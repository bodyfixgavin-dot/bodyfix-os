import { createMenuBookingResult } from "./booking";
import type { BodyFixAiResult, CrmRecord } from "./types";

/**
 * Emergency safe-default reception for a one-person studio:
 * - First meaningful customer text receives a single short acknowledgement.
 * - Every subsequent message belongs to Gavin, not to an AI conversation.
 * - Previous CRM records count as existing conversations, even when a LINE
 *   Official Account chat operator switches to "manual" in their own UI.
 * The LINE OA manual-chat toggle is NOT a reliable signal in Messaging API webhooks.
 */
export const FIRST_CONTACT_ACK =
  "收到～我先幫你記下詢問，Gavin 會親自確認後回覆你喔 😊";

export function shouldAcknowledgeFirstMessage(record: CrmRecord | null | undefined) {
  // A new follower may have a CRM welcome row, but no inbound message yet.
  return !record?.lastUserMessageAt?.trim();
}

export function createFirstContactResult(message: string): BodyFixAiResult {
  const menu = createMenuBookingResult(message);
  if (menu) {
    return {
      ...menu,
      classification: {
        ...menu.classification,
        bookingStage: "human_takeover",
        needHuman: true,
        nextAction: "human_takeover",
        notes: "首次選單預約：已接待一次，後續交由 Gavin 真人回覆；未確認時段。"
      }
    };
  }

  return {
    replyText: FIRST_CONTACT_ACK,
    classification: {
      intent: "unclear",
      leadTemperature: "C",
      bookingStage: "human_takeover",
      preferredService: "unknown",
      needHuman: true,
      bodyIssue: "",
      bodyArea: "",
      preferredLocation: "",
      preferredTime: "",
      nextAction: "human_takeover",
      notes: "首次一般詢問：已發一次固定收件訊息；後續停止自動回覆，轉真人。"
    }
  };
}
