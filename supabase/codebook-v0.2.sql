-- BodyFix Codebook v0.2
-- Central internal reference data for CRM, booking, records, follow-ups and admin selectors.

create extension if not exists pgcrypto;

create table if not exists codebook_categories (
  category_code text primary key,
  display_name_zh text not null,
  display_name_en text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists codebook_entries (
  category_code text not null references codebook_categories(category_code) on update cascade on delete restrict,
  code text not null,
  display_name_zh text not null,
  display_name_en text,
  description text,
  parent_category_code text,
  parent_code text,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  status text not null default 'active' check (status in ('active', 'coming_soon', 'legacy', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (category_code, code),
  constraint codebook_entries_parent_complete check (
    (parent_category_code is null and parent_code is null)
    or (parent_category_code is not null and parent_code is not null)
  ),
  constraint codebook_entries_parent_fk foreign key (parent_category_code, parent_code)
    references codebook_entries(category_code, code) on update cascade on delete restrict
);

create index if not exists codebook_entries_category_status_sort_idx
  on codebook_entries(category_code, status, sort_order, code);
create index if not exists codebook_entries_parent_idx
  on codebook_entries(parent_category_code, parent_code, sort_order);

insert into codebook_categories (category_code, display_name_zh, display_name_en, description, sort_order) values
  ('service', '單次服務', 'Service', 'BodyFix single-session service codes.', 10),
  ('package', '方案／套裝', 'Package', 'Multi-session and integrated packages.', 20),
  ('pass', '會員／月票', 'Pass', 'Recurring passes and memberships.', 30),
  ('location', '城市／地點', 'Location', 'Cities and frequently used service points.', 40),
  ('source', '來源渠道', 'Source', 'Client acquisition sources.', 50),
  ('followup_task', '回訪任務', 'Follow-up Task', 'Follow-up task types.', 60),
  ('priority', '優先度', 'Priority', 'Admin task priority.', 70),
  ('task_status', '任務狀態', 'Task Status', 'Follow-up and task workflow status.', 80),
  ('quick_filter', '快速篩選', 'Quick Filter', 'First-level tension filter.', 90),
  ('tension', '張力模式', 'Tension Pattern', 'Occupational, lifestyle, training and special patterns.', 100),
  ('region', '身體區域', 'Body Region', 'Body region references.', 110),
  ('fascia_line', '筋膜線', 'Fascia Line', 'Fascia line references.', 120),
  ('chart_navigator', 'Chart Navigator', 'Chart Navigator', 'Coming-soon status and chart services.', 130),
  ('payment', '付款方式／狀態', 'Payment', 'Payment methods and statuses.', 140)
on conflict (category_code) do update set
  display_name_zh = excluded.display_name_zh,
  display_name_en = excluded.display_name_en,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

-- Entries without parents are seeded first so child references remain valid and rerunnable.
insert into codebook_entries (category_code, code, display_name_zh, display_name_en, description, metadata, sort_order, status) values
  ('service','BF-FC-60','筋膜鏈整理 60 分','Fascia Chain 60',null,'{"duration_minutes":60,"service_family":"FC"}',10,'active'),
  ('service','BF-FC-90','筋膜鏈整理 90 分','Fascia Chain 90',null,'{"duration_minutes":90,"service_family":"FC"}',20,'active'),
  ('service','BF-FC-120','筋膜鏈整理 120 分','Fascia Chain 120',null,'{"duration_minutes":120,"service_family":"FC"}',30,'active'),
  ('service','BF-FC-EXT-30','筋膜鏈延長整理 30 分','Fascia Chain Extension 30',null,'{"duration_minutes":30,"service_family":"FC","is_addon":true}',40,'active'),
  ('service','BF-FC-CASE','筋膜鏈案例紀錄','Fascia Chain Case',null,'{"service_family":"FC","is_record_type":true}',50,'active'),
  ('service','BF-PC-30','骨盆核心延長整理 30 分','Pelvic Core 30',null,'{"duration_minutes":30,"service_family":"PC"}',60,'active'),
  ('service','BF-PC-60','骨盆核心整理 60 分','Pelvic Core 60',null,'{"duration_minutes":60,"service_family":"PC"}',70,'active'),
  ('service','BF-PC-90','骨盆核心深度整理 90 分','Pelvic Core 90',null,'{"duration_minutes":90,"service_family":"PC"}',80,'active'),
  ('service','BF-PC-EXT','骨盆核心加強整理','Pelvic Core Extension',null,'{"service_family":"PC","is_addon":true}',90,'active'),
  ('service','BF-PC-CASE','骨盆核心案例紀錄','Pelvic Core Case',null,'{"service_family":"PC","is_record_type":true}',100,'active'),
  ('service','BF-MI-60','動作整合 60 分','Movement Integration 60',null,'{"duration_minutes":60,"service_family":"MI"}',110,'active'),
  ('service','BF-MI-90','動作整合 90 分','Movement Integration 90',null,'{"duration_minutes":90,"service_family":"MI"}',120,'active'),
  ('service','BF-PT-1','單堂教練課','Personal Training 1 Session',null,'{"sessions":1,"price_twd":1800,"service_family":"PT"}',130,'active'),
  ('service','BF-PT-60','私人教練課 60 分','Personal Training 60',null,'{"duration_minutes":60,"service_family":"PT"}',140,'active'),

  ('package','PKG-FC-03','3 次筋膜鏈整理','Fascia Chain 3 Sessions',null,'{"sessions":3,"service_family":"FC"}',10,'active'),
  ('package','PKG-FC-06','6 次筋膜鏈整理','Fascia Chain 6 Sessions',null,'{"sessions":6,"service_family":"FC"}',20,'active'),
  ('package','PKG-FC-12','12 次筋膜鏈整理','Fascia Chain 12 Sessions',null,'{"sessions":12,"service_family":"FC"}',30,'active'),
  ('package','PKG-FC-24','24 次筋膜鏈整理 VIP','Fascia Chain 24 Sessions',null,'{"sessions":24,"service_family":"FC"}',40,'coming_soon'),
  ('package','PKG-PC-03','3 次骨盆核心整理','Pelvic Core 3 Sessions',null,'{"sessions":3,"service_family":"PC"}',50,'active'),
  ('package','PKG-PC-06','6 次骨盆核心整理','Pelvic Core 6 Sessions',null,'{"sessions":6,"service_family":"PC"}',60,'active'),
  ('package','PKG-PC-12','12 次骨盆核心整理','Pelvic Core 12 Sessions',null,'{"sessions":12,"service_family":"PC"}',70,'active'),
  ('package','PKG-PC-VIP','骨盆核心 VIP 週期','Pelvic Core VIP',null,'{"service_family":"PC"}',80,'active'),
  ('package','PKG-PT-06','6 堂教練課','PT 6 Sessions',null,'{"sessions":6,"service_family":"PT"}',90,'active'),
  ('package','PKG-PT-12','12 堂教練課','PT 12 Sessions',null,'{"sessions":12,"service_family":"PT"}',100,'active'),
  ('package','PKG-PT-24','24 堂教練課','PT 24 Sessions',null,'{"sessions":24,"service_family":"PT"}',110,'active'),
  ('package','PKG-PT-36','36 堂教練課','PT 36 Sessions',null,'{"sessions":36,"service_family":"PT"}',120,'active'),
  ('package','PKG-PT-48','48 堂教練課','PT 48 Sessions',null,'{"sessions":48,"service_family":"PT"}',130,'active'),
  ('package','PKG-PT-60','60 堂教練課','PT 60 Sessions',null,'{"sessions":60,"service_family":"PT"}',140,'active'),
  ('package','PKG-PT-72','72 堂教練課','PT 72 Sessions',null,'{"sessions":72,"service_family":"PT"}',150,'active'),
  ('package','PKG-PT-96','96 堂教練課','PT 96 Sessions',null,'{"sessions":96,"service_family":"PT"}',160,'active'),
  ('package','PKG-MI-12','12 次動作整合','Movement Integration 12',null,'{"sessions":12,"service_family":"MI"}',170,'active'),
  ('package','PKG-RESET-30D','30 天身體任務','Reset 30 Days',null,'{"duration_days":30}',180,'active'),
  ('package','PKG-RESET-90D','90 天身體狀態整理','Reset 90 Days',null,'{"duration_days":90}',190,'active'),
  ('package','PKG-24PT12FC','24 訓練 + 12 筋膜深度整合','24 PT + 12 Fascia Chain',null,'{"pt_sessions":24,"fc_sessions":12}',200,'active'),
  ('package','PKG-RECOVERY','訓練恢復／張力整理方案','Recovery Package',null,'{}',210,'active'),
  ('package','PKG-TEACHER','老師板書型張力方案','Teacher Tension Package',null,'{}',220,'active'),
  ('package','PKG-DESK','久坐辦公張力方案','Desk Worker Package',null,'{}',230,'active'),
  ('package','PKG-LIFT','重訓恢復方案','Lifting Recovery Package',null,'{}',240,'active'),
  ('package','BF-PKG-12FC','舊版 12 次筋膜鏈方案','Legacy Fascia Chain 12',null,'{"replacement_code":"PKG-FC-12"}',900,'legacy'),
  ('package','BF-PT-PKG-10','舊版 10 堂教練課','Legacy PT 10 Sessions',null,'{"sessions":10}',910,'legacy'),

  ('pass','PASS-BF-WEEKLY','每週固定追蹤','BodyFix Weekly',null,'{}',10,'active'),
  ('pass','PASS-BF-4M','每月 4 次','BodyFix 4 / Month',null,'{"sessions_per_month":4}',20,'active'),
  ('pass','PASS-BF-8M','每月 8 次','BodyFix 8 / Month',null,'{"sessions_per_month":8}',30,'active'),
  ('pass','PASS-BF-VIP','高頻次 VIP 預約','BodyFix VIP',null,'{}',40,'active'),
  ('pass','PASS-BF-RECOVERY','訓練恢復月票','Recovery Pass',null,'{}',50,'active'),
  ('pass','PASS-BF-CORE','骨盆核心月票','Core Pass',null,'{}',60,'active'),
  ('pass','PASS-GV-ALL','身體 + 狀態整合','Gavin All State Pass',null,'{}',70,'coming_soon'),
  ('pass','PASS-CN-MONTHLY','命盤月票','Chart Navigator Monthly',null,'{}',80,'coming_soon'),

  ('location','TPE','台北','Taipei','城市','{"location_type":"city"}',10,'active'),
  ('location','TPH','新北','New Taipei','城市','{"location_type":"city"}',20,'active'),
  ('location','TYO','桃園','Taoyuan','城市','{"location_type":"city"}',30,'active'),
  ('location','HSC','新竹','Hsinchu','城市','{"location_type":"city"}',40,'active'),
  ('location','YIL','宜蘭','Yilan','城市','{"location_type":"city"}',50,'active'),
  ('location','HUA','花蓮','Hualien','城市','{"location_type":"city"}',60,'active'),
  ('location','TTT','台東','Taitung','城市','{"location_type":"city"}',70,'active'),
  ('location','EAST','花東','Eastern Taiwan','區域','{"location_type":"region"}',80,'active'),
  ('location','TCH','台中','Taichung','城市','{"location_type":"city"}',90,'active'),
  ('location','CHW','彰化','Changhua','城市','{"location_type":"city"}',100,'active'),
  ('location','YUN','雲林','Yunlin','城市','{"location_type":"city"}',110,'active'),
  ('location','CYI','嘉義','Chiayi','城市','{"location_type":"city"}',120,'active'),
  ('location','TNN','台南','Tainan','城市','{"location_type":"city"}',130,'active'),
  ('location','KHH','高雄','Kaohsiung','城市','{"location_type":"city"}',140,'active'),
  ('location','PIF','屏東','Pingtung','城市','{"location_type":"city"}',150,'active'),
  ('location','ONLINE','線上','Online','服務模式','{"location_type":"mode"}',160,'active'),
  ('location','TBD','待確認','To Be Determined','狀態','{"location_type":"status"}',170,'active'),
  ('location','XMD','西門','Ximen','台北常用點','{"location_type":"venue","city_code":"TPE"}',180,'active'),
  ('location','SYS','國父紀念館','Sun Yat-sen Memorial Hall','台北常用點','{"location_type":"venue","city_code":"TPE"}',190,'active'),
  ('location','LZL','六張犁','Liuzhangli','台北常用點','{"location_type":"venue","city_code":"TPE"}',200,'active'),
  ('location','HOME','到府','Home Visit','服務模式','{"location_type":"mode"}',210,'active'),
  ('location','STUDIO','工作室','Studio','服務模式','{"location_type":"mode"}',220,'active'),

  ('source','SRC-IG','Instagram','Instagram',null,'{}',10,'active'),
  ('source','SRC-FB','Facebook','Facebook',null,'{}',20,'active'),
  ('source','SRC-LINE','LINE','LINE',null,'{}',30,'active'),
  ('source','SRC-WEB','官網','Website',null,'{}',40,'active'),
  ('source','SRC-REF','朋友介紹','Referral',null,'{}',50,'active'),
  ('source','SRC-FANS','FansOne','FansOne',null,'{}',60,'active'),
  ('source','SRC-THR','Threads 脆','Threads',null,'{}',70,'active'),
  ('source','SRC-GMAP','Google Maps','Google Maps',null,'{}',80,'active'),
  ('source','SRC-OLD','舊客／歷史資料','Existing / Historical Client',null,'{}',90,'active'),
  ('source','SRC-EVENT','活動／駐點','Event',null,'{}',100,'active'),
  ('source','SRC-UNKNOWN','未知來源','Unknown',null,'{}',110,'active'),

  ('followup_task','FT-NEW','新客追蹤','New Client Check-in',null,'{"task_type":"new_client_checkin"}',10,'active'),
  ('followup_task','FT-MED','中優先回訪','Medium Priority Follow-up',null,'{"task_type":"medium_priority_followup"}',20,'active'),
  ('followup_task','FT-HIGH','高優先回訪','High Priority Follow-up',null,'{"task_type":"high_priority_followup"}',30,'active'),
  ('followup_task','FT-DORMANT','沉睡客戶','Dormant Client',null,'{"task_type":"dormant_client"}',40,'active'),
  ('followup_task','FT-RENEW','續約候選','Renewal Candidate',null,'{"task_type":"renewal_candidate"}',50,'active'),
  ('followup_task','FT-PKG','方案候選','Package Candidate',null,'{"task_type":"package_candidate"}',60,'active'),
  ('followup_task','FT-NOSHOW','未到／取消後追蹤','No-show Follow-up',null,'{"task_type":"noshow_followup"}',70,'active'),
  ('followup_task','FT-CHECKIN','一般關心','General Check-in',null,'{"task_type":"general_checkin"}',80,'active'),
  ('followup_task','FT-REACTIVATE','喚醒舊客','Reactivate Old Client',null,'{"task_type":"reactivate_old_client"}',90,'active'),

  ('priority','P1','高優先','High Priority','今天或 24 小時內','{"target_hours":24}',10,'active'),
  ('priority','P2','中優先','Medium Priority','3 天內','{"target_days":3}',20,'active'),
  ('priority','P3','低優先','Low Priority','7 天內','{"target_days":7}',30,'active'),
  ('priority','P0','暫不追蹤','Do Not Proactively Follow Up',null,'{}',40,'active'),
  ('priority','PX','特殊注意','Manual Review',null,'{}',50,'active'),

  ('task_status','open','待處理','Open',null,'{}',10,'active'),
  ('task_status','done','已追蹤','Done',null,'{}',20,'active'),
  ('task_status','snoozed','已延後','Snoozed',null,'{}',30,'active'),
  ('task_status','closed','關閉','Closed',null,'{}',40,'active'),
  ('task_status','ignored','略過','Ignored',null,'{}',50,'active'),
  ('task_status','converted','已成功預約／成交','Converted',null,'{}',60,'active'),
  ('task_status','lost','無回應／暫失聯','Lost',null,'{}',70,'active'),

  ('quick_filter','QF-SIT','久坐壓縮類','Sitting Compression',null,'{}',10,'active'),
  ('quick_filter','QF-STAND','久站負荷類','Standing Load',null,'{}',20,'active'),
  ('quick_filter','QF-HEAD','低頭細作類','Head-down Precision Work',null,'{}',30,'active'),
  ('quick_filter','QF-ASYM','單側／不對稱類','Unilateral / Asymmetric',null,'{}',40,'active'),
  ('quick_filter','QF-LOAD','負重／爆發類','Load / Explosive',null,'{}',50,'active'),
  ('quick_filter','QF-ROT','旋轉／過頭類','Rotation / Overhead',null,'{}',60,'active'),
  ('quick_filter','QF-LIFE','生活習慣類','Lifestyle',null,'{}',70,'active'),
  ('quick_filter','QF-TRAIN','訓練恢復類','Training Recovery',null,'{}',80,'active'),

  ('region','RG-NECK','頸部','Neck',null,'{}',10,'active'),('region','RG-SHOULDER','肩膀','Shoulder',null,'{}',20,'active'),
  ('region','RG-CHEST','胸口／胸廓','Chest / Ribcage',null,'{}',30,'active'),('region','RG-BACK','背部','Back',null,'{}',40,'active'),
  ('region','RG-LOWBACK','下背','Low Back',null,'{}',50,'active'),('region','RG-PELVIS','骨盆','Pelvis',null,'{}',60,'active'),
  ('region','RG-HIP','髖','Hip',null,'{}',70,'active'),('region','RG-GLUTE','臀','Glute',null,'{}',80,'active'),
  ('region','RG-KNEE','膝','Knee',null,'{}',90,'active'),('region','RG-ANKLE','踝','Ankle',null,'{}',100,'active'),
  ('region','RG-FOOT','足底','Foot',null,'{}',110,'active'),('region','RG-JAW','下顎','Jaw',null,'{}',120,'active'),
  ('region','RG-BREATH','呼吸／橫隔膜','Breath / Diaphragm',null,'{}',130,'active'),('region','RG-CORE','核心','Core',null,'{}',140,'active'),
  ('region','RG-ARM','手臂','Arm',null,'{}',150,'active'),('region','RG-WRIST','手腕','Wrist',null,'{}',160,'active'),

  ('fascia_line','LN-SBL','表淺背線','Superficial Back Line',null,'{}',10,'active'),
  ('fascia_line','LN-SFL','表淺前線','Superficial Front Line',null,'{}',20,'active'),
  ('fascia_line','LN-LL','側線','Lateral Line',null,'{}',30,'active'),
  ('fascia_line','LN-SL','螺旋線','Spiral Line',null,'{}',40,'active'),
  ('fascia_line','LN-AL','手臂線','Arm Lines',null,'{}',50,'active'),
  ('fascia_line','LN-FL','功能線','Functional Lines',null,'{}',60,'active'),
  ('fascia_line','LN-DFL','深前線','Deep Front Line',null,'{}',70,'active'),

  ('chart_navigator','CN-TR-TXT-001','塔羅單題文字整理','Tarot Text 001',null,'{}',10,'coming_soon'),
  ('chart_navigator','CN-TR-TXT-003','塔羅三牌文字整理','Tarot Text 3 Cards',null,'{}',20,'coming_soon'),
  ('chart_navigator','CN-TR-VOICE-001','塔羅語音整理','Tarot Voice',null,'{}',30,'coming_soon'),
  ('chart_navigator','CN-TR-LIVE-001','塔羅即時諮詢','Tarot Live',null,'{}',40,'coming_soon'),
  ('chart_navigator','CN-TR-STATUS','塔羅狀態整理','Tarot Status',null,'{}',50,'coming_soon'),
  ('chart_navigator','CN-ZW-TXT-001','紫微小題文字整理','Zi Wei Text 001',null,'{}',60,'coming_soon'),
  ('chart_navigator','CN-ZW-STRUCTURE','命盤結構整理','Zi Wei Structure',null,'{}',70,'coming_soon'),
  ('chart_navigator','CN-ZW-TIMING','流年／流月節奏','Zi Wei Timing',null,'{}',80,'coming_soon'),
  ('chart_navigator','CN-ZW-CAREER','職涯方向整理','Zi Wei Career',null,'{}',90,'coming_soon'),
  ('chart_navigator','CN-ZW-RELATION','關係模式整理','Zi Wei Relationship',null,'{}',100,'coming_soon'),
  ('chart_navigator','CN-ZW-YEAR','年度方向整理','Zi Wei Annual',null,'{}',110,'coming_soon'),
  ('chart_navigator','CN-JY-BASE','吠陀占星基礎','Jyotisa Basic',null,'{}',120,'coming_soon'),
  ('chart_navigator','CN-JY-NAVA','九曜','Navagraha',null,'{}',130,'coming_soon'),
  ('chart_navigator','CN-JY-RAHU','羅睺','Rahu',null,'{}',140,'coming_soon'),
  ('chart_navigator','CN-JY-KETU','計都','Ketu',null,'{}',150,'coming_soon'),
  ('chart_navigator','CN-JY-CHART','吠陀命盤基礎','Vedic Chart',null,'{}',160,'coming_soon'),
  ('chart_navigator','CN-JY-TIMING','時間節奏觀察','Vedic Timing',null,'{}',170,'coming_soon'),

  ('payment','PAY-CASH','現金','Cash',null,'{"type":"method"}',10,'active'),
  ('payment','PAY-BANK','銀行轉帳','Bank Transfer',null,'{"type":"method"}',20,'active'),
  ('payment','PAY-LINEPAY','LINE Pay','LINE Pay',null,'{"type":"method"}',30,'active'),
  ('payment','PAY-CARD','信用卡','Credit Card',null,'{"type":"method"}',40,'active'),
  ('payment','PAY-APPLEPAY','Apple Pay','Apple Pay',null,'{"type":"method"}',50,'active'),
  ('payment','PAY-PENDING','尚未付款','Pending',null,'{"type":"status"}',60,'active'),
  ('payment','PAY-PAID','已付款','Paid',null,'{"type":"status"}',70,'active'),
  ('payment','PAY-DEPOSIT','已付訂金','Deposit Paid',null,'{"type":"status"}',80,'active'),
  ('payment','PAY-REFUND','已退款','Refunded',null,'{"type":"status"}',90,'active'),
  ('payment','PAY-PARTIAL','部分付款','Partially Paid',null,'{"type":"status"}',100,'active')
on conflict (category_code, code) do update set
  display_name_zh = excluded.display_name_zh, display_name_en = excluded.display_name_en,
  description = excluded.description, metadata = excluded.metadata, sort_order = excluded.sort_order,
  status = excluded.status, updated_at = now();

insert into codebook_entries (category_code, code, display_name_zh, display_name_en, description, parent_category_code, parent_code, metadata, sort_order, status) values
  ('tension','OT-DESK','久坐辦公型','Desk Worker','髖屈肌短縮 + 深前線壓縮','quick_filter','QF-SIT','{"pattern_type":"OT"}',10,'active'),
  ('tension','OT-ENGINEER','工程師滑鼠鍵盤型','Engineer Keyboard / Mouse','肩胛前引 + 胸小肌保護','quick_filter','QF-SIT','{"pattern_type":"OT"}',20,'active'),
  ('tension','OT-DRIVER','長時間駕駛型','Long-duration Driver','腰髖壓縮 + 頸側代償','quick_filter','QF-SIT','{"pattern_type":"OT"}',30,'active'),
  ('tension','LT-GAMER','電競久坐型','Gaming Sitting','腕屈肌 + 髖屈肌同步緊繃','quick_filter','QF-SIT','{"pattern_type":"LT"}',40,'active'),
  ('tension','OT-MEDICAL','醫護久站型','Medical Standing','SBL 後表線 + 足弓穩定負荷','quick_filter','QF-STAND','{"pattern_type":"OT"}',50,'active'),
  ('tension','OT-RETAIL','櫃哥櫃姐久站型','Retail Standing','下肢鏈保護性收縮','quick_filter','QF-STAND','{"pattern_type":"OT"}',60,'active'),
  ('tension','OT-CHEF','廚師久站彎腰型','Chef Standing / Bending','腰部 + SBL 代償鏈','quick_filter','QF-STAND','{"pattern_type":"OT"}',70,'active'),
  ('tension','OT-HAIR','髮型師抬手型','Hair Stylist Overhead','肩頸過用 + 肩胛胸壁失衡','quick_filter','QF-STAND','{"pattern_type":"OT"}',80,'active'),
  ('tension','OT-DENTAL','牙醫低頭旋轉型','Dental Head-down Rotation','頸側胸口保護 + 呼吸空間受壓','quick_filter','QF-HEAD','{"pattern_type":"OT"}',90,'active'),
  ('tension','OT-BARISTA','咖啡師手腕肩頸型','Barista Wrist / Neck','腕屈肌 + 臂線負荷','quick_filter','QF-HEAD','{"pattern_type":"OT"}',100,'active'),
  ('tension','OT-DESIGNER','設計師低頭滑鼠型','Designer Head-down Mouse','頸胸交界 + 前臂過用','quick_filter','QF-HEAD','{"pattern_type":"OT"}',110,'active'),
  ('tension','LT-PHONE','手機低頭型','Phone Head-down','頸椎前引 + 胸口保護','quick_filter','QF-HEAD','{"pattern_type":"LT","also_quick_filters":["QF-LIFE"]}',120,'active'),
  ('tension','OT-TEACHER','老師板書型','Teacher Board-writing','肩胛穩定下降 + 單側代償','quick_filter','QF-ASYM','{"pattern_type":"OT"}',130,'active'),
  ('tension','LT-PARENT','抱小孩單側型','Unilateral Child Carrying','骨盆 + 肩胛不對稱負荷','quick_filter','QF-ASYM','{"pattern_type":"LT"}',140,'active'),
  ('tension','SP-ASYMMETRIC','左右不對稱型','Asymmetric','代償鏈 + 穩定度下降','quick_filter','QF-ASYM','{"pattern_type":"SP"}',150,'active'),
  ('tension','OT-BEAUTY','美業單側操作型','Beauty Industry Unilateral','肩頸 + 手腕單側負荷','quick_filter','QF-ASYM','{"pattern_type":"OT"}',160,'active'),
  ('tension','OT-FIRE','消防員負重型','Firefighter Load','深前線 + 腰髖穩定需求高','quick_filter','QF-LOAD','{"pattern_type":"OT"}',170,'active'),
  ('tension','OT-LOGISTICS','物流搬運型','Logistics Carrying','下背 + 髖膝承重代償','quick_filter','QF-LOAD','{"pattern_type":"OT"}',180,'active'),
  ('tension','TR-WEIGHT','重訓恢復型','Weight Training Recovery','肌筋膜保護 + 恢復整合需求','quick_filter','QF-LOAD','{"pattern_type":"TR","also_quick_filters":["QF-TRAIN"]}',190,'active'),
  ('tension','TR-BOXING','拳擊旋轉型','Boxing Rotation','胸椎髖部旋轉控制不足','quick_filter','QF-LOAD','{"pattern_type":"TR","also_quick_filters":["QF-TRAIN"]}',200,'active'),
  ('tension','OT-PHOTOGRAPHER','攝影師肩頸負重型','Photographer Neck Load','肩頸上背線代償','quick_filter','QF-ROT','{"pattern_type":"OT"}',210,'active'),
  ('tension','SP-OVERHEAD','過頭抬手型','Overhead','肩胛胸壁過度使用','quick_filter','QF-ROT','{"pattern_type":"SP"}',220,'active'),
  ('tension','TR-THROW','投擲／揮拍型','Throwing / Racket','旋轉鏈 + 肩髖協調','quick_filter','QF-ROT','{"pattern_type":"TR"}',230,'active'),
  ('tension','TR-GOLF','高爾夫旋轉型','Golf Rotation','胸椎 + 髖旋轉分工','quick_filter','QF-ROT','{"pattern_type":"TR"}',240,'active'),
  ('tension','LT-SLEEP-SIDE','側睡壓迫型','Side-sleep Compression','肩頸 + 骨盆旋轉慣性','quick_filter','QF-LIFE','{"pattern_type":"LT"}',250,'active'),
  ('tension','LT-BAG-ONE-SIDE','單肩包型','One-side Bag','肩胛 + 骨盆側向代償','quick_filter','QF-LIFE','{"pattern_type":"LT"}',260,'active'),
  ('tension','TR-RUNNER','跑者下肢鏈型','Runner Lower-chain','髖膝踝外側線代償','quick_filter','QF-TRAIN','{"pattern_type":"TR"}',270,'active'),
  ('tension','TR-YOGA','瑜伽柔軟過度型','Yoga Hypermobile','穩定不足 + 關節末端代償','quick_filter','QF-TRAIN','{"pattern_type":"TR"}',280,'active')
on conflict (category_code, code) do update set
  display_name_zh = excluded.display_name_zh, display_name_en = excluded.display_name_en,
  description = excluded.description, parent_category_code = excluded.parent_category_code,
  parent_code = excluded.parent_code, metadata = excluded.metadata, sort_order = excluded.sort_order,
  status = excluded.status, updated_at = now();

-- Compatibility views let consumers use explicit reference names while preserving one source of truth.
create or replace view service_codes as select * from codebook_entries where category_code = 'service';
create or replace view package_codes as select * from codebook_entries where category_code = 'package';
create or replace view tension_codes as select * from codebook_entries where category_code = 'tension';
create or replace view location_codes as select * from codebook_entries where category_code = 'location';
create or replace view region_codes as select * from codebook_entries where category_code = 'region';
create or replace view fascia_line_codes as select * from codebook_entries where category_code = 'fascia_line';

-- New client codes are database-owned so concurrent API/booking inserts cannot create duplicates.
create sequence if not exists client_code_seq;
select setval(
  'client_code_seq',
  greatest(coalesce((select max(substring(client_code from '^C([0-9]+)$')::bigint) from clients), 0), 1),
  coalesce((select max(substring(client_code from '^C([0-9]+)$')::bigint) from clients), 0) > 0
);

create or replace function assign_client_code()
returns trigger
language plpgsql
as $$
begin
  if new.client_code is null or btrim(new.client_code) = '' then
    new.client_code := 'C' || lpad(nextval('client_code_seq')::text, 3, '0');
  end if;
  if new.line_id is null or btrim(new.line_id) = '' then
    new.line_id := 'clinic-' || new.client_code;
  end if;
  return new;
end;
$$;

drop trigger if exists clients_assign_client_code on clients;
create trigger clients_assign_client_code
before insert on clients
for each row execute function assign_client_code();

alter table service_records add column if not exists quick_filter_code text;
alter table service_records add column if not exists tension_code text;

alter table codebook_categories enable row level security;
alter table codebook_entries enable row level security;
revoke all on codebook_categories from anon, authenticated;
revoke all on codebook_entries from anon, authenticated;
grant select on codebook_categories, codebook_entries, service_codes, package_codes, tension_codes, location_codes, region_codes, fascia_line_codes to service_role;
grant usage, select on sequence client_code_seq to service_role;
grant execute on function assign_client_code() to service_role;
