# Exale CMS & Masterpiece Marketing Site
## Finalized Project Plan

---

## 1. Project Overview

**Goal:** High-performance marketing platform for **Exale** (business development holding company) with a comprehensive Admin Dashboard. A "Masterpiece" UI that feels high-tech, professional, and fluid.

**Reference:** [exale.net](https://exale.net) — content and structure source.

---

## 2. Tech Stack (FINALIZED)

| Layer | Technology | Notes |
|-------|------------|-------|
| **Monorepo** | Turborepo | Manager |
| **Backend** | NestJS | Serverless/Vercel compatible |
| **Frontend** | Next.js 15 (App Router) | exale.net |
| **Database** | MongoDB Atlas (M0 Free) | Via Prisma |
| **Auth** | Clerk | Admin dashboard only |
| **Styling** | Tailwind CSS + Shadcn/UI + Framer Motion | Masterpiece animations |
| **File Storage** | UploadThing | Apply form attachments |

---

## 3. URLs & Domains

| Environment | Public Site | Admin Dashboard |
|-------------|-------------|-----------------|
| **Local** | http://localhost:3000 | http://localhost:3000/hub |
| **Production** | https://exale.net | https://hub.exale.net |

---

## 4. Public Website (exale.net) — FULL SPEC

### 4.1 Navigation
```
[Services] [Projects] [Partners] [Media] [Blog] [Apply]
```

### 4.2 Design Vibe
- **Dark mode** default
- **Background:** `#0E0E12` (near-black)
- **Accent:** `#6A4DFF` (Royal Violet)
- **Typography:** Large, bold
- **Layout:** Bento-grid layouts, smooth scroll animations (Framer Motion)

---

### 4.3 Page Breakdown

#### **Landing Page (`/`)**

| Section | Content Source | Fields / Notes |
|---------|----------------|----------------|
| **Hero** | ContentBlock | `hero_headline`, `hero_subheadline` |
| **About (CTA)** | ContentBlock | `about_ready_headline`, `about_ready_text`, `cta_button_text` |
| **Partners Preview** | ContentBlock | `partners_headline`, `partners_text`, `partners_cta` |
| **Philosophy** | ContentBlock | `philosophy_headline`, `philosophy_text` |
| **Contact Us** | Form → API | Fields: `name`, `email`, `phone`, `concern` (dropdown), `message` (textarea) |
| **Services** | ContentBlock | `services_headline`, service cards (3): title + description |
| **Network** | ContentBlock | `network_headline`, `network_text`, partner logos |
| **Media** | ContentBlock | `media_headline`, media items |
| **Blog/Insights** | ContentBlock | `blog_headline`, `blog_subheadline`, placeholder |
| **Vision** | ContentBlock | `vision_headline`, `vision_text`, founder story, philosophy |
| **Footer CTA** | ContentBlock | `footer_cta_headline`, `footer_cta_text`, "Submit Application" link |

**Contact Us Form — Concern Dropdown Options:**
- Inquiry
- Partner
- Collaborations
- Offering Services
- Invitation
- Other

---

#### **Apply Page (`/apply`)**

| Field | Type | Required |
|-------|------|----------|
| Name | text | ✓ |
| Email | email | ✓ |
| Phone | tel | ✓ |
| Industry | text | ✓ |
| Tell us more | textarea | ✓ |
| Pitch Deck / CV | file (PDF/Doc) | via UploadThing |

**Action:** POST to Apply API → ApplicationSubmission

---

#### **Other Pages (Placeholder → Editable via CMS)**
- `/services` — Services content
- `/projects` — Projects content
- `/partners` — Partners / Network
- `/media` — Media Center
- `/blog` — Blog / Insights

All content editable from Dashboard CMS.

---

## 5. Admin Dashboard (`/hub`) — FULL SPEC

**Access:** Protected by Clerk. Only users in `Admin` collection (by clerkId) can access.

### 5.1 Layout
- Sidebar: Inbox, Apply, CMS
- Header: UserButton (Clerk)
- Main: Content area

### 5.2 Modules

#### **Inbox — Contact Us**
- **View:** Table
- **Columns:** Date, Name, Concern, Status (New/Read)
- **Action:** Click row → modal/sheet with full details (name, email, phone, concern, message)
- **Status:** Toggle New ↔ Read

#### **Inbox — Apply**
- **View:** Table
- **Columns:** Date, Name, Industry, Attachment (link to download)
- **Action:** Click row → full details + file download link

#### **CMS — Content Manager**
- **Tabs:** Home | Services | Projects | Partners | Media | Blog
- **Per Section:** Form fields for each ContentBlock (key → input)
- **Types:** text, rich_text, image (URL or UploadThing)
- **Action:** Save → PUT to Content API

---

## 6. Backend API — ENDPOINTS

### 6.1 Content Module
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/content` | All ContentBlocks (optional: `?section=home`) |
| GET | `/content/:key` | Single block by key |
| PUT | `/content/:key` | Update block (protected) |
| PUT | `/content/bulk` | Bulk update (protected) |

### 6.2 Contact Module
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/contact` | Submit Contact Us form |
| GET | `/contact` | List ContactSubmissions (protected) |
| GET | `/contact/:id` | Single submission (protected) |
| PATCH | `/contact/:id` | Update status (protected) |

### 6.3 Apply Module
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/apply` | Submit Apply form (with fileUrl) |
| GET | `/apply` | List ApplicationSubmissions (protected) |
| GET | `/apply/:id` | Single application (protected) |

### 6.4 Auth
- Clerk JWT verification on protected routes
- Admin check: clerkId must exist in `Admin` collection

---

## 7. Database — ContentBlock Keys (Initial Seed)

### Section: `home`
| Key | Type | Default Value |
|-----|------|---------------|
| hero_headline | text | Not Every Beginning Has An Ending |
| hero_subheadline | text | Ready to take your first step? |
| about_ready_text | rich_text | Do you have a groundbreaking idea... |
| about_cta_text | text | Start Your Journey |
| partners_headline | text | Those we rely on. |
| partners_text | rich_text | Our success is intertwined with yours... |
| partners_cta | text | View All Partners |
| philosophy_headline | text | You take a step; We take you a mile. |
| philosophy_text | rich_text | Your ambition drives us... |
| contact_headline | text | Got Any Questions? |
| contact_cta | text | Send Message |
| services_headline | text | Our Services |
| services_intro | text | We provide tailored solutions... |
| service_1_title | text | Web & App Development |
| service_1_desc | text | Full stack development built for scale... |
| service_2_title | text | Strategic Planning |
| service_2_desc | text | Business planning and market fit analysis... |
| service_3_title | text | Branding & Design |
| service_3_desc | text | Identity, Design & Storytelling... |
| network_headline | text | Our Network |
| network_text | rich_text | Our success is intertwined with yours... |
| media_headline | text | Media Center |
| media_intro | text | Press releases, brand assets, and coverage. |
| blog_headline | text | Insights & Stories |
| blog_subheadline | text | How to Unleash Your Potential |
| blog_teaser | text | The journey of a thousand miles... |
| vision_headline | text | Our Vision: Your Business, Independent and Thriving |
| vision_text | rich_text | At Exale, we are dedicated to guiding you... |
| founder_story | rich_text | Exale was founded in Cairo, Egypt, in 2025... |
| philosophy_full | rich_text | Ahmed Khafagy firmly believes that everyone... |
| footer_cta_headline | text | Let's build something great. |
| footer_cta_text | rich_text | Curious to learn more... |
| footer_cta_button | text | Submit Application |

### Section: `services`, `projects`, `partners`, `media`, `blog`
- Editable via CMS; initial placeholders.

---

## 8. Implementation Phases — ORDER OF EXECUTION

### Phase 1: Backend (NestJS) ✓ DONE
- [x] Prisma schema
- [x] PrismaService
- [x] ContentModule (GET/PUT/PUT bulk)
- [x] ContactModule (POST/GET/PATCH)
- [x] ApplyModule (POST/GET)
- [x] Auth guard (Clerk JWT + Admin check)
- [x] Seed script for ContentBlocks

### Phase 2: Public Website (Next.js) ✓ DONE
- [x] Masterpiece layout (header, nav, footer)
- [x] Landing page sections (Hero, About, Services, etc.) — fetch from API
- [x] Contact Us form + API integration
- [x] Apply page + form + UploadThing integration
- [x] Placeholder pages (Services, Projects, Partners, Media, Blog)
- [x] Framer Motion animations

### Phase 3: Admin Dashboard ✓ DONE
- [x] `/hub` route (protected by Clerk + Admin check)
- [x] Dashboard layout (sidebar, header)
- [x] Inbox — Contact Us table + detail view
- [x] Inbox — Apply table + detail view
- [x] CMS — Content Manager with section tabs
- [x] Admin sync (db:add-admin script)

### Phase 4: Polish & Deploy ✓ DONE
- [x] Vercel config (API + Web)
- [x] Environment variables for production (see DEPLOY.md)
- [x] Domain setup instructions (see DEPLOY.md)

---

## 9. Current Status

| Component | Status |
|-----------|--------|
| Monorepo scaffold | ✅ Done |
| Prisma schema | ✅ Done |
| NestJS base + Prisma | ✅ Done |
| Next.js base + Tailwind | ✅ Done |
| Clerk auth (layout, middleware) | ✅ Done |
| UploadThing token | ✅ Configured |
| ContentModule | ✅ Done |
| ContactModule | ✅ Done |
| ApplyModule | ✅ Done |
| Public landing page | ✅ Done |
| Apply page | ✅ Done |
| Contact form | ✅ Done |
| Dashboard (/hub) | ✅ Done |

---

## 10. Environment Variables Summary

See [DEPLOY.md](./DEPLOY.md) for production deployment and env vars.

### `apps/api/.env` (local)
```
DATABASE_URL=mongodb+srv://USER:PASSWORD@exaleholdings.pxjlw6s.mongodb.net/exale?retryWrites=true&w=majority&appName=ExaleHoldings
CORS_ORIGIN=http://localhost:3000,https://exale.net
PORT=3002
CLERK_SECRET_KEY=sk_test_...  # Same Clerk app as web — for profile + hub auth
```

### `apps/web/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:3002
UPLOADTHING_TOKEN=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

---

**This document is the single source of truth for the Exale CMS & Marketing project.**
