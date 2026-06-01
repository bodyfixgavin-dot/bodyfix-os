"use client";

import { useEffect, useState } from "react";
import { ClinicNotice, ClinicShell } from "@/components/clinic/ClinicShell";

type RecentBackfillRecord = {
  id: string;
  service_date: string | null;
  service_code: string | null;
  service_name_snapshot: string | null;
  body_region: string | null;
  internal_notes: string | null;
  followup_needed: boolean | null;
  clients?: {
    client_code?: string | null;
    display_name?: string | null;
    client_name?: string | null;
  } | null;
};

type RecentData = { records: RecentBackfillRecord[] };
type PreviewItem = { file: string; row: number; reason: string; value?: string; incoming?: string; existing?: string };
type DryRunResult = {
  summary: {
    clients_rows: number;
    service_records_rows: number;
    followup_rows: number;
    planned_new_clients: number;
    planned_service_records: number;
    planned_followups: number;
    missing_names: number;
    possible_duplicates: number;
  };
  issues: PreviewItem[];
  duplicates: PreviewItem[];
  review_list: PreviewItem[];
  result?: {
    clients_created: number;
    clients_updated: number;
    clients_skipped: number;
    service_records_created: number;
    followups_created: number;
    failed: number;
  };
};

type UploadState = {
  clientsCsv: string;
  serviceRecordsCsv: string;
  followupsCsv: string;
};

type SubmitState = { kind: "" | "success" | "error"; message: string };

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="calendar-backfill-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProblemList({ title, items, emptyText }: { title: string; items: PreviewItem[]; emptyText: string }) {
  return (
    <details className="calendar-backfill-details" open={items.length > 0}>
      <summary>{title}（{items.length}）</summary>
      {items.length ? (
        <div className="calendar-backfill-problems">
          {items.slice(0, 50).map((item, index) => (
            <article className="clinic-item" key={`${item.file}-${item.row}-${index}`}>
              <strong>{item.file}｜第 {item.row} 列</strong>
              <span>{item.reason}</span>
              <small>{item.value ?? item.incoming ?? ""}{item.existing ? ` → ${item.existing}` : ""}</small>
            </article>
          ))}
          {items.length > 50 && <small>僅顯示前 50 筆，請下載或整理 CSV 後再匯入。</small>}
        </div>
      ) : <p>{emptyText}</p>}
    </details>
  );
}

async function readFile(file: File | undefined) {
  if (!file) return "";
  return file.text();
}

function hasCsv(upload: UploadState) {
  return Boolean(upload.clientsCsv || upload.serviceRecordsCsv || upload.followupsCsv);
}

