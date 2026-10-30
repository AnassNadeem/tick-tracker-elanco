export function formatObserved(iso: string) {
  const [datePart, timePart = "00:00:00"] = iso.replace(/\.\d+/, "").replace(/Z$/, "").split("T");
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year} ${timePart.slice(0, 5)} UTC`;
}

export type MapFilters = {
  from: string;
  to: string;
  species: string;
  severity: string;
  region: string;
};

export const emptyFilters: MapFilters = {
  from: "",
  to: "",
  species: "",
  severity: "",
  region: "",
};

const FILTER_KEYS = ["from", "to", "species", "severity", "region"] as const;

export function filtersFromParams(params: URLSearchParams): MapFilters {
  const filters = { ...emptyFilters };
  for (const key of FILTER_KEYS) {
    filters[key] = params.get(key) ?? "";
  }
  return filters;
}

export function filtersToQuery(filters: MapFilters, extra?: Record<string, string>) {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    if (filters[key]) params.set(key, filters[key]);
  }
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  params.set("limit", "1000");
  return params;
}

export function pageQuery(filters: MapFilters, sightingId: string | null) {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    if (filters[key]) params.set(key, filters[key]);
  }
  if (sightingId) params.set("sighting", sightingId);
  return params.toString();
}
