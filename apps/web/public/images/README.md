# Exale — Image Assets Guide

Place your images in the folders below. All paths are relative to `apps/web/public/`, so `/images/hero/bg.jpg` is served as `https://yoursite.com/images/hero/bg.jpg`.

---

## Folder Structure

```
apps/web/public/
└── images/
    ├── hero/          # Landing page hero section
    ├── services/      # Service icons/illustrations
    ├── partners/      # Partner logos
    ├── gallery/       # Media / about visuals
    ├── blog/          # Blog post thumbnails
    └── favicon.ico    # Site favicon (root of public/)
```

---

## Images Needed

### 1. Hero (`/images/hero/`)

| File | Size | Use |
|------|------|-----|
| `hero-bg.jpg` or `hero-bg.webp` | 1920×1080+ | Optional background behind headline (dark overlay recommended) |
| — | — | Or leave empty for text-only hero (current design) |

---

### 2. Services (`/images/services/`)

| File | Size | Use |
|------|------|-----|
| `web-app.svg` | 64×64 or 128×128 | Web & App Development icon |
| `strategic.svg` | 64×64 or 128×128 | Strategic Planning icon |
| `branding.svg` | 64×64 or 128×128 | Branding & Design icon |

Use SVG or PNG. Transparent or dark-mode friendly recommended.

---

### 3. Partners (`/images/partners/`)

| File | Use |
|------|-----|
| `lighthouse-labs.png` | Lighthouse Labs logo |
| `venture-grove.png` | Venture Grove logo |
| `foundry-partners.png` | Foundry Partners logo |
| `nimbus-cloud.png` | Nimbus Cloud logo |
| `arcade-digital.png` | Arcade Digital logo |
| `studio-motion.png` | Studio Motion logo |

Logos should be white or light for dark background. PNG with transparency or SVG preferred.

---

### 4. Gallery / Media (`/images/gallery/`)

| File | Use |
|------|-----|
| `founder.jpg` | Optional: Ahmed Khafagy / founder photo |
| `office-1.jpg`, `office-2.jpg` | Optional: Team or office images |
| `press-*.jpg` | Optional: Press / event images |

---

### 5. Blog (`/images/blog/`)

| File | Use |
|------|-----|
| `placeholder.jpg` | Default thumbnail for Insights & Stories |
| `post-*.jpg` | Thumbnails for blog posts (when blog is live) |

---

### 6. Favicon & Meta

| File | Location | Use |
|------|----------|-----|
| `favicon.ico` | `public/favicon.ico` | Browser tab icon |
| `og-image.jpg` | `public/images/og-image.jpg` | Social share image (1200×630) |

---

## How Images Are Used

- **Static assets** (e.g. `/images/partners/logo.png`): Place in `public/images/` and reference as `/images/partners/logo.png` in code or CMS.
- **CMS-managed images**: Store full URLs in ContentBlock (type `image`). You can use UploadThing URLs or external URLs for maximum flexibility.
- **Next.js Image**: Use `<Image src="/images/..." alt="..." />` for optimized loading.

---

## Quick Reference

| Section | Where to use | Folder |
|---------|--------------|--------|
| Hero background | Hero component | `images/hero/` |
| Service icons | Services section | `images/services/` |
| Partner logos | Network / Partners | `images/partners/` |
| Founder / About | Vision section | `images/gallery/` |
| Blog thumbnails | Blog / Insights | `images/blog/` |
| Favicon | Site-wide | `public/favicon.ico` |
| Social share | Meta tags | `public/images/og-image.jpg` |
