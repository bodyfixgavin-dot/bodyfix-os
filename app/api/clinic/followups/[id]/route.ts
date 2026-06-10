import { NextResponse } from "next/server";
import { readJson, requireClinicAdmin } from "@/lib/clinic-api";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Params) {
  const auth = await requireClinicAdmin("/api/clinic/followups/[id]");
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const body = await readJson(req) as Record<string, unknown>;
  const action = body.action;
  let payload: Record<string, unknown>;

  if (action === "complete") {
    payload = { status: "completed" };
  } else if (action === "postpone") {
    const dueDate = typeof body.due_date === "string" ? body.due_date.slice(0, 10) : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return NextResponse.json({ error: "延後日期格式錯誤。" }, { status: 400 });
    payload = { due_date: dueDate };
  } else {
    return NextResponse.json({ error: "不支援的追蹤操作。" }, { status: 400 });
  }

  const { data, error } = await auth.supabase.from("followup_tasks").update(payload).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ task: data });
}
