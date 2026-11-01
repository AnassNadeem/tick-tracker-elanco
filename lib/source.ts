import type { SightingSource } from "./types";

const KNOWN: SightingSource[] = ["upstream", "extended", "user_submitted"];

export function normalizeSource(value: string): SightingSource {
  return KNOWN.includes(value as SightingSource) ? (value as SightingSource) : "upstream";
}

export function sourceLabel(source: SightingSource) {
  if (source === "user_submitted") return "Community report";
  if (source === "extended") return "Local extension, not from the Elanco API";
  return "Elanco API record";
}
