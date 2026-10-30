import { connection } from "next/server";
import { prisma } from "@/lib/db";
import type { SpeciesDto } from "@/lib/types";

export async function GET() {
  await connection();

  try {
    const rows = await prisma.species.findMany({ orderBy: { name: "asc" } });
    const data: SpeciesDto[] = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      latinName: row.latinName,
      riskLevel: row.riskLevel,
      description: row.description,
      identificationTips: row.identificationTips,
      imageUrl: row.imageUrl,
    }));
    return Response.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not load species" }, { status: 500 });
  }
}
