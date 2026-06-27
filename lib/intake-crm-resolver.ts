export type ResolutionStatus = "linked_existing" | "created_new" | "needs_review";
export type IntakeContact = { name: string; birthday?: string | null; lineUserId?: string | null; lineId?: string | null; phone?: string | null; instagram?: string | null };
export type CandidateClient = { id: string; display_name?: string | null; birthday?: string | null; line_user_id?: string | null; line_id?: string | null; phone?: string | null; instagram?: string | null; aliases?: string[]; identifiers?: { identifier_type: string; normalized_value?: string | null; identifier_value?: string | null; is_verified?: boolean | null; is_active?: boolean | null }[] };
export type ResolveResult = { status: ResolutionStatus; clientId?: string; reason: string; candidateClientIds: string[] };
export function normalizeText(value?: string | null) { return (value ?? "").trim().toLowerCase().replace(/^@/, "").replace(/\s+/g, ""); }
export function normalizePhone(value?: string | null) { return (value ?? "").replace(/[^0-9+]/g, "").replace(/^\+886/, "0"); }
function idValue(c: CandidateClient, type: string) { const found = c.identifiers?.find((i) => i.identifier_type === type && i.is_active !== false); return normalizeText(found?.normalized_value || found?.identifier_value || (c as Record<string, unknown>)[type] as string | null); }
function phoneValue(c: CandidateClient) { const found = c.identifiers?.find((i) => i.identifier_type === "phone" && i.is_active !== false); return normalizePhone(found?.normalized_value || found?.identifier_value || c.phone); }
function sameBirthday(a?: string | null, b?: string | null) { return !!a && !!b && a.slice(0, 10) === b.slice(0, 10); }
function birthdayConflict(a?: string | null, b?: string | null) { return !!a && !!b && a.slice(0, 10) !== b.slice(0, 10); }
function nameMatch(input: IntakeContact, c: CandidateClient) { const n = normalizeText(input.name); return !!n && [c.display_name, ...(c.aliases ?? [])].some((v) => normalizeText(v) === n); }
function contactMatch(input: IntakeContact, c: CandidateClient) { return (!!input.phone && normalizePhone(input.phone) === phoneValue(c)) || (!!input.lineId && normalizeText(input.lineId) === idValue(c, "line_id")) || (!!input.instagram && normalizeText(input.instagram) === idValue(c, "instagram")) || (!!input.lineUserId && normalizeText(input.lineUserId) === idValue(c, "line_user_id")); }
export function resolveIntakeClient(input: IntakeContact, candidates: CandidateClient[]): ResolveResult {
  const matched = candidates.filter((c) => {
    if (input.lineUserId && normalizeText(input.lineUserId) === idValue(c, "line_user_id")) return true;
    if (input.phone && normalizePhone(input.phone) === phoneValue(c)) return true;
    if (input.lineId && normalizeText(input.lineId) === idValue(c, "line_id")) return true;
    if (input.instagram && normalizeText(input.instagram) === idValue(c, "instagram")) return true;
    return nameMatch(input, c);
  });
  const conflict = matched.find((c) => birthdayConflict(input.birthday, c.birthday) && contactMatch(input, c));
  if (conflict) return { status: "needs_review", reason: "identifier_birthday_conflict", candidateClientIds: matched.map((c) => c.id) };
  const lineUser = matched.filter((c) => input.lineUserId && normalizeText(input.lineUserId) === idValue(c, "line_user_id"));
  if (lineUser.length === 1) return { status: "linked_existing", clientId: lineUser[0].id, reason: "line_user_id_match", candidateClientIds: [lineUser[0].id] };
  if (lineUser.length > 1) return { status: "needs_review", reason: "multiple_line_user_id_candidates", candidateClientIds: lineUser.map((c) => c.id) };
  if (!input.birthday) {
    if (matched.length) return { status: "needs_review", reason: "birthday_missing_non_stable_match", candidateClientIds: matched.map((c) => c.id) };
    return { status: "created_new", reason: "no_candidate", candidateClientIds: [] };
  }
  const exact = matched.filter((c) => sameBirthday(input.birthday, c.birthday) && ((!!input.phone && normalizePhone(input.phone) === phoneValue(c)) || (!!input.lineId && normalizeText(input.lineId) === idValue(c, "line_id")) || (!!input.instagram && normalizeText(input.instagram) === idValue(c, "instagram")) || (nameMatch(input, c) && contactMatch(input, c))));
  if (exact.length === 1) return { status: "linked_existing", clientId: exact[0].id, reason: "birthday_and_contact_match", candidateClientIds: [exact[0].id] };
  if (exact.length > 1) return { status: "needs_review", reason: "multiple_candidates", candidateClientIds: exact.map((c) => c.id) };
  const sameNameBirthday = matched.filter((c) => nameMatch(input, c) && sameBirthday(input.birthday, c.birthday));
  if (sameNameBirthday.length) return { status: "needs_review", reason: "same_name_birthday_contact_diff_or_missing", candidateClientIds: sameNameBirthday.map((c) => c.id) };
  return { status: "created_new", reason: "no_safe_match", candidateClientIds: matched.map((c) => c.id) };
}
