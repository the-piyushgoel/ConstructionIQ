# Construction IQ — Engineering Handoff Specification

**Document type:** Frontend engineering handoff
**Target stack:** React + Next.js (App Router) + Tailwind CSS
**Scope constraint:** Translates the finalized Design System (colors, type, spacing, components) into implementation-ready specifications. No visual, product, or workflow decision is introduced or altered here — this document is measurement, structure, and process, not design.
**Code policy:** No component code, no JSX, no Tailwind class strings are written in this document. Class *mapping strategy* and token *wiring* are specified so an engineer can implement without guessing, but the implementation itself is the engineering team's work.

---

## 1. Screen Inventory

| Screen | Route (App Router convention) | Primary components used | Access |
|---|---|---|---|
| Overview / Monitoring dashboard | `/dashboard` | KPI strip, Risk Card list, Nav rail, Top bar | All authenticated roles (content scoped by role) |
| Recovery plan queue | `/plans` | Recommendation Card list, Table (queue view toggle) | `pmo_manager` and domain leads (read/act scoped by role) |
| Recovery plan detail | `/plans/[planId]` | Recommendation Card (expanded), Agent Panel (full), Timeline (risk-lifecycle) | Role-scoped detail fields |
| Agent performance | `/agents` | Table, Chart (agent acceptance/modification rate) | `pmo_manager`, `admin` |
| Plan/decision history | `/history` | Table, Timeline (plan-history) | All roles, scoped to their own project(s) |
| Project switcher / project settings | `/projects`, `/projects/[projectId]/settings` | Table, form inputs | `pmo_manager`, `admin` |
| Field mobile view | `/field` (or a distinct responsive rendering path, per Design System §22) | Reduced Risk Card, reduced Recommendation Card | `field_supervisor` |
| Auth (login) | `/login` | Form inputs, Button | Unauthenticated |
| Access denied | Shared error boundary, not a routed screen | Empty/Error state component | Any role hitting an RBAC-gated route |
| Global error / 500 | `app/error.tsx` (Next.js convention) | Error state component | Any |
| Not found | `app/not-found.tsx` | Empty/Error state component | Any |

**Note on `/field`:** per Design System §22, this is not a responsive breakpoint of `/dashboard` — it is a distinct route rendering a reduced component variant, so role-based content shaping happens at the route/data layer, not via CSS hiding of elements that were still fetched.

---

## 2. Layout Measurements

All values below are direct implementations of Design System §4 (Grid), §5 (Spacing), and §9 (Dashboard Layout) — restated here in exact pixel terms for engineering use.

### 2.1 Shell dimensions

| Region | Width | Height | Notes |
|---|---|---|---|
| Nav rail (expanded) | 240px | 100vh | Fixed position, collapses to icon-rail per §2.2 |
| Nav rail (collapsed) | 64px | 100vh | Toggle persisted per-user (local preference) |
| Top bar | 100% (fluid, min 960px before triggering nav collapse) | 56px | Fixed to top, `elevation.1` |
| Inspector panel (overlay) | 400px | 100vh minus top bar (calc) | Slides in from right, `elevation.4` |
| KPI strip | 100% of main content area | 96px | Horizontally scrollable below 1024px per Design System §9 |
| Main content max-width | 1440px | fluid | Centered when viewport exceeds 1440px + nav + inspector combined |

### 2.2 Breakpoint-triggered layout changes (exact px, matching Design System §22)

| Breakpoint | Trigger px | Change |
|---|---|---|
| `2xl` | ≥1440px | Max content width reached, centered layout with side margins |
| `xl` | 1280–1439px | Full layout, Inspector panel remains overlay (never persistent third column at any width, per Design System §9) |
| `lg` | 1024–1279px | KPI strip becomes horizontally scrollable |
| `md` | 768–1023px | Nav rail collapses to icon-rail (64px) automatically (user can still expand manually, preference persists until viewport changes again) |
| `sm` | 480–767px | Tables convert to stacked card-per-row; Nav rail becomes slide-over drawer |
| below `sm` | <480px | Buttons/inputs go full-width; field-level simplified route (`/field`) is the intended experience at this width, not a squeezed `/dashboard` |

