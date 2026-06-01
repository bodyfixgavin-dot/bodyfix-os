"use client";

import { useMemo, useState } from "react";
import { completeAppointmentAndDeductItems } from "@/app/actions/appointments";
import type { AppointmentItemInput, BodyFixServiceId, CompleteAppointmentInput } from "@/types/bodyfix";

type BalanceType = "training_session" | "bodywork_session" | "consulting_session";
type ServiceCategory =
  | "教練課"
  | "雙人半私人教學"
  | "筋膜線指定整理"
  | "骨盆核心整理"
  | "紫微 / 塔羅文字單"
  | "混合服務"
  | "其他";
type PaymentMode = "balance" | "single_payment" | "comp" | "accounts_receivable";
type PaymentMethod = "現金" | "轉帳" | "Line Pay" | "其他";
type FollowupDelay = "none" | "3" | "7" | "14" | "custom";
type FollowupPurpose = "詢問身體狀態" | "提醒下次預約" | "推 3 次整理" | "推 12 次計畫" | "其他";

type CustomerOption = {
  customer_id: string;
  customer_name: string;
  plan_name: string;
  training_remaining: number;
  bodywork_remaining: number;
  unpaid_amount?: number;
  latest_service_label?: string | null;
  latest_service_date?: string | null;
};

type ServiceCatalogItem = {
  service_code: string;
  display_name: string;
  english_name?: string;
  category: ServiceCategory;
  duration_minutes: number | null;
  default_price: number | null;
  default_balance_type: BalanceType | null;
  default_deduct_units: number;
  service_type?: "main" | "add_on";
  participant_count?: number;
  is_premium_service?: boolean;
  bodyfix_service_id: BodyFixServiceId;
  note: string;
};

type QuickRecordForm = {
  serviceCode: string;
  addonEnabled: boolean;
  paymentMode: PaymentMode;
  trainingDeduct: number;
  bodyworkDeduct: number;
  manualAdjustmentAmount: number;
  receivableAmount: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  compReason: string;
  compDeductBalance: boolean;
  expectedPaymentDate: string;
  todayFocus: string;
  observedStatus: string;
  nextDirection: string;
  notes: string;
  followupDelay: FollowupDelay;
  customFollowupDate: string;
  followupPurpose: FollowupPurpose;
};

