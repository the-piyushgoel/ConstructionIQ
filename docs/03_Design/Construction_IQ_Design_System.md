# Construction IQ — Enterprise Design System & Frontend Specification

**Document type:** Design system + component specification for engineering handoff
**Scope constraint:** Product vision, problem statement, frozen architecture, system design, and ADRs are unchanged inputs. This document specifies visual and interaction design only — no workflow, feature, or pipeline change is introduced.
**Direction:** Enterprise SaaS, dark-first, executive decision-intelligence platform. Calm, high-density, premium, minimal. Visual register close to Linear/Vercel/Stripe Dashboard/Datadog/GitHub — quiet chrome, confident type, restrained color used only where it carries meaning.

---

## 1. Design System Overview

**Design principle:** *Signal over decoration.* In a decision-intelligence product, every visual choice must help a Project Manager tell "this needs attention" from "this is fine" in under a second, at a glance, across a screen holding many simultaneous risk items. Color, weight, and motion are reserved almost entirely for that job — everything else in the interface is quiet by default.

**System structure:** Three layers, each depending only on the layer below:
1. **Foundation tokens** — color, type, spacing, elevation, radius, motion primitives (§2–5, §23–24).
2. **Primitive components** — buttons, inputs, badges, tooltips, tables (§8, §15).
3. **Composite/domain components** — Risk Cards, Recommendation Cards, Agent Panels, Timeline (§11–14) — built exclusively from primitives and tokens, never with one-off styling.

Nothing in a composite component may introduce a color, spacing value, or type size that isn't already a token. This is the enforceable rule that keeps a high-density executive dashboard from sliding into visual noise as more screens are added.

---

## 2. Color Tokens

Dark-first: all tokens are defined for the dark theme as the primary surface; a light-theme mapping is provided as a secondary, not an afterthought retrofit, since some enterprise clients mandate light mode for accessibility or projector use.

### 2.1 Neutral scale (chrome, surfaces, text)

A single cool-neutral graphite scale — not pure black — so that elevation (§6) can be expressed through actual lightness steps rather than opacity hacks.

| Token | Dark value | Light value | Usage |
|---|---|---|---|
| `color.surface.canvas` | `#0B0D10` | `#F7F8FA` | App background |
| `color.surface.base` | `#111418` | `#FFFFFF` | Default panel/card background |
| `color.surface.raised` | `#181C21` | `#FFFFFF` (with shadow) | Elevated cards, modals |
| `color.surface.overlay` | `#1F242B` | `#F1F2F4` | Popovers, dropdowns, tooltips |
| `color.surface.sunken` | `#0E1013` | `#EEF0F2` | Inset regions (code blocks, log panels) |
| `color.border.subtle` | `#20252C` | `#E4E6E9` | Hairline dividers |
| `color.border.default` | `#2A3038` | `#D6D9DD` | Card borders, table rules |
| `color.border.strong` | `#3A424D` | `#B8BCC2` | Focus rings, active borders |
| `color.text.primary` | `#EDEFF2` | `#12151A` | Headings, primary values |
| `color.text.secondary` | `#9AA2AD` | `#5B616B` | Supporting text, labels |
| `color.text.muted` | `#666E79` | `#8B909A` | Timestamps, placeholders |
| `color.text.disabled` | `#454B54` | `#B4B8BE` | Disabled control text |

### 2.2 Brand accent

A restrained indigo-violet — signals "intelligence/reasoning" without borrowing Linear's exact purple or any competitor's literal hue. Used for primary actions, active nav state, and the AI-reasoning affordances (agent panels, confidence indicators) — never for risk severity, which has its own dedicated ramp (§2.3) so the two meanings never collide.

| Token | Value | Usage |
|---|---|---|
| `color.brand.50` | `#EEF0FE` | Tinted backgrounds (light mode) |
| `color.brand.400` | `#7B7FF0` | Hover state, secondary accents |
| `color.brand.500` | `#5B5FE8` | Primary actions, active nav, links |
| `color.brand.600` | `#4548C4` | Pressed state |
| `color.brand.900` | `#1E1F52` | Text-on-tint (light mode) |

### 2.3 Semantic / risk scale

This is the single most important token group in the system: it is the vocabulary the entire product uses to communicate risk severity, and it must never be reused for anything else (no decorative use of red, no using amber for a "new feature" badge).

| Token | Value (dark) | Meaning | Used by |
|---|---|---|---|
| `color.risk.critical` | `#E5484D` | Confirmed disruption, immediate action required | Risk Card critical state, PM alert badges |
| `color.risk.high` | `#F0913D` | High predicted risk (≥65%) | Risk Card, monitoring heat indicators |
| `color.risk.moderate` | `#E8B93D` | Moderate predicted risk (35–64%) | Risk Card, watch-state indicators |
| `color.risk.low` | `#4FAE6E` | Low risk / resolved / accepted-and-on-track | Confirmation states, resolved plans |
| `color.risk.neutral` | `#5B6270` | No active risk, informational | Default monitoring state |

Each semantic color ships as a 3-stop mini-ramp (`-bg` at ~12% opacity fill, `-border` at ~40% opacity, `-text` at full saturation, lightened for AA contrast on dark surfaces) — e.g. `color.risk.critical-bg`, `color.risk.critical-border`, `color.risk.critical-text` — so severity can be expressed as a full badge/card treatment, not just a text color.

### 2.4 Data visualization palette

A categorical set distinct from the risk scale, for charts where color encodes *category* (which agent, which vendor) rather than *severity* — reusing the risk colors for chart categories would teach users a false severity association.

`viz.1` `#5B5FE8` (brand) · `viz.2` `#3DB8E8` · `viz.3` `#3DE8C4` · `viz.4` `#E8C43D` · `viz.5` `#E87D3D` · `viz.6` `#C43DE8`

