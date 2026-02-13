# App Functionality Summary (Sphere / Book Webapp)

English summary of the current web app: what it does, how it is built, and how features are used.

---

## 1. Overview

- **Stack:** React 18, Vite 5, React Router 6. No UI library; custom CSS in `index.css`.
- **Brand:** App title is **Sphere**; loading screen and document title use it.
- **Entry:** `main.jsx` mounts the app with global providers; `App.jsx` handles routing and auth gating.

---

## 2. Authentication & Access

### 2.1 How access works

- **Telegram:** When opened inside Telegram Web App, `useTelegram()` reads `window.Telegram.WebApp.initData` and optional `user` from init data. If present, the user is treated as logged in (Telegram auth).
- **SMS (dev):** Auth can also be “SMS” (phone + code). User and onboarding state are restored from `localStorage` via `AuthContext`.
- **Dev mode:** On `localhost` / `127.0.0.1` with no Telegram, the app sets `initData = 'dev'` and a fake Telegram user so you can use the app without the bot.

### 2.2 Auth flow

- **AuthContext** (`contexts/AuthContext.jsx`): Persists `user`, `onboardingSeen`, `authMethod` (`'telegram' | 'sms'`), and pending signup/login data in `localStorage`. Exposes:
  - `user`, `isRestoring`
  - `persistUser`, `finishOnboarding`
  - `requestCode(phone, method)`, `login(phone, password)`, `verifyCode(code, options)`, `forgotPassword`, etc.
- **Verification:** Test code is `1234`; it can be exposed in dev as `window.__devVerificationCode`.
- **Gating:** Until `ready && !isRestoring` (Telegram ready + auth restored), the app shows a loading screen (“Yuklanmoqda…”). If the user is not logged in (no Telegram user and no app user) and the route is not an auth route, they are redirected to `/splash`.

### 2.3 Auth routes (no main layout)

- `/splash`, `/onboarding`, `/login`, `/signup`, `/verify`, `/congratulation`, `/forgot-password` (and sub-routes). These are outside the main `Layout`.

---

## 3. Layout & Navigation

### 3.1 Layout

- **Layout** (`components/Layout.jsx`): Wraps all main app routes. It renders:
  - **Header:** Only when `showSimpleHeader` is false (e.g. on home). Shows search and notifications icons and “Home” title.
  - **Main:** `<Outlet />` for the current route.
  - **Bottom nav:** Always (except on reader and book-detail pages).
- **Simple header:** On category, cart, confirm-order, location, notifications, vendors, authors, search, profile sub-pages, and book detail, a page-specific header is shown instead of the default one. Document title is set per route (e.g. “Category · Sphere”).

### 3.2 Bottom navigation

- **BottomNav** (`components/BottomNav.jsx`): Tabs – **Home** (`/`), **Category** (`/category`), **Cart** (`/cart`), **Profile** (`/profile`). Uses `NavLink` for active state; labels come from i18n (`nav.home`, `nav.category`, etc.). Cart shows a badge with `totalItems` from `CartContext`. Icons use class `icons-svg` and CSS so they inherit color (muted when inactive, accent when active). Bottom nav is hidden on reader (`/books/:bookId` without `/detail`) and book detail (`/books/:bookId/detail`).

---

## 4. Data: API vs mock

### 4.1 Core API (`api.js`)

- **Base:** All requests go to `/api` (same origin; backend or proxy must serve it).
- **Telegram:** Optional `initData` is sent as query `initData` and/or header `X-Telegram-Init-Data` for auth.
- **Functions:**
  - `apiGet(path, initData)`, `apiPost(path, body, initData)` – JSON.
  - `getBookCoverUrl(book, initData)` – if `book.cover_url` is not a full URL, returns `/api/books/:id/cover` (with `initData` if provided).
  - `bookFileUrl(bookId, initData)`, `fetchBookFile(bookId, initData)` – for book file (e.g. reader).

### 4.2 Content API (`api/content.js`)

