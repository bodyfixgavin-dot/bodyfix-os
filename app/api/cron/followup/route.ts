import { NextResponse } from "next/server";
import { pushLineMessage } from "@/lib/bodyfix-ai/line";
import { SEVEN_DAY_FOLLOWUP, THREE_DAY_FOLLOWUP } from "@/lib/bodyfix-ai/prompt";
import { ensureSheetHeaders, listCrmRecords, markFollowupSent } from "@/lib/bodyfix-ai/sheets";
import { getAutomationDecision } from "@/lib/bodyfix-ai/conversation-state";
import type { CrmRecord } from "@/lib/bodyfix-ai/types";

export const runtime = "nodejs";

const CLOSED_STAGES = new Set(["booked", "not_fit", "human_takeover"]);

export async function GET(req: Request) {
  const unauthorized = verifyCron(req);
  if (unauthorized) return unauthorized;

  await ensureSheetHeaders();
  const rows = await listCrmRecords();
  const now = new Date();
  const sent: Array<{ userId: string; action: string }> = [];
  const skipped: Array<{ userId: string; action: string; reason: string }> = [];
  const failed: Array<{ userId: string; error: string }> = [];

  for (const row of rows) {
    const action = getFollowupAction(row.record, now);
    if (!action) continue;

    const message = action === "followup_3_days" ? THREE_DAY_FOLLOWUP : SEVEN_DAY_FOLLOWUP;
    try {
      const decision = await getAutomationDecision(row.record.userId);
      if (!decision.allowSend) {
        skipped.push({ userId: row.record.userId, action, reason: decision.reason });
        continue;
      }

      await pushLineMessage(row.record.userId, message);
      await markFollowupSent(row.record, row.rowNumber, message, action);
      sent.push({ userId: row.record.userId, action });
    } catch (error) {
      failed.push({ userId: row.record.userId, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return NextResponse.json({ ok: failed.length === 0, sent, skipped, failed });
}

function verifyCron(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });

  const url = new URL(req.url);
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const querySecret = url.searchParams.get("secret");
  if (bearer !== secret && querySecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

function getFollowupAction(record: CrmRecord, now: Date): "followup_3_days" | "followup_7_days" | null {
  if (!record.userId || CLOSED_STAGES.has(record.bookingStage)) return null;

  const followupCount = Number(record.followupCount) || 0;
  const lastUser = parseDate(record.lastUserMessageAt || record.firstSeenAt);
  const lastBot = parseDate(record.lastBotMessageAt);
  const lastFollowup = parseDate(record.lastFollowupAt);

  if (!lastBot) return null;
  if (lastUser && lastUser > lastBot) return null;
  if (lastFollowup && hoursBetween(lastFollowup, now) < 20) return null;

  const elapsed = elapsedSince(lastUser || lastBot, now);
  const testMode = process.env.FOLLOWUP_TEST_MODE === "true";
  const threeDayThreshold = testMode ? 3 * 60 * 1000 : 3 * 24 * 60 * 60 * 1000;
  const sevenDayThreshold = testMode ? 7 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  if (followupCount === 0 && elapsed >= threeDayThreshold) return "followup_3_days";
  if (followupCount === 1 && record.bookingStage !== "booked" && elapsed >= sevenDayThreshold) return "followup_7_days";
  return null;
}

function parseDate(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function elapsedSince(date: Date, now: Date) {
  return now.getTime() - date.getTime();
}

function hoursBetween(start: Date, end: Date) {
  return (end.getTime() - start.getTime()) / (60 * 60 * 1000);
}
