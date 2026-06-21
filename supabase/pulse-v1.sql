-- BodyFix Pulse v1. Prefixes avoid collisions with existing BodyFix OS tables.
create extension if not exists pgcrypto;
create table if not exists pulse_settings (id uuid primary key default gen_random_uuid(), month_target integer not null default 150000, period_start date not null, period_end date not null, rest_weekdays integer[] default '{2}', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists pulse_income_entries (id uuid primary key default gen_random_uuid(), entry_date date not null, client_name text, service_type text, amount integer not null check(amount >= 0), source text, note text, created_at timestamptz default now());

alter table pulse_income_entries add column if not exists client_id uuid references clients(id);
alter table pulse_income_entries add column if not exists client_name_snapshot text;
alter table pulse_income_entries add column if not exists service_code text;
alter table pulse_income_entries add column if not exists service_line text;
alter table pulse_income_entries add column if not exists service_name text;
alter table pulse_income_entries add column if not exists service_variant text;
alter table pulse_income_entries add column if not exists standard_price integer;
alter table pulse_income_entries add column if not exists amount_actual integer;
create table if not exists pulse_appointments (id uuid primary key default gen_random_uuid(), appointment_date date not null, start_time time, client_name text not null, service_type text, estimated_amount integer, status text default '已排' check(status in ('已排','待確認','已完成','取消')), note text, created_at timestamptz default now());
create table if not exists pulse_followups (id uuid primary key default gen_random_uuid(), client_name text not null, last_visit_date date, main_issue text, contact_method text, priority text default '中' check(priority in ('高','中','低')), followup_status text default '未聯絡' check(followup_status in ('未聯絡','已聯絡','已回覆','已預約','暫不打擾')), suggested_message text, created_at timestamptz default now());
create index if not exists pulse_income_date_idx on pulse_income_entries(entry_date); create index if not exists pulse_appointment_date_idx on pulse_appointments(appointment_date,status);
alter table pulse_settings enable row level security; alter table pulse_income_entries enable row level security; alter table pulse_appointments enable row level security; alter table pulse_followups enable row level security;
insert into pulse_settings(month_target,period_start,period_end,rest_weekdays) select 150000,current_date,(current_date + interval '30 days')::date,'{2}' where not exists(select 1 from pulse_settings);
insert into pulse_income_entries(entry_date,client_name,service_type,amount,source,note) values (current_date,'臨時客 A','60 分',2000,'軟體','上午'),(current_date,'臨時客 B','60 分',2300,'軟體','剛剛');
insert into pulse_appointments(appointment_date,start_time,client_name,service_type,estimated_amount,status) values (current_date + interval '1 day','14:00','勁甫','視狀況加時',2800,'已排');
insert into pulse_followups(client_name,last_visit_date,main_issue,contact_method,priority,followup_status) values
('勁甫',current_date - interval '15 days','肩胛、手臂、腰臀','LINE','高','未聯絡'),('LRC',current_date - interval '20 days','肩背痠、重訓型','IG','高','未聯絡'),('蜜汁熊',current_date - interval '28 days','肩背痠緊','LINE','高','未聯絡'),('Kai',current_date - interval '33 days','腰痠、髖內外緊','IG','高','未聯絡'),('Dustin Shen',current_date - interval '49 days','腰舊傷、運動表現','IG','中','未聯絡'),('Albert',current_date - interval '49 days','肩頸酸緊','LINE','中','未聯絡'),('Johnny',current_date - interval '55 days','背部緊','IG','中','未聯絡'),('Patrick',current_date - interval '34 days','肩膀沾黏、酸痛','LINE','高','未聯絡'),('Shawn翔',current_date - interval '40 days','闊背、脊柱、腰方緊','LINE','中','未聯絡'),('Chester',current_date - interval '47 days','腰部、臀部痠緊','LINE','中','未聯絡');
