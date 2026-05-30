import { NextResponse } from "next/server";
import { RECORD_FIELDS, cleanPayload, readJson, requireClinicAdmin } from "@/lib/clinic-api";

type Params = { params: Promise<{ id: string }> };
export async function PATCH(req: Request, ctx: Params) {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const payload = cleanPayload(await readJson(req), RECORD_FIELDS);
  payload.updated_at = new Date().toISOString();
  const { data, error } = await auth.supabase.from("service_records").update(payload).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ service_record: data });
}
