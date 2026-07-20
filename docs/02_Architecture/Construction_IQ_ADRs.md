# Construction IQ — Architecture Decision Records

**Document type:** Architecture Decision Record (ADR) set
**Status of this document:** Finalized for the initial production release
**Note on scope:** These ADRs document the implementation stack for Construction IQ's first production release: a **modular monolith** built on Next.js, Node.js, PostgreSQL, Redis, and BullMQ. This is a deliberate phased-evolution decision (see ADR-007) — the service boundaries defined in the earlier system design document remain valid as internal module boundaries within the monolith today, and as the extraction seams for a future microservices split, should scale or team-topology requirements demand it later. Nothing in the product architecture (the eleven-stage pipeline) is altered by this document.

---

## ADR-001: Next.js as the Frontend and BFF Framework

**Status:** Accepted

**Context**
Construction IQ's frontend has two distinct surfaces — a real-time monitoring dashboard and a recovery-plan review interface — both of which need role-based server-side data shaping (procurement, cost, and quality stakeholders must never receive fields their role shouldn't see, per the frozen UX design), fast first-paint for a PMO user checking status quickly, and a backend-for-frontend (BFF) layer that composes data from multiple internal modules into a single response.

**Decision**
Use Next.js (React) as both the frontend rendering framework and the BFF layer, via its API routes / route handlers acting as the composition and role-shaping layer described in the system design document's API Gateway strategy.

**Alternatives Considered**
- **Plain React SPA + separate Express BFF** — would work, but introduces a second codebase and deployment unit purely to host composition logic that Next.js provides natively via route handlers, adding operational overhead without a corresponding benefit at current scale.
- **Server-rendered templating (e.g., a traditional MVC framework)** — rejected because the recovery-plan-card UI is highly interactive (expandable reasoning, live confidence updates, Accept/Modify/Reject with weight adjustment) and benefits from a component-driven client model, not primarily server-rendered pages.
- **Remix** — a reasonable alternative with a similar server/client unification model; not chosen primarily due to team familiarity and the maturity of Next.js's ecosystem for the specific real-time + role-based-rendering pattern needed here.

**Trade-offs**
- Gains: one codebase and one deployment for both UI and BFF composition logic; built-in support for server-side data fetching co-located with the components that need it, which directly supports the "never send fields the role shouldn't see" requirement; strong caching primitives for the slow-changing reference data (vendor profiles, contract clause lookups).
- Costs: couples frontend release cadence to BFF release cadence — a BFF-only change (e.g., a new composed endpoint) requires a full Next.js deploy rather than an independent lightweight service deploy; the framework's opinions about rendering/caching add a learning curve for engineers unfamiliar with its data-fetching model.

**Consequences**
The BFF composition logic (joining recovery plan + agent reasoning + simulation confidence into one response, per the earlier API Gateway strategy) lives inside Next.js route handlers rather than as a standalone service. This is acceptable at current scale because BFF logic is thin composition, not heavy computation — the compute-heavy work stays in the backend modules it calls.

**Future Evolution**
If the BFF's composition logic grows in complexity or needs independent scaling/deployment from the frontend (e.g., to serve a future mobile-native client alongside the web client), it can be extracted into a standalone BFF service without changing the underlying backend module contracts, since the composition logic is already isolated in its own route-handler layer.

---

## ADR-002: Node.js as the Primary Backend Runtime

**Status:** Accepted

**Context**
The system's real-time path (Continuous Monitoring → event consumption → plan delivery → WebSocket push to the frontend) is fundamentally I/O-bound: waiting on external signal sources, database queries, queue operations, and socket connections, rather than CPU-bound number crunching in the request path itself. The compute-heavy AI inference workloads (model serving for Prediction, Attribution, and the Agents) are a separate concern (see ADR-008).

**Decision**
Use Node.js (TypeScript) as the runtime for all orchestration, API, queue-processing, and real-time-messaging backend code — i.e., everything except the model-serving layer itself.

