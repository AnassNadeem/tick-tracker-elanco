"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

type HealthResponse = {
  sightings: number;
};

type RegionRow = {
  regionId: string;
  region: string;
  count: number;
};

export default function LandingInsights() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await fetch("/api/health");
      if (!response.ok) throw new Error("Health check failed");
      return (await response.json()) as HealthResponse;
    },
  });

  const regions = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const response = await fetch("/api/stats/regions");
      if (!response.ok) throw new Error("Could not load cities");
      return (await response.json()) as { data: RegionRow[] };
    },
  });

  const total = health.data?.sightings;
  const top = (regions.data?.data ?? []).filter((row) => row.count > 0).slice(0, 3);

  return (
    <aside className="insight-panel" aria-label="Sighting insights">
      <div>
        <p className="insight-kicker">At a glance</p>
        <p className="insight-total">
          <strong>{total === undefined ? "..." : total.toLocaleString("en-GB")}</strong>
          <span>sightings on the map</span>
        </p>
      </div>
      <div>
        <h3>Busiest cities</h3>
        {regions.isError ? (
          <p className="help">City totals could not be loaded.</p>
        ) : (
          <ol className="insight-cities">
            {top.map((row) => (
              <li key={row.regionId}>
                <span>{row.region}</span>
                <span>{row.count.toLocaleString("en-GB")}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
      <p className="insight-span">Records span 2012-2026, with a summer peak each year.</p>
      <Link href="/activity" className="feature-link">
        See seasonal activity &rarr;
      </Link>
    </aside>
  );
}
