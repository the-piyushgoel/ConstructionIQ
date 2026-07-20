# Construction IQ
### AI-Powered Predictive Schedule Risk & Recovery Intelligence for Data Centre EPC Projects

**Track:** Industrial Intelligence / Infrastructure Construction / Quality Management
**Aligned Problem Statement:** AI Intelligence Platform for Data Centre EPC Project Delivery

---

## 1. Problem Statement

Large-scale data centre EPC projects involve hundreds of contractors, suppliers, consultants, and engineering teams operating in parallel against a single master schedule. Each stakeholder follows its own local priorities, resource constraints, procurement timelines, and contractual commitments. When an unexpected event occurs — a delayed equipment delivery, workforce shortage, design revision, or failed inspection — the Project Management Office (PMO) must manually coordinate across stakeholders through meetings, emails, and phone calls to arrive at a feasible recovery plan.

This process is slow and almost entirely reactive. By the time a delay is identified, discussed, and resolved, it has already begun to cascade into downstream schedule slippage. Industry data supports the scale of the problem: a 2024 Turner & Townsend survey found that 67% of data centre EPC projects in Asia-Pacific experienced schedule overruns exceeding 10%, with procurement misalignment and commissioning failures cited as leading causes.

## 2. Why Existing Systems Fail

Traditional project management platforms such as Oracle Primavera P6 and Microsoft Project are effective at creating and tracking schedules, but they function as passive planning tools. They can confirm that a delay has occurred, but they cannot reason about how different stakeholders should respond to it. These platforms treat a project as a deterministic schedule rather than as a dynamic system in which procurement, construction, quality, cost, and resource decisions continuously influence one another. As a result, the burden of evaluating recovery options and negotiating a way forward remains entirely manual.

## 3. Proposed Solution

**Construction IQ** is an AI-powered intelligence platform that shifts EPC project management from reactive coordination to proactive, explainable decision-making. Rather than modelling every contractor as an individual AI agent, Construction IQ models the major decision-making *functions* of an EPC project as specialized AI agents, coordinated by a central orchestration layer, and grounded in continuous risk monitoring rather than after-the-fact alerts.

## 4. System Architecture

Construction IQ operates as a seven-layer pipeline:

1. **Continuous Monitoring** — Ongoing tracking of procurement status, vendor activity, weather, and logistics signals across all active project line items.
2. **Risk Prediction** — A predictive model that surfaces disruption risk (e.g., delivery delay probability) days to weeks before it materializes, rather than after the fact.
3. **Risk Attribution Engine** — Every predicted risk score is decomposed into its weighted contributing factors (e.g., vendor history, port congestion, weather, inventory shortage), making the prediction fully explainable rather than a black-box number. This is attribution, not post-incident root-cause analysis — it explains *why the model believes a risk exists*, before the disruption has occurred.
4. **Specialized Agent Layer** — Six domain-specific agents — Procurement, Scheduling, Resource, Cost, Quality, and Risk — independently evaluate the disruption from their own area of expertise and propose recovery options, informed directly by the risk attribution breakdown.
5. **Simulation Layer** — Before any recommendation reaches a human, candidate options are tested against second-order effects (e.g., does the proposed alternate vendor have the capacity to fulfil the order without creating a new delay of its own) and scored on a measurable output, not just a pass/fail check:

   | Option | Recovery | Extra Cost | Confidence |
   |---|---|---|---|
   | A — Alternate vendor (air freight) | 12 days | ₹45L | 91% |
   | B — Re-sequence commissioning | 8 days | ₹20L | 84% |
   | C — Expedited alternate vendor (premium) | 18 days | ₹1.1Cr | 96% |

   This is the output the Orchestrator scores against — each option's confidence reflects how completely the simulation could validate its second-order assumptions (e.g., vendor capacity, workforce availability) against available data.
6. **Orchestrator (Decision Layer)** — A weighted multi-objective scoring mechanism combines agent recommendations, applies hard constraints (safety, compliance, contractual minimums) as non-negotiable filters, and produces a single ranked recovery plan with full traceability.
7. **Human Decision Layer** — The Project Manager reviews the recommended plan with expandable reasoning, alternative options, and retains full control via Accept / Modify / Reject actions. Construction IQ is designed as a decision-support system, not a replacement for the PMO.

   Every recommendation card surfaces three trust indicators alongside the plan itself, rather than the recommendation alone:

   | Indicator | Meaning |
   |---|---|
   | Recommendation Confidence (e.g., 92%) | How strongly the top-scored option outperforms the alternatives |
   | Reasoning Confidence (e.g., High) | How complete and consistent the underlying agent reasoning chain is |
   | Data Completeness (e.g., 87%) | How much of the relevant data (ERP, vendor, contract) was available when the recommendation was generated |

   This matters because an enterprise decision-support system that hides its own uncertainty is not trustworthy in a contractually sensitive domain — a PM needs to know not just *what* the system recommends, but *how sure it is*, before acting on it.

