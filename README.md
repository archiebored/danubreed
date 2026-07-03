# Da Nu Breed

Teenage Expression of Calvary Bible Church — a progressive web app (PWA) for members,
events, giving, and anonymous confessions/suggestions.

## Stack
React + Vite + Tailwind CSS + Supabase + vite-plugin-pwa

## Getting started

```bash
npm install
npm run dev
```

The `.env` file already has the Supabase project URL and anon key filled in.
Never commit `.env` — it's gitignored. Use `.env.example` as the template for
any other machine or deploy target.

## Project structure

- `src/pages/` — one file per screen (Home, Events, Confess, Signup, Dashboard, etc.)
- `src/components/` — shared layout pieces (TopBar, BottomNav, PublicLayout, RequireStaff)
- `src/context/` — ThemeContext (dark/light, persisted) and AuthContext (staff login + role)
- `src/lib/supabase.js` — Supabase client, reads from env vars
- `da_nu_breed_schema.sql` (in the parent delivery) — run this in the Supabase SQL editor first

## Staff accounts

Coordinator/admin access is separate from the public site. Staff log in at `/staff/login`
using the accounts created in Supabase Auth and linked to the `staff` table. Anyone signed
in via Supabase Auth but missing from `staff` is treated as logged out for app purposes.

## What's built so far

Public: Home, Give (placeholder — payments not wired up yet), Events + registration,
Confess/suggest (writes to `anonymous_submissions`), member Sign-up, Coordinator contact, More.

Staff: Login, Dashboard (live counts + recent inbox).

## What's next

- Full coordinator CRUD: members list/edit, tribe assignment, department management
- Event creation/editing from the dashboard
- Paystack integration for giving and event fees
- Real logo (currently a text wordmark + placeholder PWA icons)

## Deploying

Push to GitHub, import into Vercel, and add `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` as environment variables in the Vercel project settings
(same values as your local `.env`).
