import MapScreen from "@/components/map/MapScreen";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <Suspense fallback={<p className="page">Loading the map…</p>}>
      <h1 className="sr-only">Tick sightings map</h1>
      <MapScreen />
    </Suspense>
  );
}
