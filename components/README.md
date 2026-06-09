# MosquitoHunt

Mobile-first humor social app: log mosquito kills, salute / comment, climb a
weekly leaderboard, and share a case-file "dossier." Next.js (App Router) +
Supabase, deployable on Vercel.

## Architecture

```
app/                      route = page
  page.tsx                For You feed (/)
  leaderboard/page.tsx    weekly board
  profile/[username]/...  a hunter's dossier + posts
  terms/ privacy/         legal pages (linked from signup)
components/               one file per UI piece (Feed, PostCard, Dossier, ...)
context/AuthContext.tsx   Supabase session -> profile
lib/                      theme tokens, supabase clients, ranking, stats, types
supabase/migrations/      0001 schema · 0002 feed ranking + stats
```

## Setup

1. **Create a Supabase project.** Run `supabase/migrations/0001_schema.sql`
   then `0002_feed_and_stats.sql` in the SQL editor.
2. **Auth:** Authentication > Sign In / Providers > Email -> turn OFF
   "Confirm email" (instant signup, no confirmation step).
3. **Storage:** create a public bucket named `evidence` (for snap photos).
   Add a policy allowing authenticated users to upload to their own folder.
4. **Env:** copy `.env.local.example` to `.env.local` and fill
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. `npm install && npm run dev`

## Deploy to Vercel

1. Push to GitHub, import the repo in Vercel.
2. Add the two `NEXT_PUBLIC_SUPABASE_*` env vars in Project Settings.
3. In Supabase Auth > URL Configuration, add your Vercel domain (and later
   mosquitohunt.org) to the allowed redirect/site URLs.
4. Deploy. Point mosquitohunt.org at Vercel when ready.

## The feed ranking

`hot = (salutes + 0.5*comments + 1) / (age_hours + 2)^GRAVITY` — see the
`feed_ranked` view in `0002`. GRAVITY (1.5) is the recency-vs-popularity dial;
raise toward ~1.8 for a fresher feed. Computed at query time (fine for MVP).
Scale path: a materialized view refreshed by a cron / Supabase scheduled
function, or precompute in an edge function.

## TODO before launch

- Replace `{{placeholders}}` in terms/privacy and get legal review (EU/Italy).
- Render the dossier to a real image (e.g. an `/api/og` route) for clean
  social sharing instead of screenshots.
- Add a Report button + moderation (the real UGC risk).
- Seed the leaderboard so it doesn't launch as a ghost town.