**Alternatives Considered**
- **Python for the entire backend** — rejected as the primary orchestration runtime because Python's I/O concurrency model (even with `asyncio`) is a worse fit for a system built around high-concurrency socket connections (WebSockets) and queue consumers than Node's event loop; Python remains the right choice specifically for model inference (ADR-008), not general orchestration.
- **JVM-based stack (e.g., Java/Kotlin with Spring)** — technically capable, but adds substantially more operational and cognitive overhead (build tooling, memory tuning, verbosity) than the team's actual concurrency requirements justify at this stage.
- **Go** — a strong alternative for I/O-bound services with excellent concurrency primitives; not chosen primarily because it would split the team's language surface three ways (Go for orchestration, Python for models, TypeScript for frontend) with no corresponding performance requirement that Node cannot already meet.

**Trade-offs**
- Gains: single language (TypeScript) shared between frontend, BFF, and backend orchestration code, reducing context-switching and allowing shared type definitions for API contracts (e.g., the `RiskEvent` and `AgentRecommendation` shapes referenced throughout the system design); mature ecosystem for queues (BullMQ, ADR-005), WebSockets (ADR-006), and Postgres clients.
- Costs: CPU-bound work must be deliberately kept out of the Node process (e.g., never running model inference in-process) or it will block the event loop and degrade the real-time path for every connected client — this is an architectural discipline requirement, not just a performance nice-to-have.

**Consequences**
All CPU-heavy inference work is required to live in the separate Python-based model-serving layer, called via network request, never embedded as an in-process library inside a Node service. This boundary is enforced structurally (separate deployable), not just by convention.

**Future Evolution**
If a specific orchestration workload emerges that is genuinely CPU-bound (e.g., a future complex constraint-solver replacing the current weighted-scoring formula in the Decision Orchestrator), it should be evaluated for extraction into its own service in an appropriate runtime, rather than run in-process inside the Node orchestrator.

---

## ADR-003: PostgreSQL as the Primary Datastore

**Status:** Accepted

**Context**
Construction IQ's most sensitive data — recovery plans, decision history, contract-derived risk factors — carries contractual and legal weight (liquidated damages exposure, audit requirements). The system also needs a vector index for the Risk Agent's RAG-based contract clause retrieval, and time-series-shaped data for Continuous Monitoring's rolling signal windows.

**Decision**
Use PostgreSQL as the single primary datastore across the monolith, with the `pgvector` extension for the Risk Agent's contract-clause vector search and `TimescaleDB` (a Postgres extension) for the Monitoring module's time-series workload.

**Alternatives Considered**
- **A dedicated vector database (e.g., Pinecone, Weaviate)** for RAG — rejected for the initial release because it introduces a second database technology and operational surface purely to serve one module's retrieval need, when `pgvector` provides adequate retrieval quality at the current corpus size (contract documents per project, not web-scale embeddings).
- **A dedicated time-series database (e.g., InfluxDB)** for Monitoring — rejected for the same reason; TimescaleDB provides purpose-built time-series performance as a Postgres extension, avoiding a second database engine to operate, back up, and secure.
- **MongoDB or another document store** for the semi-structured agent-recommendation payloads — rejected because Postgres's `JSONB` columns provide sufficient flexibility for semi-structured fields (e.g., `attribution_breakdown`, `ranked_options`) while preserving the relational integrity and ACID guarantees required for the system-of-record tables (recovery plans, decisions).

**Trade-offs**
- Gains: one database engine to operate, back up, monitor, and secure; strong ACID guarantees for the contractually sensitive system-of-record data; `JSONB` covers the semi-structured needs without a second data model; a single connection-pooling and migration strategy across the whole monolith.
- Costs: Postgres-as-vector-store and Postgres-as-time-series-store are both good, not best-in-class, compared to dedicated systems at very large scale — this is an explicit, accepted trade of some ceiling performance for significantly lower operational complexity at current scale.

**Consequences**
All schema migrations, backup/restore, and access-control policies are unified under one database technology, simplifying the operational runbook described in the system design's deployment and security sections.