const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    service_code: "training_60",
    display_name: "教練課 60 分鐘",
    category: "教練課",
    duration_minutes: 60,
    default_price: 1800,
    default_balance_type: "training_session",
    default_deduct_units: 1,
    bodyfix_service_id: "BF-MI-001",
    note: "一對一教練課目前只有 60 分鐘；不提供一對一教練課 90 分鐘。"
  },
  {
    service_code: "partner_training_90",
    display_name: "雙人半私人教學 90 分鐘",
    english_name: "Partner Training Session",
    category: "雙人半私人教學",
    duration_minutes: 90,
    default_price: 3200,
    default_balance_type: null,
    default_deduct_units: 0,
    participant_count: 2,
    bodyfix_service_id: "BF-MI-001",
    note: "獨立服務紀錄，v0.2 不強制自動扣兩位客戶堂數；其中一人缺席仍以雙人課時段計算。"
  },
  {
    service_code: "fascia_line_sbl_60",
    display_name: "1. 背側緊繃線 60 分",
    category: "筋膜線指定整理",
    duration_minutes: 60,
    default_price: 2300,
    default_balance_type: "bodywork_session",
    default_deduct_units: 1,
    bodyfix_service_id: "BF-BR-001",
    note: "官方筋膜線指定整理單線項目。"
  },
  {
    service_code: "fascia_line_sfl_60",
    display_name: "2. 前側壓縮線 60 分",
    category: "筋膜線指定整理",
    duration_minutes: 60,
    default_price: 2300,
    default_balance_type: "bodywork_session",
    default_deduct_units: 1,
    bodyfix_service_id: "BF-BR-001",
    note: "官方筋膜線指定整理單線項目。"
  },
  {
    service_code: "fascia_line_ll_60",
    display_name: "3. 側邊失衡線 60 分",
    category: "筋膜線指定整理",
    duration_minutes: 60,
    default_price: 2300,
    default_balance_type: "bodywork_session",
    default_deduct_units: 1,
    bodyfix_service_id: "BF-BR-001",
    note: "官方筋膜線指定整理單線項目。"
  },
  {
    service_code: "fascia_line_sl_60",
    display_name: "4. 旋轉代償線 60 分",
    category: "筋膜線指定整理",
    duration_minutes: 60,
    default_price: 2300,
    default_balance_type: "bodywork_session",
    default_deduct_units: 1,
    bodyfix_service_id: "BF-BR-001",
    note: "官方筋膜線指定整理單線項目。"
  },
  {
    service_code: "fascia_line_dfl_60",
    display_name: "5. 深層核心線 60 分",
    category: "筋膜線指定整理",
    duration_minutes: 60,
    default_price: 2300,
    default_balance_type: "bodywork_session",
    default_deduct_units: 1,
    bodyfix_service_id: "BF-BR-001",
    note: "官方筋膜線指定整理單線項目。"
  },
  {
    service_code: "fascia_line_arm_60",
    display_name: "6. 肩頸手臂線 60 分",
    category: "筋膜線指定整理",
    duration_minutes: 60,
    default_price: 2300,
    default_balance_type: "bodywork_session",
    default_deduct_units: 1,
    bodyfix_service_id: "BF-BR-001",
    note: "官方筋膜線指定整理單線項目。"
  },
  {
    service_code: "fascia_line_fl_60",
    display_name: "7. 動作連動線 60 分",
    category: "筋膜線指定整理",
    duration_minutes: 60,
    default_price: 2300,
    default_balance_type: "bodywork_session",
    default_deduct_units: 1,
    bodyfix_service_id: "BF-BR-001",
    note: "官方筋膜線指定整理單線項目。"
  },
  {
    service_code: "fascia_multi_line_90",
    display_name: "8. 多線整合整理 90 分",
    category: "筋膜線指定整理",
    duration_minutes: 90,
    default_price: 3600,
    default_balance_type: "bodywork_session",
    default_deduct_units: 1,
    is_premium_service: true,
    bodyfix_service_id: "BF-BR-002",
    note: "90 分鐘高價服務；v0.2 先允許扣 bodywork_session 1，並保留手動調整金額。"
  },
  {
    service_code: "pelvic_core_reset_60",
    display_name: "骨盆核心整理 60 分",
    category: "骨盆核心整理",
    duration_minutes: 60,
    default_price: 2500,
    default_balance_type: "bodywork_session",
    default_deduct_units: 1,
    bodyfix_service_id: "BF-PC-001",
    note: "骨盆核心整理主服務。"
  },
  {
    service_code: "pelvic_core_addon_30",
    display_name: "骨盆核心延長 +30 分",
    category: "骨盆核心整理",
    duration_minutes: 30,
    default_price: 1200,
    default_balance_type: null,
    default_deduct_units: 0,
    service_type: "add_on",
    bodyfix_service_id: "BF-PC-EXT-001",
    note: "加購項目 add-on，通常接在主服務後使用；不作為主服務。"
  },
  {
    service_code: "ziwei_text_order",
    display_name: "紫微文字解析",
    category: "紫微 / 塔羅文字單",
    duration_minutes: null,
    default_price: null,
    default_balance_type: null,
    default_deduct_units: 0,
    bodyfix_service_id: "BF-SR-ZW-TXT-001",
    note: "自訂價格；不扣堂，記服務紀錄與收款。"
  },
  {
    service_code: "tarot_text_order",
    display_name: "塔羅文字解析",
    category: "紫微 / 塔羅文字單",
    duration_minutes: null,
    default_price: null,
    default_balance_type: null,
    default_deduct_units: 0,
    bodyfix_service_id: "BF-SR-TR-TXT-001",
    note: "自訂價格；不扣堂，記服務紀錄與收款。"
  },
  {
    service_code: "sadm_relationship_session",
    display_name: "SADM 關係決策整理",
    category: "紫微 / 塔羅文字單",
    duration_minutes: null,
    default_price: null,
    default_balance_type: "consulting_session",
    default_deduct_units: 0,
    bodyfix_service_id: "BF-SR-TR-TXT-002",
    note: "consulting_session 先預留；v0.2 不強制扣除。"
  }
];

