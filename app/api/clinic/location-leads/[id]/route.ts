import { NextResponse } from "next/server";
import { LOCATION_LEAD_FIELDS, cleanPayload, readJson, requireClinicAdmin } from "@/lib/clinic-api";
type Params = { params: Promise<{ id: string }> };
export async function PATCH(req: Request, ctx: Params) {
  const auth = await requireClinicAdmin("/api/clinic/location-leads/[id]");
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const payload = cleanPayload(await readJson(req), LOCATION_LEAD_FIELDS) as Record<string, unknown>;
  payload.updated_at = new Date().toISOString();
  const { data, error } = await auth.supabase.from("location_demand_leads").update(payload).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ lead: data });
}