**Future Evolution**
If the contract corpus grows to a scale where `pgvector` retrieval latency or quality becomes a measurable bottleneck (monitored per the model-quality metrics in the system design's monitoring section), or if the Monitoring module's signal volume outgrows TimescaleDB's single-node performance envelope, either workload can be migrated to a dedicated engine without disturbing the rest of the schema, since each is already logically isolated by module (per the module boundaries in the system design document).

---

## ADR-004: Redis for Caching and Ephemeral State

**Status:** Accepted

**Context**
The system has several needs for fast, ephemeral, non-authoritative data: BFF-layer caching of slow-changing reference data (vendor profiles, contract clause summaries), rate-limiting counters at the API layer, WebSocket connection/session bookkeeping for the real-time channel, and the job/queue backing store required by BullMQ (ADR-005).

**Decision**
Use Redis as the shared caching layer, rate-limit counter store, and BullMQ's backing store.

**Alternatives Considered**
- **In-process (per-instance) caching only** — rejected because the monolith runs multiple instances behind a load balancer; per-instance caching would produce inconsistent cache state across instances and cannot back a distributed queue.
- **Using PostgreSQL itself for caching/queue state** — technically possible (e.g., `SKIP LOCKED` based job queues in Postgres), but rejected because it would add write load and lock contention to the primary system-of-record database for high-churn ephemeral data (job state transitions, rate-limit counters) that has fundamentally different durability requirements than a recovery plan record.
- **Memcached** for caching only — rejected because it does not provide the pub/sub and data-structure primitives (sorted sets, lists) that BullMQ and the WebSocket layer's presence/session tracking depend on; choosing Redis lets one technology serve all three needs.

**Trade-offs**
- Gains: one additional piece of infrastructure serves caching, rate limiting, and queueing simultaneously, rather than three separate systems; Redis's low-latency in-memory model is well matched to all three use cases' actual durability requirements (ephemeral, tolerant of restart-induced loss for cache/rate-limit data, with BullMQ's own persistence configuration handling the queue's durability needs, per ADR-005).
- Costs: Redis becomes a second stateful system to operate and monitor alongside Postgres, and an outage affects three subsystems (cache, rate limiting, queueing) simultaneously rather than being isolated — mitigated by treating cache and rate-limit data as non-critical-path (the system degrades, e.g., loses caching benefit or rate-limit enforcement, rather than failing outright, if Redis is briefly unavailable), while queue durability is protected separately via BullMQ's persistence settings.

**Consequences**
Any code path that treats Redis-backed cache data as authoritative would be a design defect; the system is required to always be able to reconstruct cached values from PostgreSQL (the source of truth) on a cache miss.

**Future Evolution**
If queue volume or cache traffic grows to a point where they contend for the same Redis instance's resources, they can be split into separate Redis instances (one for BullMQ, one for caching/rate-limiting) without any application-code change, since the separation is already logical, not just conventional.

---

## ADR-005: BullMQ for Background Job and Queue Processing

**Status:** Accepted

**Context**
The system design document specifies a range of background jobs (signal polling, monitoring rollups, scheduled re-scoring, outcome reconciliation, calibration recomputation) and asynchronous fan-out work (dispatching parallel agent calls, per ADR-008) that must run reliably, with retries, backoff, and dead-letter handling, inside the Node.js monolith.

**Decision**
Use BullMQ (Redis-backed) as the job queue and background-processing library for all asynchronous and scheduled work within the monolith.

**Alternatives Considered**
- **A dedicated message broker (e.g., RabbitMQ) as the sole queue** — rejected for the initial release because it introduces a second broker technology purely for internal job processing, when the system does not yet have the multi-consumer-group, replayable-event-log requirements that justify Kafka (ADR-010) for internal task queues specifically — those requirements apply to the cross-module event backbone, not to simple background-job execution.
- **Temporal for all background workflows** — the system design document specifically calls out Temporal for the Learning Repository's multi-day, multi-step outcome-reconciliation workflow, and that remains valid for that specific job; adopting Temporal for every background job (including simple scheduled polling) was considered but rejected as introducing unnecessary operational and conceptual overhead for jobs that are genuinely simple, bounded, single-step tasks with standard retry semantics.
- **Native `node-cron` plus custom retry logic** — rejected because it would mean hand-rolling retry/backoff/dead-letter handling that BullMQ provides out of the box, increasing maintenance burden and the risk of subtly incorrect retry logic in a system where reliable delivery (e.g., not silently dropping a risk-detection event) has real business consequences.

**Trade-offs**
- Gains: mature retry/backoff/dead-letter support, delayed and repeatable (cron-like) job scheduling, and job-progress tracking, all within the existing Redis infrastructure (ADR-004) — no new broker to operate.
- Costs: BullMQ is Redis-backed, so it inherits Redis's durability characteristics; for the small number of genuinely long-running, multi-day, multi-step workflows (specifically outcome reconciliation and calibration, per the system design), BullMQ alone is not the right tool, which is why Temporal remains the choice for those specific jobs rather than replacing it.

**Consequences**
The system uses two distinct background-processing tools for two distinct problem shapes: BullMQ for short-lived, single-step or simple-retry asynchronous jobs (signal polling, agent fan-out coordination, notification dispatch), and Temporal for the small number of genuinely long-horizon, multi-step, stateful workflows (outcome reconciliation, calibration). This split is deliberate and should not be collapsed into "just use one" without re-examining the actual workload shapes.

**Future Evolution**
If job volume grows to the point where it saturates the shared Redis instance's throughput (per ADR-004's future-evolution note), BullMQ can be pointed at a dedicated Redis instance without any job-processing code change.

