import { NextResponse } from "next/server";
import { requireClinicAdmin } from "@/lib/clinic-api";
import { SERVICES, STAFF_LEVELS } from "@/src/bodyfix-foundation";

const conversionServiceCodes = [
  "fascia_chain_reset_60",
  "multi_line_reset_90",
  "training_12_foundation",
  "training_24_plus_12_bundle",
] as const;

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function safeCount(items: Record<string, unknown>[], predicate: (item: Record<string, unknown>) => boolean) {
  return items.filter(predicate).length;
}

export async function GET() {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;

  const [{ data: candidates, error: candidateError }, { data: clients, error: clientError }] = await Promise.all([
    auth.supabase.from("plan_candidate_summary").select("*"),
    auth.supabase
      .from("client_progress_summary")
      .select("*")
      .order("last_session_date", { ascending: false, nullsFirst: false })
      .limit(20),
  ]);

  if (candidateError) return NextResponse.json({ error: candidateError.message }, { status: 500 });
  if (clientError) return NextResponse.json({ error: clientError.message }, { status: 500 });

  const planCandidates = (candidates ?? []) as Record<string, unknown>[];
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekStart = startOfWeek(now).toISOString();

  const sentStatuses = new Set(["sent", "discussing", "won", "lost", "nurture"]);
  const wonStatuses = new Set(["won", "accepted"]);
  const lostStatuses = new Set(["lost", "rejected"]);
  const followupStatuses = new Set(["sent", "discussing", "nurture", "pitched"]);

  const overview = {
    sent_this_week: safeCount(planCandidates, (item) => sentStatuses.has(String(item.status)) && String(item.sent_at ?? item.updated_at ?? "") >= weekStart),
    won_this_week: safeCount(planCandidates, (item) => wonStatuses.has(String(item.status)) && String(item.won_at ?? item.updated_at ?? "") >= weekStart),
    lost_this_week: safeCount(planCandidates, (item) => lostStatuses.has(String(item.status)) && String(item.lost_at ?? item.updated_at ?? "") >= weekStart),
    three_session_count: safeCount(planCandidates, (item) => String(item.offer_type ?? item.suggested_plan_type) === "three_session_reset"),
    twelve_session_count: safeCount(planCandidates, (item) => String(item.offer_type ?? item.suggested_plan_type) === "twelve_session_program"),
    deep_integration_count: safeCount(planCandidates, (item) => String(item.offer_type ?? item.suggested_plan_type) === "deep_integration_24_plus_12"),
    pending_followup_count: safeCount(planCandidates, (item) => followupStatuses.has(String(item.status)) && Boolean(item.next_followup_at)),
    overdue_followup_count: safeCount(planCandidates, (item) => followupStatuses.has(String(item.status)) && String(item.next_followup_at ?? "9999-12-31").slice(0, 10) < today),
  };

  const serviceReferences = SERVICES.filter((service) => conversionServiceCodes.includes(service.serviceCode as (typeof conversionServiceCodes)[number])).map((service) => ({
    service_code: service.serviceCode,
    name_zh: service.nameZh,
    recommended_price_twd: service.recommendedPriceTwd,
    positioning: service.positioning,
    revenue_model: service.revenueModel,
    case_by_case: service.revenueModel === "case_by_case",
    is_high_trust: Boolean(service.isHighRiskOrHighTrust) || service.minimumStaffLevelId === "GAVIN_ONLY",
    minimum_staff_level: service.minimumStaffLevelId,
    minimum_staff_level_name: STAFF_LEVELS.find((staff) => staff.id === service.minimumStaffLevelId)?.nameZh ?? service.minimumStaffLevelId,
  }));

  return NextResponse.json({
    plan_candidates: planCandidates,
    client_candidates: clients ?? [],
    overview,
    service_references: serviceReferences,
  });
}
