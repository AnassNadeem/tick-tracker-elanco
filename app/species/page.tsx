import { SPECIES_CATALOG } from "@/lib/species-catalog";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Species guide",
  description: "A field guide to the five tick species in the dataset — how to spot them and the risk each one carries.",
};

const MARKS: Record<string, { color: string; letter: string }> = {
  "fox-badger-tick": { color: "var(--sp-fox)", letter: "F" },
  "marsh-tick": { color: "var(--sp-marsh)", letter: "M" },
  "passerine-tick": { color: "var(--sp-passerine)", letter: "P" },
  "southern-rodent-tick": { color: "var(--sp-rodent)", letter: "S" },
  "tree-hole-tick": { color: "var(--sp-tree)", letter: "T" },
};

export default function SpeciesPage() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="eyebrow-badge">Field guide</span>
        <h1>Know your ticks</h1>
        <p className="lede">
          These five species appear in the sightings dataset. Use the notes to describe what you saw
          &mdash; they are a field guide, not a laboratory identification or medical advice. Each card
          matches the colour used for that species on the map.
        </p>
      </div>

      <div className="card-grid">
        {SPECIES_CATALOG.map((species) => {
          const mark = MARKS[species.slug] ?? { color: "var(--muted)", letter: "?" };
          return (
            <article key={species.slug} className="species-card">
              <div className="species-media">
                <Image
                  src={`/images/species-${species.slug}.jpg`}
                  alt={`${species.name} (${species.latinName})`}
                  width={480}
                  height={320}
                />
                <span className="species-chip">
                  <span
                    className="species-dot"
                    style={{ background: mark.color }}
                    aria-hidden="true"
                  />
                  {species.name}
                </span>
              </div>
              <div className="species-body">
                <div className="head-row">
                  <div>
                    <h2>{species.name}</h2>
                    <p className="latin">{species.latinName}</p>
                  </div>
                  <span className="risk-badge" data-risk={species.riskLevel}>
                    {species.riskLevel} risk
                  </span>
                </div>
                <p>{species.description}</p>
                <div className="species-tips">
                  <strong>What to look for</strong>
                  <p>{species.identificationTips}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="cta-band" style={{ marginTop: "2.5rem" }}>
        <h2>Spotted one of these?</h2>
        <p>Add it to the map so others in your area know ticks are active.</p>
        <Link href="/report" className="btn btn-accent btn-lg">
          Report a sighting
        </Link>
      </div>
    </div>
  );
}
