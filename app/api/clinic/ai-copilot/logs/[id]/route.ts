import { NextResponse } from "next/server";
import { readJson } from "@/lib/clinic-api";
import { requireClinicAdmin } from "@/lib/clinic-api";
import { validateLogStatus } from "../../_helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireClinicAdmin("/api/clinic/ai-copilot/logs/[id]");
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await readJson(req);
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    if (!validateLogStatus(body.status)) return NextResponse.json({ error: "Invalid AI log status" }, { status: 400 });
    payload.status = body.status;
  }
  if (Object.prototype.hasOwnProperty.call(body, "user_feedback")) {
    payload.user_feedback = typeof body.user_feedback === "string" ? body.user_feedback : null;
  }

  const { data, error } = await auth.supabase.from("ai_copilot_logs").update(payload).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ log: data });
}
