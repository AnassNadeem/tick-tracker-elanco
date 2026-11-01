"use client";

import { fetchAllSightings } from "@/lib/fetch-sightings";
import { toMapPoints } from "@/lib/map-points";
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
    queryFn: () => fetchAllSightings(),
    staleTime: 60_000,
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
          />
        )}
      </div>
      <Link href="/map" className="feature-link">
        Open the full map &rarr;
      </Link>
    </div>
  );
}
