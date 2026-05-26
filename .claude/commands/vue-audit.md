---
description: Analyze Vue 3 component structure and report performance + code-reuse optimizations (read-only — suggests, never edits)
argument-hint: "[path or component — defaults to client/src]"
---

# Vue Component Optimization Audit

Read-only analysis of Vue 3 components that produces a **ranked report** of **performance** and **code-reuse** opportunities.

**This skill never edits, builds, or runs anything — it only reads and reports.** To apply fixes afterward, hand the findings to the **vue-expert** subagent (offer this at the end).

**Target:** use `$ARGUMENTS` if provided (a single `.vue` file or a directory); otherwise default to `client/src`.

## Phase 0 — Ground rules

- **Read-only.** Do not modify files, start the dev server, or build. Use Read / Glob / Grep (and subagents for analysis only).
- **Verify every `file:line`** by reading the actual file — never cite a location you haven't confirmed.
- **Favor fewer, high-confidence findings over noise.** Do not flag code that is already idiomatic (e.g. a `computed` that is already correct, a `v-for` already keyed by a stable id). No false positives — each finding must be defensible.
- **Ground recommendations in `client/CLAUDE.md`** (Composition API, computed-vs-method, `v-for` keys, `v-show`/`v-if`, debounced watchers, composables, centralized `api.js`, design tokens). Point reuse suggestions at patterns that already exist in the repo.

## Phase 1 — Inventory (read-only)

1. `Glob` all `.vue` files under the target. Separate **views** (`views/`) from **components** (`components/`).
2. For each file capture a quick structural profile: template / script / style line counts, declared `props` and `emits`, imported child components, composables used, and whether it uses the Composition or Options API.
3. Read `client/src/App.vue` `<style>` for the global **design tokens** and **utility classes** (`.card`, `.badge`, `.stat-card`, `.page-header`, `table`, …) so reuse suggestions reference what already exists rather than inventing new abstractions.
4. **Choose depth (adaptive):**
   - **A single file, or ≤ 8 components →** analyze inline in this context (Phase 2).
   - **> 8 components →** fan out (Phase 2-FANOUT).

## Phase 2 — Analyze (inline)

Evaluate each component against the two dimensions below. For every finding record: `file:line` · **dimension** (Perf | Reuse) · **severity** (High | Med | Low) · **effort** (S | M | L) · a one-line **why** · a concrete **before → after** snippet.

### Performance

- **Derived data computed in methods or template expressions** that should be `computed` — `.filter()/.map()/.reduce()/.sort()` run inside a method or `{{ }}` re-execute on every render.
- **`v-for` keyed by index** instead of a stable unique id (`sku`, `id`, `month`, …).
- **`v-for` + `v-if` on the same element** — pre-filter with a `computed` instead.
- **`v-if` vs `v-show` mismatch** for frequently toggled content (use `v-show` for frequent toggles, `v-if` for rarely shown).
- **Un-debounced high-frequency handlers / watchers** (`input`, `resize`, `scroll`, live search).
- **Missing cleanup** — `addEventListener`, timers, or observers created without removal in `onUnmounted` (memory leak).
- **Inline object / array / function literals in templates** (`:style="{…}"`, `:prop="[…]"`, `@click="() => …"`) — new references each render that can force child re-renders.
- **Oversized components** (very large template/script) that should be **split** or **lazy-loaded** (`defineAsyncComponent`, route-level dynamic `import()`).
- **Reactivity overhead** — deep/large watchers, `ref` on data that is never reassigned (consider `shallowRef`/`markRaw`), or reactive state that should be a `computed`.

### Code reuse / structure

- **Duplicated template markup** across files (stat cards, tables, badges, page headers) → extract a shared component; reference existing global classes/tokens.
- **Duplicated `<script>` logic** (data-loading try/catch, filter handling, pagination, toggling) → extract a **composable** under `composables/`.
- **Repeated formatting** (currency, dates, numbers, initials) → shared util or composable.
- **API calls not centralized** in `client/src/api.js`.
- **Duplicated CSS** that should use the design tokens or global utility classes.
- **Prop drilling** through multiple layers → a composable or `provide/inject`.
- **Mixed Options + Composition API** in one component, or **hardcoded magic values** that should be named constants.

## Phase 2-FANOUT — Adaptive fan-out (large trees only)

When the tree is large, run Phase 2 in parallel — one analysis subagent per component or per cluster:

- Prefer **vue-expert** for Vue-specific depth; use **Explore** for lighter passes.
- **Hard constraint in every subagent prompt: analyze READ-ONLY and RETURN findings only — do NOT edit, create, or build any file.** (vue-expert is edit-capable, so forbid edits explicitly.)
- Require each subagent to return a structured findings list (`file:line`, dimension, severity, effort, why, before/after). Collect all, then continue to Phase 3.

## Phase 3 — Cross-component synthesis

- **Dedupe** identical findings, and **merge** the same pattern seen across many files into one cross-cutting reuse item — these are usually the highest-value wins.
- **Rank** everything by impact-to-effort. Mark **Quick wins** = High impact + Low effort.

## Phase 4 — Report (the deliverable)

Output a ranked Markdown report. **Change nothing.**

1. **Summary table** — component · LOC · #Perf · #Reuse · top severity.
2. **Quick wins** — high-impact, low-effort items, first.
3. **Performance findings** — grouped High → Med → Low; each with location, why, effort, and a before → after snippet.
4. **Code-reuse opportunities** — cross-cutting extractions (shared components / composables / utils); list every call site for each.
5. **What's already good** — a short note on the idiomatic patterns found, so the report stays balanced and trustworthy.

Optionally render the report as a **Frame** (HTML) for a browsable version with a thumbnail.

**End with next steps, not edits.** Ask: _"Want me to apply any of these via vue-expert?"_ If yes, pass the selected findings (with their before/after snippets) to **vue-expert**, then verify with `cd client && npm run build`. This skill itself stops at the report.
