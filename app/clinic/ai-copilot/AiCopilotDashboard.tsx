"use client";

import { useMemo, useState } from "react";
import { ClinicNotice, ClinicShell, useClinicFetch } from "@/components/clinic/ClinicShell";

type Client = { id?: string; client_id?: string; display_name?: string; client_code?: string; current_stage?: string; priority?: string };
type Candidate = { id: string; client_id: string; display_name?: string; offer_title?: string; suggested_plan_type?: string; status?: string };
type AiLog = { id: string; module_key: string; status: string; user_feedback?: string; output_payload?: Record<string, unknown>; model_name?: string; provider_name?: string; created_at?: string };
type AiResponse = { output?: Record<string, unknown>; log?: AiLog; error?: string };

type ClientsResponse = { clients: Client[] };
type ConversionResponse = { plan_candidates: Candidate[] };
type LogsResponse = { logs: AiLog[] };

type PanelState = { loading: boolean; error: string; result: AiResponse | null };

const emptyPanel: PanelState = { loading: false, error: "", result: null };

const moduleLabels: Record<string, string> = {
  client_summary: "客戶摘要",
  offer_message: "提案草稿",
  today_followup: "今日追蹤",
  location_analysis: "地區需求分析",
};

const statusOptions = ["copied", "edited", "accepted", "rejected"];

function stringifyOutput(output?: Record<string, unknown>) {
  if (!output) return "";
  const copyText = output.copy_text;
  if (typeof copyText === "string" && copyText.trim()) return copyText;
  return JSON.stringify(output, null, 2);
}

function OutputCard({ state, onMark }: { state: PanelState; onMark: (status: string) => Promise<void> }) {
  const output = state.result?.output;
  const log = state.result?.log;
  const copyText = stringifyOutput(output);
  if (state.loading) return <div className="bf-card">AI 產生中…</div>;
  if (state.error) return <div className="bf-notice">{state.error}</div>;
  if (!output) return null;
  return (
    <div className="bf-card bf-section-gap">
      <strong>這是 AI 草稿，需 Gavin 確認</strong>
      <p className="bf-muted">Model：{String(output.model_name ?? log?.model_name ?? "unknown")}｜Provider：{String(output.provider_name ?? log?.provider_name ?? "unknown")}｜Created：{String(output.created_at ?? log?.created_at ?? "unknown")}</p>
      <pre className="clinic-ai-output">{JSON.stringify(output, null, 2)}</pre>
      <div className="clinic-actions">
        <button type="button" onClick={() => navigator.clipboard.writeText(copyText)}>複製可用文字</button>
        {statusOptions.map((status) => <button type="button" key={status} onClick={() => onMark(status)}>{status}</button>)}
      </div>
      <p className="bf-muted">安全提醒：AI 只讀取、整理、建議與產生草稿；不自動發訊息、不改預約、不改價格、不轉客戶狀態。Location Demand 第一版只做分析。</p>
    </div>
  );
}

function ClientSelect({ clients, value, onChange }: { clients: Client[]; value: string; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">選擇 client</option>
      {clients.map((client) => {
        const id = client.id ?? client.client_id ?? "";
        return <option key={id} value={id}>{client.display_name ?? client.client_code ?? id}｜{client.current_stage ?? "stage?"}｜{client.priority ?? ""}</option>;
      })}
    </select>
  );
}

async function postJson(url: string, body: Record<string, unknown> = {}) {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "AI request failed");
  return json as AiResponse;
}