**Accessibility note:** every risk and viz token is paired with a non-color redundant cue (icon shape for risk level, pattern/label for chart series) per §21 — color is never the sole channel.

---

## 3. Typography Scale

**Typeface pairing:** A grotesque sans for UI and a monospace for data/IDs/timestamps — no serif anywhere; this is a data-density product, not an editorial one.
- **UI face:** Inter (or an equivalent grotesque — Inter is specified for its mature variable-font support and numeral tabular-figure feature, critical for aligned KPI tables).
- **Mono face:** JetBrains Mono, for equipment IDs, timestamps, confidence percentages in dense tables, and code/log-style content — tabular numerals are load-bearing here since misaligned digit columns in a monitoring table read as sloppy immediately.

### 3.1 Type scale (tokenized, not ad hoc per screen)

| Token | Size / line-height | Weight | Usage |
|---|---|---|---|
| `type.display` | 28px / 36px | 600 | Page-level titles (rare — this is a dashboard, not a marketing page) |
| `type.heading.lg` | 20px / 28px | 600 | Section headers (e.g. "Active recovery plans") |
| `type.heading.md` | 16px / 24px | 600 | Card titles, panel headers |
| `type.body.lg` | 15px / 22px | 400 | Primary reading text, card descriptions |
| `type.body.md` | 13px / 20px | 400 | Default UI text, table cells |
| `type.body.sm` | 12px / 16px | 400 | Secondary labels, metadata |
| `type.caption` | 11px / 14px | 500 | Uppercase eyebrows, badge labels (rare — used only where a label needs to be distinguished from data, not decoratively) |
| `type.mono.data` | 13px / 20px | 400, tabular-nums | Percentages, IDs, timestamps in tables |
| `type.mono.lg` | 22px / 28px | 500, tabular-nums | Large KPI numerals (e.g. "72%" on a Risk Card) |

**Rule:** No screen introduces a font size outside this scale. If a designer believes a new size is needed, that is a token-addition proposal, not a one-off style.

---

## 4. Grid System

- **Base unit:** 8px grid throughout (all spacing, all component dimensions round to multiples of 8, with 4px permitted only for icon-to-label micro-gaps).
- **Dashboard layout grid:** 12-column responsive grid, max content width **1440px** (this is a data-dense desktop-first product — the primary user is a PMO at a workstation, not a phone, so the grid is not mobile-first, though it degrades per §22).
- **Gutters:** 24px at desktop (≥1280px), 16px at tablet (768–1279px), 12px at mobile (<768px).
- **Standard region widths:** left navigation rail fixed at 240px (collapsible to 64px icon-rail); main content area fluid; a right-hand detail/inspector panel (used for expanded agent reasoning) fixed at 400px, overlaying on narrower viewports rather than squeezing the main grid.

---

## 5. Spacing Tokens

8px base scale, named rather than numbered so intent is legible in code and design files alike:

| Token | Value | Usage |
|---|---|---|
| `space.xs` | 4px | Icon-to-label gap, tight inline spacing |
| `space.sm` | 8px | Internal padding of small controls (badges, chips) |
| `space.md` | 12px | Default internal card padding (compact density) |
| `space.lg` | 16px | Standard card padding, form field spacing |
| `space.xl` | 24px | Section spacing, gutter width |
| `space.2xl` | 32px | Major section separation |
| `space.3xl` | 48px | Page-level top margin, empty-state vertical rhythm |

**Density modes:** The product ships two density presets built entirely from these tokens — `comfortable` (default `lg`/`xl` rhythm) and `compact` (drops one step, `md`/`lg` rhythm) — since an executive dashboard's core promise is information density, and some PMOs will want to see more rows per screen. Density is a user preference, not a fixed design choice.

---

## 6. Elevation System

Elevation is expressed through **surface lightness steps (§2.1) plus a restrained shadow**, not through heavy drop shadows — the dark-first direction means shadows read poorly against a near-black canvas, so lightness does most of the work, with shadow reserved for genuinely floating layers (modals, popovers) that need to visually separate from a busy background.

| Token | Surface | Shadow (dark) | Usage |
|---|---|---|---|
| `elevation.0` | `surface.canvas` | none | App background |
| `elevation.1` | `surface.base` | none | Default cards, panels, table rows |
| `elevation.2` | `surface.raised` | `0 2px 8px rgba(0,0,0,0.32)` | Hovered/focused cards, dropdown triggers |
| `elevation.3` | `surface.overlay` | `0 8px 24px rgba(0,0,0,0.48)` | Popovers, tooltips, dropdown menus |
| `elevation.4` | `surface.overlay` | `0 16px 48px rgba(0,0,0,0.56)` | Modals, the expanded recommendation-review dialog |

**Rule:** No component uses a shadow value outside this table. No component skips an elevation level (a card jumps from `1` to `3`, never `1` to `4` directly), which is what keeps the visual hierarchy calm rather than jumpy on hover/focus.

---

## 7. Iconography

