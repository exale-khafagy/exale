# Mobile Responsiveness Plan — Exale Marketing & Dashboard

This document outlines the plan to add mobile views for both the marketing website and the dashboard.

---

## Current State Summary

### Marketing Website
- **Header**: Fixed, 6 nav links + auth always visible — no mobile menu; will overflow on small screens
- **Landing sections**: Hero, AboutCta, PartnersTeaser, Philosophy, ContactForm — mostly responsive (`md:` breakpoints)
- **Footer**: `grid-cols-1 md:grid-cols-4` — responsive
- **Other pages**: Services, Partners, Media, Blog, About, Apply — use `md:` grids; some may need tweaks
- **ScrollProgress**: `hidden lg:block` — already hidden on mobile

### Dashboard (Hub)
- **Sidebar**: Fixed `w-64` (256px) — always visible; no mobile drawer or collapse
- **Main content**: `p-6` — no responsive padding
- **Hub pages**: Inbox, Apply, Analytics, etc. — use tables, grids; some have `md:` breakpoints
- **CommandPalette**: Cmd+K — works on all screen sizes

---

## Phase 1: Marketing Website — Header Mobile Menu ✅

### 1.1 Header (`apps/web/src/components/Header.tsx`)

**Problem**: 6 nav links + Dashboard + Profile/UserButton always visible; overflows on &lt;768px.

**Solution**: Add a hamburger menu for mobile.

| Task | Details |
|------|---------|
| Add hamburger button | Visible below `lg:` (1024px); hidden above |
| Add mobile nav overlay/drawer | Full-screen or slide-in from right; contains nav links + auth |
| Hide desktop nav on mobile | `hidden lg:flex` for nav; show hamburger `lg:hidden` |
| Close on link click / escape | Close drawer when navigating or pressing Escape |
| Touch-friendly targets | Min 44px tap targets for links and buttons |

**Implementation approach**:
- State: `const [mobileMenuOpen, setMobileMenuOpen] = useState(false)`
- Hamburger icon (3 lines) ↔ X when open
- Overlay: `fixed inset-0 z-[99] bg-black/50 lg:hidden` for backdrop
- Drawer: `fixed top-0 right-0 h-full w-[min(320px,85vw)] bg-exale-dark ... z-[100]`
- Nav links stacked vertically with `py-4`
- Use `useEffect` to lock body scroll when open; cleanup on unmount

---

## Phase 2: Marketing Website — Landing & Content Pages ✅

### 2.1 Landing Components (already mostly responsive)

| Component | File | Action |
|-----------|------|--------|
| Hero | `components/landing/Hero.tsx` | Add `sm:` typography if needed; ensure `pt-20` accounts for header |
| AboutCta | `components/landing/AboutCta.tsx` | Verify padding `p-6 sm:p-8 md:p-12` on small screens |
| PartnersTeaser | `components/landing/PartnersTeaser.tsx` | `grid-cols-2 sm:grid-cols-3` — OK |
| Philosophy | `components/landing/Philosophy.tsx` | Same as AboutCta |
| ContactForm | `components/landing/ContactForm.tsx` | `grid-cols-1 md:grid-cols-2` — OK; ensure `px-4 sm:px-6` |

### 2.2 PublicLayout & Main

| File | Action |
|------|--------|
| `PublicLayout.tsx` | Ensure `pt-20` (header height) is consistent; main `overflow-x-hidden` to prevent horizontal scroll |
| `page.tsx` (landing) | Snap scroll may feel odd on mobile; consider `snap-none sm:snap-y` or keep as-is |

### 2.3 Other Marketing Pages

| Page | File | Action |
|------|------|--------|
| Services | `app/services/page.tsx` | `px-4 sm:px-6`; `py-12 md:py-24` |
| Partners | `app/partners/page.tsx` | Audit grid and padding |
| Media | `app/media/page.tsx` | Audit grid and padding |
| Blog | `app/blog/page.tsx` | Audit list/card layout |
| About | `app/about/page.tsx` | Audit layout |
| Apply | `app/apply/page.tsx` | Form layout; ensure full-width inputs on mobile |

### 2.4 Footer

- Already `grid-cols-1 md:grid-cols-4`
- Ensure `px-4 sm:px-6` and `py-16 md:py-20` for mobile

---

## Phase 3: Dashboard — Mobile Sidebar & Layout ✅

### 3.1 Hub Layout (`apps/web/src/app/hub/layout.tsx`)

**Problem**: Sidebar `w-64` takes ~256px; on 375px viewport, content is squeezed.

**Solution**: Collapsible sidebar + mobile drawer.

| Task | Details |
|------|---------|
| Sidebar visibility | Desktop (`lg:`): always visible. Mobile: hidden by default |
| Mobile menu button | In header; hamburger icon; opens sidebar as overlay |
| Sidebar as overlay on mobile | `fixed inset-y-0 left-0 z-40 w-64 ... lg:relative lg:z-auto` |
| Backdrop when open | `fixed inset-0 bg-black/50 z-30 lg:hidden` |
| Close on nav click | When user clicks a nav link on mobile, close sidebar |
| Header layout | Ensure header has space for: menu button (mobile), theme toggle, View Site, UserButton |

