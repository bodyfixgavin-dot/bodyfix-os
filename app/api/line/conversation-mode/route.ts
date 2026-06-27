import { NextResponse } from "next/server";
import { requireClinicAdmin, readJson } from "@/lib/clinic-api";
import {
  getConversationState,
  pauseConversation,
  resumeBot,
  setHumanTakeover
} from "@/lib/bodyfix-ai/conversation-state";

export const runtime = "nodejs";

type Action = "takeover_60" | "takeover_120" | "takeover_indefinite" | "pause" | "resume_bot";

export async function GET(req: Request) {
  const auth = await requireClinicAdmin("/api/line/conversation-mode");
  if (!auth.ok) return auth.response;

  const lineUserId = new URL(req.url).searchParams.get("line_user_id")?.trim();
  if (!lineUserId) return NextResponse.json({ error: "line_user_id is required" }, { status: 400 });

  try {
    return NextResponse.json({ state: await getConversationState(lineUserId) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireClinicAdmin("/api/line/conversation-mode");
  if (!auth.ok) return auth.response;

  const body = await readJson(req) as { line_user_id?: string; action?: Action; updated_by?: string };
  const lineUserId = body.line_user_id?.trim();
  const action = body.action;
  const updatedBy = body.updated_by?.trim() || "bodyfix_admin";

  if (!lineUserId) return NextResponse.json({ error: "line_user_id is required" }, { status: 400 });
  if (!action) return NextResponse.json({ error: "action is required" }, { status: 400 });

  try {
    const state = action === "takeover_60"
      ? await setHumanTakeover(lineUserId, 60, updatedBy)
      : action === "takeover_120"
        ? await setHumanTakeover(lineUserId, 120, updatedBy)
        : action === "takeover_indefinite"
          ? await setHumanTakeover(lineUserId, null, updatedBy)
          : action === "pause"
            ? await pauseConversation(lineUserId, updatedBy)
            : action === "resume_bot"
              ? await resumeBot(lineUserId, updatedBy)
              : null;

    if (!state) return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    return NextResponse.json({ ok: true, state });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
