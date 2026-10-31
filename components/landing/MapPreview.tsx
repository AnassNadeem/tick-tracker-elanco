"use client";

import { toMapPoints } from "@/lib/map-points";
import type { SightingListResponse } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const TickMap = dynamic(() => import("@/components/map/TickMap"), {
  ssr: false,
  loading: () => <div className="map-loading">Loading the map…</div>,
});

export default function MapPreview() {
  const router = useRouter();
  const sightings = useQuery({
    queryKey: ["sightings", "preview"],
    queryFn: async () => {
      const response = await fetch("/api/sightings?limit=1000");
      if (!response.ok) throw new Error("Could not load sightings");
      return (await response.json()) as SightingListResponse;
    },
  });

  const points = useMemo(
    () => toMapPoints(sightings.data?.data ?? []),
    [sightings.data],
  );

  return (
    <div className="map-preview-card">
      <div className="map-preview-frame">
        {sightings.isError ? (
          <p className="map-loading" role="alert">
            The map preview could not be loaded.
          </p>
        ) : (
          <TickMap
            points={points}
            selectedId={null}
            onSelect={(id) => router.push(`/map?sighting=${id}`)}
            onBounds={() => {}}
          />
        )}
      </div>
      <Link href="/map" className="feature-link">
        Open the full map &rarr;
      </Link>
    </div>
  );
}
