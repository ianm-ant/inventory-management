---
description: Redesign any Vue 3 + vue-router app into a modern SaaS layout with a left sidebar
---

Convert the current Vue 3 application from a top-nav layout into a modern SaaS shell: fixed left sidebar (logo, vertical nav, footer controls) + scrollable content pane. Work in phases. Do NOT change routes, view components, or business logic — only the layout shell, nav, and global tokens.

## Phase 1 — Discover (read-only)
1. Locate the root component: grep for `<router-view` in `src/**/*.vue` (usually `App.vue`).
2. In that file identify: the current nav element (`<header>`, `.top-nav`, `.navbar`, etc.), the list of `<router-link>`s, and any sibling controls (language/profile/user menus, theme toggles).
3. Find the router file (`src/main.js` or `src/router/*.js`) and list all route paths — these become sidebar links 1:1.
4. Grep `src/` for `position: sticky` and `top:` to find bars pinned below the old header (e.g. filter/toolbars hardcoded to `top: 70px`).
5. Grep nav-adjacent components for `position: absolute` with `right: 0` — dropdowns assuming a top-right anchor that must be flipped.
6. Note where global styles live (root component `<style>` vs `src/style.css` / `assets/main.css`) and whether `:root` tokens already exist.

## Phase 2 — Design tokens
Inject this block at the top of the global stylesheet (create `:root` if none exists; merge if one does):

```css
:root {
  --sidebar-w: 240px;
  --c-bg: #f8fafc; --c-surface: #ffffff; --c-border: #e2e8f0;
  --c-text: #0f172a; --c-text-muted: #64748b;
  --c-accent: #2563eb; --c-accent-soft: #eff6ff;
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-5: 24px; --sp-6: 32px;
  --radius: 8px;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
body { margin: 0; background: var(--c-bg); color: var(--c-text); font-family: var(--font-sans); }
```

## Phase 3 — Restructure the shell
Target template skeleton for the root component (adapt names to what Phase 1 found — keep existing modals/teleports as siblings):

```html
<div class="app">
  <aside class="sidebar">
    <div class="sidebar-logo"><!-- existing logo/title markup --></div>
    <nav class="sidebar-nav">
      <router-link ... class="nav-item">label</router-link>
    </nav>
    <div class="sidebar-footer">
      <!-- move LanguageSwitcher / ProfileMenu / user controls here -->
    </div>
  </aside>
  <div class="content">
    <!-- secondary sticky bars (FilterBar etc.) stay here, above main -->
    <main class="main-content"><router-view /></main>
  </div>
</div>
```

Shell CSS:

```css
.app { display: flex; min-height: 100vh; }
.sidebar { width: var(--sidebar-w); flex-shrink: 0; display: flex; flex-direction: column;
  background: var(--c-surface); border-right: 1px solid var(--c-border);
  position: sticky; top: 0; height: 100vh; padding: var(--sp-5) var(--sp-4); gap: var(--sp-5); }
.sidebar-logo h1 { margin: 0; font-size: 1.125rem; }
.sidebar-nav { display: flex; flex-direction: column; gap: var(--sp-1); }
.nav-item { padding: var(--sp-2) var(--sp-3); border-radius: var(--radius);
  color: var(--c-text-muted); text-decoration: none; font-size: 0.9rem;
  border-left: 3px solid transparent; }
.nav-item:hover { background: var(--c-bg); color: var(--c-text); }
.nav-item.router-link-active { background: var(--c-accent-soft); color: var(--c-accent);
  border-left-color: var(--c-accent); font-weight: 500; }
.sidebar-footer { margin-top: auto; display: flex; flex-direction: column; gap: var(--sp-3);
  padding-top: var(--sp-4); border-top: 1px solid var(--c-border); }
.content { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.main-content { flex: 1; padding: var(--sp-6); max-width: 1600px; width: 100%; margin: 0 auto; }
```

Delete/replace old `.top-nav`, `.nav-container`, `.nav-tabs` rules and any `a.active::after` underline indicator.

## Phase 4 — Fix dependents
- Sticky secondary bars from Phase 1.4: change `top: <old-header-height>` → `top: 0`.
- Dropdowns moved into `.sidebar-footer`: change `top: calc(100% + …); right: 0` → `bottom: calc(100% + 8px); left: 0; right: auto;` so menus open upward.
- Remove manual `:class="{ active: $route.path === '...' }"` — rely on `router-link-active`.
- Leave global utility classes (`.card`, `.table-container`, `.badge`, `.page-header`, etc.) untouched.

## Phase 5 — Execute via vue-expert
If a **vue-expert** subagent is available, delegate ALL `.vue` edits to it in one task containing: (a) discovered file list, (b) token block, (c) target template + shell CSS, (d) dependent-fix list. Instruct it to preserve all imports, emits, modals, and `<script>` logic verbatim. Otherwise apply edits directly.

## Phase 6 — Verify
1. Ensure dev server is running (start in background if not).
2. Use Playwright MCP: navigate to `/`, screenshot; navigate to one other route, screenshot.
3. Confirm: sidebar full-height, active link highlighted, content scrolls, footer menus open upward without clipping, no horizontal scrollbar, no console errors.
4. Report screenshot paths and any follow-ups (responsive collapse < 768px is out of scope unless requested).
