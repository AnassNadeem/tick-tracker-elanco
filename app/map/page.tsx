import MapScreen from "@/components/map/MapScreen";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sightings map",
  description: "Interactive map of UK tick sightings with filters by date, species, severity and city.",
};

export default function MapPage() {
  return (
    <Suspense fallback={<p className="page">Loading the map…</p>}>
      <h1 className="sr-only">Tick sightings map</h1>
      <MapScreen />
    </Suspense>
  );
}
