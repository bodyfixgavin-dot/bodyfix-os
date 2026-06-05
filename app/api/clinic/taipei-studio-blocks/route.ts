import { NextResponse } from "next/server";
import { STUDIO_BLOCK_FIELDS, cleanPayload, readJson, requireClinicAdmin } from "@/lib/clinic-api";
export async function GET() {
  const auth = await requireClinicAdmin("/api/clinic/taipei-studio-blocks");
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("taipei_studio_blocks").select("*").order("block_date", { ascending: true }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ taipei_studio_blocks: data ?? [] });
}
export async function POST(req: Request) {
  const auth = await requireClinicAdmin("/api/clinic/taipei-studio-blocks");
  if (!auth.ok) return auth.response;
  const payload = cleanPayload(await readJson(req), STUDIO_BLOCK_FIELDS) as Record<string, unknown>;
  payload.updated_at = new Date().toISOString();
  const { data, error } = await auth.supabase.from("taipei_studio_blocks").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ taipei_studio_block: data }, { status: 201 });
}
