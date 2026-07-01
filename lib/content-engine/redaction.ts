/**
 * BodyFix Content Engine MVP v0.1 - Redaction & Safety
 * Simple patterns to detect potential PII before sending to external APIs.
 */

const PII_PATTERNS = [
  // Phone numbers (Taiwan)
  /09\d{2}-?\d{3}-?\d{3}/g,
  /\(0\d\)-?\d{3,4}-?\d{3,4}/g,
  // Line ID patterns (common ones)
  /ID[:：]\s*[a-zA-Z0-9._-]+/gi,
  // Email addresses
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
];

export function hasPotentialPII(text: string): boolean {
  return PII_PATTERNS.some((pattern) => pattern.test(text));
}

export function redactPII(text: string): string {
  let redacted = text;
  PII_PATTERNS.forEach((pattern) => {
    redacted = redacted.replace(pattern, "[REDACTED]");
  });
  return redacted;
}
