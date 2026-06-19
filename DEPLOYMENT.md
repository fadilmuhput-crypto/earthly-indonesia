# Deployment Guide

## Prerequisites

- [Supabase](https://supabase.com) account (free tier works)
- [Vercel](https://vercel.com) account (free tier works)
- Node.js 18+

## Step 1: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `src/lib/db/schema.sql`
3. Go to Project Settings > API to get:
   - `Project URL` (your `NEXT_PUBLIC_SUPABASE_URL`)
   - `anon public` key (your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` key (your `SUPABASE_SERVICE_ROLE_KEY`)
4. Go to Authentication > Settings and configure:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

## Step 2: Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

## Step 3: Seed Data

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
npx tsx scripts/seed.ts
```

## Step 4: Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B: Vercel Dashboard

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Settings > Environment Variables
4. Deploy

## Step 5: Verify

- Visit the deployed URL
- Create an account and complete the assessment
- Browse actions, challenges, and campaigns

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/      # Authenticated pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── actions/      # Green action library
│   │   ├── challenges/   # Daily/weekly challenges
│   │   ├── campaigns/    # Community campaigns
│   │   ├── learning/     # Educational content
│   │   └── profile/      # User profile
│   ├── assessment/       # Earth Score questionnaire
│   ├── auth/             # Login/Register + callback
│   └── page.tsx          # Landing page
├── components/
│   ├── layout/           # Navbar, ThemeProvider
│   ├── shared/           # StatCard, ProgressBar, ActionBadge
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/
│   ├── supabase/         # Supabase client (client/server/middleware)
│   └── constants.ts      # App constants, questions, seed data
└── types/                # TypeScript type definitions
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth
- **Animations:** Motion
- **Charts:** Recharts
- **Deployment:** Vercel