export default function CalendarBackfillPage() {
  const [recent, setRecent] = useState<RecentData | null>(null);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [recentError, setRecentError] = useState("");
  const [upload, setUpload] = useState<UploadState>({ clientsCsv: "", serviceRecordsCsv: "", followupsCsv: "" });
  const [fileNames, setFileNames] = useState({ clients: "", services: "", followups: "" });
  const [dryRun, setDryRun] = useState<DryRunResult | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "", message: "" });
  const [busy, setBusy] = useState(false);

  async function loadRecent() {
    setLoadingRecent(true);
    const res = await fetch("/api/clinic/calendar-backfill", { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setRecentError(json.error ?? "最近匯入紀錄載入失敗。");
      setRecent(null);
    } else {
      setRecentError("");
      setRecent(json as RecentData);
    }
    setLoadingRecent(false);
  }

  useEffect(() => {
    loadRecent();
  }, []);

  async function onFiles(formData: FormData) {
    const clientsFile = formData.get("clients_csv") as File | null;
    const serviceFile = formData.get("service_records_csv") as File | null;
    const followupFile = formData.get("followups_csv") as File | null;
    setUpload({
      clientsCsv: await readFile(clientsFile ?? undefined),
      serviceRecordsCsv: await readFile(serviceFile ?? undefined),
      followupsCsv: await readFile(followupFile ?? undefined)
    });
    setFileNames({
      clients: clientsFile?.name ?? "",
      services: serviceFile?.name ?? "",
      followups: followupFile?.name ?? ""
    });
    setDryRun(null);
    setSubmitState({ kind: "success", message: "CSV 已載入瀏覽器暫存，請先執行 Dry Run。" });
  }

  async function runImport(mode: "dry_run" | "confirm") {
    setBusy(true);
    setSubmitState({ kind: "", message: "" });
    const res = await fetch("/api/clinic/calendar-backfill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, ...upload })
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setSubmitState({ kind: "error", message: json.error ?? "匯入流程失敗，請檢查 CSV 欄位或 Supabase schema。" });
      return;
    }
    setDryRun(json as DryRunResult);
    if (mode === "dry_run") {
      setSubmitState({ kind: "success", message: "Dry Run 完成：尚未寫入 Supabase。" });
    } else {
      setSubmitState({ kind: "success", message: "正式匯入完成，請查看成功與失敗數量。" });
      await loadRecent();
    }
  }

  function confirmImport() {
    if (!dryRun) {
      setSubmitState({ kind: "error", message: "請先執行 Dry Run，再正式匯入。" });
      return;
    }
    if (window.confirm("確定要正式寫入 Supabase？此動作會建立 clients / service_records / followups，但不會扣 balances。")) {
      runImport("confirm");
    }
  }

  const canDryRun = hasCsv(upload) && !busy;
  const canConfirm = Boolean(dryRun) && !busy;

  return (
    <ClinicShell
      title="行事曆 / 客戶總表回填"
      subtitle="將過去服務紀錄與客戶資料整理進 BodyFix OS。"
    >
      <ClinicNotice loading={loadingRecent} error={recentError} />

      <section className="bf-card bf-section-gap calendar-backfill-intro">
        <h2 className="bf-section-title">內部 admin / migration 工具</h2>
        <p>此工具為內部資料回填工具。正式匯入前請先執行 Dry Run；上傳 CSV 不會直接寫入 Supabase，也不會自動扣 balances。</p>
        <div className="bf-tag-row">
          <span className="bf-tag">支援 clients CSV</span>
          <span className="bf-tag">支援 service_records CSV</span>
          <span className="bf-tag">支援 followup priority CSV</span>
        </div>
      </section>

      <form action={onFiles} className="bf-card bf-form bf-section-gap calendar-backfill-card calendar-backfill-upload">
        <h2 className="bf-section-title">1. 上傳 CSV</h2>
        <label>bodyfix_clients_import_clean.csv<input name="clients_csv" type="file" accept=".csv,text/csv" /></label>
        <label>bodyfix_service_records_import_clean.csv<input name="service_records_csv" type="file" accept=".csv,text/csv" /></label>
        <label>bodyfix_followup_priority_clean.csv<input name="followups_csv" type="file" accept=".csv,text/csv" /></label>
        <button className="bf-primary calendar-backfill-submit" type="submit">載入 CSV（不寫入）</button>
        <small>已載入：{[fileNames.clients, fileNames.services, fileNames.followups].filter(Boolean).join("、") || "尚未選擇檔案"}</small>
      </form>

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">2. Dry Run 預覽</h2>
        <button className="bf-primary calendar-backfill-submit" type="button" onClick={() => runImport("dry_run")} disabled={!canDryRun}>{busy ? "處理中…" : "執行 Dry Run（不寫入資料庫）"}</button>
        {submitState.message && <div className={submitState.kind === "success" ? "bf-success" : "bf-notice"}>{submitState.message}</div>}
        {dryRun && (
          <div className="calendar-backfill-stats" aria-live="polite">
            <StatCard label="預計新增客戶" value={dryRun.summary.planned_new_clients} />
            <StatCard label="預計新增服務紀錄" value={dryRun.summary.planned_service_records} />
            <StatCard label="預計建立追蹤候選" value={dryRun.summary.planned_followups} />
            <StatCard label="缺少姓名" value={dryRun.summary.missing_names} />
            <StatCard label="可能重複客戶" value={dryRun.summary.possible_duplicates} />
          </div>
        )}
      </section>

      {dryRun && (
        <section className="bf-card bf-section-gap">
          <h2 className="bf-section-title">3. 問題資料與可能重複客戶</h2>
          <ProblemList title="問題資料列表" items={dryRun.issues} emptyText="目前沒有偵測到必要欄位缺漏。" />
          <ProblemList title="可能重複客戶列表" items={dryRun.duplicates} emptyText="目前沒有偵測到可能重複客戶。" />
          <ProblemList title="Review list" items={dryRun.review_list} emptyText="目前沒有需要人工 review 的資料。" />
        </section>
      )}

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">4. Confirm Import 正式匯入</h2>
        <p className="calendar-backfill-note">正式匯入時：client_code 已存在會更新 notes / priority；只有姓名相同但無法確認者會略過並進入 review list；歷史服務紀錄不會扣 balances。</p>
        <button className="bf-primary calendar-backfill-submit calendar-backfill-danger" type="button" onClick={confirmImport} disabled={!canConfirm}>{busy ? "匯入中…" : "Confirm Import（需二次確認）"}</button>
        {dryRun?.result && (
          <div className="calendar-backfill-stats calendar-backfill-result">
            <StatCard label="新增 clients" value={dryRun.result.clients_created} />
            <StatCard label="更新 clients" value={dryRun.result.clients_updated} />
            <StatCard label="略過 clients" value={dryRun.result.clients_skipped} />
            <StatCard label="新增 service_records" value={dryRun.result.service_records_created} />
            <StatCard label="新增 followups" value={dryRun.result.followups_created} />
            <StatCard label="失敗" value={dryRun.result.failed} />
          </div>
        )}
      </section>

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">5. 最近匯入紀錄</h2>
        {recent?.records.length ? (
          <div className="calendar-backfill-list">
            {recent.records.map((record) => (
              <article className="clinic-item" key={record.id}>
                <strong>{record.service_date ?? "未填日期"}｜{record.clients?.display_name ?? record.clients?.client_name ?? "未命名客戶"}</strong>
                <span>{record.service_name_snapshot ?? record.service_code ?? "未填服務"}｜{record.body_region ?? "未知地點"}</span>
                <small>{record.internal_notes?.split("\n")[0] ?? "Calendar Backfill"}｜追蹤：{record.followup_needed ? "需要追蹤" : "不建立"}</small>
              </article>
            ))}
          </div>
        ) : (
          <div className="calendar-backfill-empty">
            <strong>目前尚無 Calendar Backfill 匯入紀錄。</strong>
            <span>請先上傳 CSV，Dry Run 確認後再正式匯入。</span>
          </div>
        )}
      </section>
    </ClinicShell>
  );
}
