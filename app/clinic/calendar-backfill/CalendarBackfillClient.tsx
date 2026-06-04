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
type ImportMessage = { table: string; row?: number; message: string };
type DryRunResult = {
  parsedRows?: number;
  validRows?: number;
  missingNameRows?: PreviewItem[];
  possibleDuplicates?: PreviewItem[];
  invalidDateRows?: PreviewItem[];
  invalidAmountRows?: PreviewItem[];
  previewClientsCount?: number;
  previewServiceRecordsCount?: number;
  summary: {
    clients_rows: number;
    service_records_rows: number;
    followup_rows: number;
    planned_new_clients: number;
    planned_service_records: number;
    planned_followups: number;
    missing_names: number;
    possible_duplicates: number;
    unparseable_rows?: number;
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
    createdClients?: number;
    createdServiceRecords?: number;
    createdFollowups?: number;
    skippedRows?: number;
    warnings?: ImportMessage[];
    errors?: ImportMessage[];
  };
  warnings?: ImportMessage[];
  errors?: ImportMessage[];
};

type UploadState = {
  clientsCsv: string;
  serviceRecordsCsv: string;
  followupsCsv: string;
};

type PasteFormat = "auto" | "tsv" | "csv";
type SubmitState = { kind: "" | "success" | "error"; message: string };