### 4.1 Feedback Loop

The pipeline does not terminate at the human decision. Every Accept / Modify / Reject action, along with the eventual real-world outcome (was the delay actually recovered as predicted, did the alternate vendor perform as simulated), is written back into a Learning Repository:

`Human Decision → Accept / Modify / Reject → Outcome Stored → Learning Repository → Future Scoring Refined`

Over time, this closes the loop between prediction and reality: if the Risk Prediction layer consistently over- or under-estimates a given vendor's delay probability, or if PMs consistently modify a particular agent's weighting in a certain contract type, that pattern feeds back into the scoring model. Construction IQ is designed to improve its own confidence and accuracy with each project cycle, rather than operating as a static rules engine.

## 5. Conflict Resolution Mechanism

Each agent proposes multiple ranked options with structured impact estimates (schedule days affected, cost delta, quality risk, contract risk). The Orchestrator scores each option using a weighted formula:

`Score = (W_schedule × schedule_impact) + (W_cost × cost_impact) + (W_quality × quality_score) + (W_risk × risk_score)`

Weights are not fixed — they are derived from the specific project's contractual structure (e.g., a project with liquidated damages clauses automatically weights schedule impact higher). Options that violate hard constraints (safety, regulatory, contractual minimums) are excluded before scoring, regardless of how favourable their cost or schedule impact appears.

## 6. Data Architecture

| Agent | Primary Data Source | Integration Approach |
|---|---|---|
| Scheduling Agent | Primavera P6 / MS Project | XER export parsing or P6 EPPM REST API |
| Procurement Agent | Vendor portals, PO status, ERP | API integration + document parsing for vendor confirmations |
| Resource Agent | Workforce/equipment allocation logs | Structured file ingestion |
| Cost Agent | ERP cost modules, budget trackers | Structured database queries |
| Quality Agent | Inspection reports, NCRs, QMS | Document ingestion with OCR |
| Risk Agent | Contract documents, LD clauses | RAG over contract corpus |

External risk signals (weather, port congestion, logistics disruptions) are drawn from publicly available feeds. For the purposes of the prototype, internal ERP/vendor-history data — which is proprietary to real EPC organisations and unavailable during a hackathon — is represented using a realistic synthetic dataset engineered to reflect genuine industry patterns, while public signal sources are integrated live wherever feasible.

## 7. Illustrative Scenario

A critical UPS unit is flagged at 72% delay risk fourteen days before its due date, with the risk decomposed as: vendor load history (32%), port congestion (21%), inventory shortage (10%), and weather (9%). The agent layer proposes an alternate vendor; the simulation layer confirms the alternate vendor has sufficient capacity to absorb the order without delay; the Orchestrator finalizes a recovery plan projected to recover 12 of the 18 days at risk, at an estimated additional cost of ₹45 lakh, avoiding an estimated ₹1.2 crore liquidated damages exposure. The full cycle — from signal detection to an actionable, human-approved plan — compresses an estimated multi-day manual coordination process into minutes.

## 8. Human-Centred Design

Recommendations are presented as reviewable "recovery plan cards" with an expandable reasoning trail showing each agent's contribution to the decision. Project Managers can Accept, Modify (adjusting weighting priorities), or Reject any recommendation. Role-based views ensure procurement, cost, and quality stakeholders each see the detail relevant to their function, while field-level personnel receive simplified, action-oriented notifications on mobile.

## 9. Scope

This prototype focuses deliberately on predictive schedule risk detection and recovery orchestration — the highest-frequency, highest-cost failure mode in EPC delivery. The underlying agent-and-orchestrator architecture is designed to extend to the platform's other functions (specification compliance, commissioning assurance, project knowledge retrieval) as additional agents without requiring architectural redesign.

## 10. Impact at a Glance

| Metric | Before (Manual Process) | After (Construction IQ) |
|---|---|---|
| Risk Detection | After the delay has occurred | 14–18 days in advance |
| Decision Time | 2–3 days of coordination | 3–5 minutes |
| Options Compared | Ad hoc, manual | AI-generated, ranked top 3 |
| Explainability | Meetings and verbal justification | Full agent-level reasoning trail |
| Human Control | Yes | Yes (Accept / Modify / Reject retained) |

## 11. Expected Impact

- Compresses manual, multi-day disruption coordination into a near-real-time decision cycle.
- Shifts schedule risk management from reactive response to proactive, weeks-ahead prediction.
- Produces fully explainable, auditable recommendations suitable for a contractually sensitive industry.
- Preserves human authority over every final decision while eliminating the manual burden of option generation and cross-functional negotiation.
