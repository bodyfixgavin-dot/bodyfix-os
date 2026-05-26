"use client";

import { useMemo, useState } from "react";
import { completeAppointmentAndDeductItems } from "@/app/actions/appointments";
import type { CompleteAppointmentInput } from "@/types/bodyfix";

type CustomerOption = {
  customer_id: string;
  customer_name: string;
  plan_name: string;
  training_remaining: number;
  fascia_remaining_minutes: number;
};

type ServiceRow = {
  id: string;
  service_kind: "training_60" | "fascia_30" | "tarot_single";
  deduct_from: "training" | "fascia_time" | "campaign_reward" | "cash";
  payment_status: "paid" | "unpaid";
  note: string;
};

const SERVICE_LABELS = {
  training_60: "教練課 60 分鐘",
  fascia_30: "筋膜延長 30 分鐘",
  tarot_single: "塔羅單題 NT$333"
} as const;

export function QuickCheckoutPage({ customers }: { customers: CustomerOption[] }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.customer_id ?? "");
  const [rows, setRows] = useState<ServiceRow[]>([
    { id: crypto.randomUUID(), service_kind: "training_60", deduct_from: "training", payment_status: "paid", note: "" }
  ]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const selectedCustomer = customers.find((c) => c.customer_id === selectedCustomerId);

  const totals = useMemo(() => {
    let trainingDeduct = 0;
    let fasciaMinutesDeduct = 0;
    let receivable = 0;

    rows.forEach((row) => {
      if (row.service_kind === "training_60" && row.deduct_from !== "cash") trainingDeduct += 1;
      if (row.service_kind === "fascia_30" && row.deduct_from === "fascia_time") fasciaMinutesDeduct += 30;
      if (row.service_kind === "fascia_30" && row.deduct_from === "cash") receivable += 1000;
      if (row.service_kind === "tarot_single") receivable += 333;
    });

    return { trainingDeduct, fasciaMinutesDeduct, receivable };
  }, [rows]);

  async function handleSubmit() {
    if (!selectedCustomer) return;
    setSubmitting(true);
    setResultMessage(null);

    const payload: CompleteAppointmentInput = {
      appointment_id: crypto.randomUUID(),
      customer_id: selectedCustomer.customer_id,
      items: rows.map((row) => ({
        service_id: row.service_kind === "training_60" ? "BF-MI-001" : row.service_kind === "fascia_30" ? "BF-BR-EXT-001" : "BF-SR-TR-TXT-001",
        billing_type: row.deduct_from === "cash" ? "cash" : row.deduct_from === "campaign_reward" ? "campaign_reward" : "credit",
        units_to_deduct: row.service_kind === "fascia_30" && row.deduct_from === "fascia_time" ? 30 : row.service_kind === "training_60" ? 1 : 0,
        quantity: 1,
        unit_price: row.service_kind === "fascia_30" && row.deduct_from === "cash" ? 1000 : row.service_kind === "tarot_single" ? 333 : 0,
        note: row.note
      })),
      today_focus: note
    };

    const result = await completeAppointmentAndDeductItems(payload);
    setSubmitting(false);
    setResultMessage(result.success ? "完成服務並扣堂成功。" : `送出失敗：${result.message}`);
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">下課後快速扣堂頁 v0.1</h1>
      <p className="text-sm text-gray-600">BodyFix OS 每日核心流程 v0.1（先做可每天操作版本）。</p>

      <section className="rounded-2xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">客戶</h2>
        <select
          className="w-full rounded-lg border p-2"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
        >
          {customers.map((c) => (
            <option key={c.customer_id} value={c.customer_id}>{c.customer_name}</option>
          ))}
        </select>
        {selectedCustomer ? (
          <p className="mt-2 text-sm text-gray-600">
            目前方案：{selectedCustomer.plan_name}｜教練課剩餘 {selectedCustomer.training_remaining} 堂｜筋膜額度剩餘 {selectedCustomer.fascia_remaining_minutes} 分鐘
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">本次服務項目</h2>
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={row.id} className="grid gap-2 rounded-xl border p-3 md:grid-cols-4">
              <select
                className="rounded-lg border p-2"
                value={row.service_kind}
                onChange={(e) => {
                  const value = e.target.value as ServiceRow["service_kind"];
                  setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, service_kind: value } : r)));
                }}
              >
                <option value="training_60">教練課 60 分鐘</option>
                <option value="fascia_30">筋膜延長 30 分鐘</option>
                <option value="tarot_single">塔羅單題 NT$333</option>
              </select>
              <select
                className="rounded-lg border p-2"
                value={row.deduct_from}
                onChange={(e) => {
                  const value = e.target.value as ServiceRow["deduct_from"];
                  setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, deduct_from: value } : r)));
                }}
              >
                <option value="training">教練課額度</option>
                <option value="fascia_time">筋膜時間額度</option>
                <option value="campaign_reward">活動贈送</option>
                <option value="cash">現場收費</option>
              </select>
              <select
                className="rounded-lg border p-2"
                value={row.payment_status}
                onChange={(e) => {
                  const value = e.target.value as ServiceRow["payment_status"];
                  setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, payment_status: value } : r)));
                }}
              >
                <option value="paid">已收</option>
                <option value="unpaid">未收</option>
              </select>
              <input
                className="rounded-lg border p-2"
                placeholder={`備註（項目 ${idx + 1}）`}
                value={row.note}
                onChange={(e) => setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, note: e.target.value } : r)))}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="mt-3 rounded-lg border px-3 py-2"
          onClick={() =>
            setRows((prev) => [
              ...prev,
              { id: crypto.randomUUID(), service_kind: "fascia_30", deduct_from: "fascia_time", payment_status: "paid", note: "" }
            ])
          }
        >
          ＋ 新增服務項目
        </button>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="mb-2 text-lg font-semibold">本次扣除 / 應收</h2>
        <p className="text-sm">本次扣除：教練課 {totals.trainingDeduct} 堂、筋膜 {totals.fasciaMinutesDeduct} 分鐘</p>
        <p className="text-sm">本次應收：NT$ {totals.receivable}</p>
        <textarea
          className="mt-3 w-full rounded-lg border p-2"
          rows={3}
          placeholder="課後備註：今日重點、下次方向"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </section>

      <button
        type="button"
        disabled={submitting || !selectedCustomer}
        onClick={handleSubmit}
        className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {submitting ? "處理中..." : "完成服務並扣堂"}
      </button>

      {resultMessage ? <p className="text-sm text-gray-700">{resultMessage}</p> : null}
      {selectedCustomer ? (
        <p className="text-sm text-gray-600">
          完成後剩餘（預估）：教練課 {Math.max(selectedCustomer.training_remaining - totals.trainingDeduct, 0)} 堂 / 筋膜 {Math.max(selectedCustomer.fascia_remaining_minutes - totals.fasciaMinutesDeduct, 0)} 分鐘
        </p>
      ) : null}

      <p className="text-xs text-gray-500">資料邏輯：service_records 記錄做了什麼、ledger_entries 記錄扣了什麼、balances 顯示剩餘。</p>
    </main>
  );
}