---

## ADR-006: WebSockets for Real-Time Client Updates

**Status:** Accepted

**Context**
The frontend's monitoring dashboard and recovery-plan review surface need to reflect pipeline state changes (a new risk detected, a plan becoming ready, a simulation completing) as they happen, without the client polling on a fixed interval — polling would either be too slow (missing the product's "3–5 minute decision time" responsiveness goal) or wastefully frequent.

**Decision**
Use a WebSocket-based real-time channel (via a Node-native WebSocket server, e.g., `ws` or Socket.IO, integrated with the existing Node/Next.js backend) to push lightweight state-transition notifications to connected clients, which then trigger the client's data-fetching layer to re-fetch the specific updated resource (an invalidation-push, not a full-payload-push pattern, consistent with the system design's frontend architecture).

**Alternatives Considered**
- **Server-Sent Events (SSE)** — a lighter-weight, HTTP-native alternative considered seriously since the communication is predominantly server-to-client (the client rarely needs to push data back over the same channel). WebSockets were chosen instead specifically to support the "Modify" flow's potential need for lower-latency bidirectional interaction (e.g., live-adjusting weight sliders with server-side re-scoring feedback) without requiring a second channel later; this is a deliberate trade of some current simplicity for avoiding a second real-time technology in the near future.
- **Polling with short intervals** — rejected as the primary mechanism because it does not meet the responsiveness bar implied by the product's stated decision-time KPI, and wastes backend request capacity across many idle-but-connected clients.
- **A managed real-time service (e.g., Pusher, Ably)** — a reasonable option to reduce operational burden; not chosen for the initial release to avoid an external dependency and recurring cost for a capability the team can operate directly at current scale, but explicitly left open as a future option (see below).

**Trade-offs**
- Gains: true bidirectional, low-latency channel; single technology can serve both the "push a notification" case and any future "live collaborative adjustment" case.
- Costs: WebSocket connections are stateful and require sticky session handling or a shared connection-state store (Redis, per ADR-004) across multiple monolith instances behind a load balancer, adding infrastructure complexity that SSE (which is just long-lived HTTP) would have mostly avoided.

**Consequences**
WebSocket connection/presence state is tracked in Redis (per ADR-004) rather than in-process, so any monolith instance can push a notification to a client connected to a different instance — this cross-instance requirement is a direct consequence of choosing WebSockets over a simpler single-direction channel.