### 2.3 Component-level measurements

| Component | Measurement |
|---|---|
| Risk Card | Min-height 96px (comfortable) / 80px (compact); full-width within content column; internal padding per Design System §5 (`space.lg` comfortable / `space.md` compact) |
| Recommendation Card | Min-height 180px collapsed / variable expanded; same width rule as Risk Card |
| Agent Panel (summary, inline) | Row height 40px per agent line |
| Agent Panel (full, overlay) | Matches Inspector panel width (400px, or full overlay width below 1440px) |
| Table row height | 44px (comfortable) / 36px (compact) |
| Button height | 36px (comfortable) / 32px (compact), per Design System §8.1 |
| Timeline node spacing | 56px vertical gap (comfortable) / 40px (compact) |

---

## 3. Component Hierarchy

Reflects the three-layer structure from Design System §1 (Foundation tokens → Primitives → Composites), expressed as a component tree for implementation planning.

```
App Shell
├── NavRail
│   ├── NavItem (×N)
│   └── CollapseToggle
├── TopBar
│   ├── ProjectSwitcher
│   ├── GlobalSearch
│   └── AlertBell
├── PageLayout (per-route)
│   ├── KpiStrip
│   │   └── KpiStat (×N)
│   ├── RiskFeed (dashboard route)
│   │   └── RiskCard (×N)
│   │       ├── SeverityBadge
│   │       ├── AttributionBar (mini)
│   │       └── PlanLinkAction
│   ├── PlanQueue (plans route)
│   │   └── RecommendationCard (×N)
│   │       ├── TrustIndicatorRow
│   │       │   └── ConfidenceChip (×3)
│   │       ├── ReasoningDisclosure
│   │       │   └── AgentPanel (summary variant, ×6)
│   │       ├── AlternativesDisclosure
│   │       │   └── Table (simulation options)
│   │       └── DecisionActionGroup
│   │           ├── Button (Accept)
│   │           ├── Button (Modify)
│   │           │   └── WeightSlider (×N, shown when Modify active)
│   │           └── Button (Reject)
│   ├── Timeline (risk-lifecycle | plan-history variant)
│   │   └── TimelineNode (×N)
│   └── DataTable (agents, history, project-settings routes)
│       ├── TableHeader
│       ├── TableRow (×N, expandable variant optional)
│       └── TableEmptyState
├── InspectorPanel (overlay, opened contextually)
│   └── AgentPanel (full variant)
└── Shared
    ├── Tooltip / Popover
    ├── Toast (decision-submitted confirmation, per Design System §12)
    ├── EmptyState
    ├── ErrorState
    └── Skeleton (per-component variants)
```

**Composition rule:** `RiskCard` and `RecommendationCard` are composed entirely from primitives already defined in §8 of the Design System (`Badge`, `Button`, `Tooltip`) plus one domain-specific primitive each (`AttributionBar`, `TrustIndicatorRow`) — no composite component defines its own one-off styled element that duplicates a primitive's job.

---

## 4. Component Props

Specified as prop **contracts** (name, type, required/optional, default) — not implementation code. Types are described conceptually; the engineering team defines the actual TypeScript interfaces.

### 4.1 `RiskCard`

| Prop | Type | Required | Default | Notes |
|---|---|---|---|---|
| `riskId` | string | yes | — | |
| `title` | string | yes | — | |
| `severity` | enum: `watch` \| `elevated` \| `critical` \| `resolved` | yes | — | Server-derived, per Design System §11 dev note — never computed client-side from a raw score |
| `score` | number (0–100) | yes | — | |
| `detectedAt` | ISO timestamp | yes | — | |
| `attribution` | array of `{ factor: string, weight: number }` | no | `[]` | Empty array renders the "no breakdown yet" sub-state, not an error |
| `hasPlan` | boolean | yes | `false` | Drives the "View recovery plan" vs. "Monitoring — no plan needed yet" caption |
| `planId` | string | no | `undefined` | Required if `hasPlan` is true; used for the link target |
| `isStale` | boolean | no | `false` | Drives the muted "last updated Xm ago" caption per Design System §11 |
| `lastUpdatedAt` | ISO timestamp | no | — | Required if `isStale` is true |
| `density` | enum: `comfortable` \| `compact` | no | inherited from context | Should read from a shared density context, not be set per-instance in normal use |
| `onExpand` | callback | no | — | Fired when the card's expand affordance is triggered |

