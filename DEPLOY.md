# Exale — Deployment Guide

## Overview

Deploy the **Web** (Next.js) and **API** (NestJS) as two separate Vercel projects from this monorepo.

---

## 1. Deploy Web (exale.net)

### Vercel Project Settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/web` |
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `.next` (auto-detected) |

### Environment Variables

Add these in Vercel → Project → Settings → Environment Variables:

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | ✓ | `https://api.exale.net` (your API URL) |
| `UPLOADTHING_TOKEN` | ✓ | From [uploadthing.com](https://uploadthing.com) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✓ | From Clerk Dashboard |
| `CLERK_SECRET_KEY` | ✓ | From Clerk Dashboard |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | From [sentry.io](https://sentry.io) – error tracking |
| `SENTRY_ORG` | Optional | Sentry org slug (for source maps) |
| `SENTRY_PROJECT` | Optional | Sentry project slug |
| `SENTRY_AUTH_TOKEN` | Optional | Sentry auth token (CI only) |

### Domains

- Production: `exale.net`, `www.exale.net`
- Configure in Vercel → Domains

---

## 2. Deploy API (api.exale.net)

### Vercel Project Settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/api` (required) |
| **Framework Preset** | Other |
| **Build Command** | Ignored when `vercel.json` has `builds`; the build runs from `vercel.json` |
| **Include files outside the root directory** | **OFF** (must be disabled or API returns 404) |

The API uses **Vercel serverless functions** (no legacy `builds`): `api/[[...path]].js` loads the built Nest app; `vercel.json` rewrites `/*` → `/api/*` so `/health` etc. work at the root. The build command runs normally and produces `dist/`.

### Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | ✓ | MongoDB Atlas connection string (e.g. ExaleHoldings cluster). Run `npx prisma db push` in `apps/api` once so Profile and other collections exist. |
| `CORS_ORIGIN` | ✓ | `https://exale.net,https://www.exale.net,https://dashboard.exale.net` |
| `CLERK_SECRET_KEY` | ✓ | From Clerk Dashboard (same app as the web frontend — required for profile page and hub auth) |
| `SENTRY_DSN` | Optional | From [sentry.io](https://sentry.io) – API error tracking |

### Domains

- Production: `api.exale.net`
- Configure in Vercel → Domains

---

## 3. Domain Setup

### Option A: Single Domain (exale.net)

- **Web:** `exale.net`, `www.exale.net` → Vercel Web project
- **API:** `api.exale.net` → Vercel API project
- **Hub:** `hub.exale.net` → Same Vercel Web project (Next.js handles `/hub`)

### Option B: Subdomain for Hub

`dashboard.exale.net` (or `hub.exale.net` if you set `NEXT_PUBLIC_DASHBOARD_HOST=hub.exale.net`) serves the same Next.js app as `exale.net` — add the dashboard domain to the Web project in Vercel.

### DNS Records (Example)

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |
| CNAME | api | cname.vercel-dns.com |
| CNAME | dashboard | cname.vercel-dns.com |

Use the exact values Vercel shows in the Domains tab.

---

## 4. Post-Deploy Checklist

1. **Update `NEXT_PUBLIC_API_URL`** in Web project to the deployed API URL (e.g. `https://api.exale.net`)
2. **Update `CORS_ORIGIN`** in API project to include production domains
3. **Database:** Run `npx prisma db push` from `apps/api` (with production `DATABASE_URL` in `.env`) once per cluster so Profile and other collections exist. Then optionally seed: `cd apps/api && npx prisma db seed`
4. **Add first Admin:** Founder email gets Admin on first profile sync. For other admins: `cd apps/api && npm run db:add-admin <clerkId> <email>`
5. **Clerk** — Add production domains to allowed origins in [dashboard.clerk.com](https://dashboard.clerk.com). Use the **same** Clerk app for web and API so profile page and hub auth work.
6. **UploadThing** — Verify production domain in [uploadthing.com](https://uploadthing.com) if needed

---

## 5. Alternative: Deploy API to Railway / Render

If you prefer not to use Vercel for the NestJS API:

### Railway

1. Create project, connect repo
2. Root Directory: `apps/api`
3. Build: `npm run db:generate && npm run build`
4. Start: `npm run start`
5. Add env vars: `DATABASE_URL`, `CORS_ORIGIN`, `CLERK_SECRET_KEY`

### Render

1. New Web Service, connect repo
2. Root Directory: `apps/api`
3. Build: `npm run db:generate && npm run build`
4. Start: `npm run start`
5. Add environment variables

Then set `NEXT_PUBLIC_API_URL` in the Web project to the Railway/Render API URL.
