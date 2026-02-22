# API deployment (api.exale.net)

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
