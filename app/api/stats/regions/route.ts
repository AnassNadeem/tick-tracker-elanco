import { connection } from "next/server";
import { getRegionStats } from "@/lib/stats";

export async function GET() {
  await connection();
  try {
    const data = await getRegionStats();
    return Response.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not load region stats" }, { status: 500 });
  }
}
