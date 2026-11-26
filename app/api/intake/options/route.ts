import { NextResponse } from "next/server";
import { getIntakePlaces } from "@/lib/intake-options";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ places: await getIntakePlaces() }, { headers: { "Cache-Control": "no-store" } });
}
