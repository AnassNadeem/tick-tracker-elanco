"use client";

import { CITIES } from "@/lib/cities";
import type { MapFilters } from "@/lib/view";
import type { SpeciesDto } from "@/lib/types";

const SEVERITY_OPTIONS = [
  { value: "", label: "Any severity" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "unrated", label: "Not recorded" },
];

export default function FilterBar({
  filters,
  species,
  onChange,
  total,
  shown,
  truncated,
}: {
  filters: MapFilters;
  species: SpeciesDto[];
  onChange: (next: MapFilters) => void;
  total: number | null;
  shown: number;
  truncated: boolean;
}) {
  function update(key: keyof MapFilters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <form
      className="filter-bar"
      role="search"
      aria-label="Filter sightings"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="filter-fields">
        <div>
          <label htmlFor="filter-from">From</label>
          <input
            id="filter-from"
            type="date"
            value={filters.from}
            onChange={(event) => update("from", event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="filter-to">To</label>
          <input
            id="filter-to"
            type="date"
            value={filters.to}
            onChange={(event) => update("to", event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="filter-species">Species</label>
          <select
            id="filter-species"
            value={filters.species}
            onChange={(event) => update("species", event.target.value)}
          >
            <option value="">All species</option>
            {species.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-severity">Severity</label>
          <select
            id="filter-severity"
            value={filters.severity}
            onChange={(event) => update("severity", event.target.value)}
          >
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-city">City</label>
          <select
            id="filter-city"
            value={filters.region}
            onChange={(event) => update("region", event.target.value)}
          >
            <option value="">All cities</option>
            {CITIES.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="text-button"
          onClick={() =>
            onChange({ from: "", to: "", species: "", severity: "", region: "" })
          }
        >
          Clear
        </button>
      </div>
      <p className="filter-count" aria-live="polite">
        {total === null
          ? "Loading sightings"
          : truncated
            ? `Showing ${shown} of ${total}. Narrow the filters to see the rest.`
            : `${total} sighting${total === 1 ? "" : "s"}`}
      </p>
    </form>
  );
}
