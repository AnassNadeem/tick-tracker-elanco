import { SPECIES_CATALOG } from "@/lib/species-catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Species guide",
};

export default function SpeciesPage() {
  return (
    <div className="page">
      <h1>Species guide</h1>
      <p className="lede">
        These five names are the ones used by the sightings dataset. The notes below are a field guide
        for describing what you saw. They are not a laboratory identification, and they are not medical
        advice.
      </p>
      <div className="card-grid">
        {SPECIES_CATALOG.map((species) => (
          <article key={species.slug} className="card">
            <p className="eyebrow">{species.riskLevel} chance of meeting one</p>
            <h2>{species.name}</h2>
            <p className="latin">{species.latinName}</p>
            <p>{species.description}</p>
            <h3>What to look for</h3>
            <p>{species.identificationTips}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
