-- BodyFix CRM Write Bridge v0.1
-- Additive migration: service_records + optional followups only.

create extension if not exists pgcrypto;

create table if not exists public.crm_intake_requests (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  client_id uuid references public.clients(id) on delete set null,
  service_record_id uuid references public.service_records(id) on delete set null,
  followup_id uuid references public.followups(id) on delete set null,
  source text not null default 'chatgpt_bodyfix_tool',
  request_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.crm_intake_requests enable row level security;

create or replace function public.bodyfix_crm_intake(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_request_id uuid;
  v_client_id uuid;
  v_record_id uuid;
  v_followup_id uuid;
  v_existing public.crm_intake_requests%rowtype;
  v_service jsonb := p_payload->'service';
  v_followup jsonb := p_payload->'followup';
  v_service_date date;
  v_followup_date date;
  v_notes text;
begin
  v_client_id := nullif(p_payload->>'client_id', '')::uuid;
  if v_client_id is null or not exists (select 1 from public.clients where id = v_client_id) then
    raise exception 'client_id not found';
  end if;
  if coalesce(length(trim(p_payload->>'idempotency_key')), 0) < 16 then
    raise exception 'invalid idempotency_key';
  end if;
  if v_service is null or jsonb_typeof(v_service) <> 'object' then
    raise exception 'service payload is required';
  end if;

  v_service_date := nullif(v_service->>'service_date', '')::date;
  if v_service_date is null or coalesce(length(trim(v_service->>'service_name_snapshot')), 0) < 2 then
    raise exception 'service_date and service_name_snapshot are required';
  end if;

  insert into public.crm_intake_requests (idempotency_key, client_id, source, request_payload)
  values (
    trim(p_payload->>'idempotency_key'),
    v_client_id,
    coalesce(nullif(p_payload->>'source', ''), 'chatgpt_bodyfix_tool'),
    p_payload
  )
  on conflict (idempotency_key) do nothing
  returning id into v_request_id;

  if v_request_id is null then
    select * into v_existing
    from public.crm_intake_requests
    where idempotency_key = trim(p_payload->>'idempotency_key');
    return jsonb_build_object(
      'status', 'success', 'duplicate', true,
      'client_id', v_existing.client_id,
      'service_record_id', v_existing.service_record_id,
      'followup_id', v_existing.followup_id,
      'message', '同一筆紀錄已存在，未重複新增'
    );
  end if;

  if v_followup is not null and jsonb_typeof(v_followup) = 'object' then
    v_followup_date := nullif(v_followup->>'scheduled_date', '')::date;
    if v_followup_date is null
      or coalesce(length(trim(v_followup->>'message_summary')), 0) = 0
      or coalesce(length(trim(v_followup->>'next_action')), 0) = 0 then
      raise exception 'followup fields are incomplete';
    end if;
  else
    v_followup := null;
  end if;

  v_notes := concat_ws(E'\n',
    nullif(v_service->>'internal_notes', ''),
    '來源：ChatGPT CRM Write Bridge',
    'idempotency_key：' || trim(p_payload->>'idempotency_key'),
    case when nullif(v_service->>'calendar_event_id', '') is not null then 'calendar_event_id：' || v_service->>'calendar_event_id' end,
    case when nullif(v_service->>'raw_summary', '') is not null then '口述摘要：' || v_service->>'raw_summary' end
  );

  insert into public.service_records (
    client_id, service_date, record_mode, service_code, service_name_snapshot,
    duration_minutes, price_twd, main_complaint, main_tension_area,
    processed_area, strategy, client_reaction, after_change, next_focus,
    internal_notes, dominant_fascia_line, body_region, satisfaction_score,
    followup_needed, next_followup_date, case_candidate, plan_candidate
  ) values (
    v_client_id,
    v_service_date,
    coalesce(nullif(v_service->>'record_mode', ''), 'quick'),
    nullif(v_service->>'service_code', ''),
    trim(v_service->>'service_name_snapshot'),
    nullif(v_service->>'duration_minutes', '')::integer,
    nullif(v_service->>'price_twd', '')::integer,
    nullif(v_service->>'main_complaint', ''),
    nullif(v_service->>'main_tension_area', ''),
    nullif(v_service->>'processed_area', ''),
    nullif(v_service->>'strategy', ''),
    nullif(v_service->>'client_reaction', ''),
    nullif(v_service->>'after_change', ''),
    nullif(v_service->>'next_focus', ''),
    v_notes,
    nullif(v_service->>'dominant_fascia_line', ''),
    nullif(v_service->>'body_region', ''),
    nullif(v_service->>'satisfaction_score', '')::integer,
    coalesce(nullif(v_service->>'followup_needed', '')::boolean, v_followup is not null),
    coalesce(nullif(v_service->>'next_followup_date', '')::date, v_followup_date),
    false,
    false
  ) returning id into v_record_id;

  if v_followup is not null then
    insert into public.followups (
      client_id, service_record_id, followup_type, scheduled_date,
      message_template, message_summary, response_status, next_action, is_done
    ) values (
      v_client_id,
      v_record_id,
      coalesce(nullif(v_followup->>'followup_type', ''), 'other'),
      v_followup_date,
      nullif(v_followup->>'message_template', ''),
      trim(v_followup->>'message_summary'),
      coalesce(nullif(v_followup->>'response_status', ''), 'not_sent'),
      trim(v_followup->>'next_action'),
      false
    ) returning id into v_followup_id;
  end if;

  update public.clients
  set last_session_date = case when last_session_date is null or v_service_date > last_session_date then v_service_date else last_session_date end,
      next_followup_date = coalesce(v_followup_date, next_followup_date),
      updated_at = now()
  where id = v_client_id;

  update public.crm_intake_requests
  set service_record_id = v_record_id, followup_id = v_followup_id, completed_at = now()
  where id = v_request_id;

  return jsonb_build_object(
    'status', 'success', 'duplicate', false,
    'client_id', v_client_id,
    'service_record_id', v_record_id,
    'followup_id', v_followup_id,
    'message', '已成功寫入 BodyFix CRM'
  );
end;
$$;

revoke all on table public.crm_intake_requests from public, anon, authenticated;
grant select, insert, update on table public.crm_intake_requests to service_role;
revoke all on function public.bodyfix_crm_intake(jsonb) from public, anon, authenticated;
grant execute on function public.bodyfix_crm_intake(jsonb) to service_role;