async function patchLog(id: string, status: string) {
  const res = await fetch(`/api/clinic/ai-copilot/logs/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Unable to update AI log");
}

export function AiCopilotDashboard() {
  const clientsState = useClinicFetch<ClientsResponse>("/api/clinic/clients");
  const conversionState = useClinicFetch<ConversionResponse>("/api/clinic/conversion");
  const logsState = useClinicFetch<LogsResponse>("/api/clinic/ai-copilot/logs");
  const [clientId, setClientId] = useState("");
  const [offerClientId, setOfferClientId] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [panels, setPanels] = useState<Record<string, PanelState>>({
    client_summary: emptyPanel,
    offer_message: emptyPanel,
    today_followup: emptyPanel,
    location_analysis: emptyPanel,
  });

  const clients = clientsState.data?.clients ?? [];
  const candidates = useMemo(() => conversionState.data?.plan_candidates ?? [], [conversionState.data?.plan_candidates]);
  const loading = clientsState.loading || conversionState.loading || logsState.loading;
  const error = clientsState.error || conversionState.error || logsState.error;

  const selectedCandidate = useMemo(() => candidates.find((candidate) => candidate.id === candidateId), [candidateId, candidates]);

  async function run(moduleKey: string, url: string, body: Record<string, unknown> = {}) {
    setPanels((prev) => ({ ...prev, [moduleKey]: { loading: true, error: "", result: null } }));
    try {
      const result = await postJson(url, body);
      setPanels((prev) => ({ ...prev, [moduleKey]: { loading: false, error: "", result } }));
      logsState.reload();
    } catch (error) {
      setPanels((prev) => ({ ...prev, [moduleKey]: { loading: false, error: error instanceof Error ? error.message : "AI request failed", result: null } }));
    }
  }

  async function mark(moduleKey: string, status: string) {
    const logId = panels[moduleKey]?.result?.log?.id;
    if (!logId) return;
    await patchLog(logId, status);
    logsState.reload();
  }

  return (
    <ClinicShell title="AI 營運副駕" subtitle="BodyFix AI Copilot MVP：只讀取、整理、建議與產生草稿，不自動發送或修改正式資料。">
      <ClinicNotice loading={loading} error={error} />
      <section className="bf-card bf-section-gap">
        <h2>Part 7A 安全邊界</h2>
        <p>最高原則引用：<code>docs/ai-copilot-principles.md</code>。所有 AI 輸出都是草稿，正式動作必須由 Gavin 確認。</p>
        <ul>
          <li>不自動發 LINE / IG 訊息。</li>
          <li>不自動改預約、價格、付款或客戶狀態。</li>
          <li>不做醫療判讀、不承諾療效。</li>
          <li>Location Demand Analysis Only：只做分析，不產生邀約草稿。</li>
        </ul>
      </section>

      <section className="bf-grid bf-section-gap">
        <div className="bf-card">
          <h2>1. AI Client Summary｜客戶摘要</h2>
          <p className="bf-muted">讀取 client 主檔、最近 3 筆 service records、plan candidates 與 follow-ups。</p>
          <ClientSelect clients={clients} value={clientId} onChange={setClientId} />
          <button type="button" disabled={!clientId || panels.client_summary.loading} onClick={() => run("client_summary", "/api/clinic/ai-copilot/client-summary", { client_id: clientId })}>產生客戶摘要</button>
          <OutputCard state={panels.client_summary} onMark={(status) => mark("client_summary", status)} />
        </div>

        <div className="bf-card">
          <h2>2. AI Offer Message Generator｜提案草稿</h2>
          <p className="bf-muted">產生 LINE / IG 可複製提案文字，但不自動發送。</p>
          <ClientSelect clients={clients} value={offerClientId} onChange={(value) => { setOfferClientId(value); setCandidateId(""); }} />
          <select value={candidateId} onChange={(event) => { setCandidateId(event.target.value); setOfferClientId(""); }}>
            <option value="">或選擇 plan candidate / offer</option>
            {candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.display_name ?? candidate.client_id}｜{candidate.offer_title ?? candidate.suggested_plan_type}｜{candidate.status}</option>)}
          </select>
          <button type="button" disabled={(!offerClientId && !candidateId) || panels.offer_message.loading} onClick={() => run("offer_message", "/api/clinic/ai-copilot/offer-message", candidateId ? { plan_candidate_id: candidateId } : { client_id: offerClientId })}>產生提案草稿</button>
          {selectedCandidate ? <p className="bf-muted">目前選擇：{selectedCandidate.display_name ?? selectedCandidate.client_id}</p> : null}
          <OutputCard state={panels.offer_message} onMark={(status) => mark("offer_message", status)} />
        </div>

        <div className="bf-card">
          <h2>3. AI Today Follow-up｜今日追蹤建議</h2>
          <p className="bf-muted">整理今天到期、逾期、高意願但未成交名單與建議追蹤順序。</p>
          <button type="button" disabled={panels.today_followup.loading} onClick={() => run("today_followup", "/api/clinic/ai-copilot/today-followup")}>產生今日追蹤建議</button>
          <OutputCard state={panels.today_followup} onMark={(status) => mark("today_followup", status)} />
        </div>

        <div className="bf-card">
          <h2>4. Location Demand Analysis Only</h2>
          <p className="bf-muted">只分析城市、台北區域、來源區與 studio block 訊號；不產生邀約草稿。</p>
          <button type="button" disabled={panels.location_analysis.loading} onClick={() => run("location_analysis", "/api/clinic/ai-copilot/location-analysis")}>分析地區需求</button>
          <OutputCard state={panels.location_analysis} onMark={(status) => mark("location_analysis", status)} />
        </div>
      </section>

      <section className="bf-card bf-section-gap">
        <h2>AI 執行紀錄</h2>
        <p className="bf-muted">只記錄 AI 執行與草稿輸出，不修改正式客戶、預約或提案狀態。</p>
        <div className="bf-table-wrap">
          <table>
            <thead><tr><th>時間</th><th>模組</th><th>狀態</th><th>模型</th><th>Provider</th></tr></thead>
            <tbody>
              {(logsState.data?.logs ?? []).map((log) => <tr key={log.id}><td>{log.created_at}</td><td>{moduleLabels[log.module_key] ?? log.module_key}</td><td>{log.status}</td><td>{log.model_name}</td><td>{log.provider_name}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </ClinicShell>
  );
}
