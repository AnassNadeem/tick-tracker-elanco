import { connection } from "next/server";
import { getHealth } from "@/lib/stats";

export async function GET() {
  await connection();
  const health = await getHealth();
  return Response.json(health, {
    status: health.db === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
