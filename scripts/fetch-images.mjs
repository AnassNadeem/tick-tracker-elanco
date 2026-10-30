// Downloads properly-licensed photos from Wikimedia Commons into public/images
// and records attribution. Run with: node scripts/fetch-images.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "images");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "TickTrackerPlacement/1.0 (educational placement task)";

// Each job: outfile <- first unused raster result (from `index`) of a Commons file search.
const JOBS = [
  { out: "hero.jpg", query: "golden retriever dog field grass", index: 0 },
  { out: "feature-map.jpg", query: "England countryside hills landscape", index: 0 },
  { out: "feature-report.jpg", query: "hand holding smartphone outdoors", index: 0 },
  { out: "feature-prevention.jpg", query: "dog grooming brushing fur", index: 0 },
  { out: "feature-activity.jpg", query: "meadow grass summer wildflowers", index: 0 },
  { out: "landing-tick.jpg", query: "Ixodes ricinus tick", index: 0 },
  { out: "species-fox-badger-tick.jpg", query: "Ixodes tick", index: 0 },
  { out: "species-marsh-tick.jpg", query: "tick engorged", index: 0 },
  { out: "species-passerine-tick.jpg", query: "Dermacentor tick", index: 0 },
  { out: "species-southern-rodent-tick.jpg", query: "wood mouse Apodemus", index: 0 },
  { out: "species-tree-hole-tick.jpg", query: "Ixodes tick", index: 3 },
];

const usedTitles = new Set();

const cache = new Map();

async function searchFiles(query) {
  if (cache.has(query)) return cache.get(query);
  const url = `${API}?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
    query,
  )}&gsrlimit=12&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=1600&format=json&origin=*`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`search failed ${res.status} for ${query}`);
  const json = await res.json();
  const pages = Object.values(json?.query?.pages ?? {});
  const items = pages
    .map((p) => ({ title: p.title, info: p.imageinfo?.[0], index: p.index ?? 999 }))
    .filter((p) => p.info && /^image\/(jpeg|png)$/.test(p.info.mime))
    .filter((p) => (p.info.width ?? 0) >= 600)
    .sort((a, b) => a.index - b.index);
  cache.set(query, items);
  return items;
}

async function download(urlStr, outPath) {
  const res = await fetch(urlStr, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
  return buf.length;
}

function cleanHtml(s) {
  return (s ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const attributions = [];

  for (const job of JOBS) {
    try {
      const items = await searchFiles(job.query);
      const pick = items.slice(job.index).find((it) => !usedTitles.has(it.title)) ?? items[job.index] ?? items[0];
      if (!pick) {
        console.warn(`! no result for "${job.query}" -> ${job.out}`);
        continue;
      }
      usedTitles.add(pick.title);
      const src = pick.info.thumburl ?? pick.info.url;
      const bytes = await download(src, path.join(OUT_DIR, job.out));
      const meta = pick.info.extmetadata ?? {};
      attributions.push({
        out: job.out,
        title: pick.title,
        artist: cleanHtml(meta.Artist?.value) || "Unknown",
        license: cleanHtml(meta.LicenseShortName?.value) || "see Commons",
        descUrl: pick.info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(pick.title)}`,
      });
      console.log(`ok ${job.out} <- ${pick.title} (${(bytes / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.warn(`! ${job.out}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 700));
  }

  const md =
    "# Image attributions\n\n" +
    "All photos are from Wikimedia Commons, downloaded for this educational placement task.\n\n" +
    attributions
      .map(
        (a) =>
          `- **${a.out}** — [${a.title}](${a.descUrl}) by ${a.artist}. License: ${a.license}.`,
      )
      .join("\n") +
    "\n";
  await writeFile(path.join(OUT_DIR, "ATTRIBUTION.md"), md);
  console.log(`\nWrote ${attributions.length} images + ATTRIBUTION.md`);
}

main();