**Future Evolution**
If connection volume grows to a scale where self-managed WebSocket infrastructure becomes an operational burden disproportionate to the team's size, migrating to a managed real-time service is straightforward, since the frontend already treats the channel as "receive an invalidation signal, then re-fetch," not as a channel carrying business-critical payloads directly.

---

## ADR-007: Modular Monolith Instead of Microservices

**Status:** Accepted (supersedes the per-stage microservice topology sketched in the earlier system design document, for the initial production release)

**Context**
The earlier system design document sketched an eleven-service microservices topology (one service per pipeline stage plus supporting services), reasoned from stage-level scaling and rate-of-change differences. At the point of actually building and shipping a first production release, the team is small, the traffic volume does not yet approach the point where independent per-stage scaling is a binding constraint, and the operational overhead of running, deploying, and observing eleven independently deployed services is disproportionate to the current team's size and the product's current maturity.

**Decision**
Build Construction IQ as a **modular monolith**: a single deployable Node.js/Next.js application, internally structured into strict modules that mirror the pipeline stages and service boundaries defined in the system design document (`ingestion`, `monitoring`, `risk-prediction-client`, `risk-attribution-client`, `agent-orchestration`, `simulation-client`, `decision-orchestrator`, `recovery-plan`, `learning-repository`, `notification`, `identity`), each with its own internal module boundary, its own database schema (or logically isolated tables within the shared PostgreSQL instance, per ADR-003), and no direct cross-module database access — only calls through each module's exposed internal interface. The Python-based model-serving layer (ADR-008) remains a separate deployable from day one, since it is a genuinely different runtime and workload profile, not a business-logic module.

**Alternatives Considered**
- **Full microservices from day one (the original system design sketch)** — rejected for the initial release specifically because it front-loads distributed-systems complexity (service discovery, per-service CI/CD, cross-service tracing, eleven sets of infrastructure to secure and monitor) before the product has validated which stages actually need independent scaling in production. This is a sequencing decision, not a reversal of the earlier document's reasoning — the boundaries identified there remain the correct extraction seams later.
- **A single undifferentiated monolith with no internal module discipline** — rejected because it would recreate the "big ball of mud" risk the earlier document explicitly designed against; without enforced module boundaries and no-direct-cross-module-DB-access rules, a monolith degrades into unmanageable coupling exactly at the point where the team most needs to later extract services.

**Trade-offs**
- Gains: one deployable to build, test, deploy, and observe; no network latency or partial-failure handling between modules that are logically related (e.g., Decision Orchestrator calling into Recovery Plan); dramatically simpler local development and onboarding; the team can move faster on product iteration while the actual scaling bottlenecks are still unknown.
- Costs: cannot independently scale, e.g., the compute-bound Simulation module separately from the I/O-bound Ingestion module within the same process — they share the same instance's CPU/memory budget; a bug or resource leak in one module can, in principle, affect the availability of the whole monolith, which would not be true with hard microservice isolation.

**Consequences**
The strict internal module boundaries (no direct cross-module database access, calls only through exposed module interfaces, per-module schema or table ownership within the shared database) are a hard engineering rule, not a suggestion — this discipline is what makes ADR-007's future evolution path (extraction into services) tractable rather than a rewrite. Code review and CI enforce these boundaries (e.g., via lint rules disallowing cross-module imports of internal implementation, and database access-control scoping within Postgres).

**Future Evolution**
Each module is designed to be extractable into its own service, following exactly the service boundaries already defined in the system design document, at the point where a specific, measured need arises (e.g., Simulation's compute load genuinely requires independent scaling, or a specific module's release cadence genuinely diverges from the rest of the system). The extraction order should be driven by the monitoring data described in the system design document's monitoring section (per-module resource saturation, latency, and independent-scaling need), not by a fixed roadmap — the modular monolith is a deliberate, temporary simplification, not a permanent rejection of the earlier microservices design.

