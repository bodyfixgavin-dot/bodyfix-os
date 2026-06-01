export type BodyFixPaymentMode = "full_payment" | "installment_3" | "flexible_payment";

export type FlexiblePaymentStatus = "draft" | "active" | "payment_in_progress" | "paid" | "cancelled";

export type FlexiblePaymentMethod = "現金" | "轉帳" | "Line Pay" | "其他";

export type PaymentEntry = {
  date: string;
  amount: number;
  paymentMethod: FlexiblePaymentMethod;
  note?: string;
};

export type FlexiblePaymentPlan = {
  packageCode: "training_24_plus_12_integrated";
  packageName: "24 + 12 深度整合方案";
  paymentMode: "flexible_payment";
  contractAmount: number;
  minimumDeposit: number;
  trainingSessions: number;
  bodyworkSessions: number;
  paymentEntries: PaymentEntry[];
  totalPaid: number;
  outstandingAmount: number;
  paymentStatus: Extract<FlexiblePaymentStatus, "payment_in_progress" | "paid">;
};

export const INTEGRATED_24_PLUS_12_PAYMENT_RULE = {
  packageCode: "training_24_plus_12_integrated",
  packageName: "24 + 12 深度整合方案",
  contractAmount: 62400,
  fullPaymentAmount: 60000,
  threeInstallmentAmount: 20800,
  minimumFlexibleDeposit: 2400,
  trainingSessions: 24,
  bodyworkSessions: 12,
  riskReminderThreshold: 20000,
} as const;

function sanitizeAmount(amount: number) {
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
}

export function calculateFlexiblePaymentProgress(contractAmount: number, entries: Pick<PaymentEntry, "amount">[]) {
  const totalPaid = Math.min(
    sanitizeAmount(contractAmount),
    entries.reduce((sum, entry) => sum + sanitizeAmount(entry.amount), 0),
  );
  const outstandingAmount = Math.max(0, sanitizeAmount(contractAmount) - totalPaid);

  return {
    totalPaid,
    outstandingAmount,
    paymentStatus: outstandingAmount === 0 ? "paid" as const : "payment_in_progress" as const,
  };
}

export function createIntegratedFlexiblePaymentPlan(initialDeposit: number, paymentMethod: FlexiblePaymentMethod, date: string, note?: string): FlexiblePaymentPlan {
  const deposit = sanitizeAmount(initialDeposit);

  if (deposit < INTEGRATED_24_PLUS_12_PAYMENT_RULE.minimumFlexibleDeposit) {
    throw new Error(`彈性補款最低訂金為 NT$${INTEGRATED_24_PLUS_12_PAYMENT_RULE.minimumFlexibleDeposit.toLocaleString("zh-TW")}`);
  }

  const paymentEntries: PaymentEntry[] = [{ date, amount: deposit, paymentMethod, note }];
  const progress = calculateFlexiblePaymentProgress(INTEGRATED_24_PLUS_12_PAYMENT_RULE.contractAmount, paymentEntries);

  return {
    packageCode: INTEGRATED_24_PLUS_12_PAYMENT_RULE.packageCode,
    packageName: INTEGRATED_24_PLUS_12_PAYMENT_RULE.packageName,
    paymentMode: "flexible_payment",
    contractAmount: INTEGRATED_24_PLUS_12_PAYMENT_RULE.contractAmount,
    minimumDeposit: INTEGRATED_24_PLUS_12_PAYMENT_RULE.minimumFlexibleDeposit,
    trainingSessions: INTEGRATED_24_PLUS_12_PAYMENT_RULE.trainingSessions,
    bodyworkSessions: INTEGRATED_24_PLUS_12_PAYMENT_RULE.bodyworkSessions,
    paymentEntries,
    ...progress,
  };
}

export function appendFlexiblePaymentEntry(plan: FlexiblePaymentPlan, entry: PaymentEntry): FlexiblePaymentPlan {
  const paymentEntries = [...plan.paymentEntries, { ...entry, amount: sanitizeAmount(entry.amount) }];
  const progress = calculateFlexiblePaymentProgress(plan.contractAmount, paymentEntries);

  return {
    ...plan,
    paymentEntries,
    ...progress,
  };
}

export function getFlexiblePaymentRiskReminder(outstandingAmount: number) {
  const amount = sanitizeAmount(outstandingAmount);

  if (amount <= 0) return null;

  return {
    message: `此客戶尚有未收款：NT$${amount.toLocaleString("zh-TW")}，付款模式：彈性補款，請確認是否繼續安排服務。`,
    exceedsReminderThreshold: amount > INTEGRATED_24_PLUS_12_PAYMENT_RULE.riskReminderThreshold,
  };
}
