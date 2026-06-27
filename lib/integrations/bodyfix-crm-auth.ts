import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { CrmIntakePayload } from "@/lib/integrations/bodyfix-crm-schema";

function getToolSecret() {
  return process.env.BODYFIX_CRM_TOOL_SECRET?.trim() ?? "";
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function verifyCrmToolAuth(request: NextRequest) {
  const secret = getToolSecret();
  const authorization = request.headers.get("authorization") ?? "";
  if (!secret || !authorization.startsWith("Bearer ")) return false;
  return safeEqual(authorization.slice(7).trim(), secret);
}

export function createConfirmationToken(payload: CrmIntakePayload) {
  const secret = getToolSecret();
  if (!secret) throw new Error("BODYFIX_CRM_TOOL_SECRET is not configured");
  return createHmac("sha256", secret).update(stableStringify(payload)).digest("hex");
}

export function verifyConfirmationToken(payload: CrmIntakePayload, token: string) {
  return safeEqual(createConfirmationToken(payload), token);
}

export function unauthorizedResponse() {
  return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
}
