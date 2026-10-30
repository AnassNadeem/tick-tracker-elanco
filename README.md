# Tick Tracker

UK tick-sighting map, reporting form, and short guides. Built by **Anass Nadeem** for the Elanco Placement Program technical task (deadline 9am, 1 November 2026).

This is a student project. It is not an official Elanco product, and nothing in it is veterinary or medical advice.

## What it does

- Maps 1,000 sightings from the Elanco task API, plus any reports you add.
- Filters by date, species, severity, and city.
- Opens a sighting panel with the record, activity in that city, and actions to report, get directions, or share.
- Lets you submit a sighting with validation, optional severity, an optional map pin, and an optional photo.
- Explains the five species in the dataset, lists prevention steps, and charts sightings by month, city, and year.

Imported rows have a city name and no coordinates or severity. The map places them on the city centre and draws them as unrated. A report you submit can include a pin and a severity.

## Technical choices

- **Next.js (App Router)** for both the UI and the API routes — one app to run and deploy.
- **Prisma + Postgres (Supabase)** so the app and uploaded photos survive a serverless deploy. Locally, if the Supabase env vars are unset, photos still fall back to `public/uploads`.
- **Leaflet + Supercluster** for the map and clustering.
- **Zod** for shared client and server validation on reports.
- The browser never calls the Elanco API directly. Sightings are ingested into the local database first; if the live source is down, seeding falls back to `data/upstream-snapshot.json`.

## Run it

Requirements: Node.js 20 or newer.

```bash
npm install
copy .env.example .env
```

Fill `.env` with the Supabase Postgres URLs (`DATABASE_URL` pooled, `DIRECT_URL` direct) and `SUPABASE_URL` plus `SUPABASE_ANON_KEY` (or the service role key). Then:

```bash
npm run db:setup
npm run dev
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

Open http://localhost:3000.

`npm run db:setup` applies the migration and loads 14 cities, 5 species, and the sightings. It tries the live API first (`https://dev-task.elancoapps.com/data/tick-sightings`) and, if that fails, uses `data/upstream-snapshot.json`. Run `npm run ingest` later to refresh from the API without reseeding the reference tables.

The live database is the Supabase project `tick-tracker` (`eu-west-2`). Reset the database password in the Supabase dashboard, put both connection strings and the anon key in Vercel, then `npx vercel --prod`. Photos go to the public `sighting-photos` bucket.

## Walkthrough video

- Video: _not recorded yet_ (add an unlisted YouTube link or a file in the repo before submitting)

## Project layout

- `app/` — pages and `/api` routes
- `components/` — map, report form, chart
- `lib/` — database, ingestion, validation
- `prisma/` — schema, migration, seed
- `data/` — offline snapshot of the upstream sightings API
