# API deployment (api.exale.net)

## CORS preflight: "It does not have HTTP ok status"

If the browser shows **"Response to preflight request doesn't pass access control check: It does not have HTTP ok status"**, the **OPTIONS** request is getting a non-2xx (usually **403**) before it reaches this app.

### Fix (Vercel)

1. Open **Vercel Dashboard** and select **the project that serves `api.exale.net`** (not the main marketing site).
2. **Settings** → **Deployment Protection**.
3. Under **OPTIONS Allowlist**:
   - Turn the toggle **ON** (enable the allowlist).
   - Click **Add path** and enter **`/`**.
   - **Save**.
4. Redeploy the API so the latest handler is live (or wait for the next deploy).

After this, OPTIONS requests will bypass protection and hit the serverless handler, which returns **200** with CORS headers so the real GET/POST can run.

### If it still fails

- Confirm you changed settings on the **API** project (the one whose production URL is `api.exale.net`), not the web project.
- Trigger a new deployment after changing settings.
- In the browser Network tab, check the **OPTIONS** request to `api.exale.net/...`: look at **Status** (e.g. 403 vs 200) and **Response Headers** (e.g. `Access-Control-Allow-Origin`).
