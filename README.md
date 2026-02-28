# FreeJobBoard.ai

The Shopify of job boards. Launch a beautiful, modern job board — free. Forever.

## Stack
- Next.js 15 (App Router, TypeScript)
- Supabase (Postgres + Auth)
- Tailwind CSS
- Resend (email)
- Cloudflare Workers (embed script — Phase 2)
- Vercel (hosting)

## Getting Started
1. Copy `.env.local.example` to `.env.local` and fill in values
2. Run `npm install`
3. Run schema: `supabase/schema.sql` in Supabase SQL editor
4. `npm run dev`

## Routes
- `/` — Marketing homepage
- `/register` — Create a board (60 seconds)
- `/login` — Sign in
- `/dashboard` — Board owner dashboard
- `{slug}.freejobboard.ai` — Public job board (subdomain routed)
