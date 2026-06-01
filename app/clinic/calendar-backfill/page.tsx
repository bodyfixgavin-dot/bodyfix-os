"use client";

import { useState } from "react";
import { ClinicNotice, ClinicShell, Field, useClinicFetch } from "@/components/clinic/ClinicShell";

type ClientRow = {
  client_id?: string;
  id?: string;
  client_code?: string;
  display_name?: string;
  nickname?: string;
  client_name?: string;
};

type RecentBackfillRecord = {
  id: string;
  service_date: string | null;
  service_code: string | null;
  service_name_snapshot: string | null;
  body_region: string | null;
  price_twd: number | null;
  internal_notes: string | null;
  followup_needed: boolean | null;
  clients?: {
    client_code?: string | null;
    display_name?: string | null;
    client_name?: string | null;
  } | null;
};

type ClientsData = { clients: ClientRow[] };
type RecentData = { records: RecentBackfillRecord[] };

type SubmitState = { kind: "" | "success" | "error"; message: string };

const contactMethods = ["LINE", "IG", "電話", "其他", "未知"];
const locations = ["六張犁", "西門", "國父紀念館", "到府", "台中", "高雄", "台南", "新竹", "其他", "未知"];
const clientStatuses = ["熟客", "觀察", "新客", "流失", "未判斷"];
const serviceTypes = ["教練課", "雙人半私人教學", "筋膜鏈整理", "指定筋膜鏈整理", "多線整合整理", "骨盆核心整理", "紫微 / 塔羅", "其他"];
const paymentStatuses = ["已收", "未收", "不確定", "贈送", "套票扣除"];
const followupActions = ["詢問身體狀態", "提醒預約下次", "推 3 次整理", "推 12 次計畫", "確認未收款", "其他"];

function options(values: string[]) {
  return values.map((value) => <option key={value} value={value}>{value}</option>);
}

function getClientId(client: ClientRow) {
  return client.client_id ?? client.id ?? "";
}

function extractPaymentStatus(note: string | null) {
  if (!note) return "不確定";
  const match = note.match(/付款狀態：([^｜\n]+)/);
  return match?.[1] ?? "不確定";
}

