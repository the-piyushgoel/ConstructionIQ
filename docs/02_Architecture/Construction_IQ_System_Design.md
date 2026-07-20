# Construction IQ — Production System Design

**Document type:** Engineering system design specification
**Scope constraint:** The product architecture below is frozen. This document translates it into an implementation-ready technical design. No product scope, features, or pipeline stages have been added, removed, or reordered.

**Frozen architecture (reference):**

```
Public Signals ─┐
                 ├─► Continuous Monitoring
Internal Data ───┘           │
                              ▼
                    Risk Prediction Engine
                              │
                              ▼
                   Risk Attribution Engine
                              │
                              ▼
              Specialized Multi-Agent Layer
     (Procurement, Scheduling, Resource, Cost, Quality, Risk)
                              │
                              ▼
                      Simulation Engine
                              │
                              ▼
                   Decision Orchestrator
                              │
                              ▼
                       Recovery Plan
                              │
                              ▼
                    Project Manager (Human)
                              │
                              ▼
                   Learning Repository ──► (feedback loop to Continuous Monitoring)
```

---

## 1. High-Level Architecture

Construction IQ is designed as an **event-driven, microservice-based system** with a clear separation between three planes:

- **Ingestion plane** — pulls Public Signals and Internal Project Data into the system and normalizes them onto a common event schema.
- **Intelligence plane** — the core reasoning pipeline: Continuous Monitoring → Risk Prediction → Risk Attribution → Multi-Agent Layer → Simulation → Decision Orchestrator. This plane is stateless-compute-heavy and asynchronous.
- **Experience plane** — the Project Manager-facing frontend, the API layer that serves it, and the Learning Repository that closes the loop.

All three planes communicate exclusively through a central **event bus**, not direct service-to-service calls, except where a synchronous request/response is unavoidable (e.g., the frontend polling/subscribing for plan status). This keeps every pipeline stage independently deployable, independently scalable, and independently replaceable — a requirement given that the Risk Prediction and Simulation stages will iterate on their models far more frequently than, say, the Orchestrator's constraint logic.

```
                    ┌─────────────────────────────────────────────┐
                    │                Event Bus (Kafka)              │
                    └─────────────────────────────────────────────┘
   ▲            ▲            ▲             ▲             ▲            ▲          ▲
   │            │            │             │             │            │          │
Ingestion   Monitoring   Prediction   Attribution   Agent Layer  Simulation  Orchestrator
 Service      Service      Service      Service       Services     Service     Service
                                                                                    │
                                                                                    ▼
                                                                          Recovery Plan Service
                                                                                    │
                                                                        ┌───────────┴───────────┐
                                                                        ▼                        ▼
                                                                 API Gateway ──► Frontend    Learning Repository
                                                                                                   │
                                                                                                   └──► feeds back into Monitoring Service consumers
```

Each box in the frozen pipeline maps to one deployable service (or a small service cluster in the case of the Multi-Agent Layer). No stage is a library imported into another stage — every stage is a network boundary, which is what allows independent scaling (e.g., Simulation is CPU-bound and needs different scaling behavior than the I/O-bound Ingestion service).

---

## 2. Backend Service Architecture

Backend services, one per pipeline stage plus supporting services:

| Service | Responsibility | Nature |
|---|---|---|
| `ingestion-svc` | Pulls/receives Public Signals + Internal Project Data, normalizes to canonical event schema, publishes to bus | Stateless, I/O-bound |
| `monitoring-svc` | Consumes normalized events, maintains rolling state per tracked line item, detects threshold/pattern triggers | Stateful (windowed state store) |
| `risk-prediction-svc` | Runs the prediction model against monitoring triggers, emits a risk score + horizon | Stateless, compute-bound (model inference) |
| `risk-attribution-svc` | Decomposes a risk score into weighted contributing factors | Stateless, compute-bound |
| `agent-orchestration-svc` | Hosts the six specialized agents (see §4); fans out a risk+attribution event to all agents, collects their proposed options | Stateless coordinator, calls into agent workers |
| `simulation-svc` | Runs candidate options through second-order effect checks, attaches confidence scores | Stateless, compute-bound, potentially long-running |
| `decision-orchestrator-svc` | Applies weighted scoring + hard constraints, ranks final recovery plan options | Stateless, deterministic business logic |
| `recovery-plan-svc` | Persists recovery plans, exposes them to the frontend, tracks Accept/Modify/Reject state | Stateful (system of record) |
| `learning-repository-svc` | Persists outcomes, recomputes calibration adjustments, republishes tuning events | Stateful, batch-oriented |
| `notification-svc` | Delivers alerts (web push, email) to Project Managers and role-based stakeholders | Stateless, fan-out |
| `identity-svc` | Authentication, authorization, role/tenant management | Stateful (identity store) |

