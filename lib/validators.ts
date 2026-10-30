import { z } from "zod";
import type { FieldMessage } from "./types";

const dateInput = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/, "Use a YYYY-MM-DD date");

export const sightingQuerySchema = z
  .object({
    from: dateInput.optional(),
    to: dateInput.optional(),
    region: z.string().trim().min(1).optional(),
    species: z.string().trim().min(1).optional(),
    severity: z.enum(["low", "medium", "high", "unrated"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(1000).default(100),
    north: z.coerce.number().min(-90).max(90).optional(),
    south: z.coerce.number().min(-90).max(90).optional(),
    east: z.coerce.number().min(-180).max(180).optional(),
    west: z.coerce.number().min(-180).max(180).optional(),
  })
  .superRefine((value, ctx) => {
    const bounds = [value.north, value.south, value.east, value.west];
    const present = bounds.filter((part) => part !== undefined).length;
    if (present !== 0 && present !== 4) {
      ctx.addIssue({
        code: "custom",
        path: ["bounds"],
        message: "Provide north, south, east, and west together",
      });
    }
    if (
      value.north !== undefined &&
      value.south !== undefined &&
      value.south > value.north
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["south"],
        message: "South must be less than or equal to north",
      });
    }
    if (
      value.west !== undefined &&
      value.east !== undefined &&
      value.west > value.east
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["west"],
        message: "West must be less than or equal to east",
      });
    }
    if (value.from && value.to) {
      const start = parseDateBound(value.from, "start");
      const end = parseDateBound(value.to, "end");
      if (start && end && start > end) {
        ctx.addIssue({
          code: "custom",
          path: ["from"],
          message: "From must be on or before to",
        });
      }
    }
  });

export type SightingQuery = z.infer<typeof sightingQuerySchema>;

export function parseDateBound(value: string, edge: "start" | "end"): Date | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const time = edge === "start" ? "T00:00:00.000Z" : "T23:59:59.999Z";
    const date = new Date(`${value}${time}`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const normalized = /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function searchParamsToObject(searchParams: URLSearchParams) {
  const raw: Record<string, string> = {};
  for (const [key, value] of searchParams) {
    const trimmed = value.trim();
    if (trimmed) raw[key] = trimmed;
  }
  return raw;
}

export function fieldErrors(error: z.ZodError): FieldMessage[] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "query",
    message: issue.message,
  }));
}

export const trendQuerySchema = z
  .object({
    interval: z.enum(["week", "month"]).default("month"),
    region: z.string().trim().min(1).optional(),
    from: dateInput.optional(),
    to: dateInput.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.from && value.to) {
      const start = parseDateBound(value.from, "start");
      const end = parseDateBound(value.to, "end");
      if (start && end && start > end) {
        ctx.addIssue({
          code: "custom",
          path: ["from"],
          message: "From must be on or before to",
        });
      }
    }
  });

export type TrendQuery = z.infer<typeof trendQuerySchema>;

export const reportSchema = z.object({
  observedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date"),
  observedTime: z.string().regex(/^\d{2}:\d{2}$/, "Choose a valid time"),
  region: z.string().trim().min(1, "Choose a city"),
  species: z.string().trim().min(1, "Choose a species"),
  severity: z.enum(["low", "medium", "high"]).optional(),
  locationLabel: z.string().trim().max(160).optional(),
  reporterNote: z.string().trim().max(1000).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;

export function distanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}
