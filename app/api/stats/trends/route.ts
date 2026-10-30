import { connection } from "next/server";
import { getTrends } from "@/lib/stats";
import {
  fieldErrors,
  parseDateBound,
  searchParamsToObject,
  trendQuerySchema,
} from "@/lib/validators";

export async function GET(request: Request) {
  await connection();
  const url = new URL(request.url);
  const parsed = trendQuerySchema.safeParse(searchParamsToObject(url.searchParams));
  if (!parsed.success) {
    return Response.json({ errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const from = parsed.data.from ? parseDateBound(parsed.data.from, "start") : null;
  const to = parsed.data.to ? parseDateBound(parsed.data.to, "end") : null;

  try {
    const result = await getTrends({
      interval: parsed.data.interval,
      region: parsed.data.region,
      from,
      to,
    });
    if (!result.ok) {
      return Response.json(
        { errors: [{ field: "region", message: result.error }] },
        { status: 400 },
      );
    }
    return Response.json(
      { interval: result.interval, region: result.region, data: result.data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not load trends" }, { status: 500 });
  }
}
