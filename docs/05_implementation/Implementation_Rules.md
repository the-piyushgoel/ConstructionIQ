# Implementation Rules

These documents are the source of truth.

Do not redesign the product.

Do not introduce new features.

Do not simplify business logic.

Preserve every module defined in the engineering specification.

Implement using a modular monolith architecture exactly as defined in the ADR.

Maintain complete separation between:

- Prediction
- Attribution
- Agents
- Simulation
- Decision
- Learning

All UI must strictly follow the Design System.

All APIs should follow the Engineering Handoff.

Code must be production-ready.

Follow Clean Architecture.

Follow SOLID.

Avoid duplicated logic.

Every module should be independently testable.

Write maintainable code.

Prefer explicit interfaces.

No TODO comments.

No placeholder implementations.

No fake data unless explicitly required.

Every feature must compile successfully before moving to the next module.