# Sphere Webapp – Changelog

## Fixes and improvements (production stabilization)

### A) UI / Layout

- **Global CSS**
  - Added spacing variables (`--space-xs` through `--space-2xl`) and typography scale (`--text-xs` … `--text-2xl`).
  - Standardized button height (48px), padding, and flex alignment.
  - Consistent focus ring and transitions.

- **Layout and content**
  - `layout__main` now has bottom padding so content is not hidden behind the fixed bottom nav.
  - `content` uses `overflow-x: hidden` and `min-width: 0` to avoid horizontal scroll and flex overflow.
  - Body has `overflow-x: hidden` for mobile.

- **Page header**
  - Page headers use spacing variables and minimum touch targets (44px).
  - Title truncates with ellipsis; back and icon buttons are flex-shrink: 0.

- **Category page**
  - Category header aligned with app header style and negative margins.
  - Filter chips scroll horizontally without breaking layout; category grid and book cards use consistent spacing and text clamping.

- **Book detail**
  - Title and meta use word-wrap so long text doesn’t break layout.
  - Purchase row and quantity controls use flex-wrap and consistent gaps.
  - All primary actions use full-width buttons with consistent height.

- **Cart**
  - Cart item titles wrap correctly; list and summary remain readable on small screens.

- **Bottom nav**
  - Nav items and labels stay within bounds; no overlapping with page content.

---

### B) Authentication

- **AuthContext**
  - Restore from `localStorage` is wrapped in a cancelled flag to avoid state updates after unmount.
  - User restore validates parsed object before setting state.

- **useTelegram**
  - Safe access to `window.Telegram?.WebApp` and `window.location` with `typeof` checks.
  - Dev user is only set when not in Telegram and on localhost/127.0.0.1.
  - Mounted guard used so state is not set after unmount.

- **API**
  - `apiPost` now sends `initData` as query parameter as well as `X-Telegram-Init-Data` header for compatibility.

- **Route gating**
  - `showMainApp` uses explicit `Boolean()` checks for Telegram and app user.
  - Unauthenticated users are redirected to `/splash` only when not on an auth path.

- **SMS / dev flow**
  - Login and Verification use optional chaining for `res?.needVerify` where needed.
  - Dev code `1234` and `window.__devVerificationCode` continue to work for requestCode → verifyCode → persistUser.

---

### C) PDF Reader

- **Loading and errors**
  - Separate loading states: book metadata/progress vs PDF file.
  - Initial load shows a dedicated loading screen; PDF load can show an overlay so the reader shell is visible.
  - Progress API failure no longer blocks opening: missing or failed progress defaults to page 1.
  - Error screen includes a “Retry” button that re-fetches the PDF.

- **Top bar**
  - Back (exit), book title (truncated), page indicator (current/total), translation button, and settings menu.
  - Toolbar uses a small grid so elements don’t overlap on narrow screens.

- **Controls**
  - Prev/Next page buttons.
  - Page jump: number input in the bottom bar with blur/submit to go to page.
  - Zoom in/out via menu (preset zoom levels).
  - “Fit width” option in the menu toggles fit-to-width vs fixed zoom.
  - Theme (sepia / light / dark) in the same menu.

- **Progress**
  - Progress is saved with a 600 ms debounce after page change.
  - Both query param and header send `initData` for progress POST.
  - Progress is restored on open; failed restore falls back to page 1.

- **Rendering**
  - `pdfjsLib` access is guarded for SSR/absence of script.
  - Scale and fit-width are applied correctly; canvas uses device pixel ratio for sharpness.

---

### D) Translation

- **API**
  - New `translateText(text, targetLang, initData, sourceLang?)` in `api.js`.
  - Calls `POST /api/translate` with `text`, `target_lang`, optional `source_lang`.
  - On failure, returns `{ translated: '', error }` so the UI can show an error.

- **Reader panel**
  - “Translate” opens a panel (bottom sheet on mobile, centered on wider screens).
  - Modes: “Translate page” (current PDF page via `getTextContent()`) and “Enter text” (custom text).
  - Shows original context, translated result, loading and error states, and a Copy button.
  - In-memory cache (recent translations) to avoid duplicate requests.

- **Languages**
  - Translation target follows LangContext: `uz`, `ru`, `en`.

- **i18n**
  - New keys: `reader.translatePage`, `reader.translateCustom`, `reader.translatePlaceholder`, `reader.translated`, `reader.copy`, plus existing `reader.translate`, `reader.retry`, `reader.fitWidth`, `reader.pageNumber`.

---

### E) Other pages

- **Home**
  - Section headings and “See all” links use spacing variables and don’t overlap.
  - Top books, vendors, and authors sections keep consistent card sizing and aspect ratio.

- **Vendors / Authors**
  - Headers and grids use the same spacing and overflow rules; vendor/author names and text wrap correctly.

- **Profile**
  - Existing layout kept; logout modal and menu items remain consistent with global button and spacing rules.

---

### F) Performance and stability

- **API**
  - `fetchBooks`, `fetchAuthors`, `fetchVendors` log a console warning when falling back to mock data.
  - All content API usage already catches errors and uses mock data when needed.

- **Layout shift**
  - Book covers use fixed aspect ratio (e.g. 2/3) and `object-fit: cover` where applicable.
  - Skeleton and placeholder styles are used for loading states.

- **Code**
  - No full app rebuild; existing structure and routing kept.
  - Reusable patterns (spacing, buttons, headers) consolidated in CSS variables and shared classes.

---

## Acceptance checklist

- No overlapping UI elements (headers, nav, buttons, cards).
- Responsive layout down to 360px; no horizontal scrolling.
- Auth works with Telegram (initData + user) and SMS/dev (requestCode → verifyCode → persistUser).
  - Route gating: unauthenticated → splash; authenticated → main app.
- Reader: fullscreen, clear top bar and bottom controls, page jump, zoom, fit width, progress save/restore, loading and error with retry.
- Translation: page and custom text modes, panel/sheet UX, loading/error/copy, cache, uz/ru/en.
- App looks and behaves like a production-ready book reader.