**Layout structure change**:
```
<div className="flex min-h-screen">
  {/* Backdrop - mobile only */}
  <div className={`fixed inset-0 bg-black/50 z-30 lg:hidden ${sidebarOpen ? '' : 'hidden'}`} onClick={() => setSidebarOpen(false)} />
  {/* Sidebar */}
  <aside className={`
    fixed lg:relative inset-y-0 left-0 z-40 w-64 ... 
    transform transition-transform duration-200 ease-out
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `}>
    ...
  </aside>
  <div className="flex-1 flex flex-col min-w-0">
    <header className="... flex items-center justify-between px-4 sm:px-6">
      <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
        {/* Hamburger icon */}
      </button>
      ...
    </header>
    <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
  </div>
</div>
```

### 3.2 Hub Header

- Add hamburger button (left side) on mobile
- Responsive padding: `px-4 sm:px-6`
- Ensure "View Site" and UserButton don’t overflow on small screens (e.g. hide "View Site" text on very small, show icon only)

---

## Phase 4: Dashboard — Page-Level Mobile Layouts ✅

### 4.1 Inbox (`hub/inbox/page.tsx`)

| Element | Current | Mobile change |
|---------|---------|---------------|
| Toolbar | `flex flex-col gap-3 md:flex-row` | OK |
| Search input | `w-64 max-w-xs` | `w-full sm:w-64` on mobile |
| Status filters | Flex wrap | OK |
| Table | Full table | **Replace with card list on mobile** (`hidden md:table` for table, `md:hidden` for cards) |
| Detail modal | Full-screen overlay | Already OK; ensure `p-4` and scrollable content |

**Card layout for mobile** (instead of table):
- Each submission as a card: name, date, concern, status badge
- Tap to open detail modal (existing)
- Checkbox for bulk actions on each card

### 4.2 Applications (`hub/apply/page.tsx`)

- Same pattern as Inbox: table on desktop, card list on mobile
- Search + filters: stack vertically on mobile

### 4.3 Overview (`hub/page.tsx`)

- Stats grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Cards: full width on mobile

### 4.4 Analytics (`hub/analytics/page.tsx`)

- Charts: ensure they resize (e.g. `w-full min-h-[200px]`)
- Grid: `grid-cols-1 lg:grid-cols-2` for chart + stats

### 4.5 Media (`hub/media/page.tsx`)

- Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` for thumbnails
- Upload area: full width

### 4.6 CMS (`hub/cms/page.tsx`)

- Sidebar + editor: stack vertically on mobile
- Section selector: dropdown or horizontal scroll on mobile

### 4.7 SEO, Activity, Admins, Settings

- Audit each for overflow and small-screen layout
- Forms: full-width inputs, stacked buttons

---

## Phase 5: Shared Improvements ✅

### 5.1 Tailwind

- No custom breakpoints needed; default `sm:640`, `md:768`, `lg:1024` are fine
- Optional: add `xs` (480px) if needed for very small phones

### 5.2 Global Styles (`globals.css`)

- Ensure `overflow-x-hidden` on `html` or body to prevent horizontal scroll
- Touch targets: consider `min-h-[44px]` or `min-w-[44px]` for interactive elements

### 5.3 Viewport & Meta

- Verify `viewport` meta in `app/layout.tsx`: `width=device-width, initial-scale=1`

---

## Implementation Order

1. **Phase 1** — Header mobile menu (marketing) — highest impact, blocks small-screen use
2. **Phase 3** — Dashboard sidebar mobile drawer — unblocks dashboard on phones
3. **Phase 2** — Marketing landing/content polish — quick wins
4. **Phase 4** — Dashboard page layouts — Inbox/Apply first (tables → cards), then others
5. **Phase 5** — Shared tweaks — as needed

---

## Files to Create/Modify

### New components (optional)
- `components/MobileNav.tsx` — reusable mobile nav drawer for Header
- `components/hub/SidebarDrawer.tsx` — wrapper for hub sidebar with open/close logic

### Modified files
- `apps/web/src/components/Header.tsx` — hamburger + mobile nav
- `apps/web/src/app/hub/layout.tsx` — sidebar drawer + header menu button
- `apps/web/src/app/hub/inbox/page.tsx` — table + card layout
- `apps/web/src/app/hub/apply/page.tsx` — table + card layout
- `apps/web/src/components/landing/*` — padding/typography tweaks
- `apps/web/src/app/services/page.tsx`, `partners/page.tsx`, etc. — padding audit

---

## Testing Checklist

- [ ] Header: hamburger opens/closes; nav links work; auth visible
- [ ] Marketing: no horizontal scroll; tap targets adequate; forms usable
- [ ] Dashboard: sidebar opens on mobile; closes on nav; no overflow
- [ ] Inbox/Apply: cards on mobile; table on desktop; modals work
- [ ] 320px, 375px, 414px, 768px viewports
- [ ] Touch: no hover-only interactions; swipe doesn’t break layout
