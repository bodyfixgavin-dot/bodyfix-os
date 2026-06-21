-- BodyFix Pulse v1. Prefixes avoid collisions with existing BodyFix OS tables.
create extension if not exists pgcrypto;
create table if not exists pulse_settings (id uuid primary key default gen_random_uuid(), month_target integer not null default 150000, period_start date not null, period_end date not null, rest_weekdays integer[] default '{2}', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists pulse_income_entries (id uuid primary key default gen_random_uuid(), entry_date date not null, client_id uuid references clients(id) on delete set null, client_name_snapshot text, client_name text, service_type text, amount integer not null check(amount >= 0), source text, note text, created_at timestamptz default now());
create table if not exists pulse_appointments (id uuid primary key default gen_random_uuid(), appointment_date date not null, start_time time, client_id uuid references clients(id) on delete set null, client_name_snapshot text, client_name text, service_type text, estimated_amount integer, status text default '已排' check(status in ('已排','待確認','已完成','取消')), note text, created_at timestamptz default now());
create table if not exists pulse_followups (id uuid primary key default gen_random_uuid(), client_name text not null, last_visit_date date, main_issue text, contact_method text, priority text default '中' check(priority in ('高','中','低')), followup_status text default '未聯絡' check(followup_status in ('未聯絡','已聯絡','已回覆','已預約','暫不打擾')), suggested_message text, created_at timestamptz default now());

alter table clients add column if not exists display_name text;
alter table clients add column if not exists nickname text;
alter table clients add column if not exists client_name text;
alter table clients add column if not exists contact_method text;
alter table clients add column if not exists line_id text;
alter table clients add column if not exists ig_id text;
alter table clients add column if not exists phone text;
alter table clients add column if not exists main_issue text;
alter table clients add column if not exists last_visit_date date;
alter table clients add column if not exists status text;
update clients set display_name = coalesce(nullif(trim(display_name), ''), nullif(trim(client_name), ''), nullif(trim(nickname), ''), '未命名客戶') where display_name is null or trim(display_name) = '';
alter table clients alter column display_name set not null;
alter table pulse_income_entries add column if not exists client_id uuid references clients(id) on delete set null;
alter table pulse_income_entries add column if not exists client_name_snapshot text;
alter table pulse_appointments add column if not exists client_id uuid references clients(id) on delete set null;
alter table pulse_appointments add column if not exists client_name_snapshot text;
create index if not exists pulse_income_date_idx on pulse_income_entries(entry_date); create index if not exists pulse_appointment_date_idx on pulse_appointments(appointment_date,status);
alter table pulse_settings enable row level security; alter table pulse_income_entries enable row level security; alter table pulse_appointments enable row level security; alter table pulse_followups enable row level security;
insert into pulse_settings(month_target,period_start,period_end,rest_weekdays) select 150000,'2026-06-14','2026-06-30','{2}' where not exists(select 1 from pulse_settings);
insert into pulse_income_entries(entry_date,client_name,service_type,amount,source,note) values ('2026-06-14','臨時客 A','60 分',2000,'軟體','上午'),('2026-06-14','臨時客 B','60 分',2300,'軟體','剛剛');
insert into pulse_appointments(appointment_date,start_time,client_name,service_type,estimated_amount,status) values ('2026-06-15','14:00','勁甫','視狀況加時',2800,'已排');
insert into pulse_followups(client_name,last_visit_date,main_issue,contact_method,priority,followup_status) values
('勁甫','2026-06-03','肩胛、手臂、腰臀','LINE','高','未聯絡'),('LRC','2026-05-29','肩背痠、重訓型','IG','高','未聯絡'),('蜜汁熊','2026-05-21','肩背痠緊','LINE','高','未聯絡'),('Kai','2026-05-16','腰痠、髖內外緊','IG','高','未聯絡'),('Dustin Shen','2026-04-30','腰舊傷、運動表現','IG','中','未聯絡'),('Albert','2026-04-30','肩頸酸緊','LINE','中','未聯絡'),('Johnny','2026-04-24','背部緊','IG','中','未聯絡'),('Patrick','2026-05-15','肩膀沾黏、酸痛','LINE','高','未聯絡'),('Shawn翔','2026-05-09','闊背、脊柱、腰方緊','LINE','中','未聯絡'),('Chester','2026-05-02','腰部、臀部痠緊','LINE','中','未聯絡');
