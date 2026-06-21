import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type ClientRow = { id: string; client_code?: string | null; display_name?: string | null; nickname?: string | null; client_name?: string | null; phone?: string | null; line_id?: string | null; ig_id?: string | null; instagram?: string | null; matched_alias?: string | null };

const select = "id,client_code,display_name,nickname,client_name,phone,line_id,ig_id,instagram";

export async function GET(request: Request) {
  const db = createSupabaseAdminClient();
  if (!db) return NextResponse.json([]);
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const escaped = q.replaceAll("%", "").replaceAll(",", "");
  const clientQuery = db.from("clients").select(select).limit(20);
  const clients = escaped
    ? await clientQuery.or(`client_code.ilike.%${escaped}%,display_name.ilike.%${escaped}%,nickname.ilike.%${escaped}%,client_name.ilike.%${escaped}%,phone.ilike.%${escaped}%,line_id.ilike.%${escaped}%,ig_id.ilike.%${escaped}%,instagram.ilike.%${escaped}%`)
    : await clientQuery.order("updated_at", { ascending: false });
  const byId = new Map<string, ClientRow>((clients.data ?? []).map((client) => [client.id, client as ClientRow]));

  if (escaped) {
    const aliases = await db.from("client_aliases").select("client_id,alias_name,clients!inner(id,client_code,display_name,nickname,client_name,phone,line_id,ig_id,instagram)").ilike("alias_name", `%${escaped}%`).limit(20);
    for (const alias of aliases.data ?? []) {
      const row = (alias as unknown as { alias_name: string; clients: ClientRow }).clients;
      byId.set(row.id, { ...row, matched_alias: (alias as { alias_name: string }).alias_name });
    }
  }

  return NextResponse.json([...byId.values()].slice(0, 30));
}
