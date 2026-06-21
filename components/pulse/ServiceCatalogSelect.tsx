"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type PulseService = {
  id?: string;
  service_code: string;
  service_line: string | null;
  service_name: string;
  service_variant: string | null;
  price: number;
  standard_price: number;
};

export function ServiceCatalogSelect({ value, onChange }: { value?: string; onChange: (service: PulseService | null) => void }) {
  const [services, setServices] = useState<PulseService[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      setError("");
      const db = createSupabaseBrowserClient();
      if (!db) { setLoaded(true); return; }
      const { data, error } = await db
        .from("service_catalog")
        .select("id, service_code, service_line, service_name, service_variant, price, standard_price:price")
        .in("status", ["active", "trial"])
        .order("service_code", { ascending: true });
      if (error) setError(error.message);
      else setServices((data ?? []) as PulseService[]);
      setLoaded(true);
    }
    load();
  }, []);

  return <div className="pulse-select-block">
    <select value={value ?? ""} onChange={(event) => onChange(services.find((service) => service.service_code === event.target.value) ?? null)} required>
      <option value="">選擇服務</option>
      {services.map((service) => <option key={service.service_code} value={service.service_code}>
        {service.service_code}・{service.service_line ?? "未分類"}・{service.service_name}・{service.service_variant ?? "標準"}・NT${Number(service.price).toLocaleString("zh-TW")}
      </option>)}
    </select>
    {error ? <small className="pulse-error">{error}</small> : loaded && services.length === 0 ? <small>目前沒有 active / trial 服務</small> : null}
  </div>;
}
