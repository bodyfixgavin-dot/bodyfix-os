import { NextRequest, NextResponse } from "next/server";
import { getPulseMetrics } from "@/lib/pulse/data";

export async function GET(request: NextRequest) {
  const debug = request.nextUrl.searchParams.get("debug") === "1";
  const metrics = await getPulseMetrics({ debug });
  const status = "ok" in metrics && metrics.ok === false ? 500 : 200;

  return NextResponse.json(metrics, {
    status,
    headers: { "Cache-Control": debug ? "no-store" : "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
