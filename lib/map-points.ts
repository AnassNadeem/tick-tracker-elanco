import { jitteredPosition } from "./jitter";
import type { SightingDto } from "./types";
import { formatObserved } from "./view";

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  speciesSlug: string;
  severity: string | null;
  recent: boolean;
  label: string;
};

export function toMapPoints(rows: SightingDto[]): MapPoint[] {
  const maxTime = rows.reduce(
    (max, row) => Math.max(max, new Date(row.observedAt).getTime()),
    0,
  );
  // Highlight sightings within the newest 14 days present in the current view.
  const recentAfter = maxTime - 14 * 24 * 60 * 60 * 1000;

  return rows.map((row) => {
    const baseLat = row.lat ?? row.region.lat;
    const baseLng = row.lng ?? row.region.lng;
    const position = row.coordinatesAreApproximate
      ? jitteredPosition(row.id, baseLat, baseLng)
      : { lat: baseLat, lng: baseLng };
    const recent = new Date(row.observedAt).getTime() >= recentAfter;
    const severityLabel = row.severity ?? "not recorded";
    return {
      id: row.id,
      lat: position.lat,
      lng: position.lng,
      speciesSlug: row.species.slug,
      severity: row.severity,
      recent,
      label: `${row.species.name} in ${row.region.name} on ${formatObserved(row.observedAt)}. Severity ${severityLabel}.${recent ? " Recent." : ""}`,
    };
  });
}
