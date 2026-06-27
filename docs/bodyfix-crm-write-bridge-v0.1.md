# BodyFix CRM Write Bridge v0.1

## Scope

This first version only supports:

- safe client resolution
- preview without database writes
- confirmed commit
- atomic `service_records` + optional `followups`
- idempotency and audit logging

It does not create `plan_candidates`, case assets, homework tasks, or MCP tools yet.

## Why the original ZIP needed changes

The uploaded ZIP did not match the current BodyFix OS schema in several places:

- `clients` does not currently expose `line_user_id`.
- `followups` uses `scheduled_date`, `followup_type`, `message_summary`, `next_action`, `response_status`, and `service_record_id`.
- `service_records` does not contain `created_by`, `source`, `calendar_event_id`, or `raw_summary` columns.
- the original SQL did not actually enforce idempotency.
- the original display-name lookup selected one row before checking ambiguity.
- preview and commit were not cryptographically bound to the same payload.

This branch aligns the bridge with `supabase/clinic-v1.sql` and the current Clinic API fields.

## Files

- `lib/integrations/bodyfix-crm-schema.ts`
- `lib/integrations/bodyfix-crm-auth.ts`
- `lib/integrations/bodyfix-client-resolver.ts`
- `app/api/integrations/bodyfix-crm/preview/route.ts`
- `app/api/integrations/bodyfix-crm/commit/route.ts`
- `supabase/bodyfix-crm-write-bridge-v0.1.sql`
- `supabase/bodyfix-crm-write-bridge-v0.1-verify.sql`

## Deployment order

1. Review this branch. Do not merge yet.
2. Add `BODYFIX_CRM_TOOL_SECRET` to the Vercel Preview environment. Generate it with `openssl rand -hex 32`.
3. Run `supabase/bodyfix-crm-write-bridge-v0.1.sql` in Supabase SQL Editor.
4. Run the verification SQL and confirm the table and function exist.
5. Deploy the branch as a Vercel Preview.
6. Test `preview` first, then send the returned `commit_request` unchanged to `commit`.
7. Confirm the new record appears in the client timeline and follow-up list.
8. Repeat the same `commit_request`; it must return `duplicate: true` without creating another record.

## Y U you preview request

```json
{
  "client_search": { "display_name": "Y U you" },
  "service": {
    "service_date": "2026-06-27",
    "record_mode": "full",
    "service_code": "BF-PC-001",
    "service_name_snapshot": "骨盆核心整理",
    "duration_minutes": 60,
    "main_complaint": "深蹲下降時前足壓力流失，腳趾容易抬起",
    "main_tension_area": "骨盆與髖膝協同",
    "strategy": "骨盆核心整理與動作判讀",
    "after_change": "本次完成整理與深蹲觀察",
    "next_focus": "HBD 大腿外展啟動、足底支撐與髖膝協同",
    "calendar_event_id": "k2lfqonmm13shqn7chv00h1bh4",
    "raw_summary": "起身時膝伸過早、過多，髖伸與臀肌向心收縮銜接不足。"
  },
  "followup": {
    "scheduled_date": "2026-07-04",
    "followup_type": "day7",
    "message_summary": "確認本週或下週平日教練課日期",
    "next_action": "等待客戶回覆；必要時安排板橋教練課",
    "response_status": "not_sent"
  },
  "idempotency_key": "calendar:k2lfqonmm13shqn7chv00h1bh4:2026-06-27"
}
```

The preview response returns a `commit_request`. The commit endpoint accepts that object exactly as returned.

## Acceptance criteria

- Preview produces no database writes.
- Partial-name matches always return `ambiguous`.
- Commit without the correct confirmation token returns HTTP 409.
- Reusing the same idempotency key does not create another record.
- Service record and follow-up succeed together or roll back together.
- Supabase service-role credentials remain server-side only.
