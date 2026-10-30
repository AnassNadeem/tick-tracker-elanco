import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { findCity } from "./cities";
import { prisma } from "./db";
import { validateReport, warningMessages } from "./report-rules";
import { sightingInclude, toSightingDto } from "./sightings";
import { findSpeciesBySlug } from "./species-catalog";
import type { FieldMessage } from "./types";
import { reportSchema } from "./validators";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type ReportImage = {
  bytes: Buffer;
  mimeType: string;
};

export type ReportResult =
  | { ok: true; sighting: ReturnType<typeof toSightingDto>; warnings: FieldMessage[] }
  | { ok: false; status: number; errors: FieldMessage[]; warnings: FieldMessage[] };

function formText(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function reportInputFromForm(form: FormData) {
  const raw: Record<string, string> = {};
  for (const key of [
    "observedDate",
    "observedTime",
    "region",
    "species",
    "severity",
    "locationLabel",
    "reporterNote",
    "lat",
    "lng",
  ]) {
    const value = formText(form, key);
    if (value) raw[key] = value;
  }

  const file = form.get("image");
  const image = file instanceof File && file.size > 0 ? file : null;
  return { raw, image };
}

async function saveImage(image: ReportImage) {
  const filename = `${randomUUID()}.jpg`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(directory, { recursive: true });
  const output = await sharp(image.bytes)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  const filePath = path.join(directory, filename);
  await fs.writeFile(filePath, output);
  return { filePath, imageUrl: `/uploads/${filename}` };
}

export async function createUserSighting(input: {
  raw: Record<string, string>;
  image: ReportImage | null;
}): Promise<ReportResult> {
  const parsed = reportSchema.safeParse(input.raw);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "form",
        message: issue.message,
      })),
      warnings: [],
    };
  }

  const data = parsed.data;
  const errors = validateReport(data);
  const city = findCity(data.region);
  const species = findSpeciesBySlug(data.species);
  const observedAt = new Date(`${data.observedDate}T${data.observedTime}:00.000Z`);

  if (input.image) {
    if (!ALLOWED_IMAGE_TYPES.has(input.image.mimeType)) {
      errors.push({ field: "image", message: "Upload a JPEG, PNG, WEBP, or GIF" });
    } else if (input.image.bytes.byteLength > MAX_IMAGE_BYTES) {
      errors.push({ field: "image", message: "Images must be 5 MB or smaller" });
    }
  }

  if (errors.length > 0 || !city || !species || Number.isNaN(observedAt.getTime())) {
    return { ok: false, status: 400, errors, warnings: [] };
  }

  const warnings = warningMessages(data, Boolean(input.image));
  const region = await prisma.region.findUnique({ where: { name: city.name } });
  const speciesRow = await prisma.species.findUnique({ where: { slug: species.slug } });
  if (!region || !speciesRow) {
    return {
      ok: false,
      status: 500,
      errors: [{ field: "form", message: "Reference data is missing. Run the database seed and try again." }],
      warnings: [],
    };
  }

  let stored: { filePath: string; imageUrl: string } | null = null;
  try {
    if (input.image) {
      stored = await saveImage(input.image);
    }
    const row = await prisma.sighting.create({
      data: {
        speciesId: speciesRow.id,
        regionId: region.id,
        severity: data.severity ?? null,
        observedAt,
        locationLabel: data.locationLabel || null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        reporterNote: data.reporterNote || null,
        imageUrl: stored?.imageUrl ?? null,
        source: "user_submitted",
      },
      include: sightingInclude,
    });
    return { ok: true, sighting: toSightingDto(row), warnings };
  } catch (error) {
    if (stored) {
      await fs.unlink(stored.filePath).catch(() => undefined);
    }
    console.error(error);
    return {
      ok: false,
      status: 500,
      errors: [{ field: "form", message: "The sighting could not be saved" }],
      warnings: [],
    };
  }
}

export async function imageFromFile(file: File): Promise<ReportImage> {
  return {
    bytes: Buffer.from(await file.arrayBuffer()),
    mimeType: file.type,
  };
}
