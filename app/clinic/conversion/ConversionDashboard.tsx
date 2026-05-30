"use client";

import { FormEvent, useMemo, useState } from "react";
import { ClinicNotice, ClinicShell, planLabels, useClinicFetch } from "@/components/clinic/ClinicShell";

type PlanCandidate = {
  id: string;
  client_id: string;
  client_code?: string;
  display_name?: string;
  current_stage?: string;
  suggested_plan_type?: string;
  plan_score?: number;
  trigger_reason?: string;
  suggested_pitch?: string;
  status?: string;
  last_session_date?: string;
  last_service_date?: string;
  last_service_type?: string;
  latest_main_complaint?: string;
  latest_next_focus?: string;
  record_count?: number;
  updated_at?: string;
  offer_type?: string;
  offer_title?: string;
  offer_price_twd?: number;
  internal_rationale?: string;
  client_summary?: string;
  recommended_frequency?: string;
  recommended_next_step?: string;
  proposal_message?: string;
  internal_note?: string;
  sent_at?: string;
  won_at?: string;
  lost_at?: string;
  lost_reason?: string;
  next_followup_at?: string;
};

type ClientCandidate = {
  client_id: string;
  client_code?: string;
  display_name?: string;
  current_stage?: string;
  last_session_date?: string;
  latest_main_complaint?: string;
  latest_next_focus?: string;
  record_count?: number;
};

type Overview = {
  sent_this_week: number;
  won_this_week: number;
  lost_this_week: number;
  three_session_count: number;
  twelve_session_count: number;
  deep_integration_count: number;
  pending_followup_count: number;
  overdue_followup_count: number;
};

type ServiceReference = {
  service_code: string;
  name_zh: string;
  recommended_price_twd: number | null;
  positioning: string;
  revenue_model: string;
  case_by_case: boolean;
  is_high_trust: boolean;
  minimum_staff_level: string;
  minimum_staff_level_name: string;
};

type Data = {
  plan_candidates: PlanCandidate[];
  client_candidates: ClientCandidate[];
  overview: Overview;
  service_references: ServiceReference[];
};

type OfferDraft = {
  id: string;
  client_id: string;
  client_name: string;
  offer_type: string;
  offer_title: string;
  offer_price_twd: string;
  internal_rationale: string;
  client_summary: string;
  recommended_frequency: string;
  recommended_next_step: string;
  status: string;
  next_followup_at: string;
  proposal_message: string;
  internal_note: string;
  lost_reason: string;
};

const offerTypes = {
  single_followup: "單次後續整理",
  three_session_reset: "3 次短週期整理",
  twelve_session_program: "12 次完整計畫",
  deep_integration_24_plus_12: "24+12 深度整合方案",
};

const statusLabels = {
  draft: "草稿",
  suggested: "已建議",
  sent: "已送出",
  discussing: "討論中",
  won: "成交",
  lost: "未成交",
  nurture: "長期培養",
  watching: "觀察中",
  ready_to_pitch: "可提案",
  pitched: "已提案",
  accepted: "已接受",
  rejected: "已拒絕",
  paused: "暫停",
};

const statusOptions = ["draft", "suggested", "sent", "discussing", "won", "lost", "nurture"];

const offerDefaults: Record<string, { title: string; price: string; frequency: string; nextStep: string; serviceCode: string }> = {
  single_followup: {
    title: "單次後續整理與回測",
    price: "2200",
    frequency: "1 次回來確認主要卡點與身體反應，再決定後續節奏。",
    nextStep: "先約下一次整理，把這次的變化穩住。",
    serviceCode: "fascia_chain_reset_60",
  },
  three_session_reset: {
    title: "3 次短週期整理",
    price: "6600",
    frequency: "建議 2 到 3 週內完成 3 次，先把主要張力路徑整理清楚。",
    nextStep: "先排第 1 次與第 2 次時間，第三次依身體反應微調。",
    serviceCode: "multi_line_reset_90",
  },
  twelve_session_program: {
    title: "12 次完整計畫",
    price: "26400",
    frequency: "建議每週或每 10 天一次，用 12 次處理結構、動作與生活使用習慣。",
    nextStep: "先確認起始日期與前 3 次節奏，再建立完整週期。",
    serviceCode: "training_12_foundation",
  },
  deep_integration_24_plus_12: {
    title: "24+12 深度整合方案",
    price: "60000",
    frequency: "用長週期整合筋膜整理、動作訓練與身體使用策略。",
    nextStep: "先安排一次深度討論，確認目標、時間成本與適合度。",
    serviceCode: "training_24_plus_12_bundle",
  },
};

