import { NextResponse } from "next/server";
import { CASE_FIELDS, cleanPayload, readJson, requireClinicAdmin } from "@/lib/clinic-api";
export async function GET() {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const [assets, candidates] = await Promise.all([
    auth.supabase.from("case_assets").select("*, clients(client_code, display_name)").order("created_at", { ascending: false }).limit(80),
    auth.supabase.from("case_asset_candidates").select("*").limit(80)
  ]);
  const error = assets.error || candidates.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ case_assets: assets.data ?? [], case_candidates: candidates.data ?? [] });
}
export async function POST(req: Request) {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const payload = cleanPayload(await readJson(req), CASE_FIELDS);
  const { data, error } = await auth.supabase.from("case_assets").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ case_asset: data }, { status: 201 });
}
