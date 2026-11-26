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
  const submissions = (data ?? []).map(item => {
    if (item.source !== "public_intake_v2" || item.raw_payload?.version === "2.0") return item;
    try {
      const record = JSON.parse(item.raw_message || "");
      return record?.version === "2.0" && record.answers ? { ...item, raw_payload: record } : item;
    } catch { return item; }
  });
  const candidateIds = [...new Set(submissions.flatMap((item) => Array.isArray(item.candidate_client_ids) ? item.candidate_client_ids : []))];
  const { data: clients, error: clientsError } = candidateIds.length
    ? await auth.supabase.from("clients").select("id, display_name, birthday, phone, line_id, instagram, last_session_date").in("id", candidateIds)
    : { data: [], error: null };
  if (clientsError) return NextResponse.json({ error: clientsError.message }, { status: 500 });
  const { data: aliases, error: aliasesError } = candidateIds.length
    ? await auth.supabase.from("client_aliases").select("client_id, alias").in("client_id", candidateIds)
    : { data: [], error: null };
  if (aliasesError) return NextResponse.json({ error: aliasesError.message }, { status: 500 });
  const { data: identifiers, error: identifiersError } = candidateIds.length
    ? await auth.supabase.from("client_identifiers").select("client_id, identifier_type, identifier_value, normalized_value").in("client_id", candidateIds)
    : { data: [], error: null };
  if (identifiersError) return NextResponse.json({ error: identifiersError.message }, { status: 500 });
  const candidate_clients = (clients ?? []).map((client) => ({
    ...client,
    aliases: (aliases ?? []).filter((alias) => alias.client_id === client.id).map((alias) => alias.alias),
    identifiers: (identifiers ?? []).filter((identifier) => identifier.client_id === client.id),
  }));
  return NextResponse.json({ submissions, candidate_clients }, { headers: { "Cache-Control": "private, no-store" } });
}
