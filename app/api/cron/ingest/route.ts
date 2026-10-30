import { connection } from "next/server";
import { ingestUpstream } from "@/lib/ingest";

export async function GET(request: Request) {
  await connection();

  const secret = process.env.CRON_SECRET;
  const authorized = request.headers.get("authorization") === `Bearer ${secret}`;
  if (process.env.NODE_ENV === "production" || secret) {
    if (!secret || !authorized) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await ingestUpstream();
    return Response.json(result);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ingestion failed" }, { status: 502 });
  }
}