export default function CalendarBackfillPage() {
  const clients = useClinicFetch<ClientsData>("/api/clinic/clients");
  const recent = useClinicFetch<RecentData>("/api/clinic/calendar-backfill");
  const [clientName, setClientName] = useState("");
  const [existingClientId, setExistingClientId] = useState("");
  const [followupDelay, setFollowupDelay] = useState("none");
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const normalizedClientName = clientName.trim().toLowerCase();
  const duplicateCandidates = !normalizedClientName || existingClientId || !clients.data?.clients
    ? []
    : clients.data.clients.filter((client) => {
      const names = [client.display_name, client.nickname, client.client_name]
        .filter(Boolean)
        .map((name) => String(name).trim().toLowerCase());
      return names.some((name) => name === normalizedClientName || name.includes(normalizedClientName) || normalizedClientName.includes(name));
    }).slice(0, 5);

  async function submit(formData: FormData) {
    setSubmitState({ kind: "", message: "" });
    setSubmitting(true);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/clinic/calendar-backfill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setSubmitState({ kind: "error", message: json.error ?? "回填失敗，請確認欄位與 Supabase schema。" });
      return;
    }
    setSubmitState({
      kind: "success",
      message: json.followup ? "已建立客戶 / 服務紀錄 / 追蹤提醒。" : "已建立客戶與過去服務紀錄。"
    });
    await Promise.all([clients.reload(), recent.reload()]);
  }

  return (
    <ClinicShell
      title="行事曆客戶回填"
      subtitle="Calendar Backfill to CRM｜把過去行事曆裡已服務過的客戶，整理成 BodyFix OS 的客戶資料與服務紀錄。"
    >
      <ClinicNotice loading={clients.loading || recent.loading} error={clients.error || recent.error} />

      <section className="bf-card bf-section-gap calendar-backfill-intro">
        <h2 className="bf-section-title">手動回填模式</h2>
        <p>這不是正式預約頁，也不是 Google Calendar 自動同步工具。今天只做一件事：一邊看行事曆，一邊把已服務過的客戶搬進 CRM。</p>
        <div className="bf-tag-row">
          <span className="bf-tag">來源固定：Google Calendar 回填</span>
          <span className="bf-tag">先補最近 30 天</span>
          <span className="bf-tag">手機單欄輸入</span>
        </div>
      </section>

      <form action={submit} className="bf-section-gap calendar-backfill-form">
        <section className="bf-card bf-form calendar-backfill-card">
          <h2 className="bf-section-title">快速新增客戶</h2>
          <Field label="使用既有客戶（可選）">
            <select name="existing_client_id" value={existingClientId} onChange={(event) => setExistingClientId(event.target.value)}>
              <option value="">建立新客戶</option>
              {clients.data?.clients.map((client) => (
                <option key={getClientId(client)} value={getClientId(client)}>
                  {client.client_code}｜{client.display_name ?? client.nickname ?? client.client_name ?? "未命名客戶"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="客戶稱呼 / 暱稱">
            <input name="client_name" value={clientName} onChange={(event) => setClientName(event.target.value)} required={!existingClientId} placeholder="例如：小宇" />
          </Field>
          {duplicateCandidates.length > 0 && (
            <div className="bf-notice calendar-backfill-warning">
              <strong>可能已有相同客戶，請確認是否合併或繼續新增。</strong>
              <ul>
                {duplicateCandidates.map((client) => <li key={getClientId(client)}>{client.client_code}｜{client.display_name ?? client.nickname ?? client.client_name}</li>)}
              </ul>
            </div>
          )}
          <Field label="聯絡方式類型"><select name="contact_method" defaultValue="未知">{options(contactMethods)}</select></Field>
          <Field label="聯絡方式內容（可空白）"><input name="contact_value" placeholder="LINE / IG / 電話，知道多少填多少" /></Field>
          <Field label="來源"><input name="source" value="google_calendar_backfill" readOnly /></Field>
          <Field label="常見地點"><select name="preferred_location" defaultValue="未知">{options(locations)}</select></Field>
          <Field label="客戶狀態"><select name="client_status" defaultValue="未判斷">{options(clientStatuses)}</select></Field>
          <Field label="備註"><textarea name="note" placeholder="身體狀態、付款、下次方向，一句話即可。" /></Field>
        </section>

        <section className="bf-card bf-form calendar-backfill-card">
          <h2 className="bf-section-title">新增過去服務紀錄</h2>
          <Field label="服務日期"><input name="service_date" type="date" required /></Field>
          <Field label="服務類型"><select name="service_type" defaultValue="筋膜鏈整理">{options(serviceTypes)}</select></Field>
          <Field label="服務名稱（可手動輸入）"><input name="service_name" placeholder="例如：筋膜鏈整理 90 分" /></Field>
          <Field label="服務時長（分鐘）"><input name="duration_min" type="number" min="0" inputMode="numeric" placeholder="90" /></Field>
          <Field label="服務地點"><select name="location" defaultValue="六張犁">{options(locations)}</select></Field>
          <Field label="付款狀態"><select name="payment_status" defaultValue="不確定">{options(paymentStatuses)}</select></Field>
          <Field label="金額（可空白）"><input name="amount" type="number" min="0" inputMode="numeric" placeholder="例如：3000" /></Field>
          <Field label="服務紀錄備註"><textarea name="record_note" defaultValue="行事曆回填，詳細內容未補。" /></Field>
        </section>

        <section className="bf-card bf-form calendar-backfill-card">
          <h2 className="bf-section-title">是否建立追蹤</h2>
          <Field label="是否建立追蹤提醒">
            <select name="followup_delay" value={followupDelay} onChange={(event) => setFollowupDelay(event.target.value)}>
              <option value="none">不建立</option>
              <option value="3d">3 天後</option>
              <option value="7d">7 天後</option>
              <option value="14d">14 天後</option>
              <option value="custom">自訂日期</option>
            </select>
          </Field>
          {followupDelay === "custom" && <Field label="自訂追蹤日期"><input name="custom_followup_date" type="date" /></Field>}
          <Field label="追蹤類型"><select name="followup_action" defaultValue="詢問身體狀態">{options(followupActions)}</select></Field>
          {submitState.message && <div className={submitState.kind === "success" ? "bf-success" : "bf-notice"}>{submitState.message}</div>}
          <button className="bf-primary calendar-backfill-submit" type="submit" disabled={submitting}>{submitting ? "回填中…" : "建立回填資料"}</button>
        </section>
      </form>

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">最近回填紀錄</h2>
        {recent.data?.records.length ? (
          <div className="calendar-backfill-list">
            {recent.data.records.map((record) => (
              <article className="clinic-item" key={record.id}>
                <strong>{record.service_date ?? "未填日期"}｜{record.clients?.display_name ?? record.clients?.client_name ?? "未命名客戶"}</strong>
                <span>{record.service_name_snapshot ?? record.service_code ?? "未填服務"}｜{record.body_region ?? "未知地點"}</span>
                <small>付款狀態：{extractPaymentStatus(record.internal_notes)}｜追蹤：{record.followup_needed ? "已建立 / 需要追蹤" : "不建立"}</small>
              </article>
            ))}
          </div>
        ) : (
          <div className="calendar-backfill-empty">
            <strong>目前尚無行事曆回填紀錄。</strong>
            <span>你可以先從最近 30 天的客戶開始輸入。</span>
          </div>
        )}
      </section>
    </ClinicShell>
  );
}
