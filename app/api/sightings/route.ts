import { connection } from "next/server";
import { createUserSighting, imageFromFile, reportInputFromForm } from "@/lib/reports";
import { listSightings } from "@/lib/sightings";
import { fieldErrors, searchParamsToObject, sightingQuerySchema } from "@/lib/validators";

export async function GET(request: Request) {
  await connection();

  const url = new URL(request.url);
  const parsed = sightingQuerySchema.safeParse(searchParamsToObject(url.searchParams));
  if (!parsed.success) {
    return Response.json({ errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  try {
    const body = await listSightings(parsed.data);
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not load sightings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      { errors: [{ field: "form", message: "Submit the report as multipart form data" }], warnings: [] },
      { status: 400 },
    );
  }

  const { raw, image } = reportInputFromForm(form);
  let reportImage = null;
  if (image) {
    reportImage = await imageFromFile(image);
  }

  const result = await createUserSighting({ raw, image: reportImage });
  if (!result.ok) {
    return Response.json(
      { errors: result.errors, warnings: result.warnings },
      { status: result.status },
    );
  }

  return Response.json(
    { sighting: result.sighting, warnings: result.warnings },
    { status: 201 },
  );
}
