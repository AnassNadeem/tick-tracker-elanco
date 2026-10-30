import { findCity } from "./cities";
import { findSpeciesBySlug } from "./species-catalog";
import type { FieldMessage } from "./types";
import { distanceKm, type ReportInput } from "./validators";

export const UK_BOUNDS = { south: 49.5, north: 61, west: -8.6, east: 2 };
export const MAX_PIN_DISTANCE_KM = 40;

export function validateReport(data: ReportInput, now = Date.now()): FieldMessage[] {
  const errors: FieldMessage[] = [];
  const city = findCity(data.region);
  const species = findSpeciesBySlug(data.species);
  if (!city) errors.push({ field: "region", message: "Choose a UK city from the list" });
  if (!species) errors.push({ field: "species", message: "Choose a species from the list" });

  const observedAt = new Date(`${data.observedDate}T${data.observedTime}:00.000Z`);
  if (Number.isNaN(observedAt.getTime())) {
    errors.push({ field: "observedDate", message: "That date and time could not be read" });
  } else if (observedAt.getTime() > now + 5 * 60 * 1000) {
    errors.push({ field: "observedDate", message: "The sighting time cannot be in the future" });
  }

  const hasLat = data.lat !== undefined;
  const hasLng = data.lng !== undefined;
  if (hasLat !== hasLng) {
    errors.push({
      field: "lat",
      message: "Drop a pin with both latitude and longitude, or leave both empty",
    });
  }
  if (hasLat && hasLng && data.lat !== undefined && data.lng !== undefined && city) {
    if (
      data.lat < UK_BOUNDS.south ||
      data.lat > UK_BOUNDS.north ||
      data.lng < UK_BOUNDS.west ||
      data.lng > UK_BOUNDS.east
    ) {
      errors.push({ field: "lat", message: "The pin needs to be inside the UK" });
    } else if (distanceKm(city, { lat: data.lat, lng: data.lng }) > MAX_PIN_DISTANCE_KM) {
      errors.push({
        field: "lat",
        message: "That pin is more than 40 km from the selected city. Move it, or change the city.",
      });
    }
  }

  return errors;
}

export function warningMessages(data: ReportInput, hasImage: boolean, now = Date.now()): FieldMessage[] {
  const warnings: FieldMessage[] = [];
  const observedAt = new Date(`${data.observedDate}T${data.observedTime}:00.000Z`);
  if (!Number.isNaN(observedAt.getTime()) && observedAt.getTime() < now - 30 * 24 * 60 * 60 * 1000) {
    warnings.push({
      field: "observedDate",
      message: "This sighting is more than 30 days old. You can still submit it.",
    });
  }
  if (!data.severity) {
    warnings.push({
      field: "severity",
      message: "Severity was not set, so the marker will show as unrated.",
    });
  }
  if (!hasImage) {
    warnings.push({
      field: "image",
      message: "A photo helps others check the species. You can still submit without one.",
    });
  }
  return warnings;
}
