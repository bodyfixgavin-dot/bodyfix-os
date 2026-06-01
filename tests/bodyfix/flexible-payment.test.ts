import { describe, expect, it } from "vitest";
import {
  INTEGRATED_24_PLUS_12_PAYMENT_RULE,
  appendFlexiblePaymentEntry,
  calculateFlexiblePaymentProgress,
  createIntegratedFlexiblePaymentPlan,
  getFlexiblePaymentRiskReminder,
} from "../../lib/bodyfix/flexible-payment";

describe("flexible payment business rules", () => {
  it("keeps the 24 + 12 flexible payment contract at NT$62,400 and does not use the NT$60,000 full-payment price", () => {
    const plan = createIntegratedFlexiblePaymentPlan(2400, "轉帳", "2026-06-01");

    expect(plan.contractAmount).toBe(62400);
    expect(plan.contractAmount).toBe(INTEGRATED_24_PLUS_12_PAYMENT_RULE.contractAmount);
    expect(plan.contractAmount === INTEGRATED_24_PLUS_12_PAYMENT_RULE.fullPaymentAmount).toBe(false);
    expect(plan.totalPaid).toBe(2400);
    expect(plan.outstandingAmount).toBe(60000);
    expect(plan.paymentStatus).toBe("payment_in_progress");
  });

  it("requires at least NT$2,400 as the flexible-payment deposit", () => {
    let message = "";
    try {
      createIntegratedFlexiblePaymentPlan(2399, "現金", "2026-06-01");
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message.includes("彈性補款最低訂金")).toBe(true);
  });

  it("appends payment entries without overwriting old records and marks paid at zero outstanding", () => {
    const plan = createIntegratedFlexiblePaymentPlan(2400, "轉帳", "2026-06-01");
    const afterFirstTopup = appendFlexiblePaymentEntry(plan, { date: "2026-06-10", amount: 20000, paymentMethod: "現金" });
    const afterSecondTopup = appendFlexiblePaymentEntry(afterFirstTopup, { date: "2026-06-20", amount: 35000, paymentMethod: "Line Pay" });
    const paid = appendFlexiblePaymentEntry(afterSecondTopup, { date: "2026-06-30", amount: 5000, paymentMethod: "轉帳" });

    expect(plan.paymentEntries.length).toBe(1);
    expect(afterFirstTopup.paymentEntries.length).toBe(2);
    expect(afterFirstTopup.totalPaid).toBe(22400);
    expect(afterFirstTopup.outstandingAmount).toBe(40000);
    expect(afterSecondTopup.totalPaid).toBe(57400);
    expect(afterSecondTopup.outstandingAmount).toBe(5000);
    expect(paid.totalPaid).toBe(62400);
    expect(paid.outstandingAmount).toBe(0);
    expect(paid.paymentStatus).toBe("paid");
  });

  it("returns a risk reminder without blocking service when outstanding remains", () => {
    const reminder = getFlexiblePaymentRiskReminder(40000);

    expect(reminder?.message.includes("此客戶尚有未收款：NT$40,000")).toBe(true);
    expect(reminder?.message.includes("請確認是否繼續安排服務")).toBe(true);
    expect(reminder?.exceedsReminderThreshold).toBe(true);
    expect(calculateFlexiblePaymentProgress(62400, [{ amount: 62400 }]).paymentStatus).toBe("paid");
  });
});
