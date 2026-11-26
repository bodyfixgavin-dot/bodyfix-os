import { describe, expect, it, vi } from "vitest";
import { intakeStorageFailure, logIntakeStorageFailure } from "./intake-storage-error";

describe("safe storage diagnostics", () => {
  it.each([
    ["ENOTFOUND", "dns"], ["EAI_AGAIN", "dns"], ["CERT_HAS_EXPIRED", "tls"],
    ["UND_ERR_CONNECT_TIMEOUT", "timeout"], ["AbortError", "timeout"],
    ["ERR_INVALID_URL", "invalid_url"], ["ECONNRESET", "connection_reset"],
    ["ECONNREFUSED", "connection_refused"], ["PGRST205", "missing_table"],
    ["PGRST204", "missing_column"], ["42501", "permission_denied"], ["PGRST301", "invalid_key"],
  ])("classifies nested %s without exposing error text", (code, category) => {
    expect(intakeStorageFailure({ message: "fetch failed", cause: { code } })).toBe(category);
    // PostgREST serializes fetch's underlying cause into details.
    expect(intakeStorageFailure({ message: "fetch failed", details: `Caused by: ${code}` })).toBe(category);
  });
  it("does not invent a cause when a historical fetch failure lost its details", () => {
    expect(intakeStorageFailure({ message: "TypeError: fetch failed" })).toBe("network_unknown");
  });
  it("never logs payloads, keys, stack traces or raw error messages", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      logIntakeStorageFailure({ code: "PGRST205", message: "private-health-and-secret-token", details: "private-url", stack: "private-stack" });
      expect(JSON.stringify(log.mock.calls)).not.toMatch(/private/);
      expect(log.mock.calls[0][1]).toMatchObject({ category: "missing_table", urlSource: "NEXT_PUBLIC_SUPABASE_URL" });
    } finally { log.mockRestore(); }
  });
});