- **Role:** Fetch lists and single entities from the backend; on failure or missing endpoint, fall back to mock data from `mock.js`.
- **Endpoints used:**
  - `GET /api/books` → list of books
  - `GET /api/authors` → list of authors
  - `GET /api/vendors` → list of vendors
  - `GET /api/categories` → list of categories
  - `GET /api/authors/:id` → single author
  - `GET /api/home/banner` → banner image URL (optional)
- **Normalization:** Responses are normalized to a single shape (e.g. `cover_url`/`coverUrl`, `book_ids`/`bookIds`, `vendor_id`/`vendorId`) so the rest of the app can use one format. Mock data is used if the request throws or returns nothing useful.

### 4.3 Mock data (`mock.js`)

- **Books:** `MOCK_BOOKS` (with `coverUrl` from picsum), **Vendors:** `MOCK_VENDORS` (logos from ui-avatars), **Authors:** `MOCK_AUTHORS` (avatars from pravatar), **Categories:** `CATEGORIES`, **Banner:** `BANNER_SPECIAL_IMAGE`, plus **COUPONS**, **DEFAULT_ADDRESS**, **PAYMENT_METHODS**. Used as fallback when API is unavailable or not implemented.

---

## 5. Pages and features

### 5.1 Home (`/`)

- **Component:** `HomeNew.jsx`.
- **Data:** Uses `useTelegram().initData` and calls `fetchBooks`, `fetchVendors`, `fetchAuthors`, `fetchBanner` from `api/content.js`. Shows loading/skeleton while fetching; on error, falls back to empty or mock.
- **UI:** Search bar (link to `/search`), promotional banner (image from API or gradient), “Top of Week” (first 3 books), “Best Vendors” (first 6 vendors), “Authors” (first 3 authors). All section titles and CTAs use i18n keys.

### 5.2 Category (`/category`)

- **Data:** `fetchBooks(initData)` and `fetchCategories(initData)`. Filter state is local; list is filtered by `category` (e.g. “All” or category name).
- **UI:** Header with search and notifications, filter chips, grid of book cards (cover, title, price) linking to `/books/:id/detail`.

### 5.3 Books (`/books`)

- **Component:** `Books.jsx`; receives `initData` from route.
- **Data:** `apiGet('/categories', initData)` and category-based book list from API. Already API-driven; no content.js here.
- **UI:** Category tabs and book list with covers (via `getBookCoverUrl` when needed).

### 5.4 Book detail (`/books/:bookId/detail`)

- **Data:** `apiGet(\`/books/${bookId}\`, initData)`. On failure, falls back to `MOCK_BOOKS` by id. Vendor is resolved from `MOCK_VENDORS` (by `vendorId`) for display.
- **UI:** Back button, cover, title, author, price, quantity, “Add to cart”. Cart uses `useCart().addItem(book, quantity)`. Cover URL: `cover_url` or `coverUrl` or `getBookCoverUrl(book, initData)`.

### 5.5 Reader (`/books/:bookId`)

- **Route:** Outside main layout; full-screen reader. Receives `initData`.
- **Data:** `apiGet(\`/books/${bookId}\`)`, `apiGet(\`/books/${bookId}/progress\`)`, `fetchBookFile(bookId, initData)`. Progress is saved with `apiPost(\`/books/${bookId}/progress\`, { page_number }, initData)`.

### 5.6 Vendors (`/vendors`)

- **Data:** `fetchVendors(initData)` and `fetchCategories(initData)` from `api/content.js`. Filter chips use categories; vendor list is from API (or mock fallback).
- **UI:** Page header, filter buttons, grid of vendor cards (logo, name, rating).

### 5.7 Authors (`/authors`)

- **Data:** `fetchAuthors(initData)` from `api/content.js`.
- **UI:** Page header, filter chips (e.g. All, Poets, Playwrights), list of author rows (avatar, name, bio/role) linking to `/authors/:id`.

### 5.8 Author detail (`/authors/:authorId`)

- **Data:** `fetchAuthorById(authorId, initData)` and `fetchBooks(initData)`. Books shown are either by `author.bookIds` or first 4 books.
- **UI:** Avatar, name, role, rating, about, “Products” section with book covers linking to book detail.

### 5.9 Search (`/search`)

