/**
 * Brief acknowledgements must not re-classify an existing booking lead.
 * Keep this intentionally narrow: real text questions should reach the AI.
 */
const REACTIONS = new Set([
  "❤️", "❤", "♥️", "♥", "💖", "💕", "💗", "💓", "🫶",
  "👍", "👍🏻", "👍🏼", "👍🏽", "👍🏾", "👍🏿",
  "👌", "🙏", "😊", "🥰", "😍", "😄", "😆", "😂"
]);

export function isBriefReaction(message: string) {
  const trimmed = message.trim();
  if (REACTIONS.has(trimmed)) return true;
  const words = Array.from(trimmed.matchAll(/(?:❤️|❤|♥️|♥|💖|💕|💗|💓|🫶|👍|👌|🙏|😊|🥰|😍|😄|😆|😂)/gu), m => m[0]);
  if (!words.length || words.length > 3) return false;
  return words.join("") === trimmed;
}

export const REACTION_ACKNOWLEDGEMENT =
  "收到 ❤️ 有想預約的服務或方便的日期、時間，直接告訴我就可以了。";
