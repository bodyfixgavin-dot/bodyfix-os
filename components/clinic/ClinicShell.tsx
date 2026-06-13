"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ShellProps = { title: string; subtitle: string; children: React.ReactNode; showDashboardMenu?: boolean };

type DashboardLink = { label: string; href: string; note?: string };
type DashboardGroup = { title: string; description: string; links: DashboardLink[]; collapsible?: boolean };

const dashboardGroups: DashboardGroup[] = [
  {
    title: "今日工作",
    description: "每天最常用的操作，從這裡開始。",
    links: [
      { label: "總覽", href: "/clinic" },
      { label: "新增服務紀錄", href: "/clinic/records/new" },
      { label: "追蹤提醒", href: "/clinic/followups" },
      { label: "預約後台", href: "/admin" },
      { label: "行事曆回填", href: "/clinic/calendar-backfill" },
    ],
  },
  {
    title: "個案管理",
    description: "客戶資料、問卷與案例資產。",
    links: [
      { label: "客戶列表", href: "/clinic/clients" },
      { label: "新增客戶", href: "/clinic/clients/new" },
      { label: "問卷回覆", href: "/clinic/intake-submissions" },
      { label: "案例素材", href: "/clinic/cases" },
    ],
  },
  {
    title: "方案與轉換",
    description: "續約、成交與營收相關入口。",
    links: [
      { label: "下一步方案候選", href: "/clinic/plan-candidates" },
      { label: "方案提案 / 成交追蹤", href: "/clinic/conversion" },
      { label: "月營收試算", href: "/clinic/business-foundation#monthly-revenue" },
      { label: "商業規則地基", href: "/clinic/business-foundation" },
    ],
  },
  {
    title: "策略與內容",
    description: "品牌策略、內容與成長分析。",
    links: [
      { label: "策略 SWOT", href: "/clinic/strategy-swot" },
      { label: "地區需求中樞", href: "/clinic/location-dashboard" },
      { label: "Chart Navigator SOP", href: "/clinic/sop/chart-navigator" },
      { label: "AI 營運副駕", href: "/clinic/ai-copilot" },
    ],
  },
  {
    title: "系統維護",
    description: "資料規則、狀態與內部維護工具。",
    collapsible: true,
    links: [
      { label: "Codebook 字典", href: "/clinic/codebook" },
      { label: "後台資料庫狀態", href: "/admin" },
      { label: "Admin / Migration 工具", href: "/clinic/calendar-backfill" },
      { label: "產品階梯總覽", href: "/clinic/business-foundation#product-ladder" },
    ],
  },
];

type LoadState<T> = { data: T | null; error: string; loading: boolean; diagnostics: AdminDiagnostics | null };
type AdminSessionState = { bypassMode?: boolean };
type AdminDiagnostics = {
  loginState?: "unauthenticated" | "authenticated";
  databaseState?: "not_checked" | "failed" | "ready";
  requestPath?: string;
  failedRequest?: string;
  errorReason?: string;
  envErrors?: string[];
  missingEnv?: string[];
  checkedEnv?: string[];
  requiredEnv?: string[];
  nextStep?: string;
};

function formatClinicError(json: { error?: string; diagnostics?: AdminDiagnostics; missingEnv?: string[]; requestPath?: string; failedRequest?: string }, fallback: string) {
  const diagnostics = json.diagnostics;
  if (diagnostics?.envErrors?.length) {
    return `載入後台資料失敗：${diagnostics.envErrors.join("；")}。`;
  }
  if (diagnostics?.missingEnv?.length || json.missingEnv?.length) {
    return `載入後台資料失敗：缺少 ${(diagnostics?.missingEnv ?? json.missingEnv ?? []).join("、")}。請確認 Vercel Environment Variables 後重新部署。`;
  }
  if (json.failedRequest || json.requestPath || diagnostics?.failedRequest || diagnostics?.requestPath) {
    return `${json.error ?? fallback}（request path：${json.failedRequest ?? json.requestPath ?? diagnostics?.failedRequest ?? diagnostics?.requestPath}）`;
  }
  return json.error ?? fallback;
}

function DashboardGroupCard({ group }: { group: DashboardGroup }) {
  const content = (
    <>
      <p>{group.description}</p>
      <div className="clinic-menu-links">
        {group.links.map((link) => (
          <Link href={link.href} key={`${group.title}-${link.label}`}>
            <span>{link.label}</span>
            {link.note ? <small>{link.note}</small> : null}
          </Link>
        ))}
      </div>
    </>
  );

  if (group.collapsible) {
    return (
      <details className="clinic-menu-card clinic-menu-maintenance">
        <summary><span>{group.title}</span><small>預設收合，點擊展開</small></summary>
        {content}
      </details>
    );
  }

  return (
    <section className="clinic-menu-card">
      <h2>{group.title}</h2>
      {content}
    </section>
  );
}

