# API deployment (api.exale.net)

## 404 NOT_FOUND for /admin/check, /profile/me, /profile/sync

If you see **404: NOT_FOUND** (Vercel’s page with `Code: 'NOT_FOUND'`) for `https://api.exale.net/admin/check`, `/profile/me`, etc., the request is **not reaching** the serverless function.

### Current setup: single static handler

All requests are rewritten to **`/api/nest?path=$1`** and handled by **`api/nest.js`** (a single static route), which forwards the path to Nest. This avoids relying on a catch-all route that might not be matched by Vercel.

### 1. Set Root Directory

The API project must use **this folder** as the project root:

1. **Vercel Dashboard** → project that serves **api.exale.net**.
2. **Settings** → **General** → **Root Directory** → **`apps/api`** (or the path that contains this `vercel.json` and the `api/` folder). **Save**.
3. **Redeploy** (Deployments → … → Redeploy, or push a new commit).

### 2. Quick checks after deploy

- **`https://api.exale.net/health`**  
  - If you see **`{"ok":true,"from":"api/health.js"}`** → the `api/` folder is deployed and the rewrite hits a static route; then **`/admin/check`** and **`/profile/me`** should be served by **`api/nest.js`** (Nest).
  - If you still get **404** → the project root is wrong or you’re on the wrong project; fix Root Directory and redeploy.

---

## CORS preflight: "It does not have HTTP ok status"

If the browser shows **"Response to preflight request doesn't pass access control check: It does not have HTTP ok status"**, the **OPTIONS** request was getting a non-2xx (e.g. **403**) before reaching the app.

### Current fix: Edge Middleware

**`middleware.js`** at the project root handles **OPTIONS** at the **edge** (before Deployment Protection). It returns **200** with CORS headers so preflight passes. No dashboard change required.

After deploying, OPTIONS should succeed. If it still fails:

1. Confirm the **API** project (the one for `api.exale.net`) is the one you deploy from this `apps/api` folder.
2. Redeploy so the new `middleware.js` and `@vercel/functions` are included.
3. In the browser **Network** tab, inspect the **OPTIONS** request: **Status** should be **200** and **Response Headers** should include `Access-Control-Allow-Origin: https://exale.net`.

### Fallback: OPTIONS Allowlist (if middleware doesn’t run)

If your deployment doesn’t run Edge Middleware (e.g. project type or region), use the allowlist:

1. **Vercel Dashboard** → project that serves **api.exale.net**.
2. **Settings** → **Deployment Protection** → **OPTIONS Allowlist** → turn **ON** → add path **`/`** → **Save**.
3. Redeploy.