const ADDON_SERVICE = SERVICE_CATALOG.find((service) => service.service_code === "pelvic_core_addon_30")!;
const SERVICE_BY_CODE = new Map(SERVICE_CATALOG.map((service) => [service.service_code, service]));
const SERVICE_CATEGORIES: ServiceCategory[] = ["教練課", "雙人半私人教學", "筋膜線指定整理", "骨盆核心整理", "紫微 / 塔羅文字單", "混合服務", "其他"];
const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  balance: "使用套票 / 餘額扣除",
  single_payment: "單次現金 / 轉帳收款",
  comp: "贈送 / 活動折抵",
  accounts_receivable: "未收款，先記帳"
};
const RECORD_PLACEHOLDER = "今天主要處理肩頸與胸椎活動度，右側張力較高，下次可接骨盆與髖。";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function dateAfterDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getDefaultForm(serviceCode = "training_60"): QuickRecordForm {
  const service = SERVICE_BY_CODE.get(serviceCode) ?? SERVICE_CATALOG[0];
  return {
    serviceCode: service.service_code,
    addonEnabled: false,
    paymentMode: service.default_balance_type ? "balance" : "single_payment",
    trainingDeduct: service.default_balance_type === "training_session" ? service.default_deduct_units : 0,
    bodyworkDeduct: service.default_balance_type === "bodywork_session" ? service.default_deduct_units : 0,
    manualAdjustmentAmount: 0,
    receivableAmount: service.default_balance_type ? 0 : service.default_price ?? 0,
    paidAmount: service.default_balance_type ? 0 : service.default_price ?? 0,
    paymentMethod: "現金",
    compReason: "",
    compDeductBalance: false,
    expectedPaymentDate: todayDate(),
    todayFocus: "",
    observedStatus: "",
    nextDirection: "",
    notes: "",
    followupDelay: "none",
    customFollowupDate: "",
    followupPurpose: "詢問身體狀態"
  };
}

function money(amount: number) {
  return `NT$${Math.max(0, amount).toLocaleString("zh-TW")}`;
}

function servicePriceLabel(service: ServiceCatalogItem) {
  return service.default_price === null ? "自訂" : money(service.default_price);
}

function formatServiceDate(date?: string | null) {
  return date ? date : "尚無紀錄";
}

function buildFollowupDate(form: QuickRecordForm) {
  if (form.followupDelay === "none") return null;
  if (form.followupDelay === "custom") return form.customFollowupDate || null;
  return dateAfterDays(Number(form.followupDelay));
}

function buildLedgerNote(form: QuickRecordForm, service: ServiceCatalogItem) {
  const followupDate = buildFollowupDate(form);
  return [
    `service_code=${service.service_code}`,
    `service_name=${service.display_name}`,
    `balance_type=${service.default_balance_type ?? "none"}`,
    `payment_mode=${PAYMENT_MODE_LABELS[form.paymentMode]}`,
    `manual_adjustment_amount=${form.manualAdjustmentAmount}`,
    `service_record_today_focus=${form.todayFocus || "未填"}`,
    `service_record_observed_status=${form.observedStatus || "未填"}`,
    `service_record_next_direction=${form.nextDirection || "未填"}`,
    `followup=${followupDate ? `${followupDate}｜${form.followupPurpose}` : "none"}`,
    form.notes ? `note=${form.notes}` : null,
    service.is_premium_service ? "premium_service=true" : null,
    service.service_type === "add_on" ? "service_type=add_on" : null
  ].filter(Boolean).join("；");
}