---

## ADR-008: Multi-Agent Orchestration Layer

**Status:** Accepted

**Context**
The frozen product architecture requires six domain-specific perspectives (Procurement, Scheduling, Resource, Cost, Quality, Risk) to independently evaluate a detected disruption and propose recovery options, which are then arbitrated by a deterministic Decision Orchestrator. This is a product-level decision already frozen; this ADR documents the engineering approach to implementing it.

**Decision**
Implement the six agents as independent, parallelizable workers behind a common contract (input: a normalized risk + attribution event; output: a structured, ranked set of options with schedule/cost/quality/contract-risk fields), coordinated by an in-process (within the monolith, per ADR-007) orchestration module that fans a risk event out to all six agents concurrently via async task dispatch, with a bounded timeout, and aggregates whatever responses return.

**Alternatives Considered**
- **A single large model reasoning over all six domains at once** — rejected because it would collapse the explainability requirement (per the product's Risk Attribution Engine and confidence-indicator design) into one opaque reasoning pass, making it impossible to attribute a recommendation's cost or quality reasoning to a specific, auditable domain expert perspective, which is required in a contractually sensitive industry.
- **Sequential agent execution (one agent's output feeds the next)** — rejected because the agents are designed to be domain-independent evaluators, not a reasoning chain; sequential execution would both multiply latency (directly working against the product's few-minutes decision-time goal) and introduce an arbitrary ordering dependency (e.g., should Cost run before or after Quality?) that has no principled justification, since the actual arbitration between their outputs is the Decision Orchestrator's explicit job.
- **Separate microservices per agent** — considered and rejected for the same reasoning as ADR-007: at current scale, six network hops for a single fan-out add latency without a corresponding scaling benefit, since all six agents are always invoked together as one unit of work.

**Trade-offs**
- Gains: parallel execution keeps fan-out latency bounded by the slowest single agent, not the sum of all six; each agent's internal logic (and its data-source integration, per the earlier document's data architecture) remains independently testable and independently model-upgradable, even though they run in one process; partial failure (one agent's data source down) degrades gracefully into a lower `data_completeness` score rather than blocking the pipeline.
- Costs: because all six agents currently run within the same monolith process, a resource-heavy agent (e.g., the Risk Agent's RAG-based contract retrieval) shares CPU/memory with the others during a fan-out burst — this is an accepted trade at current scale, mitigated by the extraction path in ADR-007's future evolution.

**Consequences**
The `agent-registry`/`dispatcher`/`response-aggregator` internal structure (per the system design document's module boundaries) is preserved exactly as originally specified — this ADR does not change that internal structure, only confirms it runs within the monolith rather than as six standalone services for now.

**Future Evolution**
If a specific agent's resource profile diverges significantly from the others (e.g., the Risk Agent's RAG retrieval becomes materially heavier than the other five agents' logic), that single agent can be extracted into its own service first, ahead of a full extraction of all six, since the common contract between the orchestrator and each agent is already network-call-shaped in design, even though it currently resolves to an in-process call.

---

## ADR-009: Synthetic Datasets for Prototype and Early Development

**Status:** Accepted

**Context**
Several of the system's data sources (internal ERP/vendor-history records, contract documents, procurement systems) are proprietary to real EPC organizations and are not available during initial development, prototyping, or demonstration. The system nonetheless needs realistic data to validate the Prediction, Attribution, Agent, and Simulation logic end-to-end before any real customer integration exists.

**Decision**
Use engineered synthetic datasets — built to reflect genuine, researched industry patterns (e.g., vendor delay correlation with order-load thresholds, seasonal weather-driven logistics disruption patterns) — for all internal/proprietary data sources during development, testing, and demonstration, while integrating genuinely public data sources (weather, port congestion feeds) live wherever feasible, exactly as distinguished in the earlier data architecture design.

**Alternatives Considered**
- **Waiting for a real customer's data before building or validating any of the prediction/attribution logic** — rejected because it would block all meaningful engineering progress and validation on a business milestone (signing a customer with a data-sharing agreement) entirely outside engineering's control, and would leave the team unable to demonstrate or iterate on the product in the interim.
- **Using a small number of manually fabricated example records ("happy path" fixtures) instead of an engineered synthetic dataset** — rejected because hand-picked fixtures tend to only exercise the cases the engineer already anticipated, understating the model and orchestration logic's exposure to edge cases (missing data, conflicting signals, low-confidence attribution) that a more systematically engineered synthetic dataset is designed to include.
- **Using a fully random/unstructured synthetic dataset** — rejected because a dataset with no embedded realistic correlation structure would not meaningfully validate the Risk Attribution Engine's factor-decomposition logic, since there would be no genuine underlying pattern for it to correctly recover.

**Trade-offs**
- Gains: unblocks full end-to-end development and demonstration of the Prediction → Attribution → Agent → Simulation → Orchestrator chain without waiting on external data-sharing agreements; allows deliberate injection of edge cases (data gaps, conflicting signals) to stress-test the pipeline's degraded-confidence handling (per the system design's error-handling section) in a controlled way.
- Costs: model performance validated against synthetic data is not a substitute for validation against real customer data — prediction accuracy, attribution stability, and agent recommendation quality metrics observed during this phase must be treated as directional, not production-representative, and re-validated once real data is available.

**Consequences**
Any prediction-accuracy or model-quality claim made during this phase (including the illustrative "72% risk, 14-18 day lead time" scenario used in product discussions) is explicitly labeled as based on synthetic/demonstration data, not a validated production metric, in every internal and external communication of those figures, to avoid the synthetic-phase numbers being mistaken for validated real-world performance.

**Future Evolution**
As real customer data becomes available under appropriate data-sharing agreements, it replaces the synthetic dataset as the training/validation source for Prediction and Attribution specifically, with the synthetic dataset retained separately as a permanent regression-testing fixture (since its known, engineered patterns make it useful for catching model regressions in a way that real, noisier production data does not replace).

---

## ADR-010: Event-Driven Processing for the Core Pipeline

**Status:** Accepted

**Context**
The pipeline stages (Monitoring → Prediction → Attribution → Agents → Simulation → Orchestrator → Plan → PM Decision → Learning Repository) have different processing speeds, different failure modes, and a feedback loop (Learning Repository back into Monitoring/Prediction) that must never block the real-time decision path.

**Decision**
Implement the pipeline as an internal event-driven flow (per the event flow defined in the system design document), using an event log (Kafka, retained from the original system design as the correct technology choice even within the modular monolith's deployment, per the note below) for the durable, replayable, multi-consumer backbone connecting the modules, with BullMQ (ADR-005) handling simpler, bounded, single-step asynchronous tasks within a module.

**Alternatives Considered**
- **Direct synchronous function calls between modules (since they are now all in one process, per ADR-007)** — seriously considered, since in-process calls would be simpler and lower-latency than publishing to and consuming from an event log. Rejected because the feedback loop (Learning Repository → recalibration → Prediction/Attribution) and the requirement for replayability (re-running calibration against historical events, per the system design document) are not naturally expressed as synchronous function calls, and because preserving the event-driven internal structure keeps the modules genuinely decoupled — a prerequisite for the extraction path defined in ADR-007's future evolution. Collapsing to direct function calls now would make future service extraction a much larger rewrite later.
- **A simpler in-memory event emitter (e.g., Node's `EventEmitter`) instead of Kafka** — rejected because it provides no durability or replay capability; a monolith instance restart would silently lose in-flight events, which is unacceptable for a pipeline whose entire purpose is not to let a detected risk go unactioned.

**Trade-offs**
- Gains: the feedback loop and replay requirements are handled correctly from day one; modules remain genuinely decoupled despite running in one process, preserving the future extraction path (ADR-007); a single detected risk's full journey through the pipeline is fully traceable as a chain of discrete, persisted events (supporting the correlation-ID tracing described in the system design's logging and monitoring sections).
- Costs: running Kafka alongside a modular monolith is additional operational infrastructure that a purely in-process design would avoid; there is inherent latency and complexity in publish/consume versus a direct function call, which the team accepts as the cost of preserving both replayability and future extractability.

**Consequences**
Even though all modules currently run in one deployable, they communicate with each other exclusively through published events on the internal event log, never through direct in-process function calls or shared mutable state — this rule is enforced by module structure and code review, and is what makes ADR-007's monolith a genuinely modular one rather than a monolith in name only.

**Future Evolution**
No structural change is required when/if a module is extracted into its own service (per ADR-007's future evolution) — because inter-module communication is already event-based, extraction is primarily a deployment and network-boundary change, not a rewrite of the communication pattern.

---

## ADR-011: Human-in-the-Loop as a Structural Requirement

**Status:** Accepted

**Context**
Construction IQ operates in a contractually and financially sensitive domain (liquidated damages exposure, multi-crore procurement decisions) where a fully autonomous system acting without human confirmation carries both a trust problem (a Project Manager will not adopt a system they cannot verify or override) and a legal/contractual risk problem (an autonomous action taken on a project manager's behalf without their explicit confirmation is a materially different liability posture than a system that recommends and a human that decides).

**Decision**
Structure the Project Manager Accept/Modify/Reject step as a hard architectural gate, not a configurable or bypassable feature flag: no recovery plan's associated action (e.g., an auto-drafted procurement request) is executed against any external system until an explicit, audited human decision is recorded in `recovery-plan-svc`'s decision-tracking table.

**Alternatives Considered**
- **A fully autonomous mode for high-confidence recommendations (e.g., auto-execute above a 95% confidence threshold)** — considered and rejected for the initial release, because it would require the product to make a threshold judgment call about what confidence level justifies bypassing human review in a domain where the downside of an incorrect autonomous action (an unauthorized procurement commitment, a contractually consequential schedule change) is asymmetrically severe compared to the cost of a short human confirmation step. This is deliberately treated as a structural decision, not a tunable parameter, to prevent it from being silently relaxed under future feature pressure.
- **Human review as an optional, dismissible notification rather than a hard gate** — rejected because it would allow a busy or inattentive Project Manager to have actions taken on their behalf without a genuine, recorded decision, defeating the auditability requirement (per the system design's authorization and audit-trail sections) that every plan action be traceable to a specific accountable human decision.

**Trade-offs**
- Gains: preserves the trust and legal-liability posture the product requires in a contractually sensitive industry; every downstream action has an unambiguous, audited human decision behind it, directly supporting the explainability and auditability requirements documented throughout the system design; keeps the system positioned as decision support, not autonomous agency, which is both a deliberate product stance and a risk-mitigation stance.
- Costs: introduces an unavoidable minimum latency (however small) between a generated recommendation and any resulting action, since the system will never auto-execute even a very high-confidence recommendation without a recorded human decision — an explicit, accepted trade of a small amount of speed for the accountability guarantee.

**Consequences**
The `plan_decisions` table (per the system design document's database design) is the sole authorization source for any downstream action-execution code path; no service is permitted to trigger an external action (e.g., an auto-drafted procurement request submission) by reading only a recovery plan's score or confidence value — it must additionally verify a recorded `accept` decision exists for that specific plan.

**Future Evolution**
If, after sufficient production history, there is a well-evidenced case for narrowing the human-in-the-loop requirement for a specific, narrow, low-risk action class (e.g., auto-notifying a vendor of interest without committing to a purchase), that would be a deliberate, explicitly scoped future product and legal decision — not an engineering optimization — and would require its own ADR, not a quiet relaxation of this one.

---

*This ADR set documents the engineering decisions behind Construction IQ's initial production implementation. It does not alter the frozen product architecture or the pipeline stages defined in the original system design; where an ADR here (notably ADR-007) narrows the scope of an earlier system design choice, the earlier document's reasoning is preserved as the future evolution path, not discarded.*
