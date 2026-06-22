import { BODYFIX_SYSTEM_PROMPT } from "./prompt";
import type { BodyFixAiResult, BodyFixClassification, CrmRecord } from "./types";

const DEFAULT_CLASSIFICATION: BodyFixClassification = {
  intent: "unclear",
  leadTemperature: "C",
  bookingStage: "assessing",
  preferredService: "unknown",
  needHuman: false,
  bodyIssue: "",
  bodyArea: "",
  preferredLocation: "",
  preferredTime: "",
  nextAction: "ask_body_issue",
  notes: ""
};

export async function generateBodyFixReply(message: string, crm?: CrmRecord): Promise<BodyFixAiResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const userContext = crm
    ? `既有 CRM 狀態：${JSON.stringify({
        bookingStage: crm.bookingStage,
        leadTemperature: crm.leadTemperature,
        lastIntent: crm.lastIntent,
        bodyIssue: crm.bodyIssue,
        preferredLocation: crm.preferredLocation,
        preferredTime: crm.preferredTime,
        followupCount: crm.followupCount,
        notes: crm.notes
      })}`
    : "這是新客或尚未建立 CRM 狀態。";

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        { role: "system", content: BODYFIX_SYSTEM_PROMPT },
        {
          role: "user",
          content: `${userContext}\n\n客人訊息：${message}`
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "bodyfix_receptionist_reply",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["replyText", "classification"],
            properties: {
              replyText: { type: "string" },
              classification: {
                type: "object",
                additionalProperties: false,
                required: [
                  "intent",
                  "leadTemperature",
                  "bookingStage",
                  "preferredService",
                  "needHuman",
                  "bodyIssue",
                  "bodyArea",
                  "preferredLocation",
                  "preferredTime",
                  "nextAction",
                  "notes"
                ],
                properties: {
                  intent: { type: "string", enum: ["booking", "pricing", "service_difference", "body_issue", "coaching", "location", "oil_massage", "sexual_service", "followup", "unclear"] },
                  leadTemperature: { type: "string", enum: ["A", "B", "C", "D"] },
                  bookingStage: { type: "string", enum: ["new", "assessing", "ready_to_book", "waiting_time", "booked", "followup_needed", "not_fit", "human_takeover"] },
                  preferredService: { type: "string", enum: ["standard_fascia_60", "pelvic_core_60", "fascia_extension_30", "pelvic_extension_30", "mixed_extension", "one_on_one_coaching", "unknown"] },
                  needHuman: { type: "boolean" },
                  bodyIssue: { type: "string" },
                  bodyArea: { type: "string" },
                  preferredLocation: { type: "string" },
                  preferredTime: { type: "string" },
                  nextAction: { type: "string", enum: ["ask_body_issue", "ask_time", "ask_location", "ask_training_goal", "explain_difference", "send_price", "human_takeover", "followup_3_days", "followup_7_days"] },
                  notes: { type: "string" }
                }
              }
            }
          }
        }
      }
    })
  });

  if (!res.ok) throw new Error(`OpenAI request failed: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  const outputText = data.output_text || data.output?.flatMap((item) => item.content || []).map((content) => content.text || "").join("") || "";
  const parsed = JSON.parse(outputText) as BodyFixAiResult;

  return {
    replyText: parsed.replyText || fallbackReply(),
    classification: { ...DEFAULT_CLASSIFICATION, ...parsed.classification }
  };
}

function fallbackReply() {
  return "可以，我先幫你整理狀況。你目前最困擾的是肩頸、腰背、骨盆核心，還是訓練卡關？";
}
