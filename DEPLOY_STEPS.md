# 🚀 Exale Deployment Steps — Complete Guide

Follow these steps **in order** to deploy your marketing website.

---

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created and connection string ready
- [ ] Clerk account created with API keys
- [ ] UploadThing account created with token
- [ ] GoDaddy domain `exale.net` ready
- [ ] GitHub repo connected to Vercel

---

## 1️⃣ MongoDB Atlas Setup

### Step 1.1: Create Database Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new **M0 Free** cluster (or upgrade if needed)
3. Wait for cluster to finish provisioning (~3-5 minutes)

### Step 1.2: Connection String (✅ Already Configured)
Your MongoDB connection string is ready:
```
mongodb+srv://AhmedKhafagy:R08a07N99a@exale-prod.hlqsatd.mongodb.net/exale?retryWrites=true&w=majority
```

**Use this exact string** in the API project's `DATABASE_URL` environment variable in Vercel.

### Step 1.3: Configure Network Access
1. Go to **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** (or add Vercel IPs)
3. Click **"Confirm"**

---

## 2️⃣ Clerk Setup (Authentication)

### Step 2.1: Create Application
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application (or use existing)
3. Choose **"Next.js"** as framework

### Step 2.2: Get API Keys
1. Go to **API Keys** section
2. Copy:
   - **Publishable Key** (starts with `pk_...`)
   - **Secret Key** (starts with `sk_...`)

### Step 2.3: Configure Allowed Origins
1. Go to **Settings** → **Allowed Origins**
2. Add these URLs:
   - `https://exale.net`
   - `https://www.exale.net`
   - `https://api.exale.net`
   - `http://localhost:3000` (for local dev)

---

## 3️⃣ UploadThing Setup (File Uploads)

