import { NextResponse } from "next/server";
import { HOMEWORK_FIELDS, cleanPayload, readJson, requireClinicAdmin } from "@/lib/clinic-api";
export async function POST(req: Request) {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;
  const payload = cleanPayload(await readJson(req), HOMEWORK_FIELDS);
  const { data, error } = await auth.supabase.from("homework_tasks").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ homework_task: data }, { status: 201 });
}