export function QuickCheckoutPage({ customers }: { customers: CustomerOption[] }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.customer_id ?? "");
  const [form, setForm] = useState<QuickRecordForm>(() => getDefaultForm());
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const selectedCustomer = customers.find((customer) => customer.customer_id === selectedCustomerId);
  const selectedService = SERVICE_BY_CODE.get(form.serviceCode) ?? SERVICE_CATALOG[0];
  const followupDate = buildFollowupDate(form);

  const preview = useMemo(() => {
    const addonAmount = form.addonEnabled ? ADDON_SERVICE.default_price ?? 0 : 0;
    const receivable = Math.max(0, form.receivableAmount + form.manualAdjustmentAmount + addonAmount);
    const paid = form.paymentMode === "accounts_receivable" ? 0 : Math.max(0, form.paidAmount);
    const serviceRecordFilled = Boolean(form.todayFocus || form.observedStatus || form.nextDirection || form.notes);
    const duration = (selectedService.duration_minutes ?? 0) + (form.addonEnabled ? ADDON_SERVICE.duration_minutes ?? 0 : 0);
    const deductParts = [
      form.trainingDeduct > 0 ? `教練課 ${form.trainingDeduct} 堂` : null,
      form.bodyworkDeduct > 0 ? `身體整理 ${form.bodyworkDeduct} 次` : null
    ].filter(Boolean);

    return {
      duration: duration > 0 ? `${duration} 分鐘` : "依文字單內容",
      receivable,
      paid,
      serviceRecordFilled,
      deductText: deductParts.length > 0 ? deductParts.join("、") : "不扣餘額",
      followupText: followupDate ? `${followupDate}｜${form.followupPurpose}` : "不建立"
    };
  }, [followupDate, form, selectedService]);

  function patchForm(patch: Partial<QuickRecordForm>) {
    setForm((current) => ({ ...current, ...patch }));
    setIsPreviewOpen(false);
    setResultMessage(null);
  }

  function handleServiceChange(serviceCode: string) {
    setForm((current) => {
      const next = getDefaultForm(serviceCode);
      return {
        ...next,
        todayFocus: current.todayFocus,
        observedStatus: current.observedStatus,
        nextDirection: current.nextDirection,
        notes: current.notes,
        followupDelay: current.followupDelay,
        customFollowupDate: current.customFollowupDate,
        followupPurpose: current.followupPurpose
      };
    });
    setIsPreviewOpen(false);
    setResultMessage(null);
  }

  async function handleSubmit() {
    if (!selectedCustomer || !isPreviewOpen) return;
    setSubmitting(true);
    setResultMessage(null);

    const items: AppointmentItemInput[] = [];
    const billingType: AppointmentItemInput["billing_type"] =
      form.paymentMode === "balance" ? "credit" : form.paymentMode === "comp" ? "campaign_reward" : "cash";
    const totalDeductUnits = form.trainingDeduct + form.bodyworkDeduct;

    items.push({
      service_id: selectedService.bodyfix_service_id,
      billing_type: billingType,
      units_to_deduct: form.paymentMode === "balance" || (form.paymentMode === "comp" && form.compDeductBalance) ? totalDeductUnits : 0,
      quantity: 1,
      unit_price: preview.receivable,
      note: buildLedgerNote(form, selectedService)
    });

    if (form.addonEnabled) {
      items.push({
        service_id: ADDON_SERVICE.bodyfix_service_id,
        billing_type: "cash",
        units_to_deduct: 0,
        quantity: 1,
        unit_price: ADDON_SERVICE.default_price ?? 0,
        note: buildLedgerNote({ ...form, trainingDeduct: 0, bodyworkDeduct: 0 }, ADDON_SERVICE)
      });
    }

    const payload: CompleteAppointmentInput = {
      appointment_id: crypto.randomUUID(),
      customer_id: selectedCustomer.customer_id,
      items,
      today_focus: form.todayFocus || selectedService.display_name,
      body_status: form.observedStatus || null,
      next_focus: [form.nextDirection, followupDate ? `追蹤提醒：${followupDate}｜${form.followupPurpose}` : null, form.notes].filter(Boolean).join("｜")
    };

    const result = await completeAppointmentAndDeductItems(payload);
    setSubmitting(false);
    setResultMessage(result.success ? "確認完成：已寫入 service_records / ledger_entries / balances 流程。" : `送出失敗：${result.message}`);
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 overflow-x-hidden px-4 py-6 text-slate-900 sm:px-6">
      <section className="rounded-[28px] border border-[rgba(23,35,51,.16)] bg-[rgba(251,250,246,.9)] p-5 shadow-[0_24px_60px_rgba(23,35,51,.08)] sm:p-7">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-[.16em] text-[#9b7550]">
          <span>BodyFix OS</span>
          <span className="rounded-full border border-[#c6aa87] px-3 py-1 text-xs">MVP</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#172333] sm:text-4xl">服務後快速記錄 v0.2</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6f6a63] sm:text-base">
          Service Quick Record v0.2｜完成服務後，快速記錄本次內容、扣除餘額、確認收款與建立後續追蹤。
        </p>
        <p className="mt-3 text-xs leading-6 text-[#6f6a63]">
          核心邏輯：服務項目代表本次做了什麼；扣堂方式代表從哪種餘額扣除；收款方式代表本次實際應收與已收。
        </p>
      </section>

      <section className="rounded-3xl border border-[rgba(23,35,51,.14)] bg-[#fbfaf6] p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 text-xl font-semibold text-[#172333]">客戶資訊</h2>
        <label className="grid gap-2 text-sm text-[#6f6a63]">
          選擇客戶
          <select
            className="min-h-12 w-full rounded-2xl border border-[rgba(23,35,51,.16)] bg-white p-3 text-base text-[#172333]"
            value={selectedCustomerId}
            onChange={(event) => {
              setSelectedCustomerId(event.target.value);
              setIsPreviewOpen(false);
            }}
          >
            {customers.length === 0 ? <option value="">尚無客戶資料</option> : null}
            {customers.map((customer) => (
              <option key={customer.customer_id} value={customer.customer_id}>{customer.customer_name}</option>
            ))}
          </select>
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryTile label="剩餘教練課" value={selectedCustomer ? `${selectedCustomer.training_remaining} 堂` : "尚無紀錄"} />
          <SummaryTile label="剩餘身體整理" value={selectedCustomer ? `${selectedCustomer.bodywork_remaining} 次` : "尚無紀錄"} />
          <SummaryTile label="未收款" value={selectedCustomer ? money(selectedCustomer.unpaid_amount ?? 0) : "尚無紀錄"} />
          <SummaryTile
            label="最近一次服務"
            value={selectedCustomer?.latest_service_label ? `${formatServiceDate(selectedCustomer.latest_service_date)} / ${selectedCustomer.latest_service_label}` : "尚無紀錄"}
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-[rgba(23,35,51,.14)] bg-[#fbfaf6] p-4 shadow-sm sm:p-5">
            <h2 className="text-xl font-semibold text-[#172333]">本次服務項目</h2>
            <p className="mt-2 text-sm leading-6 text-[#6f6a63]">已對齊 v0.2 service catalog；一對一教練課只保留 60 分鐘，骨盆核心延長只作為 add-on。</p>

            <label className="mt-4 grid gap-2 text-sm text-[#6f6a63]">
              主服務
              <select
                className="min-h-12 w-full rounded-2xl border border-[rgba(23,35,51,.16)] bg-white p-3 text-base text-[#172333]"
                value={form.serviceCode}
                onChange={(event) => handleServiceChange(event.target.value)}
              >
                {SERVICE_CATEGORIES.map((category) => {
                  const services = SERVICE_CATALOG.filter((service) => service.category === category && service.service_type !== "add_on");
                  return services.length > 0 ? (
                    <optgroup label={category} key={category}>
                      {services.map((service) => (
                        <option key={service.service_code} value={service.service_code}>{service.display_name}</option>
                      ))}
                    </optgroup>
                  ) : null;
                })}
              </select>
            </label>

            <div className="mt-4 rounded-2xl border border-[rgba(155,117,80,.24)] bg-white/70 p-4 text-sm leading-7 text-[#172333]">
              <div className="flex flex-wrap items-center gap-2">
                <strong>{selectedService.display_name}</strong>
                {selectedService.english_name ? <span className="text-[#6f6a63]">{selectedService.english_name}</span> : null}
                {selectedService.is_premium_service ? <span className="rounded-full bg-[#172333] px-2 py-1 text-xs text-white">premium_service</span> : null}
              </div>
              <p>服務代碼：{selectedService.service_code}</p>
              <p>大類：{selectedService.category}｜時長：{selectedService.duration_minutes ? `${selectedService.duration_minutes} 分鐘` : "自訂"}｜預設價格：{servicePriceLabel(selectedService)}</p>
              <p>預設扣法：{selectedService.default_balance_type ? `扣 ${selectedService.default_balance_type} ${selectedService.default_deduct_units}` : "不扣堂 / 自訂"}</p>
              <p className="text-[#6f6a63]">{selectedService.note}</p>
            </div>

            <label className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-[rgba(155,117,80,.34)] bg-white/60 p-4 text-sm text-[#172333]">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5"
                checked={form.addonEnabled}
                onChange={(event) => patchForm({ addonEnabled: event.target.checked })}
              />
              <span>
                <strong>加購：{ADDON_SERVICE.display_name}</strong>
                <span className="block text-[#6f6a63]">{money(ADDON_SERVICE.default_price ?? 0)}，add-on，不扣堂，只記加購收入。</span>
              </span>
            </label>
          </section>

          <section className="rounded-3xl border border-[rgba(23,35,51,.14)] bg-[#fbfaf6] p-4 shadow-sm sm:p-5">
            <h2 className="text-xl font-semibold text-[#172333]">扣除 / 收款方式</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(Object.keys(PAYMENT_MODE_LABELS) as PaymentMode[]).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  className={`min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${form.paymentMode === mode ? "border-[#9b7550] bg-[#172333] text-white" : "border-[rgba(23,35,51,.14)] bg-white text-[#172333]"}`}
                  onClick={() => patchForm({ paymentMode: mode, receivableAmount: mode === "balance" || mode === "comp" ? 0 : selectedService.default_price ?? 0, paidAmount: mode === "accounts_receivable" ? 0 : selectedService.default_price ?? 0 })}
                >
                  {PAYMENT_MODE_LABELS[mode]}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(form.paymentMode === "balance" || form.paymentMode === "comp") ? (
                <>
                  <NumberField label="扣除教練課堂數" value={form.trainingDeduct} onChange={(value) => patchForm({ trainingDeduct: value })} />
                  <NumberField label="扣除身體整理次數" value={form.bodyworkDeduct} onChange={(value) => patchForm({ bodyworkDeduct: value })} />
                </>
              ) : null}

              {form.paymentMode === "balance" ? (
                <>
                  <NumberField label="是否有加購 / 補差額" value={form.manualAdjustmentAmount} onChange={(value) => patchForm({ manualAdjustmentAmount: value })} />
                  <NumberField label="本次應收（可手動調整）" value={form.receivableAmount} onChange={(value) => patchForm({ receivableAmount: value })} />
                </>
              ) : null}

              {form.paymentMode === "single_payment" ? (
                <>
                  <NumberField label="本次應收" value={form.receivableAmount} onChange={(value) => patchForm({ receivableAmount: value })} />
                  <NumberField label="本次已收" value={form.paidAmount} onChange={(value) => patchForm({ paidAmount: value })} />
                  <SelectField label="付款方式" value={form.paymentMethod} onChange={(value) => patchForm({ paymentMethod: value as PaymentMethod })} options={["現金", "轉帳", "Line Pay", "其他"]} />
                </>
              ) : null}

              {form.paymentMode === "comp" ? (
                <>
                  <TextField label="折抵原因" value={form.compReason} onChange={(value) => patchForm({ compReason: value })} placeholder="例如：活動贈送 / 補償 / 體驗" />
                  <NumberField label="本次應收（預設 0）" value={form.receivableAmount} onChange={(value) => patchForm({ receivableAmount: value })} />
                  <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-[rgba(23,35,51,.16)] bg-white p-3 text-sm text-[#172333]">
                    <input type="checkbox" checked={form.compDeductBalance} onChange={(event) => patchForm({ compDeductBalance: event.target.checked })} />
                    是否扣除餘額
                  </label>
                </>
              ) : null}

              {form.paymentMode === "accounts_receivable" ? (
                <>
                  <NumberField label="應收金額" value={form.receivableAmount} onChange={(value) => patchForm({ receivableAmount: value })} />
                  <TextField label="預計付款日" type="date" value={form.expectedPaymentDate} onChange={(value) => patchForm({ expectedPaymentDate: value })} />
                </>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-[rgba(23,35,51,.14)] bg-[#fbfaf6] p-4 shadow-sm sm:p-5">
            <h2 className="text-xl font-semibold text-[#172333]">簡短服務紀錄</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextAreaField label="今天主要處理" value={form.todayFocus} onChange={(value) => patchForm({ todayFocus: value })} placeholder={RECORD_PLACEHOLDER} />
              <TextAreaField label="觀察到的狀態" value={form.observedStatus} onChange={(value) => patchForm({ observedStatus: value })} placeholder="右側張力較高，胸椎活動度較不足。" />
              <TextAreaField label="下次方向" value={form.nextDirection} onChange={(value) => patchForm({ nextDirection: value })} placeholder="下次可接骨盆與髖，或安排 7 天後追蹤。" />
              <TextAreaField label="備註" value={form.notes} onChange={(value) => patchForm({ notes: value })} placeholder="現場補充，保持簡短即可。" />
            </div>
          </section>

          <section className="rounded-3xl border border-[rgba(23,35,51,.14)] bg-[#fbfaf6] p-4 shadow-sm sm:p-5">
            <h2 className="text-xl font-semibold text-[#172333]">追蹤提醒</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <SelectField label="是否建立追蹤提醒" value={form.followupDelay} onChange={(value) => patchForm({ followupDelay: value as FollowupDelay })} options={["none", "3", "7", "14", "custom"]} optionLabels={{ none: "不建立", "3": "3 天後", "7": "7 天後", "14": "14 天後", custom: "自訂日期" }} />
              {form.followupDelay === "custom" ? <TextField label="自訂日期" type="date" value={form.customFollowupDate} onChange={(value) => patchForm({ customFollowupDate: value })} /> : null}
              {form.followupDelay !== "none" ? <SelectField label="追蹤類型" value={form.followupPurpose} onChange={(value) => patchForm({ followupPurpose: value as FollowupPurpose })} options={["詢問身體狀態", "提醒下次預約", "推 3 次整理", "推 12 次計畫", "其他"]} /> : null}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <section className="rounded-3xl border border-[rgba(23,35,51,.14)] bg-[#fbfaf6] p-4 shadow-sm sm:p-5">
            <h2 className="text-xl font-semibold text-[#172333]">送出前預覽</h2>
            <p className="mt-2 text-sm leading-6 text-[#6f6a63]">請先按「預覽本次紀錄」，確認後才會寫入 service_records / ledger_entries / balances 流程。</p>
            <button
              type="button"
              disabled={!selectedCustomer}
              onClick={() => setIsPreviewOpen(true)}
              className="mt-4 min-h-12 w-full rounded-2xl bg-[#172333] px-5 py-3 font-bold text-white disabled:opacity-50"
            >
              預覽本次紀錄
            </button>

            {isPreviewOpen ? (
              <div className="mt-4 space-y-3 rounded-2xl border border-[#c6aa87] bg-white p-4 text-sm leading-7 text-[#172333]">
                <PreviewRow label="本次服務" value={`${selectedService.display_name}${form.addonEnabled ? ` + ${ADDON_SERVICE.display_name}` : ""}`} />
                <PreviewRow label="服務時長" value={preview.duration} />
                <PreviewRow label="扣除內容" value={preview.deductText} />
                <PreviewRow label="本次應收" value={money(preview.receivable)} />
                <PreviewRow label="本次已收" value={money(preview.paid)} />
                <PreviewRow label="付款方式" value={form.paymentMode === "single_payment" ? form.paymentMethod : PAYMENT_MODE_LABELS[form.paymentMode]} />
                <PreviewRow label="服務紀錄" value={preview.serviceRecordFilled ? "已建立" : "尚未填寫"} />
                <PreviewRow label="追蹤提醒" value={preview.followupText} />
                <button
                  type="button"
                  disabled={submitting || !selectedCustomer}
                  onClick={handleSubmit}
                  className="min-h-12 w-full rounded-2xl bg-[#9b7550] px-5 py-3 font-bold text-white disabled:opacity-50"
                >
                  {submitting ? "處理中..." : "確認完成"}
                </button>
              </div>
            ) : null}

            {resultMessage ? <p className="mt-4 rounded-2xl bg-[rgba(198,170,135,.18)] p-4 text-sm leading-7 text-[#172333]">{resultMessage}</p> : null}
          </section>

          {selectedCustomer ? (
            <section className="rounded-3xl border border-[rgba(23,35,51,.14)] bg-[#fbfaf6] p-4 text-sm leading-7 shadow-sm sm:p-5">
              <h2 className="text-lg font-semibold text-[#172333]">送出後餘額預估</h2>
              <p>教練課：{Math.max(selectedCustomer.training_remaining - form.trainingDeduct, 0)} 堂</p>
              <p>身體整理：{Math.max(selectedCustomer.bodywork_remaining - form.bodyworkDeduct, 0)} 次</p>
              <p>未收款：{form.paymentMode === "accounts_receivable" ? money((selectedCustomer.unpaid_amount ?? 0) + preview.receivable) : money(selectedCustomer.unpaid_amount ?? 0)}</p>
            </section>
          ) : null}

          <section className="rounded-3xl border border-dashed border-[rgba(155,117,80,.34)] bg-white/60 p-4 text-xs leading-6 text-[#6f6a63]">
            <strong className="text-[#172333]">資料邏輯保留</strong>
            <p>service_records = 服務故事</p>
            <p>ledger_entries = 金流與堂數流水帳</p>
            <p>balances = 現在剩多少</p>
          </section>
        </aside>
      </section>
    </main>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(23,35,51,.12)] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#9b7550]">{label}</p>
      <p className="mt-2 break-words text-lg font-bold text-[#172333]">{value}</p>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-2 text-sm text-[#6f6a63]">
      {label}
      <input
        type="number"
        className="min-h-12 w-full rounded-2xl border border-[rgba(23,35,51,.16)] bg-white p-3 text-base text-[#172333]"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="grid gap-2 text-sm text-[#6f6a63]">
      {label}
      <input
        type={type}
        className="min-h-12 w-full rounded-2xl border border-[rgba(23,35,51,.16)] bg-white p-3 text-base text-[#172333]"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="grid gap-2 text-sm text-[#6f6a63]">
      {label}
      <textarea
        className="min-h-28 w-full rounded-2xl border border-[rgba(23,35,51,.16)] bg-white p-3 text-base text-[#172333]"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options, optionLabels }: { label: string; value: string; onChange: (value: string) => void; options: string[]; optionLabels?: Record<string, string> }) {
  return (
    <label className="grid gap-2 text-sm text-[#6f6a63]">
      {label}
      <select
        className="min-h-12 w-full rounded-2xl border border-[rgba(23,35,51,.16)] bg-white p-3 text-base text-[#172333]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>{optionLabels?.[option] ?? option}</option>
        ))}
      </select>
    </label>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-[rgba(23,35,51,.10)] pb-2 last:border-b-0 sm:grid-cols-[110px_1fr]">
      <span className="font-semibold text-[#6f6a63]">{label}</span>
      <span className="break-words font-bold text-[#172333]">{value}</span>
    </div>
  );
}
