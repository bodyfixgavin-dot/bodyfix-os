import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClientSearch } from "@/lib/integrations/bodyfix-crm-schema";

export type ClientCandidate = {
  client_id: string;
  client_code: string | null;
  display_name: string;
  line_id: string | null;
  phone: string | null;
  instagram: string | null;
  match_reason: string;
  match_confidence: number;
};

export type ClientResolution =
  | { status: "resolved"; client: ClientCandidate }
  | { status: "ambiguous"; candidates: ClientCandidate[] }
  | { status: "not_found"; message: string }
  | { status: "error"; message: string };

const selectColumns = "id, client_code, display_name, client_name, nickname, line_id, phone, instagram";

type ClientRow = {
  id: string;
  client_code: string | null;
  display_name: string | null;
  client_name: string | null;
  nickname: string | null;
  line_id: string | null;
  phone: string | null;
  instagram: string | null;
};

function displayName(row: ClientRow) {
  return row.display_name ?? row.nickname ?? row.client_name ?? "未命名客戶";
}

function candidate(row: ClientRow, matchReason: string, matchConfidence: number): ClientCandidate {
  return {
    client_id: row.id,
    client_code: row.client_code,
    display_name: displayName(row),
    line_id: row.line_id,
    phone: row.phone,
    instagram: row.instagram,
    match_reason: matchReason,
    match_confidence: matchConfidence
  };
}

function unique(rows: ClientRow[]) {
  return [...new Map(rows.map((row) => [row.id, row])).values()];
}

async function exactQuery(supabase: SupabaseClient, column: string, value: string) {
  return supabase.from("clients").select(selectColumns).eq(column, value).limit(5);
}

export async function resolveClient(supabase: SupabaseClient, search: ClientSearch): Promise<ClientResolution> {
  const exactMatchers: Array<[keyof ClientSearch, string, number]> = [
    ["client_id", "id", 1],
    ["line_id", "line_id", 1],
    ["phone", "phone", 0.98],
    ["instagram", "instagram", 0.98]
  ];

  for (const [key, column, confidence] of exactMatchers) {
    const value = search[key];
    if (!value) continue;
    const { data, error } = await exactQuery(supabase, column, String(value));
    if (error) return { status: "error", message: `客戶查詢失敗：${error.message}` };
    const rows = unique((data ?? []) as ClientRow[]);
    if (rows.length === 1) return { status: "resolved", client: candidate(rows[0], `${column} 完全相符`, confidence) };
    if (rows.length > 1) return { status: "ambiguous", candidates: rows.map((row) => candidate(row, `${column} 重複`, confidence)) };
    return { status: "not_found", message: `找不到 ${column} 相符的客戶` };
  }

  const name = search.display_name?.trim();
  if (!name) return { status: "not_found", message: "缺少可用的客戶辨識資料" };

  const exactResults = await Promise.all([
    exactQuery(supabase, "display_name", name),
    exactQuery(supabase, "nickname", name),
    exactQuery(supabase, "client_name", name)
  ]);
  const exactError = exactResults.find((result) => result.error)?.error;
  if (exactError) return { status: "error", message: `客戶查詢失敗：${exactError.message}` };
  const exactRows = unique(exactResults.flatMap((result) => (result.data ?? []) as ClientRow[]));
  if (exactRows.length === 1) return { status: "resolved", client: candidate(exactRows[0], "姓名完全相符", 0.95) };
  if (exactRows.length > 1) return { status: "ambiguous", candidates: exactRows.map((row) => candidate(row, "姓名完全相符但不唯一", 0.8)) };

  const partialResults = await Promise.all([
    supabase.from("clients").select(selectColumns).ilike("display_name", `%${name}%`).limit(5),
    supabase.from("clients").select(selectColumns).ilike("nickname", `%${name}%`).limit(5),
    supabase.from("clients").select(selectColumns).ilike("client_name", `%${name}%`).limit(5)
  ]);
  const partialError = partialResults.find((result) => result.error)?.error;
  if (partialError) return { status: "error", message: `客戶查詢失敗：${partialError.message}` };
  const partialRows = unique(partialResults.flatMap((result) => (result.data ?? []) as ClientRow[]));
  if (!partialRows.length) return { status: "not_found", message: "找不到符合名稱的客戶" };
  return { status: "ambiguous", candidates: partialRows.map((row) => candidate(row, "姓名部分相符，必須人工確認", 0.6)) };
}
