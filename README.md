# RPL Frontend

Plain **HTML + CSS + Vanilla JS** frontend for the Resource Planning Ledger.  
No build step. No framework. No dependencies. Just open `index.html`.

---

## Running locally

### Option 1 — Open directly (simplest)

If the backend is running on port 8080 and you open `index.html` via
`file://`, browsers block `fetch()` cross-origin by default.  
**Use a local server instead:**

```bash
# Python (built into macOS/Linux)
cd rpl-frontend
python3 -m http.server 3000
# → http://localhost:3000
```

Or with Node.js:

```bash
npx serve .
```

Then open `http://localhost:3000`. The backend must be running on `http://localhost:8080`.

### Option 2 — Let Spring Boot serve the files

Copy the entire `rpl-frontend` folder into `rpl-backend/src/main/resources/static/`.  
Spring Boot will serve `index.html` at `/` and all API calls go to the same origin — no CORS needed.

```bash
cp -r rpl-frontend/* rpl-backend/src/main/resources/static/
```

### Option 3 — Docker

```bash
docker run -p 3000:80 \
  -v $(pwd)/rpl-frontend:/usr/share/nginx/html:ro \
  nginx:alpine
```

---

## Production deployment

Edit **`js/config.js`** — set `API_BASE` to your Render backend URL:

```js
export const API_BASE = 'https://your-app.onrender.com'
```

Then deploy the folder to any static host: **GitHub Pages**, **Netlify**, **Vercel**, **Cloudflare Pages**.

All of them work by just dragging in the folder or pointing at the repo root.

---

## Project structure

```
rpl-frontend/
├── index.html              ← entry point, loads everything
├── css/
│   └── main.css            ← all styles (dark theme, CSS variables)
└── js/
    ├── config.js           ← API_BASE setting (only file to change for prod)
    ├── app.js              ← router + nav wiring
    ├── api/
    │   └── client.js       ← all fetch() calls in one place
    ├── components/
    │   ├── badge.js        ← status/kind badge renderer
    │   ├── modal.js        ← reusable modal builder
    │   ├── tabs.js         ← tab switcher helper
    │   └── tree.js         ← composite plan tree renderer
    └── pages/
        ├── dashboard.js    ← pool balances, alert indicators
        ├── protocols.js    ← protocol CRUD + step management
        ├── resources.js    ← resource type catalogue
        ├── plans.js        ← plan tree, action lifecycle, allocations, diff
        ├── ledger.js       ← account balances + entry detail
        └── audit.js        ← audit log
```

All JS files use **native ES modules** (`type="module"` in `index.html`).  
Works in every modern browser without transpilation.

---

## Backend repo

→ [rpl-backend](https://github.com/YOUR_USERNAME/rpl-backend)
