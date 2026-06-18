"use client";

import { useEffect, useMemo, useState } from "react";
import { Field } from "./PulseShell";

type ServiceCatalogItem = {
  service_code: string | null;
  service_line: string | null;
  service_name: string | null;
  service_variant: string | null;
  standard_price: number | null;
  status: string | null;
};

function serviceLabel(service: ServiceCatalogItem) {
  const parts = [
    service.service_code,
    service.service_line,
    service.service_name,
    service.service_variant,
    service.standard_price === null || service.standard_price === undefined
      ? "NT$0"
      : `NT$${Number(service.standard_price).toLocaleString("zh-TW")}`
  ];

  return parts.map((part) => String(part ?? "-")).join("・");
}

export function EntryForm({ kind }: { kind: "income" | "appointment" }) {
  const [saved, setSaved] = useState(false);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [serviceCode, setServiceCode] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState("");
  const appointment = kind === "appointment";

  useEffect(() => {
    let active = true;

    async function loadServiceCatalog() {
      setLoadingServices(true);
      setServiceError("");

      try {
        const response = await fetch("/api/pulse/service-catalog", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "服務資料讀取失敗");
        }

        if (!active) return;
        const nextServices = Array.isArray(payload.services) ? payload.services : [];
        setServices(nextServices);

        if (nextServices.length > 0) {
          const firstService = nextServices[0] as ServiceCatalogItem;
          setServiceCode(firstService.service_code ?? "");
          setAmount(firstService.standard_price === null || firstService.standard_price === undefined ? "" : String(firstService.standard_price));
        }
      } catch (error) {
        if (!active) return;
        setServices([]);
        setServiceError(error instanceof Error ? error.message : "服務資料讀取失敗");
      } finally {
        if (active) setLoadingServices(false);
      }
    }

    loadServiceCatalog();

    return () => {
      active = false;
    };
  }, []);

  const selectedService = useMemo(
    () => services.find((service) => service.service_code === serviceCode),
    [serviceCode, services]
  );

  function updateService(nextServiceCode: string) {
    setServiceCode(nextServiceCode);
    const nextService = services.find((service) => service.service_code === nextServiceCode);
    setAmount(nextService?.standard_price === null || nextService?.standard_price === undefined ? "" : String(nextService.standard_price));
  }

  return (
    <form className="entry-form" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
      <Field label="日期"><input type="date" defaultValue="2026-06-14" required /></Field>
      {appointment && <Field label="時間"><input type="time" defaultValue="14:00" /></Field>}
      <Field label="客戶名稱"><input placeholder="輸入客戶名稱" required={appointment} /></Field>
      <Field label="服務類型">
        <select value={serviceCode} onChange={(event) => updateService(event.target.value)} disabled={loadingServices || services.length === 0} required>
          {loadingServices ? <option value="">讀取 service_catalog 中…</option> : null}
          {!loadingServices && services.length === 0 ? <option value="">service_catalog 目前沒有 active / trial 服務</option> : null}
          {services.map((service) => (
            <option key={service.service_code ?? serviceLabel(service)} value={service.service_code ?? ""}>
              {serviceLabel(service)}
            </option>
          ))}
        </select>
      </Field>
      {serviceError ? <p className="pulse-form-note">{serviceError}</p> : null}
      {selectedService ? <p className="pulse-form-note">已選服務狀態：{selectedService.status}</p> : null}
      <Field label={appointment ? "預估金額" : "實收金額"}>
        <input type="number" inputMode="numeric" placeholder="0" value={amount} onChange={(event) => setAmount(event.target.value)} required={!appointment} />
      </Field>
      {appointment ? <Field label="狀態"><select>{["已排", "待確認", "已完成", "取消"].map((x) => <option key={x}>{x}</option>)}</select></Field> : <Field label="來源"><select>{["LINE", "IG", "軟體", "熟客", "FansOne", "其他"].map((x) => <option key={x}>{x}</option>)}</select></Field>}
      <Field label="備註"><textarea placeholder="有什麼值得記住？" /></Field>
      <button className="save">{saved ? "已暫存（連接 Supabase 後同步）" : "儲存紀錄"}</button>
    </form>
  );
}
