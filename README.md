# Exale CMS & Masterpiece Marketing Site

High-performance marketing platform for **Exale** (business development holding company) with an Admin Dashboard.

> **Full project plan:** See [PLAN.md](./PLAN.md) for the complete spec, phases, and status.  
> **Deploy to production:** See [DEPLOY.md](./DEPLOY.md) for Vercel setup and domain config.

## Tech Stack

- **Manager:** Turborepo
- **Backend:** NestJS (Vercel/Serverless compatible)
- **Frontend:** Next.js 15 (App Router)
- **Database:** MongoDB Atlas (M0 Free Tier) via Prisma
- **Auth:** Clerk (Admin access only)
- **Styling:** Tailwind CSS + Shadcn/UI + Framer Motion
- **File Storage:** UploadThing (Apply form attachments)

## Project Structure

```
exale-marketing/
├── apps/
│   ├── api/          # NestJS backend
│   │   └── prisma/
│   │       └── schema.prisma
│   └── web/          # Next.js 15 frontend (exale.net)
├── packages/         # Shared packages (future)
├── turbo.json
└── package.json
```

## Getting Started

### 1. Environment Variables

**Backend (`apps/api/`):**
```bash
cp apps/api/.env.example apps/api/.env
# Set DATABASE_URL (MongoDB Atlas connection string)
```

**Frontend (`apps/web/`):**
```bash
cp apps/web/.env.example apps/web/.env.local
# Set NEXT_PUBLIC_API_URL, UploadThing, and Clerk keys
```

### 2. Database Setup

**Stop any running dev servers first** (Ctrl+C in the terminal where `npm run dev` is running). On Windows, `db:generate` can fail with `EPERM` if the API or another process is using the Prisma client.

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to MongoDB Atlas
npm run db:push

# Seed content blocks (organizes content into proper sections: home, services, partners, media, blog, projects)
npm run db:seed
```

**Note:** Run `npm run db:seed` to populate/update content blocks. This organizes content into the correct sections (Home, Services, Partners, Media, Blog, Projects) so each CMS tab has its own content.

### 3. Development

**You must run both the web app and the API.** From the repo root:

```bash
npm run dev
```

This starts both apps (Turborepo). If you only run the web app (e.g. from `apps/web`), the dashboard will show "Failed to load" for Inbox, Applications, Media, Content, and Settings.

- **Web:** http://localhost:3000 (marketing site); **Dashboard:** http://dashboard.localhost:3000
- **API:** http://localhost:3002

**Check the API is up:** open http://localhost:3002/health — you should see `{"status":"ok"}`. If that fails, the API did not start (check the terminal where `npm run dev` is running for errors; ensure `npm run db:generate` and `npm run db:push` have been run and `apps/api/.env` has a valid `DATABASE_URL`).

### 4. Add First Admin

Sign up on the site, then add yourself to the Admin collection:

```bash
cd apps/api
npm run db:add-admin <your_clerk_user_id> <your_email>
# Or add as editor (limited access): npm run db:add-admin <clerkId> <email> EDITOR
```

Get your Clerk User ID from [dashboard.clerk.com](https://dashboard.clerk.com) → Users → click your user → User ID.

### 5. Build

```bash
npm run build
```

### 6. Run Tests

```bash
npm run test
```

Runs tests in both API and Web apps.

## Database Schema

- **Profile** — User profiles synced from Clerk (name, email, avatar, phone, company, social links). Powers `/profile` page.
- **Admin** — Clerk-synced admin users (role: EDITOR | ADMIN)
- **ContentBlock** — CMS content (key, value, type, section)
- **ContentBlockVersion** — Version history for content rollback
- **ContactSubmission** — Contact Us form entries
- **ApplicationSubmission** — Apply form entries (with file URLs)
- **Settings** — Site-wide settings (singleton)
- **MediaFile** — Media library files

## Design System

- **Background:** `#0E0E12` (near-black)
- **Accent:** `#6A4DFF` (Royal Violet)
- **Mode:** Dark mode default
