# Walkthrough script

Speak this in the first person. The lines in brackets are what to do on screen, not words to read out. Aim for under 10 minutes. Have the live site open: https://tick-tracker-elanco.vercel.app

## Introduction

Hi, I'm Anass Nadeem.

This is Tick Tracker. I built it for the Elanco placement technical task. It is a UK tick-sighting tracker: a map, a way to read a single sighting, short guides on the species and on prevention, and a form so someone can report what they saw.

It is a placement project. It is not an official Elanco service, and it is not medical or veterinary advice.

## The task

[Stay on the home page.]

The brief asked for a tracker in the spirit of Elanco's preventive-care work: show where ticks are being seen, help someone identify what they are looking at, and let them add a sighting of their own. I was given a frontend brief. I chose to build it full-stack, because I wanted the map and the chart to run on data I had actually ingested, not a JSON file sitting in the browser.

The source is a public task API. One request returns a thousand sightings. Fourteen UK cities, five species, a date, and a latin name. There is no latitude, no longitude, and no severity. That is the constraint the rest of the design sits on.

## How I approached it

I treated it as one product, not a pile of pages. One Next.js app serves the interface and the API. Sightings are stored in Postgres. The browser only talks to my routes.

Imported rows have a city name and nothing finer, so the map places them on the city centre and the panel says so. I did not invent a field location. Severity is also missing from the feed, so on ingest I set it from the risk level already written for that species in the guide. A report someone types in can still leave severity blank, and the marker shows as unrated.

The feed stops in 2024. The activity chart offers 2025 and 2026, so I added a small local extension for those years, marked separately from the Elanco rows, with the same summer shape. Those rows are not from Elanco's API, and I would say that if anyone asked where 2026 came from.

I left out accounts, and I left out the optional machine-learning task. The deadline was the map, the report, and the guides, done properly.

## Demo

[Click Explore the map.]

This is the map. The clusters are cities, not precise spots. The count on a cluster is how many sightings sit on that city.

[Change the city to London. Then clear it. Zoom in until a cluster breaks into markers.]

Shape and letter are the species, so it is not colour alone. A ring means the sighting is in the newest two weeks of what you are looking at.

[Click a marker.]

The panel shows the species, the latin name, when it was seen, and that this point is the city centre. Under that is the recent activity in the same city. Report, directions, and share sit at the bottom. Directions open the city centre, not a field pin. Escape closes the panel.

[Go to Report. Submit the empty form.]

Those are the required fields: date, time, city, species. Severity is optional. If I leave it empty, the form warns me and still accepts the report. I can drop a pin, and I can attach a photo. The photo is resized and stored as a file. It is not written into the database.

[Open Species, then Prevention, then Activity.]

Species is the five ticks in the dataset, with the latin name and a short note on where you would meet them. Prevention says, in the page itself, that this is not a diagnosis. Activity is monthly counts by city and year. The bars and the table are the same numbers.

## How I used AI, and what I decided myself

I used Cursor throughout the build. That is how I stayed inside the deadline. It scaffolded the Next.js app, drafted route handlers, and let me iterate the interface quickly when I changed direction. I treated that as speed, not as the design.

The decisions were mine, and I can defend them.

I built one app instead of a separate API, because a second service would have doubled the deploy for no benefit at this size. I started on SQLite so I could build before I had hosted credentials, then moved the database to Postgres on Supabase and the photos to Storage when I published on Vercel. A serverless disk would have dropped both the database file and the uploads.

I kept ingest off the page request. If Elanco's API is down, the site still reads its own database, and seeding can fall back to a snapshot I saved from the feed. I do not send the browser to the upstream API at all.

I set severity from the species guide so the filter actually slices the imported data, and I labelled 2025 and 2026 as a local extension rather than pretending the feed contained them. I did not add logins. A public report with no moderation is acceptable for this task and it would not be acceptable as a real Elanco service.

## What I would do next

If this were going into production, rather than a placement review, I would add four things before I trusted it with the public.

First, accounts and a moderation queue, so a report is not on the map until someone has looked at it. Second, automated tests around ingest, the report validator, and the filter query. The checks I ran while building were one-off scripts, and I removed them. Third, rate limiting on the report endpoint, and monitoring when ingest fails. Fourth, a clinical read of the species and prevention copy. I wrote that for the task. I would not ship it as health guidance without that review.

The data model is already ready for a real coordinate. If the source ever sends one, it is stored on the sighting and the city centre is no longer used. I would not keep describing a city-centre pin as the place a tick was seen.

## Close

That is the product: a map of the ingested data, a report that writes back into the same database, and short guides next to it. Thank you.