Each service owns its own datastore (database-per-service). No service reaches into another service's database directly — all cross-service reads happen via API calls or via consuming published events into a local read model.

---

## 3. Frontend Architecture

**Pattern:** Single-page application, server-rendered shell for first paint, client-hydrated for interactivity.

- **Framework:** React with a component structure split by the two primary surfaces:
  - **Monitoring dashboard** — read-heavy, real-time, subscribes to a WebSocket/SSE channel for live risk score updates and root-cause breakdowns.
  - **Recovery plan review surface** — the recommendation card UI (recommendation, confidence indicators, agent reasoning trail, Accept/Modify/Reject).
- **State management:** Server state (risk scores, recovery plans, agent reasoning) is owned by a data-fetching/caching layer (query-cache pattern) rather than global client state — this data is server-authoritative and frequently updated by backend events, so client state must never be the source of truth. Local UI state (expanded reasoning panels, filter selections, weight-adjustment sliders during "Modify") is held in component-local state.
- **Real-time channel:** A dedicated **notification/streaming gateway** (WebSocket or Server-Sent Events) pushes state transitions (new risk detected, plan ready, simulation complete) to connected clients, invalidating the relevant cached queries rather than pushing full payloads — the client re-fetches the specific resource via the API Gateway on invalidation. This avoids divergent "push payload" and "pull payload" schemas.
- **Role-based rendering:** The same recovery-plan-card component renders different levels of detail (procurement detail, cost breakdown, field-level simplified action) based on the authenticated user's role, resolved server-side in the API response, not by client-side hiding of fields — sensitive cost/contract data must never be sent to a role that shouldn't see it.
- **Mobile:** Same SPA served responsively for field-level simplified views; no separate native codebase in scope, but the component structure is built to accommodate a future React Native shell if required later (not a current deliverable — noted only as a non-blocking design consideration).

---

## 4. AI Orchestration Architecture

The AI orchestration layer spans four pipeline stages (Prediction, Attribution, Multi-Agent, Simulation) and is deliberately designed so that **models can be swapped independently of the orchestration logic around them.**

- **Model-serving layer:** Each of Risk Prediction, Risk Attribution, and the six agents runs behind a **model inference gateway** (e.g., a dedicated inference service per model family) rather than being embedded in application code. This allows model versioning, A/B rollout, and rollback without redeploying business logic.
- **Agent execution pattern:** The six agents in the Multi-Agent Layer are **independent, parallelizable workers** that share a common contract:
  - Input: a normalized `RiskEvent` (risk score + attribution breakdown + relevant project context).
  - Output: a structured `AgentRecommendation` (one or more ranked options, each with `schedule_impact`, `cost_impact`, `quality_risk`, `contract_risk`).
  - Agents do not call each other directly and do not share mutable state — this is what makes the fan-out/fan-in pattern safe to parallelize and safe to partially fail (see §20, Error Handling).
- **Orchestration coordinator:** `agent-orchestration-svc` fans a single `RiskEvent` out to all six agents concurrently (via async task dispatch), collects responses with a bounded timeout, and passes the completed (or partially completed, with degraded confidence) set to the Simulation stage.
- **Simulation as a distinct compute stage:** Simulation is deliberately not folded into the agents themselves — it consumes the agents' combined candidate set and independently re-evaluates second-order feasibility (e.g., a separate service call to check current vendor capacity), which is why it is modeled as its own service rather than a step inside `agent-orchestration-svc`.
- **Decision Orchestrator as pure business logic:** The weighted scoring and hard-constraint filtering (see the frozen conflict-resolution formula) is implemented as deterministic, model-free code — no LLM or ML model sits inside this stage. This is a deliberate boundary: creative/predictive reasoning (agents, prediction, attribution) is model-driven; final arbitration is deterministic and auditable, which is required for explainability and legal defensibility in a contractual industry.
- **Prompt/model configuration management:** Any LLM-backed component (e.g., RAG-based contract reasoning inside the Risk Agent, if implemented with an LLM) stores its prompt templates and model parameters in a versioned configuration store, not hardcoded in service code, so that reasoning behavior can be audited and rolled back independently of application deployments.

---

## 5. Module Boundaries

Within each service's codebase, module boundaries mirror the conceptual stage responsibilities to avoid a "big ball of mud" per service:

