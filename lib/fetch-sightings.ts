import type { SightingListResponse } from "./types";
import { emptyFilters, filtersToQuery, type MapFilters } from "./view";

const PAGE_CAP = 10;

export async function fetchAllSightings(filters: MapFilters = emptyFilters): Promise<SightingListResponse> {
  const rows: SightingListResponse["data"] = [];
  let page = 1;
  let total = 0;

  while (page <= PAGE_CAP) {
    const params = filtersToQuery(filters);
    params.set("page", String(page));
    const response = await fetch(`/api/sightings?${params.toString()}`);
    if (!response.ok) throw new Error("Could not load sightings");
    const body = (await response.json()) as SightingListResponse;
    rows.push(...body.data);
    total = body.total;
    if (!body.hasMore) {
      return { data: rows, page: 1, limit: rows.length, total, hasMore: false };
    }
    page += 1;
  }

  return { data: rows, page: 1, limit: rows.length, total, hasMore: true };
}