- **Icon set:** A single outline icon family throughout (16/20/24px sizes only), consistent stroke width (1.5px at 20px size, scaling proportionally) — mixing filled and outline icons is the single fastest way to make an enterprise dashboard look inconsistent, so this is a hard rule, not a preference.
- **Semantic icon mapping (paired with the risk color tokens, §2.3, for the redundant non-color cue required in §21):**
  - Critical: filled triangle-exclamation glyph (outline family's "alert-triangle", rendered with the critical color)
  - High: triangle-exclamation, moderate color
  - Moderate: circle-info
  - Low/resolved: circle-check
  - Agent-specific icons: one consistent glyph per agent domain (Procurement: package/box, Scheduling: calendar, Resource: users, Cost: currency, Quality: check-shield, Risk: shield-alert) — used consistently across Agent Panels, badges, and filters so an agent's identity is recognizable by shape alone, not only by color or label.
- **Sizing tokens:** `icon.sm` 16px (inline with `body.sm` text), `icon.md` 20px (default, inline with `body.md`), `icon.lg` 24px (standalone, empty states, nav rail).

---

## 8. Component Library (Primitives)

Each primitive below follows the same specification shape used throughout this document: **Variants → States → Responsive behaviour → Accessibility → Tokens → Developer notes.**

### 8.1 Button

**Variants:** `primary` (brand-filled, one per view max), `secondary` (bordered, neutral), `ghost` (text-only, for low-emphasis actions), `danger` (risk.critical-filled, reserved for destructive/reject actions).

**States:** default, hover (elevation +1 step, per §6), active/pressed (brand.600), focus-visible (2px `color.border.strong` ring, offset 2px), disabled (`text.disabled` + `surface.sunken`, no hover response), loading (label replaced by an inline spinner, button remains its committed width to prevent layout shift).

**Responsive behaviour:** Buttons never shrink below a 32px (compact) / 36px (comfortable) height regardless of viewport; on narrow viewports, a button group stacks vertically only if all buttons cannot fit at their minimum width — never truncates label text.

**Accessibility:** Minimum 4.5:1 contrast for text at all states including disabled-adjacent hover; every icon-only button variant requires an `aria-label`; focus-visible ring is never suppressed, including on click (a common regression to explicitly guard against).

**Tokens:** `space.sm`/`space.md` internal padding by density mode; `type.body.md` label; `elevation.0`→`1` on hover.

**Developer notes:** Loading state must disable pointer events but keep the button in the tab order announcing `aria-busy="true"`, not remove it from the DOM — removing it shifts focus unpredictably for keyboard users mid-action.

### 8.2 Badge / Chip

**Variants:** `risk` (uses the §2.3 3-stop ramp — bg/border/text), `status` (neutral, e.g. "Draft", "Archived"), `agent` (uses agent-domain color + icon, §7).

**States:** static (badges are not interactive by default); an `interactive` sub-variant (dismissible filter chips) adds hover/focus/pressed states identical in spec to Button's ghost variant.

**Responsive behaviour:** Badge label truncates with an ellipsis only inside dense table cells (with a tooltip revealing the full label on hover/focus); never truncates inside a Risk Card header.

**Accessibility:** Risk badges always pair color with the semantic icon (§7) and a text label ("Critical", not just a red dot) — color-only risk badges are an explicit anti-pattern for this system, called out because it is the single most common design regression in dashboard products.

**Tokens:** `space.xs` internal padding, `type.caption` or `type.body.sm` depending on density, `radius.pill` (§24).

**Developer notes:** Badge color/icon/label triplet should be driven by a single shared enum (risk severity, agent domain) in the frontend codebase — never hand-set independently per usage site, or a future palette change requires hunting every call site.

### 8.3 Input / Select / Slider

**Variants:** text input, select/dropdown, the "Modify" weight-adjustment slider (a domain-specific control used in the Recommendation Card's Modify flow, §12).

**States:** default, focus (border → `border.strong` + subtle brand-tinted glow), error (border → `risk.critical`, helper text in `risk.critical-text`), disabled.

**Responsive behaviour:** Inputs are full-width within their container at all breakpoints below 480px; above that, sized to content-appropriate fixed widths (e.g., a percentage input is never full-width on desktop).

**Accessibility:** Every input has a visible, programmatically associated `<label>` (no placeholder-as-label anti-pattern); error state is announced via `aria-invalid` + `aria-describedby` pointing to the helper text; the Modify slider is fully operable via arrow keys, not only drag, with the current value announced on change (`aria-valuenow`/`aria-valuetext`, the latter set to a human-readable value like "Schedule priority: high" rather than a raw number).

**Tokens:** `space.md` internal padding, `type.body.md`, `color.border.default` default border.

**Developer notes:** The Modify slider's `aria-valuetext` must be derived from the same weighting-tier labels shown visually (per the frozen product's weighted-scoring design) — never leave it as a bare percentage for screen-reader users when sighted users see a qualitative label.

### 8.4 Tooltip / Popover

**Variants:** `tooltip` (single-line or short multi-line hint, hover/focus-triggered), `popover` (richer content — e.g., an agent's short reasoning excerpt — click-triggered).

**States:** entering/visible/exiting (per the motion tokens in §23).

**Responsive behaviour:** On touch/coarse-pointer viewports, tooltips convert to tap-triggered popovers (no hover-only content is ever the sole way to access information, since touch has no hover).

**Accessibility:** Tooltip content is available to screen readers via `aria-describedby`, never conveyed by `title` attribute alone; popovers trap focus while open and return focus to the trigger on close (standard dialog-adjacent behavior).

**Tokens:** `elevation.3`, `space.sm` padding, `type.body.sm`.

**Developer notes:** Tooltips must never be the only carrier of critical information (e.g., the full reasoning behind a risk score) — they supplement, and the same content must be reachable via a click-through to the full Agent Panel (§13).

---

## 9. Dashboard Layout

**Primary layout (desktop, ≥1280px):**

```
┌───────────┬──────────────────────────────────────────────┬──────────────┐
│           │  Top bar: search · project switcher · alerts   │              │
│  Nav rail ├──────────────────────────────────────────────┤  Inspector   │
│  240px    │  KPI strip (Impact-at-a-glance metrics)          │  panel       │
│           ├──────────────────────────────────────────────┤  400px        │
│           │  Active risk feed (Risk Cards, sorted by         │  (collapsed  │
│           │  severity then detection recency)                │  by default, │
│           │                                                  │  opens on    │
│           │  Recovery plan queue (Recommendation Cards)       │  card click) │
└───────────┴──────────────────────────────────────────────┴──────────────┘
```

**Rationale:** The KPI strip and risk feed are the two things a PMO needs to see *without clicking anything*, per the product's own core value proposition (fast signal-to-decision). The Inspector panel is collapsed by default to preserve density and opens as an overlay (not a permanent third column) below 1440px, so the two-column core layout never gets squeezed on a standard laptop screen.

**Responsive collapse order (widest to narrowest):** Inspector panel → overlay; Nav rail → icon-only rail (64px); KPI strip → horizontally scrollable row (never wraps to multiple rows, which would push the risk feed below the fold).

---

## 10. Navigation

**Structure:** Left nav rail, icon + label at full width (240px), icon-only at collapsed width (64px), with the current section indicated by a `color.brand.500` left-edge accent bar (2px) plus a filled icon state — never color alone (§21).

**Primary items:** Overview (KPI + risk feed), Recovery plans (queue + history), Agents (per-agent configuration/performance — a monitoring surface, not a workflow change), Projects (multi-project switcher, per the system design's multi-tenant scaling), Settings.

**Top bar:** Global project switcher (dropdown, since a PMO may oversee multiple concurrent EPC projects per the system design's multi-project scaling), a global search (risk IDs, vendor names, plan IDs), and a persistent alert bell showing unread critical-risk count as a numeral badge (never just a dot — the count itself is decision-relevant).

**States:** default, hover, active/current (persistent, not just on-click), disabled (for a nav item gated by role, per the ADR's RBAC model — shown grayed rather than hidden, with a tooltip explaining the required role, so users understand the system's shape rather than encountering silent gaps).

**Accessibility:** Nav is a `<nav>` landmark with `aria-current="page"` on the active item; collapsed icon-rail state requires every icon to retain an accessible name via `aria-label`, not rely on the (now-hidden) visible text label.

**Responsive behaviour:** Below 768px, the nav rail becomes a bottom-anchored or slide-over drawer, not a persistently docked rail — persistent docked navigation at that width would consume too much of the limited viewport for a data-dense product.

---

## 11. Risk Cards

The primary unit of the monitoring surface — represents one actively tracked risk (a predicted disruption, per the frozen Risk Prediction/Attribution stages).

**Variants:**
- `watch` — low/moderate risk, informational, quiet visual treatment (neutral border, no icon badge).
- `elevated` — high risk (≥65%), amber treatment, icon badge present.
- `critical` — confirmed or imminent disruption, red treatment, icon badge present, persistent (does not auto-dismiss).
- `resolved` — a risk that was addressed (plan accepted and outcome recorded), shown with the low/green treatment and a "resolved" status chip, retained in a collapsed history view rather than removed, since the Learning Repository's audit trail (per the ADRs) requires resolved risks to remain inspectable.

**Anatomy:** Header row (risk title, severity badge, detection timestamp in `type.mono.data`) → risk score numeral (`type.mono.lg`, colored per severity) → attribution mini-breakdown (a compact horizontal stacked bar showing the weighted factor contributions from the Risk Attribution Engine — vendor history, port congestion, weather, inventory — using the `viz` categorical palette, §2.4, since this is categorical decomposition, not severity) → a "View recovery plan" action if a plan has been generated, or a quiet "Monitoring — no plan needed yet" caption if the risk is still below the plan-generation threshold.

**States:** default, hover (elevation +1), expanded (inline reveal of the full attribution breakdown and a link into the Agent Panel), loading (skeleton, §20), stale (a risk card whose underlying data hasn't refreshed within an expected interval — shown with a muted "last updated Xm ago" caption in `text.muted`, never silently presenting old data as current).

**Responsive behaviour:** At desktop widths, cards render in a single-column list (this is a scanning surface, not a card-grid — a PMO reads top-to-bottom by severity, so multi-column card grids would break that reading order); on narrower viewports, the attribution mini-breakdown collapses from a labeled stacked bar to an unlabeled bar with a "view breakdown" tap target.

**Accessibility:** The severity badge's icon + label (§7, §8.2) is the accessible name for severity — never conveyed by border color alone; the attribution stacked-bar chart includes a text-equivalent (a visually-hidden list of "factor: percentage" pairs) for screen-reader users, since a purely visual stacked bar conveys nothing to non-sighted users.

**Tokens:** `elevation.1` default / `elevation.2` hover; risk-severity 3-stop ramp per §2.3; `space.lg` internal padding (comfortable) / `space.md` (compact).

**Developer notes:** The severity variant is derived server-side from the risk score threshold bands (per the system design's Risk Prediction output), not computed client-side from a raw percentage — this keeps the threshold logic in one place and prevents a future threshold tuning change from requiring a frontend redeploy.

---

## 12. Recommendation Cards

Represents one generated recovery plan (post-Simulation, post-Orchestrator), the primary decision surface for the Project Manager's Accept/Modify/Reject action.

**Variants:** `pending-review` (awaiting PM decision — default), `accepted`, `modified` (shown with a diff-style indicator of which weights were adjusted from the system default), `rejected` (retained, not deleted, for audit purposes), `outcome-pending` (accepted, awaiting real-world outcome confirmation from the Learning Repository loop), `outcome-confirmed`.

**Anatomy:**
1. Header: linked risk title, `recommendation confidence` numeral badge (per the frozen UX's trust-indicator design), timestamp.
2. Primary recommendation summary: recovery days, extra cost, one-line rationale.
3. Trust-indicator row: three compact stat chips — Recommendation Confidence, Reasoning Confidence, Data Completeness (exactly the three indicators specified in the frozen product design) — each using a small radial or bar micro-visualization, not just a bare numeral, so relative confidence is scannable without reading digits.
4. Expandable "Why this plan?" disclosure — reveals the per-agent reasoning trail (a compact list, each entry linking into the full Agent Panel, §13).
5. "See 2 alternatives" secondary disclosure — reveals the Simulation Engine's ranked alternative options (recovery days / cost / confidence table, per the ADR's simulation output structure).
6. Action row: `Accept` (primary button), `Modify` (secondary — opens the weight-adjustment slider inputs, §8.3), `Reject` (danger/ghost).

**States:** default, hover, expanded (either disclosure open — both can be open simultaneously, they are independent), decision-submitted (a brief confirmation micro-state before the card transitions to its resulting variant — never an instant, jarring state swap, since this is a consequential action and deserves a moment of visible confirmation), disabled (a card a lower-permission role can view but not act on, per RBAC — action row replaced with a "View only" caption, buttons hidden rather than disabled-and-clickable-looking).

**Responsive behaviour:** The trust-indicator row (item 3) is the first thing to compress on narrow viewports — three chips collapse to a single combined "Confidence: 92%" summary chip with the full three-part breakdown available in the expanded disclosure, rather than cramming three chips into insufficient width.

**Accessibility:** The Accept/Modify/Reject action row is a `<fieldset>`-equivalent semantic grouping (or ARIA `group` role) with a clear accessible name ("Decision for recovery plan #...") so screen-reader users understand these three actions are mutually exclusive alternatives for one decision, not three independent buttons; the decision-submitted confirmation state must be announced via an `aria-live="polite"` region, since it's a state change not necessarily co-located with current focus.

**Tokens:** `elevation.1` default / `elevation.2` hover/expanded; brand accent for the confidence chips (this is an AI-reasoning affordance, not a risk-severity one, so it correctly uses `color.brand`, not the risk ramp — reinforcing the meaning-separation from §2.3); `space.lg` card padding.

**Developer notes:** The Modify flow's weight adjustments must be submitted as a single atomic decision payload (weights + action), matching the ADR's `plan_decisions` table structure — the UI must not allow a "Modify" submission to exist in an ambiguous intermediate state where weights are saved but no action (accept-with-modification) has been recorded, since the human-in-the-loop ADR requires every downstream action to trace to one explicit recorded decision.

---

## 13. Agent Panels

The explainability surface — shows one agent's (Procurement, Scheduling, Resource, Cost, Quality, Risk) individual reasoning for a given risk/recommendation.

**Variants:** `summary` (compact, embedded inline within a Recommendation Card's "Why this plan?" disclosure — one line per agent), `full` (the Inspector panel view, §9, opened by clicking an agent row — shows that agent's complete input context, proposed options, and confidence).

**Anatomy (full variant):** Agent identity header (icon + name, per §7's agent-domain mapping) → data-completeness indicator for that specific agent (was its data source fully available, per the system design's degraded-confidence handling) → proposed options list (each with schedule/cost/quality/contract-risk fields, matching the ADR's `AgentRecommendation` contract) → source citations (which underlying data — vendor record, contract clause — informed this option, satisfying the explainability requirement without exposing the full raw document inline).

**States:** default, loading (that agent's response hasn't arrived yet within the fan-out window — shown as a distinct "awaiting response" state, not a generic spinner, since a PM should be able to tell *which* agent is slow), degraded (agent responded but flagged low data completeness — shown with a muted warning chip, not hidden), unavailable (agent failed entirely within the timeout — shown explicitly, contributing to the overall plan's lowered data-completeness score per §12, never silently omitted).

**Responsive behaviour:** The `full` variant, being an Inspector-panel/overlay surface (§9), takes the full overlay width on any viewport below 1440px rather than being squeezed into a persistent third column.

**Accessibility:** Each agent's `unavailable`/`degraded` state must be independently announced (not just reflected in the aggregate confidence score), since the specific reason a recommendation's confidence is lower is itself decision-relevant information for the PM, not a footnote.

**Tokens:** Agent-domain color/icon pairing per §7; `elevation.3` for the overlay panel container; `type.body.md` for reasoning text.

**Developer notes:** Source citations must link to a read-only, permission-checked document view (respecting the RBAC scoping from the ADRs — a field supervisor role must not be able to open a full contract document via an agent panel citation even if they can see the agent's summary).

---

## 14. Timeline Components

Used for the "story-driven" disruption narrative (signal detected → risk escalates → plan generated → decision recorded → outcome observed) — a vertical event timeline, not the horizontal Gantt-style scheduling view (which belongs to the underlying Primavera/MS Project data, not this product's own UI surface).

**Variants:** `risk-lifecycle` (one risk's journey from first detection through outcome), `plan-history` (a project-level feed of all decisions made, for audit/review).

**Anatomy:** Vertical rail with discrete event nodes (dot + connecting line), each node showing: event type icon, timestamp (`type.mono.data`), one-line description, and — where relevant — the risk score at that point in time (so a PM can see the score's evolution, e.g. "45% → 72%," directly in the timeline rather than needing a separate chart).

**States:** default, `in-progress` (the most recent node pulses subtly, per the motion guidelines in §23, to indicate this is a live, still-evolving sequence, not a closed history — this is the one place in the system where a subtle ambient animation is justified, since it directly communicates "this is still happening"), `complete` (no animation, all nodes static).

**Responsive behaviour:** The vertical rail's connecting line and node spacing compress (shorter `space.lg`→`space.md` gaps) on narrow viewports rather than converting to a horizontal scroller, since a vertical timeline reads naturally at any width down to mobile.

**Accessibility:** The timeline is marked up as an ordered list (`<ol>`), not a series of unconnected `<div>`s, so screen-reader users get the sequence and count ("event 3 of 7") for free; the pulsing in-progress node respects `prefers-reduced-motion` (§23) by falling back to a static highlighted state.

**Tokens:** `color.border.default` for the rail line, `color.brand.500` for the in-progress node accent, `space.lg` default node spacing.

**Developer notes:** Timeline events are rendered directly from the event log described in the system design's event-flow section (§8 of the system design document) — each timeline node corresponds 1:1 to a published pipeline event, which is what guarantees the timeline is always an accurate reconstruction of the backend's actual event history, not a UI-side approximation.

---

## 15. Tables

The workhorse of a high-density enterprise dashboard — used for the recovery-plan queue, plan-decision history, and agent-performance views.

**Variants:** `default` (standard data table), `expandable-row` (a row that reveals a nested detail panel in place, used for a compact recovery-plan queue that expands into the full Recommendation Card inline rather than always navigating away).

**Anatomy:** Sticky header row, `type.body.sm` column labels in `text.secondary`, `type.mono.data` for numeric/ID columns (right-aligned, tabular figures — never left-aligned numbers, which break scannability), row-level severity indication via a thin left-edge color bar (2px, using the risk ramp, §2.3) rather than tinting the whole row background, which would be too visually loud at high row density.

**States:** default row, hover (subtle `surface.raised` background shift), selected (for bulk actions, if applicable — checkbox + `surface.raised` + brand-tinted left border), empty (§17), loading (§20), sortable-column-active (arrow indicator + `text.primary` weight on the active column header, others recede to `text.secondary`).

**Responsive behaviour:** Below 768px, tables convert to a stacked card-per-row layout (each row's columns become labeled key-value pairs) rather than horizontal-scrolling the table — horizontal scroll on a dense data table is a common but poor mobile pattern for this kind of content, since it hides columns from view entirely.

**Accessibility:** Proper `<table>` semantics with `scope` attributes on header cells (not a `<div>`-grid approximation) so screen-reader users get correct row/column announcement; sortable columns expose `aria-sort`; the expandable-row variant uses `aria-expanded` on the trigger and associates the revealed panel via `aria-controls`.

**Tokens:** `space.md` cell padding (compact) / `space.lg` (comfortable); `color.border.subtle` row dividers; `elevation.1` for the sticky header (subtle shadow on scroll to indicate content is passing beneath it).

**Developer notes:** Column widths should be defined proportionally with defined minimums, not fixed pixel values, so the table adapts to the Inspector-panel-open/closed states of the dashboard layout (§9) without individual columns becoming unreadably narrow.

---

## 16. Charts

**Chart types used (each mapped to a specific data shape in the product, not chosen decoratively):**
- **Stacked horizontal bar** — risk attribution breakdown (categorical decomposition of one risk score), using `viz` palette.
- **Line chart with confidence band** — risk score evolution over time (the "45% → 72%" trend), using `color.brand` for the primary line and a low-opacity brand fill for any uncertainty band.
- **Grouped bar** — simulation option comparison (recovery days / cost / confidence across 2–3 candidate options side by side).
- **Sparkline** — inline, small-multiple trend indicators embedded in table rows (e.g., a vendor's recent on-time-delivery trend) — intentionally tiny and label-free, relying on the surrounding table row for context, never used as a standalone chart.

**States:** default, loading (skeleton axis + shimmer bars, §20), empty (no data yet for the selected time range — an explicit empty state per §17, never a blank chart canvas with no explanation), hover (tooltip per §8.4 showing exact values, since the visual chart alone is for pattern-scanning, not precise reading).

**Responsive behaviour:** Charts reflow their internal padding and label density (fewer axis ticks) at narrow widths rather than shrinking to illegibility; the grouped-bar simulation comparison stacks vertically into a small table below ~480px rather than compressing bars past a legible width.

**Accessibility:** Every chart ships with a visually-hidden text summary (per the Visualizer/diagram accessibility pattern used elsewhere in this system) stating the key takeaway in words (e.g., "Vendor history is the largest contributing factor at 32%") — charts are supplementary to, never the sole carrier of, the underlying data, which is also available in table form via a "view as table" toggle for screen-reader and precision-reading users.

**Tokens:** `viz` categorical palette (§2.4) for category charts; `color.risk.*` only for charts that are explicitly plotting severity over time (e.g., a risk-score line chart may use the risk ramp for its fill, since severity *is* the subject there — the meaning-separation rule from §2.3 is about not reusing risk colors for unrelated categorical data, not a prohibition on ever using risk colors in charts about risk).

---

## 17. Empty States

Per the frontend-design principle that emptiness is an invitation to act, not a dead end — every empty state names what's missing and what will fill it, in the interface's own voice.

**Instances specified:**
- **No active risks** ("All monitored items are currently within normal parameters" + a quiet illustration-free confirmation, deliberately calm rather than celebratory — this is a monitoring tool, not a game, so no confetti/checkmark-burst treatment).
- **No recovery plans generated yet** ("Recovery plans appear here once a monitored risk crosses the prediction threshold" — explains the *system's* trigger condition in plain terms, so a new user understands why the queue is empty rather than wondering if something is broken).
- **No results for current filter/search** ("No risks match [filter]" + a clear "Clear filters" action).
- **New project, no historical data** (a distinct state from "no active risks" — explains that trend charts and the Learning Repository's calibration confidence will improve as the project accumulates history, setting an honest expectation rather than showing a misleadingly confident empty chart).

**Anatomy:** Centered within the content region (never full-viewport-centered if a nav rail/KPI strip is present — those remain visible), `type.heading.md` statement, `type.body.md` explanation, one primary action if applicable.

**Accessibility:** Empty state text is real DOM content (not an image with alt text standing in for the explanation), so it's selectable, translatable, and readable by assistive technology like any other content.

**Tokens:** `space.3xl` vertical rhythm, `icon.lg` for the single supporting icon (outline family, never a large illustrative graphic — consistent with the minimal/premium direction; ornamental empty-state illustrations are explicitly avoided here as inconsistent with the Linear/Vercel/Datadog register).

---

## 18. Loading States

**Principle:** Distinguish *initial load* (skeleton, §20) from *transient re-fetch* (a subtle inline indicator, not a full skeleton flash) from *background processing* (the pipeline itself running — Simulation in progress, agents still responding) — collapsing all three into one generic spinner treatment loses information the user needs (per §13's explicit "which agent is slow" requirement).

**Instances:**
- **Initial page load:** full skeleton layout (§20).
- **Re-fetch after a real-time invalidation (§3 of the system design's frontend architecture):** the existing content remains visible with a subtle top-edge progress bar (2px, `color.brand.500`, indeterminate animation) rather than replacing content with a skeleton — content should never flash to empty just because it's refreshing.
- **Pipeline processing (a risk actively moving through Prediction → Attribution → Agents → Simulation):** the Risk Card shows a distinct "Generating recovery plan…" state with a short, honest processing-stage label (not a generic spinner), consistent with the story-driven demo principle established for this product — the user should be able to tell roughly what stage the system is in, not just that "something is loading."

**Accessibility:** All loading indicators include `aria-live="polite"` announcements at meaningful transitions (e.g., "Recovery plan ready" once complete) — not on every intermediate frame, which would spam a screen-reader user with noise.

**Tokens:** `color.brand.500` for all progress indicators (loading is a neutral, brand-adjacent state — never using a risk color for a loading indicator, which would incorrectly imply severity).

---

## 19. Error States

**Principle (per the system design's error-handling section, §20 of that document):** the frontend must render the actual degraded/partial state the backend reports, never a generic failure message, and never silently show stale data as if it were current.

**Instances:**
- **Agent unavailable within timeout:** shown explicitly within the Agent Panel (§13's `unavailable` state), contributing visibly to lowered data completeness — not hidden as a generic "some data missing" footnote.
- **Simulation timeout on an option:** the affected option is shown with a "confidence reduced — could not fully validate" chip, per the ADR's explicit design principle that uncertainty is surfaced, not hidden.
- **Full page/API failure:** a dedicated error surface (not a blank screen) stating what failed in plain terms ("Unable to load recovery plans right now") with a retry action — matching the frontend-design writing principle that errors don't apologize and are never vague.
- **Permission-denied (RBAC):** a specific "You don't have access to this view" state, distinct from a generic 404/error, so a user understands it's a role limitation, not a broken link.

**Accessibility:** Error text is announced via `aria-live="assertive"` for full-surface failures (these need immediate attention) but `aria-live="polite"` for partial/degraded states like a single unavailable agent (these are informational, not urgent interruptions).

**Tokens:** `color.risk.critical-text` for full failure states; `color.risk.moderate-text` for degraded/partial states — reusing the same semantic ramp as risk severity is intentional here, since a system error and a business risk both represent "something needs attention," and a consistent visual vocabulary for "attention needed" is more legible than a separate error-specific color system.

---

## 20. Skeleton States

**Principle:** Skeletons mirror the exact shape of the content they're replacing (card outlines, table row placeholders, chart axis placeholders) — never a generic centered spinner for a data-dense screen, since a shape-matched skeleton lets the user's eye pre-orient to the layout before data arrives, reducing perceived load time.

**Instances:** Risk Card skeleton (header bar + numeral block + attribution-bar placeholder, all as pulsing `surface.raised` blocks), Table skeleton (header row rendered immediately/real, body rows as shimmer blocks matching real row height), KPI strip skeleton (numeral placeholders at the correct `type.mono.lg` dimensions so the strip doesn't reflow once real numbers arrive).

**Motion:** A subtle left-to-right shimmer gradient sweep (per §23's motion tokens), 1.5s duration, looping only while genuinely loading — never left running past actual data arrival (a skeleton that lingers after data is ready is a common, jarring implementation bug to explicitly guard against).

**Accessibility:** The skeleton container carries `aria-busy="true"` and `role="status"` with a visually-hidden "Loading recovery plans" label — skeleton blocks themselves are `aria-hidden`, since their shimmer animation has no semantic content to announce.

**Tokens:** `surface.raised` base + a `+8%` lightness shimmer sweep; identical corner radii and dimensions to the real component being replaced, per the component's own tokens (never approximate).

---

## 21. Accessibility Guidelines

- **Contrast:** All text meets WCAG 2.1 AA at minimum (4.5:1 for body text, 3:1 for large/heading text) against its actual rendered background — checked against `surface.base`, `surface.raised`, and `surface.overlay` individually, since a color that passes on one dark surface may fail on a lighter elevation step.
- **Color independence:** Every instance of color-coded meaning (risk severity, agent identity, chart category) ships with a redundant non-color cue — icon, shape, pattern, or text label — per the specific guidance embedded in §2.3, §7, §11, §16. This is treated as a hard release-blocking requirement given the product's own explainability mandate: a system whose core value proposition is "explainable AI" cannot then rely on color alone to convey its own severity signals.
- **Keyboard operability:** every interactive element (including the Modify weight slider, expandable disclosures, and table row expansion) is fully operable via keyboard alone, with a visible focus-visible ring (never `outline: none` without a replacement) at `color.border.strong`, 2px, 2px offset.
- **Screen-reader structure:** semantic HTML landmarks (`<nav>`, `<main>`, `<aside>` for the Inspector panel) throughout; live regions scoped correctly per urgency (assertive only for genuinely urgent state changes, per §19); tables, timelines, and lists use their correct semantic elements, never `<div>` soup with visual-only structure.
- **Reduced motion:** every animation in §23 has a `prefers-reduced-motion: reduce` fallback to an instant state change or a static equivalent (explicitly specified per-component above, not left as a generic afterthought).
- **Text resizing:** layout tolerates 200% browser text zoom without content loss or overlap — verified specifically for the Recommendation Card's trust-indicator row and the dense table cells, the two components most likely to break under zoom given their information density.

---

## 22. Responsive Behaviour

**Breakpoints:** `sm` 480px · `md` 768px · `lg` 1024px · `xl` 1280px · `2xl` 1440px (max content width).

**Overall posture:** Desktop-first, not mobile-first — the primary user (PMO, per the product's own persona) works at a workstation monitoring a dense dashboard; mobile/tablet is explicitly the *field-level simplified* experience (per the frozen UX's role-based rendering design), not a shrunk version of the full dashboard. This is a deliberate deviation from typical "mobile-first" convention, justified by the actual usage pattern rather than defaulted to.

**Collapse order (already specified per-component above, consolidated here for reference):** Inspector panel → overlay (below 1440px) → Nav rail → icon-rail (below 1024px) → KPI strip → horizontal scroll (below 1024px) → Tables → stacked card-per-row (below 768px) → Nav rail → slide-over drawer (below 768px).

**Field-level mobile view (a distinct, intentionally reduced experience, not a responsive breakpoint of the full dashboard):** a simplified single-column feed of actionable notifications only (per the frozen UX's mobile-simplified role view) — Risk Cards and Recommendation Cards render in a reduced-information variant here (severity, one-line summary, and the Accept/Modify/Reject actions only — no attribution breakdown, no agent panel access), consistent with the product's own role-based information design, not a new feature.

---

## 23. Motion Guidelines

**Principle:** Motion is used only to (a) maintain object permanence during layout changes (a card expanding, a panel opening), (b) communicate a live/ongoing process (the Timeline's in-progress pulse, §14), or (c) provide feedback on a direct action (button press, decision submission). No ambient/decorative motion — this is a calm executive tool, not a marketing surface.

**Duration/easing tokens:**

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `motion.instant` | 100ms | ease-out | Hover state changes, focus rings |
| `motion.fast` | 150ms | ease-out | Button press, badge state change |
| `motion.base` | 200ms | ease-in-out | Card expand/collapse, disclosure open |
| `motion.slow` | 300ms | ease-in-out | Panel/overlay enter-exit, modal |
| `motion.ambient` | 1500–2000ms loop | linear/ease-in-out | Skeleton shimmer, Timeline in-progress pulse (the only looping motion in the system) |

**Reduced motion:** every token above collapses to `motion.instant` (or a static equivalent for `motion.ambient`, per §14/§20's specific fallbacks) under `prefers-reduced-motion: reduce`, with no exceptions.

---

## 24. Design Tokens (Consolidated Reference)

This section is the canonical token index; all values are defined in full in their originating sections above and repeated here only as a naming/structure reference for implementation:

```
color.surface.{canvas, base, raised, overlay, sunken}
color.border.{subtle, default, strong}
color.text.{primary, secondary, muted, disabled}
color.brand.{50, 400, 500, 600, 900}
color.risk.{critical, high, moderate, low, neutral}-{bg, border, text}
color.viz.{1–6}

type.{display, heading.lg, heading.md, body.lg, body.md, body.sm, caption, mono.data, mono.lg}

space.{xs, sm, md, lg, xl, 2xl, 3xl}

elevation.{0, 1, 2, 3, 4}

radius.{sm(4px), md(8px), lg(12px), pill(9999px)}

icon.{sm(16px), md(20px), lg(24px)}

motion.{instant, fast, base, slow, ambient}
```

**Token governance rule:** No component specification in this document (or any future one) may introduce a raw value (a hex code, a pixel number, a duration) outside this index. A genuinely new value is a proposed token addition, reviewed and named before use — this is the mechanism that keeps a 25-component system from drifting into inconsistency as it grows.

---

## 25. Naming Convention

**Token naming:** `category.subcategory.variant` (e.g., `color.risk.critical-bg`, `type.heading.md`, `space.lg`) — lowercase, dot-separated for category nesting, hyphen-separated only for a token's own multi-part variant (e.g., `-bg`/`-border`/`-text` suffixes on the risk ramp).

**Component naming:** PascalCase, domain-first for composite/domain components (`RiskCard`, `RecommendationCard`, `AgentPanel`, not `Card` with a `type="risk"` prop for the domain-specific ones — the frozen product's domain concepts deserve first-class component names, not generic primitives configured via props, since that naming discipline is what keeps engineering handoff unambiguous. Primitives remain generic (`Button`, `Badge`, `Table`) since they are genuinely general-purpose.

**Variant naming:** lowercase-hyphenated, state-descriptive, not numbered (`pending-review`, not `variant-1`) — every variant name in this document (§11's `watch`/`elevated`/`critical`/`resolved`, §12's `pending-review`/`accepted`/`modified`/`rejected`/`outcome-pending`/`outcome-confirmed`) is directly traceable to a real state in the frozen product's plan/risk lifecycle, never an arbitrary design-only label — this is what keeps the design system and the underlying state machine (per the system design document's §14, State Management) from drifting apart as both evolve.

**File/asset naming (for design-tool and icon-asset organization):** `component-name/variant-name/state-name.svg` (e.g., `risk-card/critical/hover.svg` where a static export is needed) — mirrors the specification structure of this document exactly, so a designer or engineer can navigate from this document to the corresponding asset without a separate mapping table.

---

*This design system specifies visual and interaction design only. It introduces no new product feature, workflow, or pipeline stage beyond what is defined in the frozen product architecture, system design, and ADRs. Every composite component in this document (§11–§14) is traceable to a specific stage or state already defined in those documents.*
