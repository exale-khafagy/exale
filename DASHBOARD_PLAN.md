# Exale Marketing Website Dashboard - Feature Plan

## Overview
This document outlines the features and improvements needed for the Exale marketing website admin dashboard, based on industry best practices for marketing CMS platforms.

---

## Current Status ✅

### Already Implemented:
- ✅ **Contact Form Submissions** (`/hub/inbox`) - View and manage contact form submissions
- ✅ **Application Submissions** (`/hub/apply`) - View and manage job/partnership applications
- ✅ **Content Management System** (`/hub/cms`) - Edit website content by section
- ✅ **Admin Management** (`/hub/admins`) - Add/remove admin users
- ✅ **Authentication** - Clerk-based auth with admin-only access
- ✅ **Profile Sync** - Automatic admin creation for founder email

---

## Recommended Features to Add 🚀

### 1. Dashboard Overview (`/hub` or `/hub/overview`)
**Purpose:** Provide a high-level overview of website activity and key metrics

**Features:**
- **Statistics Cards:**
  - Total contact submissions (with NEW count badge)
  - Total applications received
  - Website visitors (if analytics integrated)
  - Content blocks edited this month
- **Recent Activity Feed:**
  - Latest contact submissions (last 5)
  - Latest applications (last 5)
  - Recent content edits
- **Quick Actions:**
  - "View New Submissions" button
  - "Edit Homepage" button
  - "Add New Admin" button
- **Charts/Graphs:**
  - Submissions over time (line chart)
  - Submissions by concern type (pie chart)
  - Applications by industry (bar chart)

**Implementation Priority:** HIGH

---

### 2. Enhanced Inbox Features

#### 2.1 Contact Inbox Improvements
- **Search & Filter:**
  - Search by name, email, or message content
  - Filter by status (NEW/READ)
  - Filter by concern type
  - Filter by date range
- **Bulk Actions:**
  - Mark multiple as read
  - Export to CSV
  - Delete submissions
- **Email Integration:**
  - Reply directly from dashboard (if email service configured)
  - Mark as "Replied" status
- **Tags/Labels:**
  - Add custom tags (e.g., "Follow-up needed", "Partner inquiry", "Spam")
- **Notes:**
  - Add internal notes to submissions

#### 2.2 Application Inbox Improvements
- **Search & Filter:**
  - Search by name, email, industry
  - Filter by status
  - Filter by date range
- **Bulk Actions:**
  - Mark multiple as read
  - Export to CSV
  - Delete applications
- **Status Management:**
  - Add more statuses: NEW, REVIEWING, CONTACTED, ACCEPTED, REJECTED
- **Rating/Scoring:**
  - Add internal rating system (1-5 stars) for applications
- **Comments:**
  - Add internal comments/notes

**Implementation Priority:** HIGH

---

### 3. Media Library (`/hub/media`)
**Purpose:** Centralized management of images, videos, and files used across the website

**Features:**
- **File Upload:**
  - Drag & drop upload
  - Multiple file selection
  - Image optimization/compression
  - Support for: Images (JPG, PNG, WebP, SVG), PDFs, Documents
- **File Management:**
  - Grid/list view toggle
  - Search by filename
  - Filter by file type
  - Filter by upload date
  - Delete files
- **Image Editor:**
  - Basic cropping/resizing
  - Alt text editing
- **Usage Tracking:**
  - Show where each file is used (which content blocks)
- **Organization:**
  - Folders/categories
  - Tags

**Implementation Priority:** MEDIUM

---

### 4. Analytics & Reporting (`/hub/analytics`)
**Purpose:** Track website performance and user engagement

**Features:**
- **Page Views:**
  - Total page views
  - Views by page
  - Views over time
- **Form Analytics:**
  - Form submission rates
  - Conversion rates
  - Form abandonment points
- **Traffic Sources:**
  - Referrers
  - Search terms (if SEO integrated)
- **User Behavior:**
  - Most visited pages
  - Average session duration
  - Bounce rate
- **Export Reports:**
  - PDF/CSV export
  - Scheduled email reports

**Note:** Requires integration with analytics service (Google Analytics, Plausible, etc.)

**Implementation Priority:** MEDIUM

---

### 5. SEO Management (`/hub/seo`)
**Purpose:** Manage SEO metadata and improve search engine visibility

**Features:**
- **Page SEO Settings:**
  - Meta titles
  - Meta descriptions
  - Open Graph images
  - Canonical URLs
- **Sitemap Management:**
  - Generate/regenerate sitemap
  - Submit to search engines
- **SEO Analysis:**
  - Check for missing meta tags
  - Content length recommendations
  - Keyword suggestions
- **Schema Markup:**
  - Add structured data (JSON-LD)

**Implementation Priority:** LOW (can use existing CMS for basic meta tags)

---

