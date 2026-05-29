import { createHmac, timingSafeEqual } from "crypto";

const LINE_API_BASE = "https://api.line.me/v2/bot";

function getLineToken() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  return token;
}

export function verifyLineSignature(rawBody: string, signature: string | null) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;

  const digest = createHmac("sha256", secret).update(rawBody).digest("base64");
  const expected = Buffer.from(digest);
  const actual = Buffer.from(signature);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function replyLineMessage(replyToken: string, text: string) {
  const res = await fetch(`${LINE_API_BASE}/message/reply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getLineToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text: truncateLineText(text) }]
    })
  });

  if (!res.ok) throw new Error(`LINE reply failed: ${res.status} ${await res.text()}`);
}

export async function pushLineMessage(userId: string, text: string) {
  const res = await fetch(`${LINE_API_BASE}/message/push`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getLineToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text: truncateLineText(text) }]
    })
  });

  if (!res.ok) throw new Error(`LINE push failed: ${res.status} ${await res.text()}`);
}

export async function getLineDisplayName(userId: string) {
  try {
    const res = await fetch(`${LINE_API_BASE}/profile/${userId}`, {
      headers: { Authorization: `Bearer ${getLineToken()}` }
    });
    if (!res.ok) return "";
    const profile = (await res.json()) as { displayName?: string };
    return profile.displayName || "";
  } catch {
    return "";
  }
}

export async function notifyGavin(text: string) {
  const gavinLineUserId = process.env.GAVIN_LINE_USER_ID;
  if (!gavinLineUserId) return;
  await pushLineMessage(gavinLineUserId, text);
}

function truncateLineText(text: string) {
  return text.length > 4900 ? `${text.slice(0, 4897)}...` : text;
}
