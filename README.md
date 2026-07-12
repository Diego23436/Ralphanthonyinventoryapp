# Ralph Anthony — Construction Materials & Equipment Tracking Platform

Phase 1 of the Ralph Anthony ERP vision. Companion code to:
- `Cahier des Charges — Construction Materials & Equipment Tracking Platform` (v2.0)
- `Platform Structure & UX Architecture Specification` (v1.0)

This repo is a **complete, working structural scaffold** — every screen, route,
role boundary, and data shape from those two documents exists and renders.
Forms and tables currently run against local mock data (`src/lib/mockData.js`)
so the whole app is demoable **without a backend**. The Supabase schema is
written and ready in `/supabase`, but not yet wired into the React screens —
that wiring is the main piece of remaining work (see below).

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Supabase — Postgres, Auth, Realtime, Storage, Edge Functions |
| i18n | react-i18next (French / English) |
| Charts | Recharts |
| Export | jsPDF + jspdf-autotable (PDF), SheetJS/xlsx (Excel) |
| Deployment | Frontend → Cloudflare Pages · Backend → Supabase hosting |

## Getting started

```bash
npm install
cp .env.example .env      # then fill in your Supabase project URL + anon key
npm run dev
```

Without a `.env`, the app still runs: `AuthContext` falls back to two local
dev accounts so the UI is fully explorable:

- `admin@ralphanthony.test` / `admin123`
- `storekeeper@ralphanthony.test` / `store123`

## Project structure

```
src/
  assets/logo.png              Uploaded brand mark, used across the app
  components/
    forms/                     StockInForm / StockOutForm (shared by page + modal)
    layout/                    AppShell, Sidebar, TopBar
    logo/AnimatedLogo.jsx       Welcome-screen entrance animation
    ui/                        StatusBadge, KpiCard, Modal
  contexts/
    AuthContext.jsx            Supabase Auth + role (admin/storekeeper), with dev-mock fallback
    ThemeContext.jsx           Light/dark, persisted to localStorage
  i18n/                        react-i18next setup + en.json / fr.json
  lib/
    supabaseClient.js          Supabase client (reads .env)
    mockData.js                 Placeholder data shaped exactly like the schema
  pages/                       One file per screen (see below)
  routes/
    ProtectedRoute.jsx          Redirects to /login if signed out
    AdminRoute.jsx               Redirects non-admins away from admin-only screens
supabase/
  schema.sql                   Tables: levels, materials, users, admins,
                                storekeepers, stock_in, stock_out, notifications
  triggers.sql                 Auto short-codes, quantity triggers, low-stock
                                alerts, append-only enforcement, ISA subtype rule
  rls_policies.sql             Row-Level Security matching the role model
```

## Screens implemented (matches the UX spec 1:1)

| Screen | Route | Notes |
|---|---|---|
| Welcome | `/` | Animated logo entrance, bilingual tagline, public |
| Login | `/login` | Email/password, inline validation, lockout after 5 attempts |
| Dashboard | `/dashboard` | KPI cards, 7-day usage chart, recent activity, quick actions |
| Material Management | `/materials` | Table, search, register-material modal, status colors |
| Stock In | `/stock-in` | Also reachable as a dashboard quick-action modal |
| Stock Out | `/stock-out` | Includes the over-quantity warning from the UX spec |
| Transaction History | `/history` | **Admin only** — filters + export buttons (stubbed) |
| Analytics | `/analytics` | Usage-over-time chart, Top 5 materials |
| Notifications | `/notifications` | Low/watch-status material list |
| Settings | `/settings` | Profile, language, theme; admin-only account management block |

Role gating (`isAdmin`) follows the Role-Based Access Summary table exactly —
Transaction History is hidden from the sidebar and route-blocked for
storekeepers; the rest of the shell is shared, per the "same screens, same
layout" principle in the UX doc.

## Design system

Tokens live in `tailwind.config.js`, derived from the logo (clay/bronze +
charcoal) rather than a generic template palette. Fonts: **Sora** for
headings, **Inter** for UI/body text, **IBM Plex Mono** for IDs and data
(material codes, quantities). The three-tier status color system (green /
amber / red) from Section 7 of the UX doc is implemented in
`materialStatus()` in `mockData.js` and `StatusBadge.jsx`.

The Welcome screen's animated logo (`AnimatedLogo.jsx`) is the one
"signature" moment: a soft site-light glow, the mark rising into place, and
a single light sweep across it — restrained rather than busy, and fully
disabled under `prefers-reduced-motion`.

---

## What's done vs. what's left

### Done (this scaffold)
- Full routing, role guards, app shell, and all 10 screens
- Complete Tailwind design system (colors, type, spacing, dark mode)
- Bilingual FR/EN strings for every screen already implemented
- Full Supabase schema + triggers + RLS, matching the Cahier des Charges exactly
- Forms with the exact fields specified (Stock In / Stock Out), including
  the over-quantity client-side warning

### Left for the team
1. **Wire Supabase into the screens.** Every mock data call is marked with a
   `TODO` comment (`mockData.js`, `StockInForm.jsx`, `StockOutForm.jsx`,
   `MaterialManagement.jsx`, `TransactionHistory.jsx`). Swap them for real
   `supabase.from(...)` calls once a project exists and `schema.sql` /
   `triggers.sql` / `rls_policies.sql` have been applied.
2. **Realtime subscriptions** for the Dashboard/Material Management screens
   (Supabase Realtime channels), so a stock-out on one device reflects
   instantly elsewhere (NFR 7.3).
3. **Offline queueing** for Stock In/Out forms — NFR 7.3 requires forms to
   queue submissions offline and sync once back online (e.g. via a small
   IndexedDB queue + retry-on-reconnect).
4. **Real PDF/Excel export** on the Transaction History screen — buttons are
   present and styled but not yet wired to jsPDF/SheetJS.
5. **Low-stock email delivery** — the `check_low_stock()` trigger creates
   the in-app notification row; sending the actual email needs a Supabase
   Edge Function + an email provider (e.g. Resend).
6. **Admin account management** (Settings screen) — invite/deactivate
   storekeepers via the Supabase Auth admin API.
7. **Replace dev-mock auth** — remove the `DEV_USERS` fallback branch in
   `AuthContext.jsx` once real Supabase accounts exist.
8. Visual polish pass — this scaffold is intentionally kept simple per your
   request ("very simple, to be modified and ameliorated later"). Spacing,
   copy, empty/error states, and mobile refinements are good next steps.

---

## Deployment

- **Frontend → Cloudflare Pages.** Build command `npm run build`, output
  directory `dist`. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as
  Pages environment variables (same values as your local `.env`).
- **Backend → Supabase's own hosting.** Postgres, Auth, Realtime, Storage,
  and Edge Functions all live inside your Supabase project — manage them via
  the Supabase dashboard or CLI (`supabase db push`, `supabase functions
  deploy`), nothing else to host separately.
