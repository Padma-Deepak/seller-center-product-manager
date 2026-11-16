---
title: Product Manager – Code Guide
tags: [project, react, nodejs, express, study-guide]
repo: https://github.com/Padma-Deepak/seller-center-product-manager
---

# Product Manager – Code Guide

> [!abstract] What this is
> A study guide for the whole repo. Read sections 1–6 to understand how it works, section 7 for the technical concepts, and section 9 for the questions someone might ask to test whether you really know the code. Question answers are in **foldable callouts** — click to expand (in Obsidian). Try answering out loud first.

**Contents**
1. [[#1. The 30-second pitch]]
2. [[#2. What the website does]]
3. [[#3. Tech stack and why]]
4. [[#4. Repo structure]]
5. [[#5. Backend, file by file]]
6. [[#6. Frontend, file by file]]
7. [[#7. Request flows end to end]]
8. [[#8. Technical concepts explained]]
9. [[#9. Questions you might be asked]]
10. [[#10. Limitations and what you'd improve]]
11. [[#11. Cheat sheet]]

---

## 1. The 30-second pitch

"It's a recreation of the **Product Manager** page of Falabella's Seller Center — the screen a marketplace seller uses to manage their product catalog. The frontend is **React** (built with **Vite**). The backend is a **Node.js + Express REST API** that serves **mock data held in memory**. You can filter products (published, unpublished, not-for-sale reasons, drafts, deleted), search, sort, paginate, toggle a product active, bulk delete/restore, create a draft and download a CSV. The two halves live in one repo as **npm workspaces** and run together with one command."

---

## 2. What the website does

The page has these parts, top to bottom:

| Part | What it does | Backed by |
| --- | --- | --- |
| **Sidebar + header** | Navigation icons (decorative), logo, seller name and a notification dot | `GET /api/me` (name + unread count) |
| **Tabs** – Catalog / Pending / Stock | Only **Catalog** is real. The other two show a placeholder | client state only |
| **Add product** | Creates a new draft named `Untitled Draft (timestamp)` and jumps to the Drafts view | `POST /api/products` |
| **Filter chips** | All, Published, Unpublished ▾, Not for Sale ▾, Drafts, Deleted Products | `GET /api/products?view=…&sub=…` and `GET /api/products/counts` for badge numbers |
| **Toolbar** | Select-all checkbox, bulk action dropdown + **Go**, **Download catalog**, search box | `POST /api/products/bulk`, `GET /api/products/export`, `?q=` |
| **Catalog table** | Product name + SKUs, creation date, price, offer price, recommendations, stock, **Active** toggle, status icon, kebab menu | `GET /api/products`, `PATCH /api/products/:id`, `DELETE /api/products/:id` |
| **Drafts table** | Product, Category Path, Creation date (newest first) | same list endpoint with `view=drafts` |
| **Deleted table** | Greyed rows, Restore action | `view=deleted`, `POST /api/products/:id/restore` |
| **Pagination** | "1–20 of 25", Previous / Next | `page` and `limit` query params |

### The product lifecycle (important mental model)

```
            create                      publish
 (Add product) ──► DRAFT        UNPUBLISHED ◄──► PUBLISHED      (these two = the "catalog")
                    │                │  │
                    │ delete         │  │ delete
                    ▼                ▼  ▼
                          DELETED  ──restore──► back to previous status
```

* `status` is one of `published`, `unpublished`, `draft`, `deleted`.
* An **unpublished** product has a `unpublishedReason`: `salable`, `not_for_sale` or `under_review`.
* If the reason is `not_for_sale`, it also has a `notForSaleReason`: `content`, `price`, `stock`, `multimedia`, `compliance`, `configuration`.
* **Deleting is a "soft delete"** – the row stays, `status` becomes `deleted`, and the old status is saved in `previousStatus` so **Restore** can put it back.
* **"All"** means *catalog only* = `published` + `unpublished`. Drafts and deleted items are **not** in All.

### Why there are two dropdown chips that look similar
In the reference screenshots, "Unpublished" has a menu (Salable Items / Not for Sale / Under review) and there is a *separate* "Not for Sale" chip whose menu lists the **reasons** (Content, Price, Stock…). They are two different filters:
* `view=unpublished&sub=not_for_sale` → "unpublished products whose reason is not-for-sale"
* `view=not_for_sale&sub=content` → "not-for-sale products whose reason is content"

When you pick an option, the chip's label changes to what you picked (e.g. the chip reads "Content").

---

## 3. Tech stack and why

| Tech | Role | Why this choice |
| --- | --- | --- |
| **React 18** | UI | Component model + state → UI updates automatically. Asked for in the task |
| **Vite 5** | Dev server + bundler | Very fast start (native ES modules), hot reload, simple config, built-in proxy |
| **Node.js** (v26 here) | Runs the backend | Same language (JavaScript) front and back |
| **Express 4** | HTTP framework | Minimal; routing + middleware. Most common Node framework |
| **cors** | Express middleware | Adds CORS headers so browsers allow cross-origin calls |
| **npm workspaces** | Monorepo | One `npm install` for both `client/` and `server/` |
| **concurrently** | Dev script | Runs API and client in one terminal |
| **Plain CSS** (3 files) | Styling | No framework needed; CSS variables + CSS Grid. Easy to explain |
| **Lato font** (Google Fonts) | Typography | Closest free match to the Seller Center font |

No database, no auth, no TypeScript, no test framework, no state library (Redux etc.) — deliberately small.

---

## 4. Repo structure

```
.
├── package.json              root: workspaces + scripts (dev, build, start)
├── README.md                 how to run + API table
├── .gitignore                node_modules, dist, .env
├── .claude/launch.json       preview-tool config (not needed to run the app)
├── docs/                     this guide
├── client/                   ── FRONTEND (React + Vite)
│   ├── index.html            the one HTML page; loads the font and /src/main.jsx
│   ├── vite.config.js        React plugin + dev proxy  /api → localhost:3001
│   ├── package.json
│   └── src/
│       ├── main.jsx          entry: imports CSS, mounts <App/>
│       ├── App.jsx           page shell (Sidebar, Header, Page, widgets)
│       ├── pages/ProductManagerPage.jsx     ← the "brain": state + data fetching
│       ├── components/
│       │   ├── layout/       Header, Sidebar, FloatingWidgets
│       │   ├── products/     FilterChips, Toolbar, CatalogTable, DraftsTable,
│       │   │                 DeletedTable, SortHeader, RowMenu, Pagination
│       │   └── ui/           Icons, Toggle, Checkbox, Popover (generic pieces)
│       ├── hooks/            useProducts (+useCounts), useDebounce, useClickOutside
│       ├── api/              http.js (fetch wrapper), products.js (endpoint functions)
│       ├── utils/format.js   formatDate / formatPrice / formatCount
│       └── styles/           base.css, layout.css, product-manager.css
└── server/                   ── BACKEND (Node + Express)
    ├── package.json          "type": "module" (ES modules)
    └── src/
        ├── index.js          starts the server (app.listen)
        ├── app.js            builds the Express app (middleware order!)
        ├── config/index.js   port, page-size limits
        ├── routes/           index.js (mounts), products.routes.js (URL → controller)
        ├── controllers/      products.controller.js (HTTP in/out)
        ├── services/         products.service.js (business logic)
        ├── data/             products.mock.js, user.mock.js (the "database")
        ├── middleware/       errorHandler.js (404 + error JSON)
        └── utils/            csv.js, httpError.js
```

### Layering on the server (very likely interview question)
```
HTTP request
   │
 routes/        "which URL + method goes to which function?"
   │
 controllers/   "read req (query/params/body) → call service → write res (JSON/CSV)"
   │
 services/      "the actual rules: filter, sort, paginate, validate, mutate"
   │
 data/          "the in-memory arrays"
```
**Why separate them?** Each layer has one job. You could swap the mock data for a real database by changing only `data/` and the service; swap Express for something else by changing only routes/controllers; and the service can be unit-tested without HTTP.

---

## 5. Backend, file by file

### `server/package.json`
* `"type": "module"` → the code uses `import/export` (ES modules), not `require()`. Because of that, relative imports **must include the `.js` extension** (`'./app.js'`).
* `dev`: `node --watch src/index.js` → Node's built-in watcher restarts on file change (no nodemon needed).
* `start`: plain `node src/index.js`.

### `src/index.js`
Imports the app and calls `app.listen(port)`. Kept separate from `app.js` so the app can be imported (e.g. by tests) **without** opening a port.

### `src/config/index.js`
`port` (env `PORT` or 3001), `env`, `defaultPageSize` (20), `maxPageSize` (100). One place for tunables.

### `src/app.js` — middleware order matters
```js
app.use(cors())                  // 1. allow cross-origin requests
app.use(express.json())          // 2. parse JSON request bodies into req.body
app.use('/api', routes)          // 3. real API routes
app.use('/api', notFound)        // 4. any /api/* that didn't match → JSON 404
// 5. if client/dist exists (after `npm run build`): serve static files + SPA fallback
app.use(errorHandler)            // 6. LAST: catches errors thrown above
```
* Express runs middleware **top to bottom**. `notFound` is after `routes` so it only fires for unmatched URLs.
* The **error handler has 4 parameters** `(err, req, res, next)` — that signature is how Express knows it's an error handler. It must be registered last.
* The `app.get('*')` fallback returns `index.html` so a React single-page app works on refresh. It only exists in production-style runs (when `client/dist` exists).

### `src/routes/index.js` and `products.routes.js`
```
GET    /api/health
GET    /api/me
GET    /api/products              list
GET    /api/products/counts       badge numbers
GET    /api/products/export       CSV download
POST   /api/products              create draft
POST   /api/products/bulk         bulk action
PATCH  /api/products/:id          set active
DELETE /api/products/:id          soft delete
POST   /api/products/:id/restore  restore
```
> [!warning] Route order
> Literal paths (`/counts`, `/export`, `/bulk`) are declared **before** parameter routes like `/:id`. Express matches in registration order, and `/:id` would also match `/counts` (treating `"counts"` as an id). Today there is no `GET /:id` and `PATCH/DELETE /:id` use different methods, so nothing actually collides — but putting static paths first is the safe habit and matters the moment someone adds `GET /:id`.

### `src/controllers/products.controller.js`
Thin functions: read `req.query` / `req.params` / `req.body`, call the service, send the response.
* `create` returns **201 Created**.
* `exportCsv` sets `Content-Type: text/csv` and `Content-Disposition: attachment; filename="catalog.csv"` so the browser downloads it instead of displaying it.

### `src/services/products.service.js` — the core logic

**Constants**: `VIEWS`, `UNPUBLISHED_SUBS`, `NOT_FOR_SALE_SUBS`, `SORT_KEYS`, `BULK_ACTIONS` — whitelists used for validation.

**`matchesView(product, view, sub)`** – a `switch` that says whether a product belongs in a view:
* `all` → catalog (`published` or `unpublished`)
* `published` → status published
* `unpublished` → status unpublished (and if `sub` given, `unpublishedReason === sub`)
* `not_for_sale` → unpublished + reason `not_for_sale` (+ `notForSaleReason === sub`)
* `drafts` / `deleted` → by status

**`validateFilter`** – throws `400` if `view` or `sub` isn't allowed. **Whitelisting** inputs prevents garbage and unexpected behaviour.

**`compare(a, b, key, dir)`** – generic comparator:
* `null` values always sort **last** (so products without an offer price don't jump to the top when sorting descending).
* Strings use `localeCompare('es', {sensitivity:'base'})` → accent/case-insensitive Spanish-aware ordering (`Índigo` sorts near `I`).
* Numbers use subtraction. `desc` just negates.

**`filtered(query)`** – the pipeline: **validate → filter by view → filter by search → sort**.
* Search (`q`) lowercases and checks `name`, `skuSeller`, `skuFalabella`, `categoryPath` with `includes`.
* Sort tie-breaker `|| b.id - a.id` makes ordering **stable and deterministic** when two values are equal.
* Defaults: `sortBy = createdAt`, `dir = desc` (newest first).

**`listProducts(query)`** – calls `filtered`, then paginates with `slice((page-1)*limit, page*limit)`. Returns `{ items, total, page, limit, totalPages }`. `limit` is clamped to `maxPageSize`; `page` to ≥1.

**`getCounts()`** – counts for every chip/option by reusing `matchesView`, so **a badge number always equals the number of rows you get when you click it** (single source of truth).

**Mutations**
* `setActive(id, active)` – checks `active` is a boolean, product exists, and is a catalog product; sets it and updates `updatedAt`.
* `softDelete(id)` – saves `previousStatus`, sets `status='deleted'`, `active=false`.
* `restore(id)` – only valid if deleted; goes back to `previousStatus` (or `draft` as fallback).
* `bulk(action, ids)` – validates, then runs the matching function per id inside `try/catch`; items the action doesn't apply to are **skipped**; returns `{ affected }`.
* `createDraft()` – builds a product via the factory with name `Untitled Draft (YYYY-MM-DD HH:mm:ss)` and pushes it.

**`findOrThrow(id)`** – `Number(id)` (URL params are strings!) then `find`; throws `404` if missing.

### `src/data/products.mock.js` — the fake database
* A module-level `products` array = the database. Because Node caches modules, **every file that imports it shares the same array** (a singleton). Changes live until the server restarts.
* `make(overrides)` is a **factory function**: gives every product all fields with defaults, assigns an auto-increment `id`.
* Three groups: **handCrafted** (the 6 products visible in your screenshots), **generated** (5 product families × colors × sizes = 19, cycling through a `states` array so every filter has data), **drafts** (10, exactly as in the screenshot), **deleted** (6).
* Counts you will see: All 25 · Published 6 · Unpublished 19 (salable 2, not-for-sale 15, under review 2) · Drafts 10 · Deleted 6.

### `src/utils/httpError.js`
`class HttpError extends Error` with a `status`. Services `throw badRequest('…')` / `notFoundError('…')`; the error handler turns it into `res.status(err.status).json({ error })`. This keeps HTTP concerns out of the logic.

### `src/utils/csv.js`
`toCsv(rows, columns)` → header line + one line per row. `escapeCell` wraps a value in quotes and doubles inner quotes **if it contains `,` `"` or a newline** (the CSV spec, RFC 4180). Needed because category paths and names can contain commas.

### `src/middleware/errorHandler.js`
* `notFound` → `404 { error: 'Route not found: GET /api/xyz' }`
* `errorHandler` → uses `err.status || 500`; logs only 5xx; returns JSON `{ error }`.

> [!note] Sync vs async errors
> Express 4 automatically catches errors **thrown synchronously** in handlers (our services are synchronous). If a handler were `async`, a thrown error would **not** be caught automatically in Express 4 — you'd need `try/catch` + `next(err)` or a wrapper (Express 5 fixes this).

---

## 6. Frontend, file by file

### `client/index.html` and `src/main.jsx`
`index.html` has `<div id="root">` and a `<script type="module" src="/src/main.jsx">`. `main.jsx` imports the three CSS files and calls `createRoot(...).render(<App />)` — this is where React takes over the page.

### `vite.config.js`
```js
server: { port: 5173, proxy: { '/api': 'http://localhost:3001' } }
```
The browser talks only to `:5173`; Vite **forwards** any `/api/...` request to the Node API on `:3001`. Result: no CORS problem in development and the client code can just call `/api/products` (relative URL).

### `App.jsx`
The shell: `<Sidebar/>`, then a `.main` column with `<Header/>` and `<ProductManagerPage/>`, plus `<FloatingWidgets/>` (green note button and the survey bar, `position: fixed`).

### `pages/ProductManagerPage.jsx` — the most important file
It **owns all the state** and passes data/handlers down as props ("**lifting state up**"):

| State | Meaning |
| --- | --- |
| `tab` | Catalog / Pending / Stock |
| `filter` = `{view, sub}` | which chip/option is active |
| `query` | raw text in the search box |
| `sort` = `{key, dir}` or `null` | user's chosen sort |
| `page` | current page number |
| `selected` | a `Set` of checked product ids |
| `actionError` | message if a write failed |

Key lines of logic:
* `q = useDebounce(query, 300)` → only search the server 300 ms after the user stops typing.
* `effectiveSort = sort ?? (isDrafts ? {createdAt, desc} : null)` → drafts default to newest-first, and the header arrow reflects it.
* `params = useMemo(...)` → the object sent to the API; memoised so it only changes when its inputs change.
* `useProducts(params)` → fetches whenever `params` change; returns `items, total, totalPages, loading, error, reload`.
* `useCounts()` → fetches badge counts once; `reloadCounts()` after mutations.
* A `useEffect` on `[view, sub, q]` **resets page to 1 and clears selection** when the result set changes shape.
* `changeFilter(f)` → sets filter **and clears the manual sort**.
* `onSort(key)` → same key toggles asc↔desc, new key starts asc.
* `run(fn)` → wrapper for every write: clear error → `await fn()` → clear selection → `refresh()` (reload list + counts); on failure shows the message in the red banner.
* `toggleOne` copies the Set (`new Set(s)`) before changing it — React state must be **immutable** or it won't re-render.
* `allSelected` = every visible row is in `selected`.
* Rendering: tab ≠ Catalog → placeholder; otherwise chips, toolbar (**hidden on Drafts**), error banner, one of three tables by `view`, an "empty" message, and pagination.

### `hooks/useProducts.js`
```js
useEffect(() => {
  const ctrl = new AbortController()
  setLoading(true)
  listProducts(JSON.parse(key), ctrl.signal).then(...).catch(...)
  return () => ctrl.abort()          // cleanup
}, [key, tick])
```
* `key = JSON.stringify(params)` → a **string** dependency, so the effect re-runs only when the *content* of params changes (an object literal is a new reference every render).
* Cleanup **aborts the previous request** when params change → prevents a slow old response overwriting a newer one (**race condition**). The `AbortError` is ignored.
* `tick` + `reload()` → bumping a counter re-runs the effect = "refetch now".
* `useCounts` uses a ref `alive` so it doesn't set state after the component unmounted.

### `hooks/useDebounce.js`
Stores a delayed copy of a value using `setTimeout`; the cleanup `clearTimeout` restarts the timer on every keystroke.

### `hooks/useClickOutside.js`
Adds `mousedown` and `keydown` listeners on `document` while a popup is open; calls the handler if you click outside the ref'd element or press **Escape**. Removes them on cleanup.

### `api/http.js` and `api/products.js`
`http(path, {method, body, params, signal})` wraps `fetch`: builds the query string (skipping empty values), sets `Content-Type: application/json` and `JSON.stringify`s the body when present, parses JSON, and **throws `Error(data.error)` for non-2xx** (`fetch` itself only rejects on network failure, not on 404/500!). `products.js` exposes named functions (`listProducts`, `setActive`, `bulkAction`, `exportUrl`, …) so components never hand-write URLs.

### `components/products/*`
* **FilterChips** – renders plain chips and two `DropdownChip`s. Active state = `filter.view` matches. Option list shows `pill` counts (`formatCount`).
* **Toolbar** – a *controlled* search input, bulk `<select>`, **Go** button (disabled until an action and a selection exist), CSV link `<a href=… download>`.
* **CatalogTable / DraftsTable / DeletedTable** – each = a header row + rows rendered with `rows.map(...)`, using **CSS Grid** (`.cols.catalog`, `.cols.drafts`, `.cols.deleted` define the column widths).
* **SortHeader** – a header button; shows ⇅ when not sorted, ↑/↓ when active.
* **RowMenu** – the ⋮ button; uses `Popover` to show actions (Delete / Restore).
* **Pagination** – "from–to of total" + Previous/Next (disabled at the ends).

### `components/ui/*`
* **Popover** – generic dropdown using **render props**: `trigger({open, toggle})` and `children(close)`. Handles open/close state and click-outside.
* **Toggle** – a `<button role="switch" aria-checked>` styled as a switch (accessible).
* **Checkbox** – a styled `<input type="checkbox">`; supports the *indeterminate* state through a callback ref (`el.indeterminate` can't be set via an HTML attribute).
* **Icons** – one `Icon` component with a `paths` map of inline SVGs, plus `Kebab`. Uses `currentColor` so icons inherit text colour.

### `utils/format.js`
* `formatDate` → `dd/mm/yyyy` using `en-GB` locale and **`timeZone: 'UTC'`** so a date doesn't shift a day depending on the viewer's timezone.
* `formatPrice` → `$1,234`, or `-` when null.
* `formatCount` → `de-DE` locale gives dots as thousand separators (`13.327`) like the original UI.

### CSS (`styles/`)
* `base.css` – design tokens as **CSS variables** (`--dark`, `--olive`, `--chip-active`…), body font, checkbox/toggle/popover/pill styling.
* `layout.css` – the page shell: flex container, sticky sidebar, header, fixed floating widgets.
* `product-manager.css` – tabs, chips, toolbar, table grid, rows, pager.
* Tables use `display: grid` with `grid-template-columns` (mix of `fr` and `px`). Alternate row shading via `:nth-child(even)`.

---

## 7. Request flows end to end

### A. Opening the page
1. Browser loads `localhost:5173` → Vite serves `index.html` → `main.jsx` → `<App/>` renders.
2. `Header` calls `GET /api/me` → name appears.
3. `ProductManagerPage` mounts: `useProducts` calls `GET /api/products?view=all&page=1&limit=20` (no `sortBy` for the catalog, so the server default `createdAt desc` applies); `useCounts` calls `/api/products/counts`.
4. Vite's proxy forwards `/api/*` to Express → router → controller → service → returns JSON → React stores it in state → table renders.

### B. Clicking "Not for Sale ▾ → Content"
1. `onSelect({view:'not_for_sale', sub:'content'})` → `changeFilter` sets `filter`, clears `sort`.
2. `params` changes → `useProducts` effect cleanup aborts any in-flight request and fires `GET /api/products?view=not_for_sale&sub=content…`.
3. The reset-effect sets page 1 and clears selection. Chip label becomes "Content".

### C. Typing in the search box
Each keystroke updates `query` (instant, so typing feels responsive); `q` updates 300 ms after the last keystroke → params change → one request with `q=...`. Page resets to 1.

### D. Toggling Active
`Toggle` → `onToggleActive(id, true)` → `run(() => api.setActive(id, true))` → `PATCH /api/products/:id {active:true}` → service sets it → then `refresh()` refetches list + counts so the UI shows the server's truth.

### E. Bulk Delete
Tick rows (`selected` Set) → choose "Delete" → **Go** → `POST /api/products/bulk {action:'delete', ids:[…]}` → server soft-deletes each → `{affected: n}` → selection cleared, list/counts refreshed. Those rows now appear under **Deleted Products**.

### F. Add product
`POST /api/products` → 201 + the new draft → client switches filter to `drafts` → new draft is on top (newest first).

### G. Download catalog
It's an `<a href="/api/products/export?view=…&q=…" download>` — a normal browser navigation, not `fetch`. Server replies with CSV + `Content-Disposition: attachment`, so the browser saves `catalog.csv`. It uses the **current filters** but **ignores pagination** (exports all matching rows).

---

## 8. Technical concepts explained

### React
* **Component** – a function returning JSX; reusable UI piece. Names start with a capital letter.
* **JSX** – HTML-like syntax compiled to `React.createElement` calls. `{}` embeds JavaScript. `className` instead of `class`.
* **Props** – read-only inputs to a component (`<Toggle checked onChange />`). Data flows **down**; events flow **up** via callback props.
* **State (`useState`)** – data that, when changed, re-renders the component. Never mutate state directly; create a new value (new `Set`, new object).
* **Re-render** – React calls your function again; it then compares (diffs) the result with the previous one — the **virtual DOM** — and updates only the real DOM nodes that changed.
* **`useEffect(fn, deps)`** – run side effects (fetching, listeners, timers) *after* render. Re-runs when anything in `deps` changes. The **returned function is cleanup**, run before the next effect and on unmount.
* **`useMemo`** – caches a computed value until its deps change (here: the `params` object).
* **`useCallback`** – caches a function identity (used in `useClickOutside`'s `close`, `reload`).
* **`useRef`** – a mutable box that persists across renders without causing re-render; used for DOM nodes (`ref`) and the `alive` flag.
* **Custom hook** – a function starting with `use` that bundles hooks (`useProducts`, `useDebounce`). Reuses *logic*, not UI.
* **Controlled input** – the input's `value` comes from state and `onChange` updates it (search box, select).
* **Lists & `key`** – `rows.map(r => <Row key={r.id} />)`; stable keys let React track items. Don't use array index if items reorder.
* **Conditional rendering** – `cond && <X/>`, ternaries, early returns.
* **Lifting state up** – shared state lives in the nearest common parent (`ProductManagerPage`).
* **Render props** – passing a function as a prop/children (`Popover`) so the parent controls what's drawn inside.
* **Immutability** – required because React detects change by **reference equality** (`Object.is`).

### Vite
* A **dev server** that serves source files as native **ES modules** (no bundling in dev → instant start) with **HMR** (hot module replacement: edits appear without a full reload).
* `vite build` bundles/minifies to `dist/` for production (uses Rollup).
* **Proxy** – dev-server option to forward requests to another server.

### Node.js / Express
* **Node** – JavaScript runtime outside the browser (V8 engine). Single-threaded **event loop**; non-blocking I/O.
* **ES modules vs CommonJS** – `import/export` (`"type":"module"`) vs `require/module.exports`.
* **Express middleware** – a function `(req, res, next)`; either responds or calls `next()` to continue. `app.use` registers them in order.
* **Routing** – `router.get('/path', handler)`; `:id` is a **route parameter** (`req.params.id`).
* **`req.query` / `req.params` / `req.body`** – query string (`?a=1`), path segment, and JSON body respectively.
* **`express.json()`** – body-parser; without it `req.body` is `undefined`.
* **Static files + SPA fallback** – serve built assets and send `index.html` for unknown routes.

### HTTP & REST
* **REST** – resources as URLs (`/products/5`), actions as HTTP methods.
* **GET** read (safe, cacheable) · **POST** create / actions · **PATCH** partial update · **PUT** full replace · **DELETE** remove.
* **Idempotent** – repeating gives the same result (GET, PUT, DELETE, and here PATCH `{active:true}`). POST usually isn't (creating twice makes two drafts).
* **Status codes** – 200 OK, 201 Created, 400 Bad Request (client sent invalid data), 404 Not Found, 500 Server Error.
* **Headers used** – `Content-Type`, `Content-Disposition`.
* **JSON** – the data format for requests/responses.

### CORS and proxying
* **Same-origin policy** – browsers block JS from reading responses from a different *origin* (scheme+host+port). `:5173` and `:3001` are different origins.
* **CORS** – the server opts in with `Access-Control-Allow-Origin` headers (the `cors()` middleware).
* **Proxy** – because Vite forwards `/api` requests, the browser only ever sees `:5173`, so CORS isn't even triggered in dev. We still keep `cors()` so the API can be called directly (e.g. from another origin or tools).

### Architecture ideas
* **Separation of concerns / layering** – routes → controllers → services → data.
* **Mock data / in-memory store** – fake data in an array, resets on restart. Lets you build the full flow before choosing a real DB.
* **Soft delete** – flag instead of removing the row; supports undo/audit.
* **Pagination (offset-based)** – `page` + `limit` → `slice`. Simple; downsides on huge or changing datasets (skipped/duplicated rows, slow large offsets) — cursor pagination is the alternative.
* **Server-side vs client-side filtering** – here the *server* filters/sorts/paginates, like a real catalog with thousands of items, so the client never loads everything.
* **Debouncing** – delay an action until input pauses (vs *throttling* = at most once per interval).
* **Race condition & request cancellation** – `AbortController` cancels stale fetches.
* **Single Source of Truth** – counts reuse `matchesView`; the UI refetches after writes instead of guessing results.
* **Whitelist validation** – only accept known values for `view`, `sub`, `sortBy`, `action`.
* **Factory function** – `make()` builds consistent objects.
* **Singleton via module cache** – the shared `products` array.
* **Monorepo / npm workspaces** – several packages in one repo; hoisted `node_modules`; `-w client` runs a script in one workspace.
* **SPA** – Single Page Application: one HTML page; JS swaps the UI and calls APIs.

### CSS
* **CSS variables** (`var(--dark)`) – theme tokens in `:root`.
* **Flexbox** – 1-D layout (header, toolbar, chips). **Grid** – 2-D layout (tables).
* **`position: fixed/sticky/absolute`** – floating widgets / sidebar / dropdown panels (`.popover-wrap` is `relative`, `.popover` is `absolute`).
* **`box-sizing: border-box`** – padding/border included in width.
* **`fr` unit** – fraction of free space in a grid.

### Accessibility touches
`aria-label` on icon buttons, `role="switch"` + `aria-checked` on toggles, `role="tab"`/`aria-selected` on tabs, `role="alert"` on the error banner, Escape closes popovers.

### Other
* **CSV escaping**, **UTC vs local time**, **locale formatting** (`toLocaleString`), **ISO 8601** timestamps (`2026-11-11T19:58:00Z`; the `Z` means UTC).

---

## 9. Questions you might be asked

> [!tip] How to use this
> Cover the answer, say it out loud, then expand. The goal is to explain in your own words, not memorise.

### 9.1 Big picture

> [!question]- What does this project do, and how is it organised?
> A recreation of Falabella Seller Center's Product Manager page. `client/` is a React/Vite SPA; `server/` is a Node/Express REST API with in-memory mock data. Both are npm workspaces in one repo; `npm run dev` starts both. The server has routes → controllers → services → data layers.

> [!question]- How do the frontend and backend talk?
> The React app calls `fetch('/api/…')`. In dev, Vite's proxy forwards `/api` to Express on port 3001. Express returns JSON (or CSV for export). In production, `npm run build` creates `client/dist` and Express serves those static files itself, so one server does both.

> [!question]- Why a monorepo with workspaces?
> One repo and one `npm install` for both apps, shared tooling, and a single root script (`npm run dev`) that starts both. Workspaces hoist dependencies into one `node_modules`.

> [!question]- Why mock data instead of a database?
> The goal was the UI and API behaviour. An in-memory array is the simplest "database", and the service layer is separate, so a real DB (Postgres/Mongo) could replace `data/` without touching routes or React.

> [!question]- How would you run it from scratch?
> `npm install` then `npm run dev`; open `http://localhost:5173`. API alone: `npm run dev:server`. Production-style: `npm run build && npm start` and open `http://localhost:3001`.

### 9.2 Backend

> [!question]- Walk me through what happens when the client calls `GET /api/products?view=published&page=2`.
> Express matches `/api` → `routes/index.js` → `products.routes.js` `router.get('/')` → `controller.list` → `service.listProducts(req.query)`. The service validates `view`, filters with `matchesView`, applies search and sort, slices for page 2 and returns `{items,total,page,limit,totalPages}`. The controller `res.json`s it.

> [!question]- Why separate routes, controllers and services?
> Single responsibility. Routes map URLs; controllers handle HTTP details; services contain business rules and know nothing about Express, so they're reusable and testable. Swapping the data source or framework affects one layer.

> [!question]- Why is `index.js` separate from `app.js`?
> `app.js` builds and exports the app without listening, so tests (e.g. supertest) can import it without binding a port. `index.js` is only the launcher.

> [!question]- What is middleware and why does order matter?
> A function `(req,res,next)` that can modify the request/response, end it, or call `next()`. Express runs them in registration order: `json()` must come before routes so `req.body` exists; `notFound` after routes; `errorHandler` last so it catches earlier errors.

> [!question]- How does Express know `errorHandler` is an error handler?
> It has **four** parameters `(err, req, res, next)`. Express checks the function's arity.

> [!question]- How are validation errors reported?
> Services throw `HttpError(400, message)` (via `badRequest`). The error handler responds with that status and `{ error: message }`. The client's `http()` turns non-2xx into a thrown `Error` and the page shows it in the red banner.

> [!question]- What's the difference between 400 and 404 in this API?
> 400 = the request is malformed/invalid (bad `view`, non-boolean `active`, empty `ids`). 404 = the resource/route doesn't exist (unknown product id or URL).

> [!question]- Why `Number(id)` in `findOrThrow`?
> Route params are always strings; product ids are numbers, so `===` would fail without converting.

> [!question]- Why must `/counts` and `/export` be defined before `/:id`?
> Express matches routes in order. A parameter route like `/:id` also matches `/counts`. Putting literal paths first avoids that conflict.

> [!question]- Explain soft delete and how restore works.
> Delete doesn't remove the object: it stores `previousStatus`, sets `status='deleted'` and `active=false`. Restore requires `status==='deleted'` and sets `status = previousStatus` (fallback `draft`). Benefits: undo and audit; cost: queries must filter by status.

> [!question]- How does pagination work and what are its limits?
> Offset pagination: `slice((page-1)*limit, page*limit)`, `totalPages = ceil(total/limit)`, `limit` capped at 100. Limits: if data changes between requests items can be skipped/duplicated; big offsets are slow in real DBs — cursor/keyset pagination fixes that.

> [!question]- Why do null values sort last?
> In `compare`, a `null` (e.g. no offer price) returns `1`/`-1` before the direction is applied, so nulls stay at the bottom for both asc and desc, which is the friendlier UX.

> [!question]- Why `localeCompare` with `'es'` and `sensitivity: 'base'`?
> Names include accents (`Índigo`). Plain `<` compares code points and would put accented letters after `Z`. `localeCompare` sorts naturally; `base` ignores case and accents.

> [!question]- What does `|| b.id - a.id` do in the sort?
> Tie-breaker: if the main comparator returns 0, sort by id descending so order is deterministic.

> [!question]- Why do the counts always match the lists?
> `getCounts` uses the same `matchesView` function as the list filter, so there's one definition of "what belongs to this view".

> [!question]- Does `bulk` fail if one id is invalid?
> No — each id runs in `try/catch`; failures are skipped and the response reports how many were `affected`. Trade-off: the caller isn't told *which* ones failed.

> [!question]- Is the API idempotent where it should be?
> PATCH `{active:true}` and DELETE give the same end state if repeated (delete on an already-deleted item just returns it). POST create is not idempotent — each call creates another draft.

> [!question]- How is the CSV generated and why are quotes escaped?
> `toCsv` joins header + rows. `escapeCell` quotes any value with a comma, quote or newline and doubles inner quotes. Category paths and names can contain commas/pipes, so unescaped output would break columns. The route sets `Content-Disposition: attachment` to trigger a download.

> [!question]- What is CORS and do you need it here?
> A browser rule blocking cross-origin reads unless the server allows it. In dev the Vite proxy makes requests same-origin, so it isn't strictly needed; `cors()` is kept so the API works when called from another origin.

> [!question]- Where is the data stored, and what happens on restart?
> In the `products` array in `products.mock.js`, in memory. Restarting the server (or `node --watch` reloading on a file change) resets everything to the seed data.

> [!question]- Why does everything share the same `products` array?
> Node caches ES modules after the first import, so every importer receives the same module instance/array (singleton).

> [!question]- What does `"type": "module"` change?
> Enables `import/export`; relative imports need explicit `.js` extensions; no `__dirname` (we derive it from `import.meta.url` in `app.js`).

> [!question]- How is the production build served?
> `app.js` checks whether `client/dist` exists; if so it serves it with `express.static` and sends `index.html` for any non-API route so client-side routing/refresh works.

> [!question]- Is there authentication or security?
> No. It's a mock. In a real system you'd add auth (JWT/session), per-seller authorization (a seller may only see their own products), rate limiting, input schema validation (zod/joi), and stricter CORS.

> [!question]- Why is there a `/api/health` route?
> A simple liveness check used by load balancers/monitoring to know the server is up.

### 9.3 Frontend / React

> [!question]- Where does the state live and why?
> In `ProductManagerPage` (tab, filter, query, sort, page, selected). Multiple children need it (chips, toolbar, tables, pager), so it's lifted to their common parent and passed down via props and callbacks.

> [!question]- What happens when the filter changes?
> `changeFilter` updates `filter` and clears `sort`. `params` (memoised) changes → `useProducts` effect re-runs → aborts the old request, fetches the new one. The reset effect sets page 1 and clears selection.

> [!question]- Why does `useProducts` use `JSON.stringify(params)` as a dependency?
> Effect deps compare by reference. `params` is an object; a new object with the same contents would still trigger the effect. A string compares by value, so the effect only runs when the contents really change.

> [!question]- What is `AbortController` doing there?
> It cancels the previous `fetch` when params change or the component unmounts. Without it, a slow earlier response could arrive after a newer one and overwrite the correct data (race condition). Aborted requests throw `AbortError`, which we ignore.

> [!question]- What is debouncing and how did you implement it?
> `useDebounce(value, 300)` keeps a delayed copy of the value with `setTimeout`; each change clears the previous timer in the effect cleanup, so the value only updates after the user stops typing for 300 ms. This avoids one request per keystroke.

> [!question]- Why keep both `query` and `q`?
> `query` updates instantly so the input is responsive; `q` (debounced) is what triggers server calls.

> [!question]- Why copy the `Set` in `toggleOne`?
> React re-renders when state *reference* changes. Mutating the existing Set and setting it again keeps the same reference → no re-render. `new Set(s)` creates a new one.

> [!question]- Why use a `Set` for selection?
> O(1) `has/add/delete` and no duplicates, which suits "is this id selected?" lookups per row.

> [!question]- What does `run()` do?
> A helper wrapping every mutation: clear the old error, await the API call, clear selection, refresh list + counts; on error, show the message. It removes repeated try/catch in each handler and guarantees the UI re-syncs with the server.

> [!question]- Why refetch after a mutation instead of updating local state?
> The server is the source of truth: removing a row, changing counts, pagination totals and ordering are all easier and always correct if we just refetch. Trade-off: one extra request and a brief loading state. (Optimistic updates would feel faster but add rollback complexity.)

> [!question]- How does the Active toggle work?
> `Toggle` is a button with `role="switch"`; clicking calls `onChange(!checked)` → `api.setActive(id, value)` → `PATCH` → refetch. The displayed value comes from server data (`p.active`), so it's a controlled component.

> [!question]- What is `effectiveSort` for?
> Drafts should default to newest-first even though the user hasn't clicked a header. `effectiveSort` = chosen sort or the drafts default, so the header arrow shows the true sort and the request carries it.

> [!question]- Why are keys used in lists? What's used here?
> Keys let React match list items between renders to reuse/update the right DOM nodes. We use the product `id`, which is stable and unique.

> [!question]- What's a custom hook? Name the ones in this project.
> A function starting with `use` that composes other hooks to share logic. Here: `useProducts`, `useCounts`, `useDebounce`, `useClickOutside`.

> [!question]- How does `Popover` work?
> It holds `open` state and a ref, uses `useClickOutside` to close on outside click/Escape, and takes a `trigger` render-prop `({open,toggle})` and `children` (node or function receiving `close`). Both `DropdownChip` and `RowMenu` reuse it.

> [!question]- What are render props?
> Passing a function as a prop that returns JSX, so the component controls behaviour but the caller controls what's displayed.

> [!question]- Why is the toolbar hidden on Drafts?
> The reference screenshot of Drafts has no checkbox/search/bulk row, so `{!isDrafts && <Toolbar/>}`.

> [!question]- How does the select-all checkbox show a partial state?
> `Checkbox` sets `el.indeterminate` via a callback ref when some (but not all) rows are selected. `indeterminate` can only be set through JS, not an HTML attribute. The page passes `checked = allSelected` and `indeterminate = (selected.size > 0)`; the component only applies the dash when `checked` is false, so you see: nothing selected → empty, some → dash, all → tick.

> [!question]- How is the "Download catalog" button implemented?
> As a normal `<a download href="/api/products/export?...">` with the current filters. The browser navigates to it and saves the CSV because of the `Content-Disposition: attachment` header. No `fetch` or blob handling needed.

> [!question]- How do dates avoid timezone bugs?
> The server sends ISO UTC timestamps. `formatDate` formats with `timeZone: 'UTC'` so `2026-11-10T23:30:00Z` shows 10/11/2026 for everyone instead of shifting to 11/11 in some timezones.

> [!question]- What does `useMemo` buy you here?
> It keeps the `params` object stable between renders unless its inputs change, so effects depending on it don't re-run needlessly.

> [!question]- Is anything re-fetched unnecessarily?
> On a filter change, `params` changes (one request) and then the reset effect calls `setPage(1)`; if the page was already 1 nothing changes, otherwise a second request fires. The abort logic discards the stale first response. A cleaner version would reset page inside `changeFilter` itself.

> [!question]- How is loading state shown?
> `loading` adds a `.loading` class on `.table-area` that lowers opacity (stale data stays visible while refetching, avoiding flicker). "No products found." shows only when not loading and `items.length === 0`.

> [!question]- How would you add a new column or filter?
> New column: add it to the product model/mock data, add a grid column in CSS (`.cols.catalog`), a header cell and a body cell in `CatalogTable`. New filter: add the value to `VIEWS`/`matchesView`/`getCounts` on the server, then a chip/option in `FilterChips`.

> [!question]- What is Vite HMR?
> Hot Module Replacement: when you save a file, Vite swaps only that module in the running page (React Fast Refresh keeps component state) instead of reloading the browser.

> [!question]- Why `className` and not `class`?
> JSX is JavaScript, and `class` is a reserved word; React uses the DOM property name `className`.

### 9.4 CSS / UI

> [!question]- How are the tables laid out?
> CSS Grid on each row: `grid-template-columns` defines widths using `fr` and `px` (e.g. `32px 3fr 1.1fr …`). Header and body rows use the same class so the columns line up.

> [!question]- What are CSS variables used for?
> Theme tokens in `:root` (`--dark`, `--olive`, `--chip-active`, `--red`…) so colours are defined once and reused.

> [!question]- How is the dropdown positioned under its chip?
> The wrapper `.popover-wrap` is `position: relative`; the `.popover` panel is `position: absolute; top: calc(100% + 4px)` with a high `z-index` so it overlays the table.

> [!question]- Is it responsive?
> Not really — it targets desktop widths like the reference screenshots. Fluid columns (`fr`) help, but there are no mobile breakpoints.

### 9.5 "Prove you wrote it" curveballs

> [!question]- Why does the Unpublished dropdown contain "Not for Sale" *and* there's a separate Not for Sale chip?
> They're two separate filters from the reference UI. `unpublished/not_for_sale` = unpublished with reason not-for-sale; `not_for_sale/<reason>` further splits by the *reason* (Content, Price, Stock…). The service has separate `view` values for them.

> [!question]- Why does "All" not include drafts or deleted products?
> `matchesView('all')` is `status published || unpublished` — "All" means the whole live catalog. Drafts are unfinished and deleted are removed, each has its own chip.

> [!question]- What happens if I request `?view=bad`?
> `validateFilter` throws a 400: `Invalid view "bad". Use one of: …` and the client would show it in the error banner.

> [!question]- What happens if I send `PATCH /api/products/1` with `{"active":"x"}`?
> 400 `"active" must be a boolean`.

> [!question]- Can I activate a draft or a deleted product?
> No. `setActive` rejects non-catalog products with a 400.

> [!question]- What if two people use the app at once?
> They share the same in-memory data, so changes by one appear for the other after a refetch. No locking or conflict handling — fine for a mock, not for production.

> [!question]- Where would you put a real database?
> Replace the array in `data/` with a DB client/repository (e.g. Prisma/Knex) and make the service functions `async`, then update controllers to `await` (and add async error handling in Express 4).

> [!question]- How would you test this?
> Server: unit-test `products.service.js` directly (filtering, sort, pagination, counts, mutations) and use supertest against `app.js` for routes/status codes. Client: React Testing Library for `FilterChips`, `useDebounce`, `ProductManagerPage` with a mocked `fetch`/MSW.

> [!question]- What is the weakest part of the code?
> No automated tests, no auth/validation library, in-memory state, `Edit` isn't implemented, Pending/Stock tabs are placeholders, and the page-reset effect can cause an extra request. Being honest about these shows you understand the trade-offs.

---

## 10. Limitations and what you'd improve

* **Persistence** – move from the in-memory array to a real database.
* **Tests** – none yet (see testing question above).
* **Validation** – hand-written checks; use zod/joi schemas.
* **Auth & multi-tenancy** – no login; a real seller portal scopes everything to the seller.
* **State fetching** – replace custom hooks with TanStack Query (caching, retries, dedupe, optimistic updates).
* **Routing** – no React Router; tabs and filters aren't in the URL, so refresh resets them. Putting `view/sub/page/q` in the query string would make views shareable.
* **Pending / Stock tabs, Edit product** – not built.
* **Accessibility** – good start, but dropdowns lack full keyboard navigation (arrow keys) and focus management.
* **Responsive design** – desktop only.
* **Async Express** – if services become async, wrap handlers (or upgrade to Express 5).
* **Pagination** – cursor-based for large data; page-size selector.
* **Error UX** – toasts instead of a banner; per-item results for bulk actions.
* **Data counts** – the real site shows thousands; ours reflect the 25 mock catalog items.

---

## 11. Cheat sheet

### Commands
```bash
npm install            # install client + server
npm run dev            # API :3001 + client :5173
npm run dev:server     # API only
npm run dev:client     # client only
npm run build          # build client → client/dist
npm start              # run API (serves client/dist if built)
```

### API quick reference
| Method | URL | Notes |
| --- | --- | --- |
| GET | `/api/products` | `view, sub, q, sortBy, dir, page, limit` |
| GET | `/api/products/counts` | all chip counts |
| GET | `/api/products/export` | CSV, same filters |
| POST | `/api/products` | create draft → 201 |
| PATCH | `/api/products/:id` | `{active:boolean}` |
| DELETE | `/api/products/:id` | soft delete |
| POST | `/api/products/:id/restore` | undo delete |
| POST | `/api/products/bulk` | `{action, ids}` → `{affected}` |
| GET | `/api/me` | seller + notifications |

`view` ∈ `all, published, unpublished, not_for_sale, drafts, deleted`
`sortBy` ∈ `name, createdAt, updatedAt, price, offerPrice, categoryPath`
`action` ∈ `activate, deactivate, delete, restore`

### Product object
```json
{
  "id": 1,
  "name": "… / Índigo / XS",
  "skuSeller": "202611111700",
  "skuFalabella": "101355761",
  "categoryPath": "Clothes and accessories > …",
  "price": 123, "offerPrice": null, "stock": 2000,
  "active": false,
  "status": "unpublished",
  "unpublishedReason": "not_for_sale",
  "notForSaleReason": "content",
  "recommendations": [],
  "previousStatus": null,
  "createdAt": "2026-11-11T19:58:00Z",
  "updatedAt": null
}
```

### One-paragraph summary to memorise
*"The React page keeps filter, search, sort, page and selection in state. Whenever those change, a custom hook builds a query and calls the Express API through Vite's proxy, aborting stale requests. The API runs a service that validates input, filters the in-memory product list by view, searches, sorts, paginates and returns JSON. Writes (toggle, delete, restore, bulk, create) are separate endpoints; after each, the UI refetches so it always reflects the server. Counts reuse the same filter function, deletes are soft, CSV is a download endpoint, and the code is layered so the mock data could be swapped for a real database."*
