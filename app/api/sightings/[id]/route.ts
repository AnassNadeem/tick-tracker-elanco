import { connection } from "next/server";
import { getSighting } from "@/lib/sightings";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connection();
  const { id } = await params;

  try {
    const detail = await getSighting(id);
    if (!detail) {
      return Response.json({ error: "Sighting not found" }, { status: 404 });
    }
    return Response.json(detail, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not load that sighting" }, { status: 500 });
  }
}