### 4.2 `RecommendationCard`

| Prop | Type | Required | Default | Notes |
|---|---|---|---|---|
| `planId` | string | yes | — | |
| `riskId` | string | yes | — | Links back to the originating Risk Card |
| `status` | enum: `pending-review` \| `accepted` \| `modified` \| `rejected` \| `outcome-pending` \| `outcome-confirmed` | yes | — | Matches Design System §12 variants exactly; matches the `plan_decisions` lifecycle from the system design document |
| `recoveryDays` | number | yes | — | |
| `extraCost` | number (in project's base currency unit) | yes | — | Formatting (currency symbol, lakh/crore notation) handled by a shared formatter utility, not per-instance props |
| `rationale` | string | yes | — | One-line summary |
| `recommendationConfidence` | number (0–100) | yes | — | |
| `reasoningConfidence` | enum: `low` \| `medium` \| `high` | yes | — | Qualitative per Design System §8.3's slider `aria-valuetext` precedent — the same qualitative labels are used here for consistency |
| `dataCompleteness` | number (0–100) | yes | — | |
| `agentReasoning` | array of agent summary objects (see §4.3) | yes | — | |
| `alternatives` | array of `{ optionLabel, recoveryDays, extraCost, confidence }` | no | `[]` | |
| `canAct` | boolean | yes | — | RBAC-derived; when `false`, action row is hidden entirely, not shown-disabled (per Design System §12) |
| `onAccept` / `onModify` / `onReject` | callbacks | conditionally required | — | Required if `canAct` is `true`; must not be passed if `canAct` is `false` (guards against a disabled-but-wired control) |

### 4.3 `AgentPanel`

| Prop | Type | Required | Default | Notes |
|---|---|---|---|---|
| `agentDomain` | enum: `procurement` \| `scheduling` \| `resource` \| `cost` \| `quality` \| `risk` | yes | — | Drives icon + color mapping per Design System §7 |
| `variant` | enum: `summary` \| `full` | yes | `summary` | |
| `status` | enum: `default` \| `loading` \| `degraded` \| `unavailable` | yes | `default` | Must be independently rendered even when embedded inside a Recommendation Card's summary list, per Design System §13 |
| `options` | array of `{ label, scheduleImpact, costImpact, qualityRisk, contractRisk }` | required if `status` is `default` or `degraded` | `[]` | |
| `dataCompleteness` | number (0–100) | required if `status` is `degraded` | — | |
| `sourceCitations` | array of `{ label, documentRef, permissionScope }` | no | `[]` | `permissionScope` must be checked server-side before the citation link resolves — never trust client-side role state alone for document access |

### 4.4 `Timeline`

| Prop | Type | Required | Default | Notes |
|---|---|---|---|---|
| `variant` | enum: `risk-lifecycle` \| `plan-history` | yes | — | |
| `events` | array of `{ id, type, timestamp, description, scoreAtEvent? }` | yes | — | `scoreAtEvent` optional, only present for `risk-lifecycle` |
| `isInProgress` | boolean | no | `false` | Drives the pulsing most-recent-node state per Design System §14; must respect `prefers-reduced-motion` at the component level, not rely on the consumer to suppress it |

### 4.5 `DataTable` (generic primitive underlying agents/history/settings views)

| Prop | Type | Required | Default | Notes |
|---|---|---|---|---|
| `columns` | array of `{ key, label, align, sortable }` | yes | — | |
| `rows` | array of row data objects (shape defined per usage) | yes | — | |
| `density` | enum: `comfortable` \| `compact` | no | inherited | |
| `expandableRowRenderer` | render function | no | — | Only provided when the `expandable-row` variant (Design System §15) is used |
| `emptyState` | `{ title, description, action? }` | no | uses a generic default | Should be overridden per-usage with the specific copy from Design System §17 |
| `isLoading` | boolean | no | `false` | Drives skeleton row rendering per Design System §20 |

---

## 5. Interaction States

Consolidated cross-component state matrix — each row is a state that must be independently implemented and independently testable, not merged into a neighboring state for convenience.

| State | Applies to | Trigger | Visual reference |
|---|---|---|---|
| `default` | all | initial render | Design System §8–§16 base specs |
| `hover` | interactive elements, cards, table rows | pointer hover | Elevation +1 step (Design System §6) |
| `focus-visible` | all interactive elements | keyboard focus | 2px `border.strong` ring, never suppressed |
| `active/pressed` | buttons, chips | pointer down / key down (Enter/Space) | `brand.600` or equivalent pressed tone |
| `disabled` | buttons, inputs, nav items | RBAC or business-rule gating | Distinguished from `hidden` — see §7 Edge Cases |
| `loading` | cards, tables, charts, buttons | data fetch in flight | Skeleton (§20 of Design System) or inline spinner, per component |
| `expanded` / `collapsed` | Risk Card, Recommendation Card disclosures, nav rail | user toggle | `aria-expanded` required |
| `selected` | table rows (bulk actions, if present) | checkbox/click | brand-tinted left border |
| `stale` | Risk Card | data age exceeds expected refresh interval | muted timestamp caption |
| `degraded` | Agent Panel, Recommendation Card options | partial data availability | warning chip, never hidden |
| `unavailable` | Agent Panel | agent failed within timeout | explicit "no response" state |
| `decision-submitted` | Recommendation Card | Accept/Modify/Reject clicked | brief confirmation micro-state before variant transition |
| `error` | any data-bound component | fetch/mutation failure | Error state component (Design System §19), never a blank render |
| `empty` | any list/table/chart | zero results | Empty state component (Design System §17), copy specific to context |

---

## 6. Responsive Breakpoints

Restates Design System §22/§4 as exact implementation values for a Tailwind config.

| Name | Min-width | Tailwind default alignment |
|---|---|---|
| `sm` | 480px | Custom — Tailwind's default `sm` is 640px; this system overrides it to 480px to match Design System §22 exactly (see §10, Token Mapping, for how this is configured) |
| `md` | 768px | Matches Tailwind default |
| `lg` | 1024px | Matches Tailwind default |
| `xl` | 1280px | Matches Tailwind default |
| `2xl` | 1440px | Custom — Tailwind's default `2xl` is 1536px; overridden to 1440px to match the Design System's stated max content width |

**Implementation note:** because `sm` and `2xl` deviate from Tailwind's defaults, the Tailwind config's `theme.screens` must be explicitly overridden (not extended) for these two keys — using `extend.screens` would add a new breakpoint alongside the default rather than replacing it, which would leave two conflicting values in scope.

---

## 7. Edge Cases

Explicit engineering call-outs, each tied to a specific component or flow — these are the cases most likely to be missed without an explicit spec.

- **RiskCard with `hasPlan: true` but the linked plan has since been deleted/archived:** must not throw or silently 404 on click — resolve to an explicit "This plan is no longer available" state, since a plan is never hard-deleted per the system design's audit requirements, only archived; treat any missing-plan response as a data error, not an expected empty state.
- **RecommendationCard `canAct: false` combined with `status: pending-review`:** a read-only viewer must see the full card content (trust indicators, reasoning, alternatives) exactly as an actor would — only the action row differs. Do not gate content visibility by `canAct`; that prop governs actions only, per RBAC's role-scoped detail design (Design System §3, role-based rendering).
- **AgentPanel where all six agents return `unavailable`:** the Recommendation Card must still render (with `dataCompleteness` reflecting the total absence) rather than blocking plan display entirely — a fully-degraded plan is still information the PM needs to see, per the system design's graceful-degradation principle.
- **Modify flow abandoned mid-edit (user opens Modify, adjusts sliders, navigates away without submitting):** no partial state may be persisted — the weight adjustments exist only in local component state until the moment of submission, consistent with the ADR's human-in-the-loop requirement that only a complete, explicit decision is ever recorded.
- **Real-time invalidation arrives while a user has a Modify panel open on the same plan:** do not silently overwrite the in-progress edit — surface a non-blocking notice ("This plan has been updated — your in-progress changes may be based on outdated data") and let the user choose to refresh or continue, since silently discarding an in-progress PM decision is a worse failure mode than a stale-data warning.
- **Table sort/filter state on a route the user navigates away from and back to:** should persist for the duration of the session (via URL query params, not component state alone) so a PM's filtered view of the plan queue survives a navigation to a plan detail and back.
- **Density mode toggled mid-session:** must not cause a layout shift that loses the user's current scroll position/focus target — recalculate in place, don't remount the list.
- **Timeline `risk-lifecycle` variant for a risk that never generated a plan (resolved as false-positive/no-action-needed):** must terminate cleanly at a "no action required" node rather than appearing to be an incomplete/broken sequence.
- **Very long `rationale` or `title` strings (real EPC vendor/equipment names can be long):** truncation rules must be defined per component (Recommendation Card title: single-line ellipsis with full text in a tooltip; Risk Card title: allowed to wrap to two lines before truncating) — this must be decided per component, not left to default browser text overflow behavior.
- **Zero-state for a brand-new project with no historical data:** distinct from a generic empty state (Design System §17) — charts and confidence indicators must not render as if they have a baseline when they don't; show the explicit "new project" empty variant, not a chart with a flat/zero line that could be misread as an actual measurement.

---

## 8. Motion Timing

Direct implementation values from Design System §23, restated with exact CSS transition properties for engineering reference.

| Token | Duration | Easing (cubic-bezier or keyword) | Applied CSS properties |
|---|---|---|---|
| `motion.instant` | 100ms | ease-out | `background-color`, `border-color`, `box-shadow` (hover/focus) |
| `motion.fast` | 150ms | ease-out | `transform` (scale on press), `background-color` (badge state) |
| `motion.base` | 200ms | ease-in-out | `max-height`/`opacity` (disclosure expand — animate both together to avoid the common "height jump then fade" mismatch), `transform` (chevron rotation) |
| `motion.slow` | 300ms | ease-in-out | `transform: translateX` (Inspector panel slide-in), `opacity` (modal/overlay backdrop) |
| `motion.ambient` | 1500–2000ms, infinite loop | linear (shimmer), ease-in-out (pulse) | `background-position` (skeleton shimmer), `opacity`/`box-shadow` (Timeline in-progress node pulse) |

**Implementation notes:**
- Disclosure expand/collapse (`motion.base`) must animate `grid-template-rows: 0fr → 1fr` (or an equivalent auto-height technique) rather than a fixed max-height value, since Recommendation Card content is variable-length and a fixed max-height either clips longer content or leaves a visible gap for shorter content.
- All `motion.ambient` animations must be defined with a paired `@media (prefers-reduced-motion: reduce)` override that sets `animation: none` and substitutes the static fallback specified per-component in Design System §14/§20 — this is a lint-enforceable rule (see §14, Implementation Checklist).
- Toast/confirmation micro-state (`decision-submitted`) uses `motion.fast` for enter, holds for a fixed 1200ms, then `motion.base` for exit — this timing is a UX decision already implied by Design System §12 and should not be left to individual engineer judgment per instance.

---

## 9. Animation Specification

Beyond simple transitions (§8), the following are distinct, purpose-built animations:

| Animation | Component | Behavior | Reduced-motion fallback |
|---|---|---|---|
| Skeleton shimmer | Skeleton (all variants) | Linear gradient sweep, left-to-right, 1.5s loop, `background-position` animated | Static `surface.raised` block, no shimmer |
| Timeline in-progress pulse | Timeline node | Subtle `box-shadow`/opacity breathing, 2s ease-in-out loop, on the most recent node only | Static highlighted node (persistent brand-colored ring, no animation) |
| KPI numeral count-up | KpiStat | On initial mount only (not on every re-fetch), numeral counts from 0 to its value over 400ms ease-out | Numeral renders at final value immediately, no count animation |
| Confidence chip micro-visualization fill | ConfidenceChip (radial/bar) | Fills from 0 to actual value over 300ms ease-out, on mount | Fills instantly to final value |
| Severity badge entrance (new critical risk appearing in the feed) | Risk Card | Brief 200ms fade+slight-scale entrance to draw attention to a newly-critical item, fires once per severity escalation, not on every re-render | No entrance animation; item simply appears |
| Decision-submitted confirmation | Recommendation Card | Brief checkmark/confirmation micro-state per §8 timing, then transitions to the resulting status variant | Instant state swap, no intermediate confirmation animation frame (though the `aria-live` announcement per Design System §12 still fires) |

**Rule:** No animation in this table is permitted to run longer than necessary to serve its stated purpose (per Design System §23's core principle) — an engineer proposing a longer duration for aesthetic reasons should treat that as a design-system change proposal, not a local implementation choice.

---

## 10. Design Token Mapping (Tailwind Configuration Strategy)

**Approach:** Design System tokens (§2–§7, §24 of the Design System document) are wired into Tailwind via CSS custom properties, extended into `tailwind.config` — not hardcoded as literal Tailwind class values — so that theme changes (e.g., a future light/dark toggle, or a rebrand) require editing token values in one place, not hunting class strings across the codebase.

### 10.1 Mapping strategy

1. **CSS custom properties** define every token from Design System §2–§7 (e.g., `--color-surface-canvas`, `--color-risk-critical-bg`, `--space-lg`, `--radius-md`) in a global stylesheet, with a `[data-theme="light"]` override block for the light-mode values, per Design System §2.
2. **Tailwind `theme.extend`** references these custom properties (e.g., a `colors.surface.canvas` entry resolving to `var(--color-surface-canvas)`), rather than Tailwind holding the literal hex values directly — this is what makes the CSS-custom-property layer the actual source of truth, with Tailwind as a class-generation convenience on top of it.
3. **Semantic color utilities** (risk severity, agent domain) are exposed as their own Tailwind color keys (e.g., a `risk` color object with `critical`, `high`, `moderate`, `low`, `neutral` sub-keys, each itself an object with `bg`/`border`/`text`) — never generated ad hoc by concatenating strings at the component level, which would bypass Tailwind's ability to purge/tree-shake unused classes correctly.
4. **Spacing, radius, and font-size scales** in `tailwind.config` are fully replaced (not extended) with the Design System's token scale (§5, §3) — this is a deliberate constraint-by-configuration choice: removing Tailwind's own default numeric spacing scale prevents an engineer from reaching for an off-scale value (e.g., an arbitrary `p-[13px]`) that isn't one of the system's named tokens.
5. **Motion durations/easings** (§8, §23) are added as custom `transitionDuration` and `transitionTimingFunction` keys, named identically to the token names (`instant`, `fast`, `base`, `slow`) so a class reads as `duration-base`, matching the design system's own vocabulary rather than a raw millisecond value.

### 10.2 Token-to-config category mapping

| Design System token category | Tailwind config location |
|---|---|
| `color.*` (§2) | `theme.extend.colors`, sourced from CSS custom properties |
| `type.*` (§3) | `theme.fontSize` (full replace), each entry a `[size, { lineHeight, fontWeight }]` tuple matching the token table exactly |
| `space.*` (§5) | `theme.spacing` (full replace) |
| `elevation.*` (§6) | `theme.extend.boxShadow`, named to match (`shadow-elevation-2`, etc.) |
| `radius.*` (§24) | `theme.borderRadius` (full replace) |
| `icon.*` sizing (§7) | Not a Tailwind token — enforced via a shared `Icon` primitive component prop (`size="sm"|"md"|"lg"`), not arbitrary width/height classes at usage sites |
| `motion.*` (§23) | `theme.extend.transitionDuration`, `theme.extend.transitionTimingFunction` |
| Breakpoints (§6 of this document) | `theme.screens` — `sm` and `2xl` explicitly overridden, others left at Tailwind defaults per §6 above |

---

## 11. Asset Organization

| Asset type | Location | Naming |
|---|---|---|
| Icons (outline set, §7 of Design System) | `/public/icons/` or an inline SVG icon component registry (`/src/components/icons/`) | `icon-name.svg`, kebab-case, matching the semantic name used in code (e.g., `alert-triangle.svg`, `package.svg` for Procurement) — never a numbered/generic filename |
| Static illustrations | Not used per Design System §17's explicit decision to avoid decorative empty-state illustrations — no asset category needed here |
| Fonts | Self-hosted via `next/font` (Inter, JetBrains Mono) rather than a runtime Google Fonts request, for performance and to avoid a third-party network dependency on every page load | `/src/app/fonts/` per Next.js App Router convention |
| Chart color/category assets | Not image assets — defined as token references (§10.2), consumed directly by the charting library's config | — |
| Exported design-tool assets (if any static exports are needed for documentation) | `/design/exports/` (outside the application source tree entirely — never mixed into `/public`) | `component-name/variant-name/state-name.png`, mirroring Design System §25's file-naming convention exactly |

---

## 12. Naming Conventions

Extends Design System §25 into frontend-code-specific conventions.

- **Component files:** PascalCase matching the component name exactly (`RiskCard.tsx`, `AgentPanel.tsx`), one primary exported component per file.
- **Component variant/state props:** always typed as string-literal unions matching the Design System's variant vocabulary verbatim (e.g., `'watch' | 'elevated' | 'critical' | 'resolved'`) — never re-abbreviated or renamed in code (no `crit` for `critical`), since the whole point of Design System §25's naming rule is that a state name is traceable across design, code, and the underlying data model without translation.
- **CSS custom property names:** `--color-{category}-{variant}`, `--space-{token}`, `--type-{token}` — kebab-case, mirroring the dot-notation token names from Design System §24 with dots replaced by hyphens (e.g., `color.risk.critical-bg` → `--color-risk-critical-bg`).
- **Hooks:** `use` + PascalCase description of the concern, not the component (`useRiskFeed`, not `useRiskCardData`) — hooks are organized by data/business concern, reusable across whichever components need that concern.
- **API/data-layer functions:** verb-first, resource-second (`fetchRecoveryPlan`, `submitPlanDecision`), matching the action names used in the system design document's event names where a direct mapping exists (e.g., `submitPlanDecision` corresponds to the `PlanDecisionRecorded` event).
- **Test files:** co-located, `ComponentName.test.tsx`, one test file per component file — no separate parallel test-tree structure.

---

## 13. Folder Organization

Next.js App Router structure, organized around the three-layer component model from Design System §1 and the module boundaries from the system design document (frontend consumes, but does not re-derive, those boundaries).

```
src/
├── app/                          # Next.js App Router routes
│   ├── (authenticated)/
│   │   ├── dashboard/
│   │   ├── plans/
│   │   │   └── [planId]/
│   │   ├── agents/
│   │   ├── history/
│   │   ├── projects/
│   │   │   └── [projectId]/settings/
│   │   └── field/
│   ├── login/
│   ├── error.tsx
│   ├── not-found.tsx
│   └── layout.tsx                # App shell: NavRail, TopBar, density/theme context providers
├── components/
│   ├── primitives/                # Button, Badge, Tooltip, Input, Table (generic), Skeleton, EmptyState, ErrorState
│   ├── domain/                    # RiskCard, RecommendationCard, AgentPanel, Timeline, KpiStrip
│   │   ├── RiskCard/
│   │   │   ├── RiskCard.tsx
│   │   │   ├── RiskCard.test.tsx
│   │   │   └── SeverityBadge.tsx  # sub-component scoped to this domain component only
│   │   ├── RecommendationCard/
│   │   ├── AgentPanel/
│   │   └── Timeline/
│   ├── charts/                     # chart wrapper components (stacked bar, line+band, grouped bar, sparkline)
│   ├── icons/                      # icon component registry, per §11
│   └── shell/                      # NavRail, TopBar, InspectorPanel
├── hooks/                          # useRiskFeed, usePlanDecision, useDensityPreference, etc.
├── lib/
│   ├── api/                        # data-fetching functions, one module per backend module boundary
│   ├── formatters/                 # currency, date, percentage formatting utilities
│   └── rbac/                       # role/permission-checking utilities consumed by components, mirroring the ADR's RBAC model
├── styles/
│   ├── tokens.css                  # CSS custom properties, per §10.1, including the light-theme override block
│   └── globals.css
├── fonts/                          # next/font configuration, per §11
└── types/                          # shared TypeScript types/enums (severity, agent domain, plan status) — the single source of truth for the string-literal unions referenced in §12
```

**Rule:** `components/domain/*` may import from `components/primitives/*` and `components/icons/*` only — never from another `components/domain/*` component's internals directly (a `RecommendationCard` composes an `AgentPanel` via its public props/exported component, never by reaching into `AgentPanel`'s internal sub-components).

---

## 14. Frontend Implementation Checklist

A release-readiness checklist, organized by the same section numbers as the Design System for direct traceability.

**Foundation**
- [ ] CSS custom properties for all token categories (§2–§7 of Design System) implemented, including light-theme override block
- [ ] Tailwind config fully wired per §10 of this document (spacing/radius/fontSize replaced, not extended; screens `sm`/`2xl` overridden)
- [ ] Font self-hosting via `next/font` configured for both Inter and JetBrains Mono

**Primitives**
- [ ] Button: all four variants × all states implemented and visually verified against Design System §8.1
- [ ] Badge/Chip: risk, status, and agent variants; color+icon+label triplet driven by shared enum, never hand-set per usage
- [ ] Input/Select/Slider: keyboard operability verified for the Modify weight slider specifically, including `aria-valuetext`
- [ ] Tooltip/Popover: touch-device tap-triggered fallback implemented, not hover-only

**Domain components**
- [ ] RiskCard: all four severity variants, stale state, loading skeleton, expand/collapse
- [ ] RecommendationCard: all six status variants, Modify flow's atomic submission behavior (per Edge Cases §7), decision-submitted confirmation timing matches §8/§9
- [ ] AgentPanel: summary and full variants; `unavailable`/`degraded` states independently visible even inside a Recommendation Card's summary list
- [ ] Timeline: both variants; in-progress pulse with reduced-motion fallback; ordered-list semantics

**Layout & responsive**
- [ ] All breakpoint-triggered layout changes from §2.2/§6 verified at each named breakpoint, not just "looks fine at common device sizes"
- [ ] Field mobile route (`/field`) implemented as a distinct route with its own reduced component variants, not a CSS-only responsive collapse of `/dashboard`
- [ ] Density mode (comfortable/compact) toggle implemented without layout-shift/focus-loss on toggle (per Edge Cases §7)

**States & edge cases**
- [ ] Every state in the §5 matrix implemented per applicable component — no component ships with only `default`/`hover`/`loading` if it has additional states specified
- [ ] Every edge case in §7 has a corresponding implemented behavior and, where feasible, an automated test
- [ ] Error states render the actual backend-reported degraded/partial condition, never a generic fallback message, per Design System §19

**Motion**
- [ ] All animations in §9 implemented with the exact duration/easing tokens from §8, not approximated values
- [ ] Every looping/ambient animation has a verified `prefers-reduced-motion` fallback
- [ ] Disclosure expand/collapse uses the grid-based auto-height technique, not a fixed max-height

**Accessibility**
- [ ] Automated accessibility linting (e.g., axe-core in CI) passing on every route
- [ ] Manual keyboard-only pass completed on the Recommendation Card's full Accept/Modify/Reject flow, including the weight slider
- [ ] Manual screen-reader pass completed on RiskCard, RecommendationCard, and AgentPanel specifically, given their information density
- [ ] 200% text-zoom verified on Recommendation Card and dense table views, per Design System §21

**Data/RBAC correctness**
- [ ] `canAct`/role-scoped props verified to hide (not disabled-show) actions/fields a role shouldn't see, matching the ADR's RBAC model
- [ ] Source citation links in AgentPanel verified to enforce permission scope server-side, not solely via client-side role state
- [ ] Table/filter state persistence via URL params verified across navigation, per Edge Cases §7

**Naming/structure hygiene**
- [ ] No component introduces a raw color/spacing/duration value outside the token set (§10 governance rule)
- [ ] No `components/domain/*` component imports another domain component's internal sub-components directly
- [ ] All variant/state prop values match the Design System's vocabulary verbatim, with no abbreviation

---

*This document specifies structure, measurement, and process for implementation. No component code is included. Engineering is responsible for the actual React/Next.js/Tailwind implementation against this specification.*
