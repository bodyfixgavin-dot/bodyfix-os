"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ShellProps = { title: string; subtitle: string; children: React.ReactNode };

type LoadState<T> = { data: T | null; error: string; loading: boolean };

export function ClinicShell({ title, subtitle, children }: ShellProps) {
  return (
    <main className="bf-container clinic-page">
      <section className="bf-hero">
        <div className="bf-brand"><span className="bf-logo-box">BF</span> BodyFix Clinic</div>
        <h1>{title}</h1>
        <p className="bf-subtitle">{subtitle}</p>
        <nav className="clinic-nav">
          <Link href="/clinic">總覽</Link>
          <Link href="/clinic/clients">客戶列表</Link>
          <Link href="/clinic/clients/new">新增客戶</Link>
          <Link href="/clinic/records/new">新增服務紀錄</Link>
          <Link href="/clinic/followups">追蹤提醒</Link>
          <Link href="/clinic/plan-candidates">下一步方案候選</Link>
          <Link href="/clinic/conversion">方案提案 / 成交追蹤</Link>
          <Link href="/clinic/location-dashboard">地區需求中樞</Link>
          <Link href="/clinic/business-foundation">商業規則地基</Link>
          <Link href="/clinic/cases">案例素材</Link>
          <Link href="/admin">預約後台</Link>
        </nav>
      </section>
      {children}
    </main>
  );
}

export function useClinicFetch<T>(url: string): LoadState<T> & { reload: () => Promise<void> } {
  const [state, setState] = useState<LoadState<T>>({ data: null, error: "", loading: true });
  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 401) {
      setState({ data: null, error: "請先到 /admin 登入 BodyFix 後台，再回到 Clinic。", loading: false });
      return;
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState({ data: null, error: json.error ?? "載入失敗，請確認 Clinic V1 schema 已套用。", loading: false });
      return;
    }
    setState({ data: json as T, error: "", loading: false });
  }, [url]);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

export function ClinicNotice({ loading, error }: { loading?: boolean; error?: string }) {
  if (loading) return <div className="bf-card bf-section-gap">載入 BodyFix Clinic 資料中…</div>;
  if (error) return <div className="bf-notice bf-section-gap">{error}</div>;
  return null;
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
