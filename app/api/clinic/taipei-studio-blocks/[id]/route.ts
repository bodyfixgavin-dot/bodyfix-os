import { NextResponse } from "next/server";
import { STUDIO_BLOCK_FIELDS, cleanPayload, readJson, requireClinicAdmin } from "@/lib/clinic-api";
type Params = { params: Promise<{ id: string }> };
export async function PATCH(req: Request, ctx: Params) {
  const auth = await requireClinicAdmin("/api/clinic/taipei-studio-blocks/[id]");
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const payload = cleanPayload(await readJson(req), STUDIO_BLOCK_FIELDS) as Record<string, unknown>;
  payload.updated_at = new Date().toISOString();
  const { data, error } = await auth.supabase.from("taipei_studio_blocks").update(payload).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ taipei_studio_block: data });
}