### Step 3.1: Create Account
1. Go to [UploadThing](https://uploadthing.com)
2. Sign up / Sign in
3. Create a new app

### Step 3.2: Get Token
1. Go to **API Keys**
2. Copy your **Token** (single token for v6)

---

## 4️⃣ Deploy API to Vercel (api.exale.net)

### Step 4.1: Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. **Project Name:** `exale-api` (or your choice)

### Step 4.2: Configure Project Settings
1. Click **"Configure Project"**
2. Set these values:
   - **Root Directory:** `apps/api`
   - **Framework Preset:** `Other`
   - **Build Command:** `npm run db:generate && npm run build`
   - **Output Directory:** Leave empty (not used for serverless)
   - **Install Command:** `npm install` (default)

### Step 4.3: Add Environment Variables
Go to **Settings** → **Environment Variables** and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `mongodb+srv://AhmedKhafagy:R08a07N99a@exale-prod.hlqsatd.mongodb.net/exale?retryWrites=true&w=majority` | Your MongoDB production cluster |
| `CORS_ORIGIN` | `https://exale.net,https://www.exale.net,https://hub.exale.net,https://dashboard.exale.net` | Optional; API always allows these + your list. Include dashboard if you use that subdomain. |
| `CLERK_SECRET_KEY` | `sk_...` | From Clerk (Step 2.2) |
| `NODE_ENV` | `production` | Optional but recommended |

### Step 4.4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. **Copy the deployment URL** (e.g., `exale-api-xyz.vercel.app`)

### Step 4.5: Add Custom Domain
1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `api.exale.net`
4. Follow DNS instructions (we'll configure in GoDaddy next)

---

## 5️⃣ Deploy Web to Vercel (exale.net)

### Step 5.1: Create Vercel Project
1. In Vercel Dashboard, click **"Add New"** → **"Project"**
2. Import the **same GitHub repository**
3. **Project Name:** `exale-web` (or your choice)

### Step 5.2: Configure Project Settings
1. Click **"Configure Project"**
2. Set these values:
   - **Root Directory:** `apps/web`
   - **Framework Preset:** `Next.js` (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (default)

### Step 5.3: Add Environment Variables
Go to **Settings** → **Environment Variables** and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.exale.net` | **Use your API domain** (or Vercel URL temporarily) |
| `UPLOADTHING_TOKEN` | `...` | From UploadThing (Step 3.2) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_...` | From Clerk (Step 2.2) |
| `CLERK_SECRET_KEY` | `sk_...` | From Clerk (Step 2.2) |
| `NEXT_PUBLIC_SITE_URL` | `https://exale.net` | For Schema.org, sitemap |
| `NEXT_PUBLIC_DASHBOARD_HOST` | `hub.exale.net` | Optional: if using subdomain for dashboard |

**Important:** Set all variables for **Production**, **Preview**, and **Development** environments.

### Step 5.4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~3-5 minutes)
3. **Copy the deployment URL** (e.g., `exale-web-xyz.vercel.app`)

### Step 5.5: Add Custom Domains
1. Go to **Settings** → **Domains**
2. Click **"Add Domain"** and add:
   - `exale.net`
   - `www.exale.net`
   - `dashboard.exale.net` (optional — same app, rewrites to `/hub`; add CNAME in GoDaddy)
   - `hub.exale.net` (optional, alternative dashboard subdomain)
3. **Don't configure DNS yet** — we'll do that in GoDaddy next

---

## 6️⃣ Configure DNS in GoDaddy

### Step 6.1: Get Vercel DNS Values
1. In Vercel → **Web Project** → **Settings** → **Domains**
2. For each domain (`exale.net`, `www.exale.net`), Vercel will show DNS records
3. **Copy the values** shown (they'll look like CNAME records)

### Step 6.2: Configure in GoDaddy
1. Go to [GoDaddy Domain Manager](https://dcc.godaddy.com)
2. Find `exale.net` → Click **"DNS"** or **"Manage DNS"**

#### For Root Domain (exale.net):
- **Type:** `A` or `CNAME`
- **Name:** `@` (or leave blank)
- **Value:** Use what Vercel shows (usually a CNAME like `cname.vercel-dns.com` or an A record IP)

#### For www Subdomain:
- **Type:** `CNAME`
- **Name:** `www`
- **Value:** `cname.vercel-dns.com` (or what Vercel shows)

#### For API Subdomain:
- **Type:** `CNAME`
- **Name:** `api`
- **Value:** Use the **API project's** CNAME from Vercel (different from web project)

#### For Hub Subdomain (optional):
- **Type:** `CNAME`
- **Name:** `hub`
- **Value:** Use the **Web project's** CNAME (same as `exale.net`)

### Step 6.3: Save and Wait
1. Click **"Save"** on all DNS records
2. **Wait 5-60 minutes** for DNS propagation
3. Check status in Vercel → Domains (should show "Valid Configuration" when ready)

---

## 7️⃣ Post-Deployment Setup

### Step 7.1: Update API URL in Web Project
1. Once `api.exale.net` is live, go to **Web Project** → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_API_URL` to: `https://api.exale.net`
3. **Redeploy** the web project (or wait for next commit)

### Step 7.2: Update CORS in API Project
1. Go to **API Project** → **Settings** → **Environment Variables**
2. Update `CORS_ORIGIN` to include all production domains:
   ```
   https://exale.net,https://www.exale.net,https://api.exale.net,https://hub.exale.net
   ```
3. **Redeploy** the API project

### Step 7.3: Add First Admin User
Run this locally (or connect to MongoDB directly):

```bash
cd apps/api
npm install
# Set DATABASE_URL in .env.local or export it
npm run db:add-admin <your-clerk-user-id> khafagy.ahmedibrahim@gmail.com
```

**To get your Clerk User ID:**
1. Go to Clerk Dashboard → **Users**
2. Find your user → Copy the **User ID** (starts with `user_...`)

### Step 7.4: Seed CMS Content (Optional)
To populate editable content blocks:

```bash
cd apps/api
npm install
# Set DATABASE_URL in .env.local
npx prisma db seed
```

---

## 8️⃣ Verify Everything Works

### Checklist:
- [ ] `https://exale.net` loads the marketing site
- [ ] `https://www.exale.net` redirects or loads correctly
- [ ] `https://api.exale.net` returns API responses
- [ ] Sign in works on `https://exale.net`
- [ ] Dashboard accessible at `https://exale.net/hub` (when signed in as admin)
- [ ] CMS page loads at `https://exale.net/hub/cms`
- [ ] Contact form submits successfully
- [ ] Apply form works with file uploads

---

## 🆘 Troubleshooting

### DNS Not Working?
- Wait up to 24 hours for full propagation
- Check DNS propagation: [whatsmydns.net](https://www.whatsmydns.net)
- Verify records match exactly what Vercel shows

### API Returns 404 at api.exale.net? — Do this first
- **Domain must point to the API project:** In Vercel, `api.exale.net` must be added under the **API** project (Root Directory: `apps/api`), not the Web project. If it’s on the Web project, you’ll get a 404.
- After a successful deploy, opening `https://api.exale.net` should return JSON (e.g. `{"api":"exale","status":"ok",...}`). `https://api.exale.net/health` should return `{"status":"ok","timestamp":"..."}`.
- Set `CORS_ORIGIN` in the API project to include `https://exale.net`, `https://www.exale.net`, and `https://hub.exale.net` (comma-separated) so the dashboard can call the API.
- Check API build logs in Vercel → API project → Deployments.

**Quick checklist:** (1) **Web** project → Domains: remove `api.exale.net` if present. (2) **API** project → Domains: add `api.exale.net`. (3) API project → Deployments: confirm latest build succeeded. (4) GoDaddy: CNAME for `api` must point to the **API** project target, not the Web project.

**Domain is on API project but still 404?** (1) **API** project → **Deployments** → open the latest deployment → open the **Building** log. Confirm the build finished successfully (no red errors). If `npm run db:generate` or `npm run build` failed, fix the cause (e.g. add `DATABASE_URL` in Vercel env, fix Prisma). (2) **Settings** → **General** → confirm **Root Directory** is `apps/api`. (3) **Redeploy**: Deployments → ⋮ on latest → **Redeploy** and check **Clear build cache**, then redeploy. After a successful build, `https://api.exale.net` and `https://api.exale.net/health` should return JSON.

### 404 at dashboard.exale.net?
- **Add the domain to the Web project:** In Vercel → **Web** project → Settings → Domains, add `dashboard.exale.net`. The 404 usually means this host isn’t assigned to any project (or is on the wrong one).
- **DNS:** In GoDaddy, add a **CNAME** for `dashboard` pointing to the same value as `exale.net` (e.g. `cname.vercel-dns.com`). Wait a few minutes for DNS to update.
- **Alternative:** Use **https://exale.net/hub** for the dashboard; it’s the same app and doesn’t require the subdomain.

### Dashboard shows "Failed to load applications" or "API error"?
- **Web project:** Set `NEXT_PUBLIC_API_URL` to `https://api.exale.net` (and redeploy so the new value is baked in).
- **API project:** CORS now always allows `https://dashboard.exale.net` and `https://hub.exale.net`; ensure the API deployment succeeded and `CLERK_SECRET_KEY` is set so the API can verify dashboard tokens.
- **Admin access:** Your Clerk user must be added as an admin (run `npm run db:add-admin <clerk-user-id> <email>` in `apps/api` with `DATABASE_URL` set). Otherwise the API returns 401 and the dashboard shows "You don't have access."
- If the UI shows e.g. "API error: Failed to fetch (404)", the API route or deployment is wrong; if "(500)", check API logs and env (e.g. `DATABASE_URL`, Prisma).

### Authentication Not Working?
- Verify Clerk keys are correct
- Check Clerk → Allowed Origins includes production domains
- Check browser console for errors

### CSS/Styling Broken?
- Hard refresh browser (Ctrl+Shift+R)
- Check Vercel build logs for CSS compilation errors
- Verify `globals.css` is imported in `app/layout.tsx`

---

## 📝 Quick Reference

### Vercel Projects:
- **Web:** `exale-web` → `apps/web` → `exale.net`
- **API:** `exale-api` → `apps/api` → `api.exale.net`

### Environment Variables Summary:
**Web Project:**
- `NEXT_PUBLIC_API_URL`
- `UPLOADTHING_TOKEN`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL`

**API Project:**
- `DATABASE_URL`
- `CORS_ORIGIN`
- `CLERK_SECRET_KEY`

---

**Ready? Start with Step 1 (MongoDB) and work through each step!** 🚀
