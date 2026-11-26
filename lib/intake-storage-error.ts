// Return fixed labels only: never log raw messages, stacks, URLs, headers or payloads.
export function intakeStorageFailure(error: unknown) {
  const seen = new Set<unknown>();
  const parts: string[] = [];
  function collect(value: unknown, depth = 0) {
    if (!value || typeof value !== "object" || seen.has(value) || depth > 4) return;
    seen.add(value);
    const e = value as Record<string, unknown>;
    for (const key of ["code", "name", "message", "details"]) if (typeof e[key] === "string") parts.push(e[key]);
    collect(e.cause, depth + 1);
    if (Array.isArray(e.errors)) e.errors.forEach(v => collect(v, depth + 1));
  }
  collect(error);
  const text = parts.join(" ");
  if (/ENOTFOUND|EAI_AGAIN|EAI_FAIL|ENODATA|getaddrinfo/i.test(text)) return "dns";
  if (/CERT_|TLS_|SSL_|certificate|self.signed/i.test(text)) return "tls";
  if (/TimeoutError|AbortError|ABORT_ERR|ETIMEDOUT|UND_ERR_(CONNECT|HEADERS|BODY)_TIMEOUT/i.test(text)) return "timeout";
  if (/ERR_INVALID_URL|Invalid URL/i.test(text)) return "invalid_url";
  if (/ECONNREFUSED/i.test(text)) return "connection_refused";
  if (/ECONNRESET|EPIPE|UND_ERR_SOCKET/i.test(text)) return "connection_reset";
  if (/PGRST205|42P01/i.test(text)) return "missing_table";
  if (/PGRST204|42703/i.test(text)) return "missing_column";
  if (/42501|row.level security|permission denied/i.test(text)) return "permission_denied";
  if (/PGRST30[123]|invalid api key|invalid.*jwt/i.test(text)) return "invalid_key";
  if (/fetch failed|networkerror|failed to fetch/i.test(text)) return "network_unknown";
  return "database_unknown";
}

export function logIntakeStorageFailure(error: unknown) {
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const legacyUrl = process.env.SUPABASE_URL?.trim();
  console.error("intake_storage_unavailable", {
    category: intakeStorageFailure(error),
    urlSource: "NEXT_PUBLIC_SUPABASE_URL",
    legacyUrlMatches: publicUrl && legacyUrl ? publicUrl === legacyUrl : null,
    serviceKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    environment: process.env.VERCEL_ENV === "production" ? "production" : process.env.VERCEL_ENV === "preview" ? "preview" : "local",
  });
}