function dateOnly(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function money(value?: number | string | null) {
  const amount = Number(value ?? 0);
  if (!amount) return "待個案確認";
  return `NT$${amount.toLocaleString("zh-TW")}`;
}

function normalizeStatus(status?: string) {
  if (status === "ready_to_pitch") return "suggested";
  if (status === "pitched") return "sent";
  if (status === "accepted") return "won";
  if (status === "rejected") return "lost";
  if (status === "watching" || status === "paused") return "nurture";
  return status ?? "draft";
}

function pickOfferType(candidate: PlanCandidate) {
  const current = candidate.offer_type || candidate.suggested_plan_type || "single_followup";
  return Object.prototype.hasOwnProperty.call(offerTypes, current) ? current : "single_followup";
}

function buildDraft(candidate: PlanCandidate): OfferDraft {
  const offerType = pickOfferType(candidate);
  const defaults = offerDefaults[offerType];
  const clientSummary = candidate.client_summary || candidate.latest_main_complaint || candidate.trigger_reason || "這次主要呈現身體張力路徑還沒有完全穩定，需要下一步整理。";
  return {
    id: candidate.id,
    client_id: candidate.client_id,
    client_name: candidate.display_name || candidate.client_code || "未命名客戶",
    offer_type: offerType,
    offer_title: candidate.offer_title || defaults.title,
    offer_price_twd: String(candidate.offer_price_twd ?? defaults.price),
    internal_rationale: candidate.internal_rationale || candidate.suggested_pitch || candidate.trigger_reason || "由最近服務紀錄與 plan candidate 轉成提案。",
    client_summary: clientSummary,
    recommended_frequency: candidate.recommended_frequency || defaults.frequency,
    recommended_next_step: candidate.recommended_next_step || defaults.nextStep,
    status: normalizeStatus(candidate.status),
    next_followup_at: dateOnly(candidate.next_followup_at),
    proposal_message: candidate.proposal_message || "",
    internal_note: candidate.internal_note || "",
    lost_reason: candidate.lost_reason || "",
  };
}

function buildMessages(draft: OfferDraft) {
  const label = offerTypes[draft.offer_type as keyof typeof offerTypes] ?? draft.offer_type;
  const priceText = money(draft.offer_price_twd);
  const clientMessage = `依你這次的狀況，我會先把重點放在：${draft.client_summary}\n\n我不太建議只停在單次舒緩，因為這次比較不像單一位置痠痛，而是張力路徑、使用習慣跟恢復節奏一起牽動。如果只做一次，身體可能會舒服，但比較難真的把卡住的模式穩下來。\n\n所以我會比較建議你先走「${label}」。${draft.internal_rationale}\n\n安排方式會是：${draft.recommended_frequency}\n\n費用先抓 ${priceText}。如果你覺得方向可以，我們下一步就先${draft.recommended_next_step}`;
  const internalSummary = `${draft.client_name}｜${label}｜${priceText}\n現況：${draft.client_summary}\n提案理由：${draft.internal_rationale}\n建議節奏：${draft.recommended_frequency}\n下一步：${draft.recommended_next_step}\n狀態：${statusLabels[draft.status as keyof typeof statusLabels] ?? draft.status}｜下次追蹤：${draft.next_followup_at || "未設定"}`;
  return { clientMessage, internalSummary };
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function serviceForOffer(serviceReferences: ServiceReference[], offerType: string) {
  const code = offerDefaults[offerType]?.serviceCode;
  return serviceReferences.find((service) => service.service_code === code) ?? serviceReferences[0];
}

export function ConversionDashboard() {
  const { data, loading, error, reload } = useClinicFetch<Data>("/api/clinic/conversion");
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<OfferDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedCandidate = useMemo(
    () => data?.plan_candidates.find((candidate) => candidate.id === selectedId) ?? data?.plan_candidates[0],
    [data?.plan_candidates, selectedId],
  );

  const activeDraft = draft ?? (selectedCandidate ? buildDraft(selectedCandidate) : null);
  const generated = activeDraft ? buildMessages(activeDraft) : null;
  const reference = activeDraft && data ? serviceForOffer(data.service_references, activeDraft.offer_type) : null;

  function selectCandidate(candidate: PlanCandidate) {
    setSelectedId(candidate.id);
    setDraft(buildDraft(candidate));
    setNotice("");
  }

  function updateDraft<K extends keyof OfferDraft>(key: K, value: OfferDraft[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  function updateOfferType(value: string) {
    if (!activeDraft) return;
    const defaults = offerDefaults[value];
    setDraft({
      ...activeDraft,
      offer_type: value,
      offer_title: defaults.title,
      offer_price_twd: defaults.price,
      recommended_frequency: defaults.frequency,
      recommended_next_step: defaults.nextStep,
    });
  }

  async function saveOffer(event?: FormEvent, statusOverride?: string, nextFollowupAt?: string) {
    event?.preventDefault();
    if (!activeDraft || !generated) return;
    setSaving(true);
    setNotice("");
    const nextStatus = statusOverride ?? activeDraft.status;
    const payload: Record<string, string | number | null> = {
      offer_type: activeDraft.offer_type,
      suggested_plan_type: activeDraft.offer_type === "deep_integration_24_plus_12" ? "training_progression" : activeDraft.offer_type,
      offer_title: activeDraft.offer_title,
      offer_price_twd: Number(activeDraft.offer_price_twd || 0),
      internal_rationale: activeDraft.internal_rationale,
      client_summary: activeDraft.client_summary,
      recommended_frequency: activeDraft.recommended_frequency,
      recommended_next_step: activeDraft.recommended_next_step,
      status: nextStatus,
      next_followup_at: (nextFollowupAt ?? activeDraft.next_followup_at) || null,
      proposal_message: generated.clientMessage,
      internal_note: generated.internalSummary + (activeDraft.internal_note ? `\n\n${activeDraft.internal_note}` : ""),
      lost_reason: activeDraft.lost_reason || null,
    };
    if (nextStatus === "sent") payload.sent_at = new Date().toISOString();
    if (nextStatus === "won") payload.won_at = new Date().toISOString();
    if (nextStatus === "lost") payload.lost_at = new Date().toISOString();

    const res = await fetch(`/api/clinic/plan-candidates/${activeDraft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setNotice(json.error ?? "儲存失敗，請確認 Part 6 migration 已套用。 ");
    } else {
      setNotice("提案已更新。 ");
      setDraft((current) => current ? { ...current, status: nextStatus, next_followup_at: nextFollowupAt ?? current.next_followup_at } : current);
      await reload();
    }
    setSaving(false);
  }

  const today = new Date().toISOString().slice(0, 10);
  const planCandidates = data?.plan_candidates ?? [];
  const todayFollowups = planCandidates.filter((item) => dateOnly(item.next_followup_at) === today);
  const overdueFollowups = planCandidates.filter((item) => dateOnly(item.next_followup_at) && dateOnly(item.next_followup_at) < today && !["won", "lost"].includes(normalizeStatus(item.status)));
  const recentlySent = planCandidates.filter((item) => ["sent", "discussing"].includes(normalizeStatus(item.status))).slice(0, 5);
  const recentlyWon = planCandidates.filter((item) => normalizeStatus(item.status) === "won").slice(0, 5);
  const recentlyNurture = planCandidates.filter((item) => ["lost", "nurture"].includes(normalizeStatus(item.status))).slice(0, 5);

  return (
    <ClinicShell title="方案提案 / 成交追蹤" subtitle="BodyFix Offer & Conversion System：把服務紀錄、follow-up、plan candidates 與商業規則接成提案、追蹤與成交工作流。">
      <ClinicNotice loading={loading} error={error} />
      {data && (
        <>
          <section className="bf-summary-grid bf-section-gap">
            <Metric label="本週送出提案" value={data.overview.sent_this_week} />
            <Metric label="本週成交" value={data.overview.won_this_week} />
            <Metric label="本週 lost" value={data.overview.lost_this_week} />
            <Metric label="3 次方案數" value={data.overview.three_session_count} />
            <Metric label="12 次方案數" value={data.overview.twelve_session_count} />
            <Metric label="24+12 方案數" value={data.overview.deep_integration_count} />
            <Metric label="待追蹤總數" value={data.overview.pending_followup_count} />
            <Metric label="逾期未追" value={data.overview.overdue_followup_count} />
          </section>

          <section className="bf-card bf-section-gap bf-table-wrap">
            <h2 className="bf-section-title">1. 待提案名單</h2>
            <table className="bf-admin-table">
              <thead><tr><th>客戶</th><th>最近服務</th><th>主要問題</th><th>建議方案</th><th>狀態</th><th>下次追蹤</th><th>操作</th></tr></thead>
              <tbody>
                {planCandidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.client_code}｜{candidate.display_name}</td>
                    <td>{dateOnly(candidate.last_service_date ?? candidate.last_session_date) || "未記錄"}<br /><small>{candidate.last_service_type || `${candidate.record_count ?? 0} 筆紀錄`}</small></td>
                    <td>{candidate.client_summary || candidate.latest_main_complaint || candidate.trigger_reason}</td>
                    <td>{offerTypes[pickOfferType(candidate) as keyof typeof offerTypes] ?? planLabels[candidate.suggested_plan_type ?? ""] ?? candidate.suggested_plan_type}</td>
                    <td>{statusLabels[normalizeStatus(candidate.status) as keyof typeof statusLabels] ?? candidate.status}</td>
                    <td>{dateOnly(candidate.next_followup_at) || "未設定"}</td>
                    <td><button className="bf-secondary" type="button" onClick={() => selectCandidate(candidate)}>編輯提案</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {planCandidates.length === 0 && <p>目前沒有 plan candidates。可先從 Clinic V1 的服務紀錄或方案候選建立。</p>}
          </section>

          {data.client_candidates.length > 0 && (
            <section className="bf-card bf-section-gap">
              <h2 className="bf-section-title">適合觀察的客戶</h2>
              <div className="clinic-list">
                {data.client_candidates.slice(0, 6).map((client) => (
                  <div className="clinic-item" key={client.client_id}>
                    <strong>{client.client_code}｜{client.display_name}</strong>
                    <span>{client.latest_main_complaint || "尚無主要問題摘要"}</span>
                    <small>最近服務：{dateOnly(client.last_session_date) || "未記錄"}｜紀錄數：{client.record_count ?? 0}</small>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeDraft && generated && (
            <section className="clinic-grid bf-section-gap">
              <form className="bf-card bf-form clinic-form-grid" onSubmit={(event) => saveOffer(event)}>
                <h2 className="bf-section-title clinic-wide">2. 提案編輯器</h2>
                <label>客戶<input value={activeDraft.client_name} readOnly /></label>
                <label>提案類型<select value={activeDraft.offer_type} onChange={(event) => updateOfferType(event.target.value)}>{Object.entries(offerTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label>提案標題<input value={activeDraft.offer_title} onChange={(event) => updateDraft("offer_title", event.target.value)} /></label>
                <label>價格 TWD<input type="number" value={activeDraft.offer_price_twd} onChange={(event) => updateDraft("offer_price_twd", event.target.value)} /></label>
                <label>狀態<select value={activeDraft.status} onChange={(event) => updateDraft("status", event.target.value)}>{statusOptions.map((status) => <option key={status} value={status}>{statusLabels[status as keyof typeof statusLabels]}</option>)}</select></label>
                <label>下次追蹤日<input type="date" value={activeDraft.next_followup_at} onChange={(event) => updateDraft("next_followup_at", event.target.value)} /></label>
                <label className="clinic-wide">現況摘要<textarea value={activeDraft.client_summary} onChange={(event) => updateDraft("client_summary", event.target.value)} /></label>
                <label className="clinic-wide">內部提案理由<textarea value={activeDraft.internal_rationale} onChange={(event) => updateDraft("internal_rationale", event.target.value)} /></label>
                <label className="clinic-wide">建議頻率<textarea value={activeDraft.recommended_frequency} onChange={(event) => updateDraft("recommended_frequency", event.target.value)} /></label>
                <label className="clinic-wide">建議下一步<textarea value={activeDraft.recommended_next_step} onChange={(event) => updateDraft("recommended_next_step", event.target.value)} /></label>
                <label className="clinic-wide">lost reason / 內部備註<textarea value={activeDraft.lost_reason || activeDraft.internal_note} onChange={(event) => updateDraft(activeDraft.status === "lost" ? "lost_reason" : "internal_note", event.target.value)} /></label>
                <div className="clinic-wide bf-admin-actions">
                  <button className="bf-primary" type="submit" disabled={saving}>{saving ? "儲存中…" : "儲存提案"}</button>
                  {statusOptions.map((status) => <button className="bf-secondary" type="button" key={status} onClick={() => saveOffer(undefined, status)}>{statusLabels[status as keyof typeof statusLabels]}</button>)}
                </div>
                {notice && <div className="bf-notice clinic-wide">{notice}</div>}
              </form>

              <div className="bf-card">
                <h2 className="bf-section-title">3. 客戶版訊息產生器</h2>
                <h3>客戶版訊息</h3>
                <textarea className="clinic-copy-box" readOnly value={generated.clientMessage} />
                <h3>內部版摘要</h3>
                <textarea className="clinic-copy-box" readOnly value={generated.internalSummary} />
                {reference && (
                  <div className="bf-notice">
                    <strong>Part 4 商業規則參考</strong><br />
                    {reference.name_zh}｜參考價格：{money(reference.recommended_price_twd)}｜產品定位：{reference.positioning}<br />
                    revenue model：{reference.revenue_model}｜case_by_case：{reference.case_by_case ? "是" : "否"}｜高信任服務：{reference.is_high_trust ? "是" : "否"}｜最低權限：{reference.minimum_staff_level_name}
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="clinic-grid bf-section-gap">
            <FollowupCard title="4-1. 今天要追蹤" items={todayFollowups} onSelect={selectCandidate} onQuickStatus={(item, status, nextDate) => saveQuick(item, status, nextDate, reload, setNotice)} />
            <FollowupCard title="4-2. 已逾期未追" items={overdueFollowups} onSelect={selectCandidate} onQuickStatus={(item, status, nextDate) => saveQuick(item, status, nextDate, reload, setNotice)} />
            <FollowupCard title="4-3. 最近已送出提案" items={recentlySent} onSelect={selectCandidate} onQuickStatus={(item, status, nextDate) => saveQuick(item, status, nextDate, reload, setNotice)} />
            <FollowupCard title="4-4. 最近成交" items={recentlyWon} onSelect={selectCandidate} />
            <FollowupCard title="4-5. 最近 lost / nurture" items={recentlyNurture} onSelect={selectCandidate} />
          </section>
        </>
      )}
    </ClinicShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="bf-card"><strong>{label}</strong><div className="clinic-metric">{value}</div></div>;
}

function FollowupCard({ title, items, onSelect, onQuickStatus }: { title: string; items: PlanCandidate[]; onSelect: (item: PlanCandidate) => void; onQuickStatus?: (item: PlanCandidate, status: string, nextDate?: string) => void }) {
  return (
    <div className="bf-card">
      <h2 className="bf-section-title">{title}</h2>
      {items.length === 0 && <p>目前沒有資料。</p>}
      <div className="clinic-list">
        {items.map((item) => (
          <div className="clinic-item" key={item.id}>
            <strong>{item.display_name || item.client_code}｜{statusLabels[normalizeStatus(item.status) as keyof typeof statusLabels] ?? item.status}</strong>
            <span>{item.offer_title || offerTypes[pickOfferType(item) as keyof typeof offerTypes] || item.suggested_pitch}</span>
            <small>下次追蹤：{dateOnly(item.next_followup_at) || "未設定"}</small>
            <div className="bf-admin-actions">
              <button className="bf-secondary" type="button" onClick={() => onSelect(item)}>查看</button>
              {onQuickStatus && (<>
                <button className="bf-secondary" type="button" onClick={() => onQuickStatus(item, "discussing", addDays(3))}>標記已追蹤</button>
                <button className="bf-secondary" type="button" onClick={() => onQuickStatus(item, "won")}>won</button>
                <button className="bf-secondary" type="button" onClick={() => onQuickStatus(item, "lost")}>lost</button>
                <button className="bf-secondary" type="button" onClick={() => onQuickStatus(item, "nurture", addDays(14))}>nurture</button>
              </>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function saveQuick(item: PlanCandidate, status: string, nextFollowupAt: string | undefined, reload: () => Promise<void>, setNotice: (value: string) => void) {
  const payload: Record<string, string | null> = { status };
  if (nextFollowupAt) payload.next_followup_at = nextFollowupAt;
  if (status === "won") payload.won_at = new Date().toISOString();
  if (status === "lost") payload.lost_at = new Date().toISOString();
  await fetch(`/api/clinic/plan-candidates/${item.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  setNotice("追蹤工作區已快速更新。 ");
  await reload();
}
