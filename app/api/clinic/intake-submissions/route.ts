import { NextResponse } from "next/server";
import { requireClinicAdmin } from "@/lib/clinic-api";

export async function GET() {
  const auth = await requireClinicAdmin("/api/clinic/intake-submissions");
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("intake_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submissions: data ?? [] });
}
