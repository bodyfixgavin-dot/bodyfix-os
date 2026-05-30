"use client";

import { useState } from "react";
import { ClinicShell, Field, SelectOptions, TextInput } from "@/components/clinic/ClinicShell";
import {
  BODYFIX_PRINCIPLES,
  SERVICES,
  STAFF_LEVELS,
  assertCanOperateService,
  calculateMonthlyProjection,
  calculateServiceProfit,
  canOperateService,
} from "@/src/bodyfix-foundation";
import type {
  CustomerSource,
  MonthlyProjectionResult,
  ServiceCalculationResult,
  ServiceCode,
  StaffLevelId,
} from "@/src/bodyfix-foundation";

type ProfitForm = {
  serviceCode: ServiceCode;
  customerSource: CustomerSource;
  staffLevelId: StaffLevelId;
  grossRevenueTwd: string;
  materialCostTwd: string;
  adminCostTwd: string;
  locationCostTwd: string;
  referralBonusTwd: string;
};

type MonthlyForm = ProfitForm & {
  monthlySessions: string;
  monthlyFixedCostTwd: string;
};

const customerSourceLabels: Record<CustomerSource, string> = {
  bodyfix_official: "BodyFix 官方客源",
  staff_own: "員工自帶客源",
  partner_referral: "合作夥伴轉介",
  student_own: "學生自帶客源",
  unknown: "未知 / 待判斷",
};

const staffLevelLabels = Object.fromEntries(
  STAFF_LEVELS.map((staff) => [staff.id, `${staff.nameZh}（${staff.id}）`]),
) as Record<StaffLevelId, string>;

const serviceLabels = Object.fromEntries(
  SERVICES.map((service) => [service.serviceCode, `${service.nameZh}（${service.serviceCode}）`]),
) as Record<ServiceCode, string>;

const statusLabels: Record<string, string> = {
  active: "可營運",
  interest_only: "興趣登記",
  coming_soon: "尚未開放",
  paused: "暫停",
  archived: "封存",
};

const revenueModelLabels: Record<string, string> = {
  service_commission: "自動抽成試算",
  fixed_referral_bonus: "固定轉介獎金",
  case_by_case: "不自動試算",
  training_fee: "培訓費",
  license_fee: "授權費",
  not_open: "未開放營收",
};

const defaultProfitForm: ProfitForm = {
  serviceCode: "fascia_chain_reset_60",
  customerSource: "bodyfix_official",
  staffLevelId: "L4_FASCIA_LINE_PRACTITIONER",
  grossRevenueTwd: "2200",
  materialCostTwd: "0",
  adminCostTwd: "0",
  locationCostTwd: "0",
  referralBonusTwd: "0",
};

const defaultMonthlyForm: MonthlyForm = {
  ...defaultProfitForm,
  monthlySessions: "30",
  monthlyFixedCostTwd: "30000",
};

function money(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);
}

function toOptionalNumber(value: string) {
  if (value.trim() === "") return undefined;
  return Number(value);
}

function translateCalculationError(error: unknown, serviceCode: ServiceCode) {
  const service = SERVICES.find((item) => item.serviceCode === serviceCode);
  if (service?.serviceCode === "grooming_interest") {
    return "Grooming 目前為興趣登記，尚未開放正式營收試算。";
  }
  if (service?.status !== "active") {
    return "此服務目前不是正式可試算服務。";
  }
  if (service?.revenueModel === "case_by_case") {
    return "此服務採個案制，不適用自動抽成試算。";
  }
  return error instanceof Error ? error.message : "試算失敗，請確認輸入資料。";
}

