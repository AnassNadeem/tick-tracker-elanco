"use client";

import FilterBar from "@/components/map/FilterBar";
import Legend from "@/components/map/Legend";
import SightingPanel from "@/components/map/SightingPanel";
import { useDebounced } from "@/components/useDebounced";
import { CITIES } from "@/lib/cities";
import { fetchAllSightings } from "@/lib/fetch-sightings";
import { filtersFromParams, pageQuery, type MapFilters } from "@/lib/view";
import { toMapPoints } from "@/lib/map-points";
import type { SpeciesDto } from "@/lib/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const TickMap = dynamic(() => import("./TickMap"), {
  ssr: false,
  loading: () => <div className="map-loading">Loading the map…</div>,
});

type HealthResponse = {
  db: "ok" | "error";
  upstream: "ok" | "down";
  sightings: number;
};

export default function MapScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<MapFilters>(() => filtersFromParams(searchParams));
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("sighting"));
  const debouncedFilters = useDebounced(filters, 300);

  useEffect(() => {
    const next = pageQuery(debouncedFilters, selectedId);
    if (next !== searchParams.toString()) {
      router.replace(next ? `/map?${next}` : "/map", { scroll: false });
    }
  }, [debouncedFilters, selectedId, router, searchParams]);

  const sightingsQuery = useQuery({
    queryKey: ["sightings", debouncedFilters],
    queryFn: () => fetchAllSightings(debouncedFilters),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const speciesQuery = useQuery({
    queryKey: ["species"],
    queryFn: async () => {
      const response = await fetch("/api/species");
      if (!response.ok) throw new Error("Could not load species");
      return (await response.json()) as { data: SpeciesDto[] };
    },
  });

  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await fetch("/api/health");
      if (!response.ok) throw new Error("Health check failed");
      return (await response.json()) as HealthResponse;
    },
  });

  const points = useMemo(
    () => toMapPoints(sightingsQuery.data?.data ?? []),
    [sightingsQuery.data],
  );
  const focus = useMemo(() => {
    const city = CITIES.find((item) => item.name === filters.region);
    return city ? { lat: city.lat, lng: city.lng } : null;
  }, [filters.region]);

  return (
    <div className="map-shell">
      <FilterBar
        filters={filters}
        species={speciesQuery.data?.data ?? []}
        onChange={setFilters}
        total={sightingsQuery.data?.total ?? null}
        shown={points.length}
        truncated={Boolean(sightingsQuery.data?.hasMore)}
      />
      {healthQuery.data?.upstream === "down" ? (
        <p className="banner banner-warn" role="status">
          The live source is unreachable. This map is showing the last data saved in the app.
        </p>
      ) : null}
      {sightingsQuery.isError ? (
        <p className="banner banner-error" role="alert">
          Sightings could not be loaded. Check that the database has been seeded, then refresh.
        </p>
      ) : null}
      <div className="map-stage">
        <TickMap points={points} selectedId={selectedId} onSelect={setSelectedId} focus={focus} />
        <Legend />
        {selectedId ? (
          <SightingPanel id={selectedId} onClose={() => setSelectedId(null)} onSelect={setSelectedId} />
        ) : (
          <p className="selected-chip quiet">Choose a marker to read that sighting.</p>
        )}
      </div>
    </div>
  );
}