export function ClinicShell({ title, subtitle, children, showDashboardMenu = false }: ShellProps) {
  const [bypassMode, setBypassMode] = useState(false);

  useEffect(() => {
    async function loadAdminSession() {
      try {
        const res = await fetch("/api/admin/session", { cache: "no-store" });
        const data = await res.json().catch(() => ({})) as AdminSessionState;
        setBypassMode(res.ok && Boolean(data.bypassMode));
      } catch {
        setBypassMode(false);
      }
    }

    loadAdminSession();
  }, []);

  return (
    <main className="bf-container clinic-page">
      <section className="bf-hero">
        <Link className="bf-brand" href="/clinic" aria-label="回到 BodyFix OS Hub"><span className="bf-logo-box">BF</span> BODYFIX OS</Link>
        <h1>{title}</h1>
        <p className="bf-subtitle">{subtitle}</p>
        {!showDashboardMenu && (
          <nav className="clinic-nav clinic-nav-compact" aria-label="後台快速導覽">
            <Link href="/clinic">回到後台總覽</Link>
            <Link href="/clinic/records/new">新增服務紀錄</Link>
            <Link href="/clinic/followups">追蹤提醒</Link>
            <Link href="/admin">預約後台</Link>
          </nav>
        )}
      </section>
      {showDashboardMenu && (
        <nav className="clinic-menu-grid bf-section-gap" aria-label="BodyFix OS 後台功能分類">
          {dashboardGroups.map((group) => <DashboardGroupCard group={group} key={group.title} />)}
        </nav>
      )}
      {bypassMode && (
        <div className="bf-notice bf-section-gap">目前為 Preview 測試模式，已啟用免密碼後台進入。<br />請勿匯入正式客戶資料。</div>
      )}
      {children}
    </main>
  );
}

export function useClinicFetch<T>(url: string): LoadState<T> & { reload: () => Promise<void> } {
  const [state, setState] = useState<LoadState<T>>({ data: null, error: "", loading: true, diagnostics: null });
  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    if (!url.startsWith("/api/")) {
      setState({ data: null, error: "內部 API 路徑格式錯誤：請使用 /api/...", loading: false, diagnostics: { loginState: "authenticated", databaseState: "failed", requestPath: url, failedRequest: url, errorReason: "request path 錯誤" } });
      return;
    }
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.status === 401) {
        setState({ data: null, error: "請先到 /admin 登入 BodyFix 後台，再回到後台總覽。", loading: false, diagnostics: { loginState: "unauthenticated", databaseState: "not_checked", requestPath: url } });
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ data: null, error: formatClinicError(json, "載入失敗，請確認 BodyFix OS schema 已套用。"), loading: false, diagnostics: json.diagnostics ?? null });
        return;
      }
      setState({ data: json as T, error: "", loading: false, diagnostics: { loginState: "authenticated", databaseState: "ready", requestPath: url } });
    } catch {
      setState({ data: null, error: "資料模組載入失敗，請檢查 /api/... request path 或網路狀態。", loading: false, diagnostics: { loginState: "authenticated", databaseState: "failed", requestPath: url, failedRequest: url, errorReason: "request path 或網路狀態錯誤" } });
    }
  }, [url]);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

export function ClinicNotice({ loading, error, diagnostics }: { loading?: boolean; error?: string; diagnostics?: AdminDiagnostics | null }) {
  if (loading) return <div className="bf-card bf-section-gap">載入 BodyFix 後台資料中…</div>;
  if (!error) return null;
  return (
    <section className="bf-card bf-section-gap" role="alert">
      <h2 className="bf-section-title">後台資料庫狀態</h2>
      <p>{error}</p>
      <p>登入狀態：{diagnostics?.loginState === "unauthenticated" ? "未登入" : "已通過"}</p>
      <p>資料庫狀態：{diagnostics?.databaseState === "failed" ? "失敗" : diagnostics?.databaseState === "not_checked" ? "未檢查" : "失敗"}</p>
      <p>錯誤原因：{diagnostics?.errorReason ?? error}</p>
      {diagnostics?.missingEnv?.length ? <p>缺少 env：{diagnostics.missingEnv.join("、")}</p> : null}
      {diagnostics?.envErrors?.length ? <ul>{diagnostics.envErrors.map((envError) => <li key={envError}>{envError}</li>)}</ul> : null}
      <p>Request path：{diagnostics?.failedRequest ?? diagnostics?.requestPath ?? "目前頁面的 /api/clinic/... request"}</p>
      <p>下一步：{diagnostics?.nextStep ?? "請確認 Vercel env 後重新部署。"}</p>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label>{label}{children}</label>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} />;
}

export const stageLabels: Record<string, string> = {
  lead_dm: "私訊名單", booked: "已預約", first_done: "首次完成", followup: "追蹤中", repeat: "回訪",
  three_session_candidate: "3 次短週期整理候選", three_session_client: "3 次短週期整理客戶",
  twelve_session_candidate: "12 次完整計畫候選", twelve_session_client: "12 次完整計畫客戶",
  maintenance: "續航 / 訂閱", coach_integration: "教練整合", lost: "暫時流失"
};

export const planLabels: Record<string, string> = {
  single_followup: "單次後追蹤", three_session_reset: "3 次短週期整理", twelve_session_program: "12 次完整計畫",
  maintenance_plan: "續航 / 訂閱", coach_integration: "教練整合", training_progression: "動作整合訓練進階", watching: "觀察中"
};

export function SelectOptions({ options }: { options: Record<string, string> }) {
  return <>{Object.entries(options).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</>;
}