function serviceTags(serviceCode: ServiceCode) {
  const service = SERVICES.find((item) => item.serviceCode === serviceCode);
  if (!service) return null;
  return (
    <div className="bf-tag-row">
      {service.status === "active" && <span className="bf-tag">active = 可營運</span>}
      {service.status === "interest_only" && <span className="bf-tag bf-tag-warning">interest_only = 興趣登記</span>}
      {service.revenueModel === "case_by_case" && <span className="bf-tag bf-tag-warning">case_by_case = 不自動試算</span>}
      {service.minimumStaffLevelId === "GAVIN_ONLY" && <span className="bf-tag bf-tag-warning">GAVIN_ONLY = Gavin 本人限定</span>}
    </div>
  );
}

export function BusinessFoundationDashboard() {
  const [permissionStaffLevelId, setPermissionStaffLevelId] = useState<StaffLevelId>("L4_FASCIA_LINE_PRACTITIONER");
  const [permissionServiceCode, setPermissionServiceCode] = useState<ServiceCode>("fascia_chain_reset_60");
  const [permissionResult, setPermissionResult] = useState<{ allowed: boolean; reason: string } | null>(null);
  const [profitForm, setProfitForm] = useState<ProfitForm>(defaultProfitForm);
  const [profitResult, setProfitResult] = useState<ServiceCalculationResult | null>(null);
  const [profitError, setProfitError] = useState("");
  const [monthlyForm, setMonthlyForm] = useState<MonthlyForm>(defaultMonthlyForm);
  const [monthlyResult, setMonthlyResult] = useState<MonthlyProjectionResult | null>(null);
  const [monthlyError, setMonthlyError] = useState("");

  function checkPermission() {
    const allowed = canOperateService(permissionStaffLevelId, permissionServiceCode);
    try {
      assertCanOperateService(permissionStaffLevelId, permissionServiceCode);
      setPermissionResult({ allowed, reason: "符合 Part 4 權限規則，可操作此服務。" });
    } catch (error) {
      setPermissionResult({
        allowed,
        reason: error instanceof Error ? error.message : "不符合 Part 4 權限規則。",
      });
    }
  }

  function updateProfit<K extends keyof ProfitForm>(key: K, value: ProfitForm[K]) {
    setProfitForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateMonthly<K extends keyof MonthlyForm>(key: K, value: MonthlyForm[K]) {
    setMonthlyForm((prev) => ({ ...prev, [key]: value }));
  }

  function calculateProfit() {
    setProfitError("");
    setProfitResult(null);
    try {
      const result = calculateServiceProfit({
        serviceCode: profitForm.serviceCode,
        customerSource: profitForm.customerSource,
        staffLevelId: profitForm.staffLevelId,
        grossRevenueTwd: toOptionalNumber(profitForm.grossRevenueTwd),
        materialCostTwd: toOptionalNumber(profitForm.materialCostTwd),
        adminCostTwd: toOptionalNumber(profitForm.adminCostTwd),
        locationCostTwd: toOptionalNumber(profitForm.locationCostTwd),
        referralBonusTwd: toOptionalNumber(profitForm.referralBonusTwd),
      });
      setProfitResult(result);
    } catch (error) {
      setProfitError(translateCalculationError(error, profitForm.serviceCode));
    }
  }

  function calculateMonthly(form = monthlyForm) {
    setMonthlyError("");
    setMonthlyResult(null);
    try {
      const result = calculateMonthlyProjection({
        serviceCode: form.serviceCode,
        customerSource: form.customerSource,
        staffLevelId: form.staffLevelId,
        grossRevenueTwd: toOptionalNumber(form.grossRevenueTwd),
        materialCostTwd: toOptionalNumber(form.materialCostTwd),
        adminCostTwd: toOptionalNumber(form.adminCostTwd),
        locationCostTwd: toOptionalNumber(form.locationCostTwd),
        referralBonusTwd: toOptionalNumber(form.referralBonusTwd),
        monthlySessions: Number(form.monthlySessions),
        monthlyFixedCostTwd: Number(form.monthlyFixedCostTwd),
      });
      setMonthlyResult(result);
    } catch (error) {
      setMonthlyError(translateCalculationError(error, form.serviceCode));
    }
  }

  function applyQuickTest(monthlySessions: string, serviceCode: ServiceCode) {
    const service = SERVICES.find((item) => item.serviceCode === serviceCode);
    const nextForm: MonthlyForm = {
      ...monthlyForm,
      serviceCode,
      staffLevelId: service?.minimumStaffLevelId && service.minimumStaffLevelId !== "CASE_BY_CASE"
        ? service.minimumStaffLevelId
        : "L4_FASCIA_LINE_PRACTITIONER",
      grossRevenueTwd: String(service?.recommendedPriceTwd ?? 0),
      monthlySessions,
    };
    setMonthlyForm(nextForm);
    calculateMonthly(nextForm);
  }

  return (
    <ClinicShell
      title="BodyFix Business Foundation Preview Dashboard"
      subtitle="內部後台預覽頁：視覺化 Part 4 商業規則引擎，快速驗收產品、人才、權限、分潤與營收模型。"
    >
      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">1. BodyFix 原則總覽</h2>
        <p className="bf-highlight-sentence">{BODYFIX_PRINCIPLES.coreSentence}</p>
        <div className="bf-summary-grid">
          <InfoItem label="品牌定位" value={BODYFIX_PRINCIPLES.brandPositioning} />
          <InfoItem label="營運邏輯" value={BODYFIX_PRINCIPLES.operatingLogic} />
          <InfoItem label="人才原則" value={BODYFIX_PRINCIPLES.talentPrinciple} />
          <InfoItem label="所有權原則" value={BODYFIX_PRINCIPLES.ownershipPrinciple} />
        </div>
      </section>

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">2. 產品階梯總覽</h2>
        <div className="bf-table-wrap">
          <table className="bf-admin-table bf-foundation-table">
            <thead>
              <tr>
                <th>服務名稱</th>
                <th>serviceCode</th>
                <th>分類</th>
                <th>價格 / 時間</th>
                <th>狀態</th>
                <th>最低操作權限</th>
                <th>營收模式</th>
                <th>定位 / 下一步產品</th>
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((service) => (
                <tr key={service.serviceCode}>
                  <td><strong>{service.nameZh}</strong>{service.isHighRiskOrHighTrust && <span className="bf-tag">高信任服務</span>}</td>
                  <td><code>{service.serviceCode}</code></td>
                  <td>{service.category}</td>
                  <td>{service.recommendedPriceTwd === null ? "個案 / 未定價" : money(service.recommendedPriceTwd)}<br />{service.durationMinutes ?? "依方案"} 分鐘</td>
                  <td>{statusLabels[service.status] ?? service.status}{serviceTags(service.serviceCode)}</td>
                  <td>{service.minimumStaffLevelId}</td>
                  <td>{revenueModelLabels[service.revenueModel] ?? service.revenueModel}</td>
                  <td>{service.positioning}<br /><small>{service.nextServiceCodes?.join("、") ?? "—"}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">3. 人才階梯與權限總覽</h2>
        <div className="bf-table-wrap">
          <table className="bf-admin-table">
            <thead>
              <tr><th>等級</th><th>中文名稱</th><th>英文名稱</th><th>rank</th><th>定位</th><th>可操作服務</th><th>不可操作提醒</th><th>升級條件</th></tr>
            </thead>
            <tbody>
              {STAFF_LEVELS.map((staff) => (
                <tr key={staff.id}>
                  <td>{staff.id}</td>
                  <td>{staff.nameZh}</td>
                  <td>{staff.id.replaceAll("_", " ").toLowerCase()}</td>
                  <td>{staff.rank}</td>
                  <td>{staff.positioning}</td>
                  <td>{staff.canOperateServiceCodes.length > 0 ? staff.canOperateServiceCodes.join("、") : "尚無獨立操作服務"}</td>
                  <td>{staff.cannotOperateServiceCodes?.join("、") ?? staff.notes?.join("；") ?? "依 Part 4 權限檢查器判斷"}</td>
                  <td>完成上一階段訓練、服務邊界驗收，並由 BodyFix 依 rank 與服務權限開放。</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bf-card bf-nested-card bf-section-gap">
          <h3>權限檢查器</h3>
          <div className="clinic-form-grid bf-form">
            <Field label="staffLevelId">
              <select value={permissionStaffLevelId} onChange={(event) => setPermissionStaffLevelId(event.target.value as StaffLevelId)}>
                <SelectOptions options={staffLevelLabels} />
              </select>
            </Field>
            <Field label="serviceCode">
              <select value={permissionServiceCode} onChange={(event) => setPermissionServiceCode(event.target.value as ServiceCode)}>
                <SelectOptions options={serviceLabels} />
              </select>
            </Field>
          </div>
          <button className="bf-primary bf-section-gap" type="button" onClick={checkPermission}>檢查是否可操作</button>
          {permissionResult && (
            <div className={permissionResult.allowed ? "bf-success bf-section-gap" : "bf-notice bf-section-gap"}>
              <strong>{permissionResult.allowed ? "可操作" : "不可操作"}</strong>：{permissionResult.reason}
            </div>
          )}
        </div>
      </section>

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">4. 單次服務淨利試算</h2>
        <CalculationFields form={profitForm} onChange={(key, value) => updateProfit(key as keyof ProfitForm, value as ProfitForm[keyof ProfitForm])} />
        <button className="bf-primary bf-section-gap" type="button" onClick={calculateProfit}>試算單次淨利</button>
        {profitError && <div className="bf-notice bf-section-gap">{profitError}</div>}
        {profitResult && (
          <ResultGrid
            items={[
              ["服務代碼", profitResult.serviceCode],
              ["客戶來源", customerSourceLabels[profitResult.customerSource]],
              ["總收入", money(profitResult.grossRevenueTwd)],
              ["員工分潤", money(profitResult.employeePayoutTwd)],
              ["BodyFix 毛分潤", money(profitResult.bodyfixGrossShareTwd)],
              ["材料成本", money(profitResult.materialCostTwd)],
              ["行政成本", money(profitResult.adminCostTwd)],
              ["場地成本", money(profitResult.locationCostTwd)],
              ["轉介獎金", money(profitResult.referralBonusTwd)],
              ["BodyFix 單次淨利", money(profitResult.bodyfixNetProfitTwd)],
              ["套用規則 ID", profitResult.appliedRuleId],
              ["備註", profitResult.notes.join("；")],
            ]}
          />
        )}
      </section>

      <section className="bf-card bf-section-gap">
        <h2 className="bf-section-title">5. 月營收試算</h2>
        <div className="bf-admin-actions bf-margin-bottom">
          <button className="bf-small-btn" type="button" onClick={() => applyQuickTest("30", "fascia_chain_reset_60")}>30 堂 fascia_chain_reset_60</button>
          <button className="bf-small-btn" type="button" onClick={() => applyQuickTest("50", "fascia_chain_reset_60")}>50 堂 fascia_chain_reset_60</button>
          <button className="bf-small-btn" type="button" onClick={() => applyQuickTest("80", "fascia_line_selected_reset_60")}>80 堂 fascia_line_selected_reset_60</button>
          <button className="bf-small-btn" type="button" onClick={() => applyQuickTest("100", "multi_line_reset_90")}>100 堂 multi_line_reset_90</button>
        </div>
        <CalculationFields form={monthlyForm} onChange={(key, value) => updateMonthly(key as keyof MonthlyForm, value as MonthlyForm[keyof MonthlyForm])} includeMonthly />
        <button className="bf-primary bf-section-gap" type="button" onClick={() => calculateMonthly()}>試算月營收</button>
        {monthlyError && <div className="bf-notice bf-section-gap">{monthlyError}</div>}
        {monthlyResult && (
          <ResultGrid
            items={[
              ["每月堂數", `${monthlyResult.monthlySessions}`],
              ["月總收入", money(monthlyResult.monthlyGrossRevenueTwd)],
              ["月員工分潤", money(monthlyResult.monthlyEmployeePayoutTwd)],
              ["月變動成本", money(monthlyResult.monthlyVariableCostTwd)],
              ["月固定成本", money(monthlyResult.monthlyFixedCostTwd)],
              ["BodyFix 月淨利", money(monthlyResult.bodyfixMonthlyNetProfitTwd)],
              ["損益兩平堂數", monthlyResult.breakEvenSessions === null ? "無法自動估算" : `${monthlyResult.breakEvenSessions} 堂`],
              ["備註", monthlyResult.notes.join("；")],
            ]}
          />
        )}
      </section>
    </ClinicShell>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return <div className="clinic-item"><strong>{label}</strong><span>{value}</span></div>;
}

function CalculationFields({
  form,
  onChange,
  includeMonthly = false,
}: {
  form: ProfitForm | MonthlyForm;
  onChange: (key: keyof MonthlyForm, value: string) => void;
  includeMonthly?: boolean;
}) {
  const monthlyFields = includeMonthly && "monthlySessions" in form ? form : null;

  return (
    <div className="clinic-form-grid bf-form">
      <Field label="serviceCode">
        <select value={form.serviceCode} onChange={(event) => onChange("serviceCode", event.target.value)}>
          <SelectOptions options={serviceLabels} />
        </select>
      </Field>
      <Field label="customerSource">
        <select value={form.customerSource} onChange={(event) => onChange("customerSource", event.target.value)}>
          <SelectOptions options={customerSourceLabels} />
        </select>
      </Field>
      <Field label="staffLevelId">
        <select value={form.staffLevelId} onChange={(event) => onChange("staffLevelId", event.target.value)}>
          <SelectOptions options={staffLevelLabels} />
        </select>
      </Field>
      <Field label={includeMonthly ? "pricePerSessionTwd" : "grossRevenueTwd"}>
        <TextInput type="number" value={form.grossRevenueTwd} onChange={(event) => onChange("grossRevenueTwd", event.target.value)} />
      </Field>
      <Field label={includeMonthly ? "materialCostPerSessionTwd" : "materialCostTwd"}>
        <TextInput type="number" value={form.materialCostTwd} onChange={(event) => onChange("materialCostTwd", event.target.value)} />
      </Field>
      <Field label={includeMonthly ? "adminCostPerSessionTwd" : "adminCostTwd"}>
        <TextInput type="number" value={form.adminCostTwd} onChange={(event) => onChange("adminCostTwd", event.target.value)} />
      </Field>
      <Field label={includeMonthly ? "locationCostPerSessionTwd" : "locationCostTwd"}>
        <TextInput type="number" value={form.locationCostTwd} onChange={(event) => onChange("locationCostTwd", event.target.value)} />
      </Field>
      <Field label={includeMonthly ? "referralBonusPerSessionTwd" : "referralBonusTwd"}>
        <TextInput type="number" value={form.referralBonusTwd} onChange={(event) => onChange("referralBonusTwd", event.target.value)} />
      </Field>
      {monthlyFields && (
        <>
          <Field label="monthlySessions">
            <TextInput type="number" value={monthlyFields.monthlySessions} onChange={(event) => onChange("monthlySessions", event.target.value)} />
          </Field>
          <Field label="monthlyFixedCostTwd">
            <TextInput type="number" value={monthlyFields.monthlyFixedCostTwd} onChange={(event) => onChange("monthlyFixedCostTwd", event.target.value)} />
          </Field>
        </>
      )}
    </div>
  );
}

function ResultGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="bf-result-grid bf-section-gap">
      {items.map(([label, value]) => (
        <div className="clinic-item" key={label}>
          <strong>{label}</strong>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}