- `ingestion-svc`: `signal-adapters/` (one adapter module per external source), `normalization/`, `publisher/`
- `monitoring-svc`: `state-store/`, `trigger-rules/`, `event-consumer/`
- `risk-prediction-svc`: `feature-builder/`, `model-client/`, `score-publisher/`
- `risk-attribution-svc`: `factor-decomposer/`, `weighting-config/`
- `agent-orchestration-svc`: `agent-registry/`, `dispatcher/`, `response-aggregator/`, and one submodule per agent domain (`procurement/`, `scheduling/`, `resource/`, `cost/`, `quality/`, `risk/`) — each agent submodule is independently testable and independently owns its data-source adapters (per §15).
- `simulation-svc`: `option-evaluator/`, `capacity-checkers/`, `confidence-scorer/`
- `decision-orchestrator-svc`: `scoring-engine/`, `constraint-filters/`, `plan-ranker/`
- `recovery-plan-svc`: `plan-store/`, `decision-tracker/`
- `learning-repository-svc`: `outcome-ingestor/`, `calibration-engine/`, `tuning-publisher/`

A hard rule across all services: **no module reaches across a service boundary by importing another service's internal package.** Cross-service interaction only happens through the published API contract or event schema.

---

## 6. Service Boundaries

Service boundaries are drawn along **rate-of-change and scaling-profile lines**, not just conceptual pipeline stages:

- Prediction and Attribution are separate services (not one) because attribution logic (factor weighting) will be tuned far more frequently, by a different team (data science vs. ML engineering), than the core prediction model.
- The six agents are grouped into a single `agent-orchestration-svc` deployable (rather than six separate microservices) because they share an identical execution contract, are invoked together as one fan-out unit, and splitting them into six network hops would add latency without a corresponding scaling benefit — internally they remain separate modules (§5) so they can still be developed and tested independently, and can be split into standalone services later without breaking the contract, if one agent's load profile diverges significantly.
- `recovery-plan-svc` is separate from `decision-orchestrator-svc` because the former is a system-of-record (must be durable, queryable, auditable) while the latter is stateless compute — coupling them would force the compute service to inherit database scaling constraints it doesn't need.
- `learning-repository-svc` is intentionally decoupled from the real-time path — it consumes events asynchronously and never sits in the critical path between a detected risk and a delivered recovery plan, so a slow or failing learning pipeline can never delay an active recommendation.

---

## 7. API Gateway Strategy

A single **API Gateway** (e.g., Kong, AWS API Gateway, or an equivalent managed gateway) is the sole entry point for all frontend and external-integration traffic. It is responsible for:

- **Routing** — maps external routes (`/api/v1/risks`, `/api/v1/plans`, `/api/v1/agents/{id}/reasoning`) to the appropriate internal service, so the frontend never needs to know internal service topology.
- **Authentication termination** — validates the session/JWT before any request reaches a backend service (see §12).
- **Authorization pre-check** — enforces coarse-grained role checks at the edge (e.g., "does this role have any access to cost data") before delegating fine-grained, resource-level authorization to the owning service (see §13).
- **Rate limiting & quota enforcement** — per-tenant and per-user limits, to protect the compute-bound Prediction/Simulation services from being overwhelmed by client polling.
- **Request/response shaping** — strips fields the caller's role should not see (defense in depth alongside §3's server-side role rendering).
- **Backend-for-frontend (BFF) layer** — a thin aggregation layer behind the gateway composes multi-service responses (e.g., a single "recovery plan detail" call that joins `recovery-plan-svc` + `agent-orchestration-svc` reasoning + `simulation-svc` confidence) so the frontend does not make several round trips per screen.

Internal service-to-service calls (e.g., `decision-orchestrator-svc` calling `simulation-svc` synchronously if needed) bypass the public gateway entirely and go through an internal service mesh with mTLS, kept separate from the public-facing gateway for both security and latency reasons.

---

## 8. Event Flow

The primary event flow mirrors the frozen pipeline exactly, implemented as a chain of published/consumed events on the bus:

```
SignalIngested (raw)
   → SignalNormalized
       → MonitoringStateUpdated
           → RiskTriggerDetected
               → RiskScorePredicted
                   → RiskAttributed
                       → AgentRecommendationsCollected
                           → SimulationCompleted
                               → RecoveryPlanGenerated
                                   → PlanPresentedToUser
                                       → PlanDecisionRecorded (Accept/Modify/Reject)
                                           → OutcomeObserved (delayed, async)
                                               → LearningRepositoryUpdated
                                                   → ScoringCalibrationPublished ─┐
                                                                                  │
   (feedback loop) ◄──────────────────────────────────────────────────────────────┘
   MonitoringStateUpdated consumers subscribe to ScoringCalibrationPublished
```

Each arrow is a distinct event type on the bus, versioned independently (see §17 for how consumers are protected from breaking schema changes). This event chain is the technical backbone of the feedback loop shown in the frozen architecture: the Learning Repository does not call Monitoring directly — it publishes a `ScoringCalibrationPublished` event that `risk-prediction-svc` and `risk-attribution-svc` subscribe to, adjusting their weighting/model parameters on the next cycle. This is fully asynchronous and never blocks the live decision path.