### 6. Settings & Configuration (`/hub/settings`)
**Purpose:** Manage website-wide settings and configurations

**Features:**
- **General Settings:**
  - Site name
  - Site description
  - Contact email
  - Default timezone
- **Email Settings:**
  - SMTP configuration
  - Email templates
  - Notification preferences
- **Form Settings:**
  - Default form fields
  - Auto-responder messages
  - Spam protection settings
- **Integration Settings:**
  - Google Analytics ID
  - Social media links
  - Third-party API keys
- **Backup & Restore:**
  - Export all data
  - Import data
  - Database backup schedule

**Implementation Priority:** MEDIUM

---

### 7. Activity Log (`/hub/activity`)
**Purpose:** Track all changes and actions in the dashboard

**Features:**
- **Activity Feed:**
  - Who did what and when
  - Content edits
  - Admin additions/removals
  - Form submissions
- **Filtering:**
  - Filter by user
  - Filter by action type
  - Filter by date range
- **Export:**
  - Export activity log to CSV

**Implementation Priority:** LOW

---

### 8. User Management Enhancements (`/hub/admins` - Already exists, enhance)

**Additional Features:**
- **Roles & Permissions:**
  - Different permission levels (Super Admin, Editor, Viewer)
  - Granular permissions (can edit content but not delete, etc.)
- **User Activity:**
  - Last login time
  - Activity summary
- **Invitations:**
  - Send email invitations to new admins
  - Invitation expiry

**Implementation Priority:** LOW (current simple admin system works)

---

### 9. Content Management Enhancements (`/hub/cms` - Already exists, enhance)

**Additional Features:**
- **Rich Text Editor Improvements:**
  - Better formatting options
  - Image insertion from media library
  - Link management
  - Code blocks
- **Content Preview:**
  - Preview changes before publishing
  - Side-by-side comparison
- **Content History:**
  - Version history
  - Rollback to previous versions
- **Bulk Editing:**
  - Edit multiple blocks at once
- **Content Templates:**
  - Save common content patterns
  - Quick insert templates

**Implementation Priority:** MEDIUM

---

### 10. Search & Quick Actions

**Features:**
- **Global Search:**
  - Search bar in header
  - Search across: submissions, content, media, users
- **Keyboard Shortcuts:**
  - `Cmd/Ctrl + K` for search
  - `Cmd/Ctrl + N` for new submission
  - Quick navigation shortcuts

**Implementation Priority:** LOW

---

## Implementation Priority Summary

### Phase 1 (Immediate - High Priority):
1. ✅ Dashboard Overview page with stats and recent activity
2. ✅ Enhanced search & filtering for inboxes
3. ✅ Bulk actions for submissions
4. ✅ Export to CSV functionality

### Phase 2 (Short-term - Medium Priority):
1. Media Library
2. Settings & Configuration page
3. Enhanced CMS with better editor
4. Analytics integration (if needed)

### Phase 3 (Long-term - Low Priority):
1. SEO Management
2. Activity Log
3. Advanced user roles & permissions
4. Content versioning

---

## Technical Considerations

### Database Schema Additions Needed:
- **ActivityLog** model (for activity tracking)
- **MediaFile** model (if not using UploadThing's storage)
- **Tag** model (for tagging submissions)
- **Note** model (for internal notes on submissions)

### API Endpoints Needed:
- `GET /hub/stats` - Dashboard statistics
- `GET /hub/activity` - Activity log
- `POST /contact/bulk` - Bulk actions
- `GET /contact/export` - CSV export
- `GET /media` - Media library
- `POST /media` - Upload media
- `GET /settings` - Get settings
- `PUT /settings` - Update settings

### Third-party Integrations (Optional):
- **Analytics:** Google Analytics, Plausible, or Vercel Analytics
- **Email Service:** SendGrid, Resend, or AWS SES for notifications
- **Image Optimization:** Cloudinary or ImageKit
- **Search:** Algolia or Meilisearch (if advanced search needed)

---

## UI/UX Improvements

### Current Issues to Fix:
1. ✅ Remove O-Hub branding (replace with Exale)
2. ✅ Better error handling (show helpful messages when API is down)
3. ✅ Loading states (skeleton loaders instead of "Loading...")
4. ✅ Empty states (better empty state designs)
5. ✅ Responsive design (ensure mobile-friendly)

### Design Enhancements:
- Consistent color scheme (use Exale brand colors)
- Better typography hierarchy
- Improved spacing and layout
- Smooth animations/transitions
- Dark mode support (if needed)

---

## Next Steps

1. **Immediate:** Fix "Failed to load" error - ensure API is running and improve error messages
2. **Week 1:** Implement Dashboard Overview page
3. **Week 2:** Add search & filtering to inboxes
4. **Week 3:** Add bulk actions and CSV export
5. **Week 4:** Implement Media Library

---

**Last Updated:** February 2026
**Status:** Planning Phase
