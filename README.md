# Seller Center – Product Manager

React (Vite) client + Node/Express API backed by in-memory mock data.

## Run

```bash
npm install        # installs client + server (npm workspaces)
npm run dev        # API on :3001, client on :5173 (proxies /api → :3001)
```

Open http://localhost:5173. Restarting the API resets the mock data.

Production-style: `npm run build && npm start` serves the built client from the API on :3001.

## Structure

```
client/                      React app (Vite)
  src/
    api/                     fetch wrapper + product endpoints
    components/
      layout/                Header, Sidebar, FloatingWidgets
      products/              FilterChips, Toolbar, Catalog/Drafts/Deleted tables, RowMenu, Pagination
      ui/                    Icons, Toggle, Checkbox, Popover
    hooks/                   useProducts, useCounts, useDebounce, useClickOutside
    pages/                   ProductManagerPage
    styles/                  base.css, layout.css, product-manager.css
    utils/                   format helpers
server/
  src/
    config/                  port, paging limits
    data/                    products.mock.js, user.mock.js
    routes/ → controllers/ → services/   (HTTP → request handling → business logic)
    middleware/              404 + error handler
    utils/                   csv, httpError
```

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/products` | List. Query: `view` (`all`, `published`, `unpublished`, `not_for_sale`, `drafts`, `deleted`), `sub`, `q`, `sortBy` (`name`, `createdAt`, `updatedAt`, `price`, `offerPrice`, `categoryPath`), `dir` (`asc`/`desc`), `page`, `limit` |
| GET | `/api/products/counts` | Counts for the filter dropdown badges |
| GET | `/api/products/export` | CSV download (same filters as the list) |
| POST | `/api/products` | Create a draft |
| PATCH | `/api/products/:id` | `{ "active": boolean }` |
| DELETE | `/api/products/:id` | Soft delete |
| POST | `/api/products/:id/restore` | Restore a deleted product |
| POST | `/api/products/bulk` | `{ "action": "activate" \| "deactivate" \| "delete" \| "restore", "ids": [] }` |
| GET | `/api/me` | Seller name + unread notifications |

`sub` for `unpublished`: `salable`, `not_for_sale`, `under_review`.
`sub` for `not_for_sale`: `content`, `price`, `stock`, `multimedia`, `compliance`, `configuration`.