---

## 9. Database Design

Database-per-service, chosen by access pattern rather than a single company-wide default:

| Service | Database | Justification |
|---|---|---|
| `monitoring-svc` | Time-series DB (e.g., TimescaleDB) | Rolling window aggregation over vendor/schedule/weather signals is a time-series access pattern |
| `risk-prediction-svc` | Relational (PostgreSQL) for model metadata/features; model artifacts in object storage | Predictions are structured records; model binaries are large blobs, don't belong in a relational row |
| `risk-attribution-svc` | Relational (PostgreSQL) | Structured factor-weight records with strong consistency needs |
| `agent-orchestration-svc` | Relational per agent schema (PostgreSQL, single instance, schema-per-agent) + object storage for any RAG document corpus (Risk Agent's contract corpus) | Structured recommendations need relational integrity; unstructured contract text needs a document/vector store |
| `simulation-svc` | Relational (PostgreSQL) | Simulation runs and their scored outputs are structured, auditable records |
| `decision-orchestrator-svc` | No persistent store (stateless) — reads inputs, writes result to `recovery-plan-svc` | Pure computation; persisting here would duplicate the system of record |
| `recovery-plan-svc` | Relational (PostgreSQL), the system of record | Recovery plans are the most legally/contractually sensitive artifact in the system and require strong ACID guarantees, auditability, and point-in-time history |
| `learning-repository-svc` | Relational (PostgreSQL) for outcomes + a data warehouse (e.g., a columnar store) for longitudinal calibration analysis | Transactional writes of individual outcomes vs. analytical queries over months of history are different workloads |
| `identity-svc` | Relational (PostgreSQL) | Standard identity/role storage |

**Vector store note:** The Risk Agent's contract-clause retrieval (RAG over LD clauses and contractual obligations) uses a vector index (e.g., pgvector inside the same PostgreSQL instance, or a dedicated vector DB) — kept as an addition to, not a replacement for, the relational schema, since contract metadata still needs relational integrity.

**Core `recovery-plan-svc` schema (conceptual, not exhaustive):**

- `risk_events` (risk_id, source_signal_ids, predicted_score, horizon, attribution_breakdown JSON, created_at)
- `agent_recommendations` (recommendation_id, risk_id, agent_name, option_rank, schedule_impact, cost_impact, quality_risk, contract_risk)
- `simulation_results` (simulation_id, recommendation_id, confidence_score, second_order_findings JSON)
- `recovery_plans` (plan_id, risk_id, ranked_options JSON, final_score_breakdown JSON, recommendation_confidence, reasoning_confidence, data_completeness)
- `plan_decisions` (decision_id, plan_id, pm_user_id, action [accept/modify/reject], modified_weights JSON, decided_at)
- `outcomes` (outcome_id, plan_id, observed_result JSON, recorded_at) — written by `learning-repository-svc` but logically traceable back to the plan

---

## 10. Background Jobs

| Job | Trigger | Runs In |
|---|---|---|
| Signal polling (for sources without push/webhook support) | Scheduled (cron, e.g., every 5–15 min per source) | `ingestion-svc` worker pool |
| Monitoring window rollups | Scheduled (e.g., hourly aggregation of raw signal windows) | `monitoring-svc` |
| Model batch re-scoring (re-evaluate open risks as new signals arrive) | Scheduled, plus event-triggered on significant new signal | `risk-prediction-svc` |
| Vendor capacity re-check | Scheduled (daily) to keep Simulation's capacity assumptions fresh even without an active risk | `simulation-svc` |
| Outcome reconciliation (checking whether a predicted delay actually materialized, days/weeks later) | Scheduled (daily), matching plan horizon dates against actual delivery data | `learning-repository-svc` |
| Calibration recomputation | Scheduled (e.g., weekly) or triggered after N new outcomes accumulate | `learning-repository-svc` |
| Stale plan expiry/archival | Scheduled | `recovery-plan-svc` |
| Notification digesting (batched summaries for non-urgent monitoring alerts) | Scheduled | `notification-svc` |

All background jobs run through a managed job scheduler (e.g., a Kubernetes CronJob layer or a workflow engine such as Temporal for jobs with multi-step retry/compensation needs — Temporal is preferred for the outcome reconciliation and calibration jobs specifically, since they involve multi-step, long-horizon, retryable workflows spanning days).

---

## 11. Queue Architecture

- **Primary backbone:** Apache Kafka (or equivalent, e.g., managed Kafka/PubSub) as the durable event log described in §8. Chosen over a simple message queue because the system needs **replay** (re-running the Learning Repository's calibration against historical events) and **multiple independent consumers** per event (e.g., both `notification-svc` and `learning-repository-svc` may need to react to the same `PlanDecisionRecorded` event).
- **Topic partitioning:** Partitioned by `project_id` (or `tenant_id` in a multi-project deployment) to guarantee ordering of events belonging to the same project/disruption while allowing horizontal scale-out across projects.
- **Dead-letter handling:** Every consumer service has a paired dead-letter topic; events that fail processing after bounded retries are routed there for manual/automated inspection rather than blocking the partition.
- **Task queues (separate from the event log):** For synchronous-ish, bounded work inside a stage (e.g., dispatching six parallel agent calls from `agent-orchestration-svc`), an in-process async task dispatcher (not Kafka) is used, since this is a fan-out within a single request lifecycle, not a durable cross-service event.
- **Consumer group isolation:** Each downstream service runs its own consumer group per topic, ensuring the Simulation stage's processing speed can never be throttled by, say, the Learning Repository's slower analytical consumption of the same upstream events.

---

## 12. Authentication

- **Identity provider:** Centralized `identity-svc` backed by an OIDC-compliant provider (e.g., Auth0, Okta, or a self-hosted Keycloak instance) rather than custom credential storage — offloads password handling, MFA, and session lifecycle to a hardened, audited component.
- **Token model:** Short-lived JWT access tokens (e.g., 15-minute expiry) plus a refresh token, issued after OIDC login. The API Gateway validates JWT signature and expiry on every request before routing.
- **Field/contractor personnel:** Same OIDC flow, but with a lighter-weight mobile-optimized login (e.g., magic link or SMS OTP as a secondary flow) for field-level users who need frictionless access on site.
- **Service-to-service authentication:** mTLS certificates issued by an internal certificate authority for all internal service mesh traffic — no shared static API keys between internal services.

---

## 13. Authorization

- **Model:** Role-Based Access Control (RBAC) with resource-scoped attribute checks layered on top for project-level isolation (a user's role is scoped to specific project IDs, not global).
- **Roles (illustrative, matching the frozen UX design):**
  - `pmo_manager` — full recovery plan visibility, Accept/Modify/Reject rights, cost and contract detail.
  - `procurement_lead`, `cost_lead`, `quality_lead` — role-scoped detail views (per §3), read-only on the overall plan, full detail on their own domain.
  - `field_supervisor` — simplified action notifications only, no cost/contract data.
  - `admin` — tenant/project configuration, no operational decision rights by default (separation of duties).
- **Enforcement layers (defense in depth):**
  1. API Gateway — coarse route-level check (e.g., only `pmo_manager` and above can call the decision-recording endpoint).
  2. Service-level — `recovery-plan-svc` re-validates the resource-scoped permission (does this user belong to this project) independently of the gateway, since the gateway should never be the sole authorization boundary.
  3. Data-shaping — the BFF layer (per §7) strips fields the resolved role should not receive, so no over-fetching of cost/contract data ever reaches the client bundle.
- **Audit trail:** Every authorization-relevant action (plan view, decision recorded, weight modification) is written to an immutable audit log (append-only table or dedicated audit event stream), required given the contractual/legal sensitivity noted in the frozen product design.

---

## 14. State Management

- **Pipeline state (backend):** The pipeline is designed to be **as stateless as possible per stage**, with durable state living only in `monitoring-svc` (rolling signal windows) and `recovery-plan-svc` (the system of record). Intermediate stages (Prediction, Attribution, Agents, Simulation, Orchestrator) treat each event as a self-contained unit of work and do not require session/conversation state between calls — this is what allows them to scale horizontally without sticky routing.
- **Plan lifecycle state machine:** A recovery plan moves through an explicit state machine: `generated → presented → accepted | modified | rejected → outcome_pending → outcome_recorded`. This state machine lives in `recovery-plan-svc` and is the authoritative source for "what stage is this disruption at" — the frontend never infers state from combining multiple signals client-side.
- **Frontend state:** As described in §3 — server state via a cache-invalidation pattern, driven by the real-time channel; local UI state (e.g., in-progress weight adjustments during "Modify," not yet submitted) held transiently in the component tree and discarded if not submitted, never persisted client-side, to avoid stale/conflicting edits across devices.

---

## 15. External Integrations

| Integration | Purpose | Pattern |
|---|---|---|
| Primavera P6 / MS Project | Scheduling Agent's data source | Scheduled XER export ingestion (batch) or P6 EPPM REST API polling (near-real-time), normalized in `ingestion-svc` |
| ERP / vendor procurement systems (e.g., SAP Ariba) | Procurement Agent's data source | API integration where available; document/email parsing pipeline as fallback for vendors without API access |
| Public weather APIs | Continuous Monitoring external signal | Scheduled polling, cached with short TTL |
| Port congestion / shipping data feeds | Continuous Monitoring external signal | Scheduled polling or third-party data provider webhook |
| QMS / inspection record systems | Quality Agent's data source | Document ingestion with OCR pipeline for scanned inspection reports |
| Contract management systems | Risk Agent's data source | Document ingestion into the RAG corpus (§9's vector store) |
| Notification channels (email, push, SMS) | Alerting Project Managers and field personnel | Fan-out via `notification-svc` to third-party providers (e.g., a transactional email/SMS provider) |

All external integrations are isolated behind an **adapter interface per source** (per the `signal-adapters/` module in §5), so that a change in a vendor's API, or the addition of a new data source, never requires touching the core Monitoring/Prediction logic — only a new adapter is added.

---

## 16. Deployment Architecture

- **Container orchestration:** Kubernetes, with each backend service as an independently deployable, independently scalable Deployment + Service pair.
- **Environments:** `dev → staging → production`, with staging as a full mirror of production topology (same service count, smaller resource allocations) to catch integration issues before release.
- **Multi-project isolation:** Namespace-per-tenant (or logical partitioning within shared namespaces, depending on scale) so that one client's data-heavy project cannot starve another's compute resources — directly addressing the earlier-identified scalability gap around concurrent multi-project usage.
- **CI/CD:** Each service has its own pipeline (build → test → containerize → deploy), gated by automated tests and a canary/blue-green rollout strategy for the compute-heavy AI services (Prediction, Attribution, Simulation) specifically, since a bad model deployment there has the highest blast radius on decision quality.
- **Model deployment:** Model artifacts for Prediction/Attribution/Agents are versioned and deployed independently of application code releases (per §4), via a model registry, allowing rollback of a model version without rolling back the surrounding service code.
- **Infrastructure as code:** All environments defined via Terraform (or equivalent), no manually provisioned infrastructure, to guarantee staging/production parity.

---

## 17. Environment Variables

Environment configuration is separated into four categories, each with its own secret-management posture:

| Category | Examples | Storage |
|---|---|---|
| Service topology | `KAFKA_BROKERS`, `DB_HOST`, `API_GATEWAY_URL` | Config maps (non-secret) |
| Secrets/credentials | `DB_PASSWORD`, `OIDC_CLIENT_SECRET`, third-party API keys | Secrets manager (e.g., Vault, cloud-native secrets store), injected at runtime, never checked into source or plain config maps |
| Feature/model configuration | `PREDICTION_MODEL_VERSION`, `SIMULATION_TIMEOUT_MS`, agent-specific weighting defaults | Versioned configuration service (per §4's prompt/model config store), not raw env vars, so changes are auditable and reversible without a redeploy |
| Environment identity | `ENVIRONMENT` (`dev`/`staging`/`prod`), `TENANT_ID` scoping | Config maps |

No service reads a secret directly from an environment variable file committed to a repository; all secrets are injected by the orchestration platform at pod startup and rotated on a defined schedule.

---

## 18. Logging

- **Structured logging:** Every service emits structured (JSON) logs with a mandatory correlation ID that is generated at `ingestion-svc` and propagated through every subsequent event and service call in the pipeline — this is what allows a single disruption (from raw signal to final PM decision) to be traced end-to-end across eleven services.
- **Log levels:** Standard `DEBUG/INFO/WARN/ERROR`, with `AUDIT` as a distinct, separately routed log stream for anything touching authorization decisions or plan decisions (§13), since audit logs have different retention and access-control requirements than operational logs.
- **Centralized aggregation:** All logs ship to a central log store (e.g., an ELK/OpenSearch stack or equivalent managed logging service), queryable by correlation ID, service name, and risk/plan ID.
- **PII/sensitive data handling:** Contract terms, cost figures, and vendor-specific commercial data are never logged at `INFO` level or below — only referenced by ID, with full payload inspection available only through a separate, access-controlled debugging path.

---

## 19. Monitoring

- **Golden signals per service:** Latency, traffic, error rate, and saturation tracked per service (e.g., via Prometheus + Grafana), with service-specific SLOs — e.g., `risk-prediction-svc` inference latency, `simulation-svc` job completion time, `recovery-plan-svc` API p99 latency.
- **Pipeline-level tracing:** Distributed tracing (e.g., OpenTelemetry) spanning the full event chain from §8, so that the time from `RiskTriggerDetected` to `RecoveryPlanGenerated` is directly measurable — this is the technical instrumentation behind the product's own KPI claim ("14–18 days early detection," "3–5 minute decision time"), and must be measured in production, not just estimated.
- **Model-quality monitoring (distinct from infra monitoring):** Prediction accuracy (predicted vs. actual delay), attribution stability, and agent recommendation acceptance/modification rates are tracked as first-class metrics, feeding directly into the Learning Repository's calibration process (§8) — this is the production analog of the "lead time" and "false negative rate" evaluation criteria in the product brief.
- **Alerting:** Threshold- and anomaly-based alerts on both infra metrics (service down, queue backlog growing) and model-quality metrics (prediction accuracy degrading week over week), routed to the engineering on-call rotation, separate from the business-facing Project Manager notifications in §15.

---

## 20. Error Handling

- **Per-stage failure isolation:** A failure in one agent (e.g., the Quality Agent's data source is temporarily unreachable) does not fail the whole Multi-Agent Layer response — `agent-orchestration-svc` collects whatever agents respond within the timeout window and marks the missing agent's contribution as absent, which directly lowers the plan's `data_completeness` score (per the frozen UX's trust indicators) rather than blocking the pipeline.
- **Retry policy:** Transient failures (network timeouts to external integrations, momentary DB unavailability) use exponential backoff with jitter, bounded to a small number of attempts before routing to the dead-letter topic (§11).
- **Circuit breaking:** External integrations (§15) are wrapped in circuit breakers so that a failing third-party source (e.g., a weather API outage) degrades gracefully — Continuous Monitoring continues operating on the remaining available signals rather than stalling.
- **Simulation failure handling:** If the Simulation stage cannot complete second-order validation for an option within its timeout, that option is still passed to the Orchestrator but flagged with reduced confidence, rather than dropped silently — consistent with the product's principle that uncertainty should be surfaced, not hidden.
- **Compensating actions:** Because `decision-orchestrator-svc` and `recovery-plan-svc` are separate services (§6), a failure writing a finalized plan is handled with a compensating retry/reconciliation job rather than a distributed transaction — the system favors eventual consistency with reconciliation over two-phase commit across service boundaries.
- **User-facing error states:** The frontend explicitly renders "recommendation pending / degraded confidence / unavailable" states rather than a generic error, so a Project Manager is never shown a silently incomplete or stale plan as if it were complete.

---

## 21. Scalability Strategy

- **Horizontal scaling per stage, tuned to load profile:** `ingestion-svc` and `monitoring-svc` scale with signal volume (I/O-bound, scale on connection/throughput metrics); `risk-prediction-svc`, `agent-orchestration-svc`, and `simulation-svc` scale with active risk-event volume (CPU/inference-bound, scale on queue depth and inference latency).
- **Multi-project/multi-tenant scaling:** Kafka topic partitioning by `project_id` (§11) and Kubernetes namespace isolation (§16) together ensure that adding a new concurrent project adds partitions and pods rather than contending with existing projects' processing — this directly resolves the scalability gap flagged earlier in the product's evaluation (concurrent multi-project handling).
- **Read/write scaling for `recovery-plan-svc`:** Read replicas for the frontend's high-frequency plan/status polling, with writes (decisions) going to the primary — read-heavy dashboard traffic never competes with write-path latency for a PM recording a decision.
- **Caching:** Frequently-read, slow-changing data (vendor profile summaries, contract clause lookups) cached at the BFF layer (§7) with short TTLs, reducing repeated load on `agent-orchestration-svc`'s data sources during a burst of related risk events.
- **Backpressure:** Kafka consumer lag is a first-class scaling signal — consumer group autoscaling (e.g., via KEDA) reacts to partition lag rather than only CPU utilization, since AI inference stages can be CPU-idle while still backlogged on a slow external dependency.

---

## 22. Performance Optimization

- **Model inference latency:** Prediction/Attribution/Agent models are served via a dedicated, GPU/CPU-optimized inference layer (§4) with batching where safe (batching independent risk events for the same model, not batching across different agents), to keep the fan-out latency in the Multi-Agent Layer within the product's stated few-second budget.
- **Parallel agent execution:** The six agents execute concurrently, not sequentially (§4) — this is the single largest latency lever in the pipeline, since sequential agent execution would multiply, not add, their individual latencies.
- **Simulation bounding:** Simulation only deep-evaluates the top N candidate options surfaced by the agents (not every theoretically possible option), bounding its own compute cost.
- **BFF response composition:** The BFF layer (§7) parallelizes its downstream calls (recovery plan + reasoning + confidence) rather than calling services sequentially, so the frontend's single "load plan detail" request is bound by the slowest downstream call, not their sum.
- **Database indexing:** `recovery-plan-svc`'s hot-path queries (fetch active plans by project, fetch decision history by plan) are covered by composite indexes on `(project_id, status)` and `(plan_id, decided_at)` respectively, established at schema design time rather than retrofitted.

---

## 23. Security Architecture

- **Network segmentation:** Public API Gateway traffic and internal service-mesh traffic are on separate network boundaries (§7); no backend service is directly internet-addressable.
- **Encryption:** TLS in transit for all external traffic; mTLS in transit for all internal service-to-service traffic (§12); encryption at rest for all databases and object storage, including the contract-document corpus and any RAG vector index, given its contractual sensitivity.
- **Secrets management:** Per §17 — no plaintext secrets in config, rotated credentials, least-privilege service accounts per database (each service's DB user has access only to its own schema).
- **Tenant/project data isolation:** Enforced at three layers — database row-level scoping by `project_id`, Kafka topic partitioning by `project_id`, and Kubernetes namespace isolation (§16, §21) — so a data leak at any single layer does not by itself cross a project boundary.
- **Audit immutability:** The audit log (§13) is append-only, written to a separate store with restricted write access (only the authorization enforcement point can write to it), so it cannot be altered by a compromised application service.
- **Third-party integration hardening:** All external API credentials (§15) are scoped to least-privilege access on the vendor side (e.g., a read-only Primavera P6 integration account) and rotated on a defined schedule, minimizing blast radius if a single integration credential is compromised.
- **Model/data supply-chain security:** Model artifacts (§16) are signed and their provenance tracked in the model registry, preventing an unverified model from being deployed into the Prediction/Attribution/Agent inference layer.

---

## 24. Technology Stack with Justification

| Layer | Technology | Justification |
|---|---|---|
| Backend services | Node.js/TypeScript or Python (per service, chosen by workload) — Python for model-serving-heavy services (`risk-prediction-svc`, `risk-attribution-svc`, agent workers, `simulation-svc`), TypeScript/Node for I/O-orchestration-heavy services (`ingestion-svc`, `recovery-plan-svc`, `notification-svc`) | Matches each service's actual workload: Python has first-class ML/inference tooling; Node is efficient for high-concurrency I/O orchestration and integrates cleanly with the frontend team's skillset for the BFF layer |
| Frontend | React + a query-cache library (e.g., a data-fetching/caching layer) | Matches the frozen UX's need for server-state-driven, real-time-invalidated views (§3); React's component model suits the role-based card rendering requirement |
| Event bus | Apache Kafka | Durable, replayable, multi-consumer event log required for the feedback loop (§8) and for the Learning Repository's ability to replay historical events during calibration — a simpler queue (e.g., plain SQS/RabbitMQ) would not support replay or multiple independent consumer groups per event as cleanly |
| Primary database | PostgreSQL (per service, per §9) | Strong ACID guarantees needed for the system-of-record (`recovery-plan-svc`) and structured records elsewhere; pgvector extension allows the RAG vector store to live alongside relational contract metadata without a second database technology |
| Time-series store | TimescaleDB (PostgreSQL extension) | Keeps the time-series workload (`monitoring-svc`) on the same underlying engine family as the rest of the system, minimizing operational surface area, while still providing purpose-built time-series performance |
| Workflow engine | Temporal | Chosen specifically for the Learning Repository's multi-day, multi-step outcome-reconciliation workflow (§10) — a plain cron job cannot cleanly express "wait N days, then check an external system, then retry on failure, then trigger calibration," which is exactly Temporal's design target |
| Container orchestration | Kubernetes | Industry-standard for independent per-service scaling, canary/blue-green rollout support (§16), and namespace-based tenant isolation (§16, §23) |
| API Gateway | Kong (or equivalent managed gateway) | Mature support for JWT validation, per-tenant rate limiting, and a plugin architecture for the BFF composition layer (§7) |
| Identity | Auth0 / Keycloak (OIDC) | Offloads security-critical credential handling, MFA, and session lifecycle to a hardened, audited external component rather than custom-building authentication (§12) |
| Observability | Prometheus + Grafana (metrics), OpenSearch/ELK (logs), OpenTelemetry (tracing) | Standard, interoperable observability stack that supports the correlation-ID-based cross-service tracing required in §18–19 |
| Autoscaling | KEDA (Kubernetes Event-Driven Autoscaling) | Enables scaling backend consumers on Kafka partition lag rather than only CPU (§21), which matches the actual bottleneck profile of an event-driven AI pipeline |
| Infrastructure as code | Terraform | Guarantees dev/staging/production environment parity (§16), a precondition for the canary rollout strategy on model-serving services |

---

*This document is a translation of the frozen Construction IQ product architecture into an implementation-ready system design. No pipeline stage, agent, or product decision described in the original architecture has been altered, added, or removed.*
