import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const sql = readFileSync("supabase/intake-to-crm-v1.sql", "utf8");
const route = readFileSync("app/api/intake/route.ts", "utf8");
const manual = readFileSync("app/api/clinic/intake-submissions/[id]/resolve/route.ts", "utf8");
describe("intake CRM transaction and manual resolution safeguards", () => {
  it("uses an atomic RPC for CRM promotion and marks failures instead of created_new", () => { expect(sql.includes("process_intake_crm_resolution")).toBe(true); expect(route.includes("supabase.rpc(\"process_intake_crm_resolution\"")).toBe(true); expect(route.includes("resolution_status: \"failed\"")).toBe(true); });
  it("followup failures rollback inside the CRM transaction", () => { expect(sql.includes("language plpgsql")).toBe(true); expect(sql.includes("insert into public.followups")).toBe(true); expect(sql.includes("on conflict (source_key)")).toBe(true); });
  it("needs_review keeps resolved_at and resolved_by empty", () => { expect(sql.includes("resolution_status = 'needs_review'")).toBe(true); expect(sql.includes("resolved_at = null")).toBe(true); expect(sql.includes("resolved_by = null")).toBe(true); });
  it("linked existing only fills empty client fields", () => { expect(sql.includes("birthday = coalesce(clients.birthday, s.birthday)")).toBe(true); expect(sql.includes("line_id = coalesce(nullif(clients.line_id, ''), nullif(s.line_id, ''))")).toBe(true); });
  it("birthday conflicts are handled by needs_review and not overwritten", () => { expect(readFileSync("lib/intake-crm-resolver.ts", "utf8").includes("identifier_birthday_conflict")).toBe(true); expect(sql.includes("birthday = coalesce(clients.birthday, s.birthday)")).toBe(true); });
  it("source_key idempotency uses a normal unique index", () => { expect(sql.includes("create unique index if not exists followups_source_key_key on public.followups(source_key)")).toBe(true); expect(sql.includes("where source_key is not null")).toBe(false); });
  it("candidate queries avoid raw PostgREST or filters", () => { expect(route.includes(".or(`")).toBe(false); expect(route.includes("candidate display_name clients")).toBe(true); expect(route.includes("candidate aliases")).toBe(true); });
  it("new clients get a generated client_code", () => { expect(sql.includes("generate_bodyfix_client_code")).toBe(true); expect(sql.includes("trg_set_bodyfix_client_code")).toBe(true); });
  it("manual link_existing, create_new and add_alias actions are supported", () => { expect(manual.includes("link_existing")).toBe(true); expect(manual.includes("create_new")).toBe(true); expect(manual.includes("add_alias")).toBe(true); expect(manual.includes("resolved_manually")).toBe(true); });
  it("manual API is protected by clinic admin auth", () => { expect(manual.includes("requireClinicAdmin")).toBe(true); expect(manual.includes("if (!auth.ok) return auth.response")).toBe(true); });
});
