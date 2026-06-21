-- BodyFix Pulse v1. Prefixes avoid collisions with existing BodyFix OS tables.
create extension if not exists pgcrypto;

create table if not exists pulse_settings (id uuid primary key default gen_random_uuid(), month_target integer not null default 150000, period_start date not null, period_end date not null, rest_weekdays integer[] default '{2}', created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists service_catalog (
  id uuid primary key default gen_random_uuid(),
  service_code text unique not null,
  service_line text not null,
  service_name text not null,
  service_variant text,
  price integer,
  billing_type text not null check (billing_type in ('session','addon','package','installment','monthly','fixed_scope','coming_soon','subsidy','other')),
  status text not null default 'active' check (status in ('active','trial','draft','coming_soon','retired')),
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists pulse_income_entries (id uuid primary key default gen_random_uuid(), entry_date date not null, client_name text, service_type text, amount integer not null check(amount >= 0), source text, note text, created_at timestamptz default now());
alter table pulse_income_entries add column if not exists service_code text;
alter table pulse_income_entries add column if not exists service_line text;
alter table pulse_income_entries add column if not exists service_name text;
alter table pulse_income_entries add column if not exists service_variant text;
alter table pulse_income_entries add column if not exists standard_price integer;
alter table pulse_income_entries add column if not exists amount_actual integer;

create table if not exists pulse_appointments (id uuid primary key default gen_random_uuid(), appointment_date date not null, start_time time, client_name text not null, service_type text, estimated_amount integer, status text default '已排' check(status in ('已排','待確認','已完成','取消')), note text, created_at timestamptz default now());
create table if not exists pulse_followups (id uuid primary key default gen_random_uuid(), client_name text not null, last_visit_date date, main_issue text, contact_method text, priority text default '中' check(priority in ('高','中','低')), followup_status text default '未聯絡' check(followup_status in ('未聯絡','已聯絡','已回覆','已預約','暫不打擾')), suggested_message text, created_at timestamptz default now());
create index if not exists pulse_income_date_idx on pulse_income_entries(entry_date);
create index if not exists pulse_income_service_code_idx on pulse_income_entries(service_code);
create index if not exists service_catalog_status_idx on service_catalog(status, service_line);
create index if not exists pulse_appointment_date_idx on pulse_appointments(appointment_date,status);
alter table pulse_settings enable row level security; alter table service_catalog enable row level security; alter table pulse_income_entries enable row level security; alter table pulse_appointments enable row level security; alter table pulse_followups enable row level security;

insert into service_catalog(service_code,service_line,service_name,service_variant,price,billing_type,status,note) values
('BF-BR-001','Body Reset','筋膜鏈整理','60 分鐘',2200,'session','active',null),
('BF-BR-002','Body Reset','筋膜線指定整理','60 分鐘',2300,'session','active',null),
('BF-BR-EXT-001','Body Reset','筋膜鏈延長整理','+30 分鐘',1000,'addon','active',null),
('BF-BR-003','Body Reset','多線整合整理','90 分鐘',3600,'session','active',null),
('BF-PC-001','Pelvic Core','骨盆核心整理','60 分鐘',2500,'session','active',null),
('BF-PC-EXT-001','Pelvic Core','骨盆核心延長整理','+30 分鐘',1200,'addon','active',null),
('BF-PC-VIP-001','Pelvic Core','骨盆核心深度完整方案','120 分鐘',6800,'session','active','不是單純延長時間，而是高階權限服務。'),
('BF-MI-001','Movement Integration','單堂評估訓練','60 分鐘',1800,'session','active',null),
('BF-MI-PKG-001','Movement Integration','12 堂基礎建立','12 堂',20400,'package','active',null),
('BF-MI-PKG-002','Movement Integration','24 堂三個月整合','24 堂',38400,'package','active',null),
('BF-MI-PKG-003','Movement Integration','36 堂長期進階','36 堂',54000,'package','active',null),
('BF-MI-PKG-004','Movement Integration','24+12 深度整合方案','24 堂訓練 + 12 堂筋膜鏈整理',62400,'package','active','不可寫成 36 堂，必須拆成 24 堂訓練 + 12 堂筋膜鏈整理。'),
('BF-MI-PKG-004-PAYFULL','Movement Integration','24+12 深度整合方案一次付清優惠','一次付清',60000,'package','active',null),
('BF-MI-PKG-004-INST2','Movement Integration','24+12 深度整合方案分 2 期','每期 NT$31,200，總額 NT$62,400',31200,'installment','active',null),
('BF-MI-PKG-004-INST3','Movement Integration','24+12 深度整合方案分 3 期','每期 NT$20,800，總額 NT$62,400',20800,'installment','active',null),
('BF-SR-TR-001','Status Reading','塔羅單題整理','fixed_scope',333,'fixed_scope','active',null),
('BF-SR-TR-002','Status Reading','塔羅狀態整理','fixed_scope',666,'fixed_scope','active',null),
('BF-SR-TR-003','Status Reading','塔羅深度整理','fixed_scope',1200,'fixed_scope','active',null),
('BF-SR-ZW-TXT-001','Status Reading','紫微小題文字整理','fixed_scope',888,'fixed_scope','active',null),
('BF-SR-ZW-001','Status Reading','紫微結構解析','fixed_scope',3600,'fixed_scope','active',null),
('BF-SR-PKG-001','Status Reading','紫微 + 塔羅整合諮詢','fixed_scope',4800,'fixed_scope','active',null),
('BF-SR-EXT-001','Status Reading','延伸狀態整理','+30 分鐘',1000,'addon','active','紫微不是按分鐘計價，而是固定範圍計價 fixed_scope。'),
('BF-CORP-001','Corporate Extension','BodyFix 初次完整評估整理','60 分鐘標準價',2200,'session','active',null),
('BF-CORP-002','Corporate Extension','企業活動參與者單人預約','60 分鐘',2100,'session','active',null),
('BF-CORP-003','Corporate Extension','企業活動兩人同行','每人',2000,'session','active',null),
('BF-MEM-BODY-001','Membership','BodyFix 身體狀態吃到飽','試營運，每月最多 8 次，每週最多 2 次，每次 60 分鐘',16800,'monthly','trial',null),
('BF-MEM-BODY-002','Membership','BodyFix 身體狀態吃到飽','正式價，每月最多 8 次，每週最多 2 次，每次 60 分鐘',19800,'monthly','draft',null),
('BF-MEM-CHART-001','Membership','Chart Navigator 命盤導航問到飽','試營運，每週 1 個主題，每月 1 次整理',4800,'monthly','trial',null),
('BF-MEM-CHART-002','Membership','Chart Navigator 命盤導航問到飽','正式價，每週 1 個主題，每月 1 次整理',6800,'monthly','draft',null),
('BF-FANS-001','Other Revenue','FansOne','月費',599,'monthly','active',null),
('BF-SPACE-001','Space Guide','Space Guide','尚未正式定價',null,'coming_soon','coming_soon',null),
('BF-GROOM-001','Grooming','Grooming／除毛','Coming Soon',null,'coming_soon','coming_soon',null),
('BF-TOUR-001','City Tour','城市巡迴','尚未獨立定價',null,'coming_soon','draft',null),
('BF-HOME-001','Home Visit','到府服務','到府加價尚未正式定價',null,'coming_soon','draft',null),
('BF-EQUIP-001','Equipment Subsidy','居家腳踏車補助版','補助 NT$1,500，是否納入正式方案待定',1500,'subsidy','draft',null)
on conflict (service_code) do update set service_line=excluded.service_line, service_name=excluded.service_name, service_variant=excluded.service_variant, price=excluded.price, billing_type=excluded.billing_type, status=excluded.status, note=excluded.note, updated_at=now();

insert into pulse_settings(month_target,period_start,period_end,rest_weekdays) select 150000,'2026-06-14','2026-06-30','{2}' where not exists(select 1 from pulse_settings);
insert into pulse_income_entries(entry_date,client_name,service_type,service_code,service_line,service_name,service_variant,standard_price,amount,amount_actual,source,note)
select '2026-06-14','臨時客 A',service_variant,service_code,service_line,service_name,service_variant,price,price,price,'軟體','上午' from service_catalog where service_code='BF-BR-001'
union all
select '2026-06-14','臨時客 B',service_variant,service_code,service_line,service_name,service_variant,price,price,price,'軟體','剛剛' from service_catalog where service_code='BF-BR-002';
insert into pulse_appointments(appointment_date,start_time,client_name,service_type,estimated_amount,status) values ('2026-06-15','14:00','勁甫','BF-BR-EXT-001 筋膜鏈延長整理',1000,'已排');
insert into pulse_followups(client_name,last_visit_date,main_issue,contact_method,priority,followup_status) values
('勁甫','2026-06-03','肩胛、手臂、腰臀','LINE','高','未聯絡'),('LRC','2026-05-29','肩背痠、重訓型','IG','高','未聯絡'),('蜜汁熊','2026-05-21','肩背痠緊','LINE','高','未聯絡'),('Kai','2026-05-16','腰痠、髖內外緊','IG','高','未聯絡'),('Dustin Shen','2026-04-30','腰舊傷、運動表現','IG','中','未聯絡'),('Albert','2026-04-30','肩頸酸緊','LINE','中','未聯絡'),('Johnny','2026-04-24','背部緊','IG','中','未聯絡'),('Patrick','2026-05-15','肩膀沾黏、酸痛','LINE','高','未聯絡'),('Shawn翔','2026-05-09','闊背、脊柱、腰方緊','LINE','中','未聯絡'),('Chester','2026-05-02','腰部、臀部痠緊','LINE','中','未聯絡');