const pasteExample = `client_name\tcontact_method\tcontact_value\tservice_date\tservice_type\tservice_name\tduration_min\tlocation\tpayment_status\tamount\tpriority\tnote
小宇\tLINE\t\t2026-06-01\t筋膜整理\t筋膜鏈整理 60 分鐘\t60\t六張犁\t已收\t2200\tP1\t行事曆回填
阿哲\tIG\t\t2026-06-03\t骨盆核心整理\t骨盆核心整理 60 分鐘\t60\t西門\t已收\t2500\tP2\t行事曆回填`;

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
          {items.length > 50 && <small>僅顯示前 50 筆，請先整理資料後再匯入。</small>}
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
  const [pasteText, setPasteText] = useState("");
  const [pasteFormat, setPasteFormat] = useState<PasteFormat>("auto");
  const [dryRun, setDryRun] = useState<DryRunResult | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "", message: "" });
  const [busy, setBusy] = useState(false);

  async function loadRecent() {
    setLoadingRecent(true);
    try {
      const res = await fetch("/api/clinic/calendar-backfill", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRecentError(json.error ?? "最近匯入紀錄載入失敗。");
        setRecent(null);
      } else {
        setRecentError("");
        setRecent(json as RecentData);
      }
    } catch {
      setRecentError("最近匯入紀錄載入失敗：請檢查 /api/clinic/calendar-backfill request path 或網路狀態。");
      setRecent(null);
    } finally {
      setLoadingRecent(false);
    }
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
    try {
      const res = await fetch("/api/clinic/calendar-backfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, ...upload, pasteText, pasteFormat })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fallback = mode === "dry_run"
          ? "Dry Run 解析失敗：請檢查貼上資料格式。"
          : "Confirm Import clients 寫入失敗：請檢查 clients schema 或 server log。";
        setSubmitState({ kind: "error", message: json.error ?? fallback });
        return;
      }
      setDryRun(json as DryRunResult);
      if (mode === "dry_run") {
        setSubmitState({ kind: "success", message: "Dry Run 完成：尚未寫入 Supabase。" });
      } else {
        const result = (json as DryRunResult).result;
        const warningCount = result?.warnings?.length ?? (json as DryRunResult).warnings?.length ?? 0;
        const skippedRows = result?.skippedRows ?? 0;
        setSubmitState({
          kind: "success",
          message: `正式匯入完成：clients ${result?.clients_created ?? 0} 筆、service_records ${result?.service_records_created ?? 0} 筆、followups ${result?.followups_created ?? 0} 筆；warning ${warningCount} 筆、skipped ${skippedRows} 筆。`
        });
        await loadRecent();
      }
    } catch {
      setSubmitState({ kind: "error", message: "匯入請求失敗：請檢查 /api/clinic/calendar-backfill request path 或網路狀態。" });
    } finally {
      setBusy(false);
    }
  }

  const dryRunHasProblems = Boolean(
    dryRun && (
      dryRun.issues.length > 0 ||
      dryRun.summary.missing_names > 0 ||
      (dryRun.summary.unparseable_rows ?? 0) > 0
    )
  );

  function confirmImport() {
    if (!dryRun) {
      setSubmitState({ kind: "error", message: "請先執行 Dry Run，再正式匯入。" });
      return;
    }
    if (dryRunHasProblems) {
      setSubmitState({ kind: "error", message: "請先修正 Dry Run 標出的問題資料後再匯入。" });
      return;
    }
    if (window.confirm("確定要正式寫入 Supabase？此動作會建立 clients / service_records / followups，但不會扣 balances。")) {
      runImport("confirm");
    }
  }

  const hasPasteText = Boolean(pasteText.trim());
  const hasImportSource = hasCsv(upload) || hasPasteText;
  const canDryRun = hasImportSource && !busy;
  const canConfirm = Boolean(dryRun) && !dryRunHasProblems && !busy;
  const pasteStatus = !hasPasteText
    ? "請貼上資料後執行 Dry Run。"
    : !dryRun
      ? "已偵測到貼上資料，請先執行 Dry Run 預覽。"
      : dryRunHasProblems
        ? "請先修正問題資料後再匯入。"
        : "Dry Run 完成，可確認後正式匯入。";

  return (
    <ClinicShell
      title="行事曆 / 客戶總表回填"
      subtitle="將過去服務紀錄與客戶資料整理進 BodyFix OS。"
    >
      <ClinicNotice loading={loadingRecent} error={recentError} />

      <section className="bf-card bf-section-gap calendar-backfill-intro">
        <h2 className="bf-section-title">內部 admin / migration 工具</h2>
        <p>此工具為 admin-only 內部資料回填工具。建議手機使用「貼上資料匯入」，從 Google Sheet / Numbers / 備忘錄複製表格文字後貼上；Dry Run 不會寫入 Supabase，也不會自動扣 balances。</p>
        <div className="bf-tag-row">
          <span className="bf-tag">Paste Import</span>
          <span className="bf-tag">優先支援 TSV</span>
          <span className="bf-tag">支援 CSV</span>
          <span className="bf-tag">Dry Run / Confirm Import</span>
        </div>
      </section>

      <section className="bf-card bf-form bf-section-gap calendar-backfill-card calendar-backfill-paste">
        <h2 className="bf-section-title">1. 貼上資料匯入 / Paste Import</h2>
        <p className="calendar-backfill-note">第一列請放欄位名稱；必要欄位只有 client_name。欄位順序可調整，系統會依 header 對應 clients / service_records / followups。</p>
        <label>
          貼上資料文字框
          <textarea
            value={pasteText}
            onChange={(event) => { setPasteText(event.target.value); setDryRun(null); }}
            placeholder="請從 Google Sheet / Numbers / 行事曆整理表複製資料後貼上。第一列請放欄位名稱。"
            rows={10}
          />
        </label>
        <label>
          格式選擇
          <select value={pasteFormat} onChange={(event) => { setPasteFormat(event.target.value as PasteFormat); setDryRun(null); }}>
            <option value="auto">自動偵測</option>
            <option value="tsv">TSV</option>
            <option value="csv">CSV</option>
          </select>
        </label>
        <p className="calendar-backfill-status" aria-live="polite">{pasteStatus}</p>
        <div className="calendar-backfill-actions" aria-label="貼上式匯入操作">
          <button className="bf-primary calendar-backfill-submit" type="button" onClick={() => runImport("dry_run")} disabled={!canDryRun}>
            {busy ? "處理中…" : "Dry Run 預覽"}
          </button>
          <button className="bf-primary calendar-backfill-submit calendar-backfill-danger" type="button" onClick={confirmImport} disabled={!canConfirm}>
            {busy ? "匯入中…" : "Confirm Import 正式匯入"}
          </button>
        </div>
        {!canConfirm && <small className="calendar-backfill-helper">請先執行 Dry Run 預覽。</small>}
        {submitState.message && <div className={submitState.kind === "success" ? "bf-success" : "bf-notice"}>{submitState.message}</div>}
        {dryRun && (
          <div className="calendar-backfill-preview" aria-live="polite">
            <h3>Dry Run 結果</h3>
            <div className="calendar-backfill-stats">
              <StatCard label="解析資料筆數" value={dryRun.parsedRows ?? dryRun.summary.clients_rows} />
              <StatCard label="有效客戶資料筆數" value={dryRun.validRows ?? Math.max(0, dryRun.summary.clients_rows - dryRun.summary.missing_names)} />
              <StatCard label="預計新增客戶數" value={dryRun.previewClientsCount ?? dryRun.summary.planned_new_clients} />
              <StatCard label="預計新增服務紀錄數" value={dryRun.previewServiceRecordsCount ?? dryRun.summary.planned_service_records} />
              <StatCard label="預計建立追蹤候選數" value={dryRun.summary.planned_followups} />
              <StatCard label="缺少姓名筆數" value={dryRun.summary.missing_names} />
              <StatCard label="可能重複客戶數" value={dryRun.summary.possible_duplicates} />
              <StatCard label="無法解析筆數" value={dryRun.summary.unparseable_rows ?? 0} />
            </div>
          </div>
        )}
        <details className="calendar-backfill-details">
          <summary>範例格式（TSV）</summary>
          <pre className="calendar-backfill-example">{pasteExample}</pre>
        </details>
        {!hasPasteText && !hasCsv(upload) && (
          <div className="calendar-backfill-empty">
            <strong>尚未提供匯入資料。</strong>
            <span>手機建議先在試算表整理欄位，直接複製表格後貼到上方文字框，再按 Dry Run。</span>
          </div>
        )}
      </section>

      <details className="bf-card bf-section-gap calendar-backfill-card calendar-backfill-details calendar-backfill-upload-panel">
        <summary>進階：舊版 CSV 上傳</summary>
        <form action={onFiles} className="bf-form calendar-backfill-upload">
          <label>bodyfix_clients_import_clean.csv<input name="clients_csv" type="file" accept=".csv,text/csv" /></label>
          <label>bodyfix_service_records_import_clean.csv<input name="service_records_csv" type="file" accept=".csv,text/csv" /></label>
          <label>bodyfix_followup_priority_clean.csv<input name="followups_csv" type="file" accept=".csv,text/csv" /></label>
          <button className="bf-primary calendar-backfill-submit" type="submit">載入 CSV（不寫入）</button>
          <small>已載入：{[fileNames.clients, fileNames.services, fileNames.followups].filter(Boolean).join("、") || "尚未選擇檔案"}</small>
        </form>
      </details>

      {dryRun && (
        <section className="bf-card bf-section-gap">
          <h2 className="bf-section-title">2. 問題資料與可能重複客戶</h2>
          <ProblemList title="問題資料列表" items={dryRun.issues} emptyText="目前沒有偵測到必要欄位缺漏或解析問題。" />
          <ProblemList title="可能重複客戶列表" items={dryRun.duplicates} emptyText="目前沒有偵測到可能重複客戶。" />
          <ProblemList title="Review list" items={dryRun.review_list} emptyText="目前沒有需要人工 review 的資料。" />
          <ProblemList title="Dry Run warnings" items={(dryRun.warnings ?? []).map((warning) => ({ file: warning.table, row: warning.row ?? 0, reason: warning.message }))} emptyText="目前沒有 schema 或匯入警告。" />
        </section>
      )}

      {dryRun?.result && (
        <section className="bf-card bf-section-gap">
          <h2 className="bf-section-title">3. 正式匯入結果</h2>
          <div className="calendar-backfill-stats calendar-backfill-result">
            <StatCard label="新增 clients" value={dryRun.result.clients_created} />
            <StatCard label="更新 clients" value={dryRun.result.clients_updated} />
            <StatCard label="略過 clients" value={dryRun.result.clients_skipped} />
            <StatCard label="新增 service_records" value={dryRun.result.service_records_created} />
            <StatCard label="新增 followups" value={dryRun.result.followups_created} />
            <StatCard label="Warning" value={dryRun.result.warnings?.length ?? dryRun.warnings?.length ?? 0} />
            <StatCard label="Skipped rows" value={dryRun.result.skippedRows ?? 0} />
            <StatCard label="Error" value={dryRun.result.errors?.length ?? dryRun.errors?.length ?? dryRun.result.failed} />
          </div>
          {Boolean(dryRun.result.warnings?.length ?? dryRun.warnings?.length) && (
            <details className="calendar-backfill-details" open>
              <summary>Warnings（{dryRun.result.warnings?.length ?? dryRun.warnings?.length ?? 0}）</summary>
              <div className="calendar-backfill-problems">
                {(dryRun.result.warnings ?? dryRun.warnings ?? []).slice(0, 50).map((warning, index) => (
                  <article className="clinic-item" key={`${warning.table}-${warning.row ?? index}`}>
                    <strong>{warning.table}{warning.row ? `｜第 ${warning.row} 列` : ""}</strong>
                    <span>{warning.message}</span>
                  </article>
                ))}
              </div>
            </details>
          )}
          {Boolean(dryRun.result.errors?.length ?? dryRun.errors?.length) && (
            <details className="calendar-backfill-details" open>
              <summary>Errors（{dryRun.result.errors?.length ?? dryRun.errors?.length ?? 0}）</summary>
              <div className="calendar-backfill-problems">
                {(dryRun.result.errors ?? dryRun.errors ?? []).slice(0, 50).map((error, index) => (
                  <article className="clinic-item" key={`${error.table}-${error.row ?? index}`}>
                    <strong>{error.table}{error.row ? `｜第 ${error.row} 列` : ""}</strong>
                    <span>{error.message}</span>
                  </article>
                ))}
              </div>
            </details>
          )}
        </section>
      )}

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">4. 最近匯入紀錄</h2>
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
            <span>請先貼上資料或載入 CSV，Dry Run 確認後再正式匯入。</span>
          </div>
        )}
      </section>

      <div className="calendar-backfill-sticky-actions" aria-label="手機版貼上式匯入操作">
        <button className="bf-primary" type="button" onClick={() => runImport("dry_run")} disabled={!canDryRun}>
          {busy ? "處理中…" : "Dry Run 預覽"}
        </button>
        <div className="calendar-backfill-sticky-confirm">
          <button className="bf-primary calendar-backfill-danger" type="button" onClick={confirmImport} disabled={!canConfirm}>
            {busy ? "匯入中…" : "Confirm Import"}
          </button>
          {!canConfirm && <small>請先執行 Dry Run 預覽。</small>}
        </div>
      </div>
    </ClinicShell>
  );
}
