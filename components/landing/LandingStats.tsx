"use client";

import { CITIES } from "@/lib/cities";
import { SPECIES_CATALOG } from "@/lib/species-catalog";
import { useQuery } from "@tanstack/react-query";

type HealthResponse = {
  sightings: number;
  lastIngestedAt: string | null;
};

export default function LandingStats() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await fetch("/api/health");
      if (!response.ok) throw new Error("Health check failed");
      return (await response.json()) as HealthResponse;
    },
  });

  const total = health.data?.sightings;

  return (
    <section className="stat-band" aria-label="Dataset at a glance">
      <div className="stat-band-inner">
        <div className="stat">
          <strong>{total === undefined ? "—" : total.toLocaleString("en-GB")}</strong>
          <span>sightings mapped</span>
        </div>
        <div className="stat">
          <strong>{CITIES.length}</strong>
          <span>UK cities covered</span>
        </div>
        <div className="stat">
          <strong>{SPECIES_CATALOG.length}</strong>
          <span>tick species profiled</span>
        </div>
        <div className="stat">
          <strong>24/7</strong>
          <span>open to new reports</span>
        </div>
      </div>
    </section>
  );
}
