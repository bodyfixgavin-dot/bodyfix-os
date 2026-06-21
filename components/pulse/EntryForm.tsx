"use client";

import { useMemo, useState } from "react";
import { Field } from "./PulseShell";
import { SELECTABLE_SERVICE_CATALOG } from "./serviceCatalog";

const money = (amount: number | null) => (amount == null ? "尚未定價" : `NT$${amount.toLocaleString("zh-TW")}`);

export function EntryForm({ kind }: { kind: "income" | "appointment" }) {
  const [saved, setSaved] = useState(false);
  const [selectedCode, setSelectedCode] = useState(SELECTABLE_SERVICE_CATALOG[0]?.service_code ?? "");
  const selectedService = useMemo(
    () => SELECTABLE_SERVICE_CATALOG.find((service) => service.service_code === selectedCode),
    [selectedCode]
  );
  const [amountActual, setAmountActual] = useState(String(selectedService?.price ?? ""));
  const appointment = kind === "appointment";

  function handleServiceChange(serviceCode: string) {
    const nextService = SELECTABLE_SERVICE_CATALOG.find((service) => service.service_code === serviceCode);
    setSelectedCode(serviceCode);
    setAmountActual(String(nextService?.price ?? ""));
    setSaved(false);
  }

  return (
    <form className="entry-form" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
      <Field label="日期"><input type="date" defaultValue="2026-06-14" required /></Field>
      {appointment && <Field label="時間"><input type="time" defaultValue="14:00" /></Field>}
      <Field label="客戶名稱"><input placeholder="輸入客戶名稱" required={appointment} /></Field>
      <Field label="服務代碼">
        <select name="service_code" value={selectedCode} onChange={(event) => handleServiceChange(event.target.value)} required>
          {SELECTABLE_SERVICE_CATALOG.map((service) => (
            <option key={service.service_code} value={service.service_code}>
              {service.service_code} · {service.service_line} · {service.service_name} · {service.service_variant} · {money(service.price)}{service.status === "trial" ? "（試營運）" : ""}
            </option>
          ))}
        </select>
      </Field>
      {selectedService && (
        <div className="catalog-preview">
          <span>服務線：{selectedService.service_line}</span>
          <span>服務名稱：{selectedService.service_name}</span>
          <span>規格：{selectedService.service_variant}</span>
          <span>標準價：{money(selectedService.price)}</span>
          <span>付款方式：{selectedService.billing_type}</span>
          <span>狀態：{selectedService.status === "trial" ? "試營運" : "正式啟用"}</span>
          {selectedService.note && <small>{selectedService.note}</small>}
        </div>
      )}
      {selectedService && (
        <>
          <input type="hidden" name="service_line" value={selectedService.service_line} />
          <input type="hidden" name="service_name" value={selectedService.service_name} />
          <input type="hidden" name="service_variant" value={selectedService.service_variant ?? ""} />
        </>
      )}
      <Field label={appointment ? "預估金額" : "實收金額"}>
        <input name={appointment ? "estimated_amount" : "amount_actual"} type="number" inputMode="numeric" value={amountActual} onChange={(event) => setAmountActual(event.target.value)} placeholder="0" required={!appointment} />
      </Field>
      {!appointment && <input type="hidden" name="standard_price" value={selectedService?.price ?? ""} />}
      {appointment ? <Field label="狀態"><select>{["已排", "待確認", "已完成", "取消"].map((x) => <option key={x}>{x}</option>)}</select></Field> : <Field label="來源"><select>{["LINE", "IG", "軟體", "熟客", "FansOne", "其他"].map((x) => <option key={x}>{x}</option>)}</select></Field>}
      <Field label="備註"><textarea placeholder="有什麼值得記住？" /></Field>
      <button className="save">{saved ? "已暫存（連接 Supabase 後同步）" : "儲存紀錄"}</button>
    </form>
  );
}
