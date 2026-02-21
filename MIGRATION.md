# Exale — Database Migration

## When to Migrate

Run migrations when:

- You add or change models in `apps/api/prisma/schema.prisma` (e.g. `Profile`, `MediaFile`, `Settings`, `ContentBlock`, `ContentBlockVersion`, `Admin.role`)
- You see "Failed to load" in Media Library or Settings
- Prisma errors mention missing tables/collections

## Prerequisites

**Stop the API before migrating.** The API locks the Prisma client DLL. If it’s running, `prisma generate` can fail with `EPERM`.

1. Stop the API (`Ctrl+C` in its terminal, or stop any `nest start` process)
2. Stop any `turbo run dev` if it’s running the API
3. Then run the migration

## Option A: PowerShell Script (Windows)

From the project root:

```powershell
.\scripts\migrate-db.ps1
```

The script will:

1. Ask you to confirm the API is stopped
2. Run `prisma generate` in `apps/api`
3. Run `prisma db push` in `apps/api`

## Option B: Manual Commands

From the project root:

```bash
cd apps/api
npm run db:generate
npm run db:push
```

Or from the root using turbo:

```bash
npm run db:generate
npm run db:push
```

## After Migration

1. Restart the API: `cd apps/api && npm run dev` (or `turbo run dev` from root)
2. Confirm Media Library (`/hub/media`), Settings (`/hub/settings`), and Activity Log (`/hub/activity`) load correctly

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `EPERM` on `prisma generate` | API (or another process) is using Prisma | Stop the API, then run migration again |
| `apps/api doesn't exist` | Wrong directory | Run from project root: `d:\Exale 2026\Marketing Websites\Websites\exale-marketing` |
| `DATABASE_URL` missing | `.env` not set | Add `DATABASE_URL` to `apps/api/.env` |
| "Failed to load" in Media Library | Migration not run or API needs restart | Run migration, restart API |
