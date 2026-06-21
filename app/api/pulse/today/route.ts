import { NextRequest, NextResponse } from "next/server";
import { getPulseMetrics } from "@/lib/pulse/data";

export async function GET(request: NextRequest) {
  const debug = request.nextUrl.searchParams.get("debug") === "1";

  return NextResponse.json(await getPulseMetrics({ debug }), {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" }
  });
}