- **Data:** `fetchBooks(initData)` once; search is client-side over that list (by title and author). Recent searches stored in `localStorage` under `search_recent`.
- **UI:** Search input, recent terms, result list (cover, title, author, price) linking to book detail.

### 5.10 Cart (`/cart`)

- **Data:** `useCart()` – items, `totalItems`, `subtotal`, `shipping`, `total`, `updateQuantity`, `removeItem`, etc. Cart is persisted in `localStorage` (`app_cart`).
- **UI:** List of cart lines (cover, title, price, quantity controls), totals, link to confirm order.

### 5.11 Confirm order (`/confirm-order`)

- Uses cart and mock **DEFAULT_ADDRESS** and **PAYMENT_METHODS** for address and payment UI. No real order API mentioned in the current code.

### 5.12 Profile and sub-pages

- **Profile** (`/profile`): Receives `user` (app user or Telegram user) and `isDev`. Links to account, address, offers (coupons), favorites, orders, help.
- **Profile/account, address, offers, favorites, orders, help:** Various pages; some still use mock (e.g. Favorites from `MOCK_BOOKS`, Coupons from `COUPONS`, Location from `DEFAULT_ADDRESS`).

### 5.13 Other routes

- **Notifications, Promotion, Location, Order status, Order feedback, News:** Implemented as pages; some content may be static or mock.

---

## 6. Cart

- **CartContext** (`contexts/CartContext.jsx`): Items in state and in `localStorage` under `app_cart`. Each item has at least `id`, `title`, `price`, `quantity`, and optionally `coverUrl`. Methods: `addItem(book, quantity)`, `updateQuantity(bookId, quantity)`, `removeItem(bookId)`, `clearCart`. Derived: `totalItems`, `subtotal`, `shipping` (fixed 2), `total`. Used in Layout (badge), Cart page, and BookDetail (add to cart).

---

## 7. Internationalization (i18n)

- **LangContext** (`contexts/LangContext.jsx`): Language stored in `localStorage` (`app_lang`). Supported: `uz`, `ru`, `en`. Provides `lang`, `setLang`, `t(key)`, `languages`.
- **i18n.js:** Flat key structure (e.g. `app.loading`, `nav.home`, `home.topOfWeek`, `bookDetail.back`). `getT(lang)` returns a function that looks up the key in the chosen language. Used in Layout, BottomNav, and most pages for labels and messages.

---

## 8. UI and styling

- **CSS:** Single global `index.css` with CSS variables (e.g. `--bg`, `--accent`, `--text`, `--muted`, `--radius`). BEM-like classes for layout, header, bottom nav, cards, buttons, forms, auth pages, skeleton, empty state.
- **Icons:** `components/Icons.jsx` exports SVG components (e.g. IconBook, IconCart, IconUser, IconSearch). They use class `icons-svg`; global CSS sets `color: currentColor`, `fill: none`, `stroke: currentColor` so they inherit text color. Bottom nav icons have explicit size and color inheritance so they stay visible.
- **Book covers:** `BookCover.jsx` – shows image or placeholder (gradient + optional IconBookCover). Sizes: `sm`, `md`, etc., via props/CSS.

---

## 9. Summary table

| Area           | How it works |
|----------------|--------------|
| **Auth**       | Telegram (initData + optional user) or SMS (phone + code). State in AuthContext + localStorage. Dev mode on localhost. |
| **Access**     | Loading until ready + auth restored; then splash/onboarding or main app. Unauthenticated users redirected to splash unless on auth route. |
| **Layout**     | Layout = optional header + Outlet + BottomNav. BottomNav hidden on reader and book-detail. |
| **Data**       | Core API in `api.js` (GET/POST, book cover, book file). Content in `api/content.js` (books, authors, vendors, categories, banner) with mock fallback. |
| **Cart**       | CartContext + localStorage; add/update/remove; badge in nav; used in Cart and BookDetail. |
| **i18n**       | LangContext + i18n.js; uz/ru/en; `t(key)` used across app. |
| **Routing**    | HashRouter; auth routes without layout; main routes inside Layout; reader outside layout; 404 → home. |

This document describes the current functionality as implemented in the codebase (routing, auth, data flow, API vs mock, cart, i18n, and main pages).
