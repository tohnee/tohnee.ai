---
phase: current
reviewers: [self — external CLIs unavailable: gemini (no API key), codex (connection failed), opencode (unauthorized), cursor (not authenticated)]
reviewed_at: 2026-05-14T10:00:00Z
plans_reviewed: [src/ — all 24 source files]
---

# Code Review — tohnee.ai

## Summary

Solid React 19 + Vite + Tailwind CSS v4 SPA with clean architecture (lazy-loaded routes, ErrorBoundary, SEO component, AnimatePresence page transitions). Code is well-structured and visually polished. Primary concerns: security (API key in localStorage sent to third-party endpoint), no real search/indexing, and several accessibility gaps.

---

## High Severity

### H1: API key in localStorage, sent to MiniMax with full message history
**File:** `src/pages/Try.tsx:38-92`

MiniMax API key stored in `localStorage` under `minimax_api_key`, sent in plaintext via `Authorization: Bearer`. Full message history forwarded to `api.minimax.chat`.

- Any browser extension or XSS leaks the key
- No privacy notice for users
- User messages go to third-party API

**Fix:** Proxy through serverless function (Vercel/Netlify). Add privacy disclosure near submit area.

### H2: No real search — renders static hardcoded results
**File:** `src/pages/Search.tsx:27-47`

Search accepts query input but always shows same hardcoded links. "Top Results" doesn't filter.

**Fix:** Client-side filtering from a JSON index, or wire to search API (Algolia/MeiliSearch).

### H3: Broken "Sign up" link with no route
**File:** `src/pages/auth/Login.tsx:40`

Login links to `/signup` but no route exists in `App.tsx`.

**Fix:** Add `/signup` route or remove link.

---

## Medium Severity

### M1: Search popular items not clickable
**File:** `src/pages/Search.tsx:54-65`

Popular searches and recent research listed as `<li>` with cursor styles but no `<Link>` or handler. Looks interactive but does nothing.

**Fix:** Wrap in `<Link>` or add `onClick`.

### M2: Login form submits to nothing
**File:** `src/pages/auth/Login.tsx:20`

`preventDefault` on submit, no validation, no navigation, no feedback. Dead UX.

**Fix:** Add email validation, POST to endpoint, or surface "coming soon" message.

### M3: Blog images use invalid Unsplash IDs
**File:** `src/pages/company/Blog.tsx:13`

`1500000000000 + i * 10000` produces invalid photo IDs. `onError` fallback triggers for all cards — every blog card shows same fallback image.

**Fix:** Use real curated Unsplash photo IDs.

### M4: Three.js eslint cleanliness in WebGLBackground
**File:** `src/components/WebGLBackground.tsx:19-23`

Three `// eslint-disable-next-line react-hooks/purity` supressions on `Math.random()` inside `useMemo`. Works but signals design tension.

**Fix:** Use `useRef` + imperative init, or add explanatory comment.

---

## Low Severity

### L1: Footer research links all point to /research
**File:** `src/components/Layout.tsx:89-91`

Overview, Index, and Latest all link to same URL. Consider anchors or distinct routes.

### L2: SEO default image may not exist
**File:** `src/components/SEO.tsx:12`

`DEFAULT_IMAGE = 'https://tohnee.ai/og-image.png'` — verify this file exists at deployment or social cards will be blank.

### L3: WebGLBackground ignores prefers-reduced-motion
**File:** `src/components/WebGLBackground.tsx:57`

No mechanism for motion-sensitive users to disable particle animation.

**Fix:** Check `window.matchMedia('(prefers-reduced-motion: reduce)')`.

### L4: Bundle size 1.27MB vendor chunk
Build output: `index-CKTSf41j.js` 1.27MB (364KB gzip). Primarily Three.js + Framer Motion. Acceptable but monitor.

---

## Risk Assessment

**MEDIUM.** API key exposure is primary risk. Dead pages (search, login, signup) create half-baked impression. No production data at risk currently.

---

## Key Action Items

1. Proxy MiniMax API through serverless fn — H1
2. Implement real search or client-side filtering — H2
3. Fix `/signup` missing route or remove link — H3
4. Make popular search items clickable — M1
5. Add email validation and feedback to login — M2
6. Fix Blog.tsx Unsplash image URLs — M3
7. Verify og-image.png exists — L2
8. Add prefers-reduced-motion check — L3
