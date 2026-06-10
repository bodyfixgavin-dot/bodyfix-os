import { NextResponse } from "next/server";
import { readJson, requireClinicAdmin } from "@/lib/clinic-api";

const BACKFILL_NOTE_MARKER = "來源：A 完整客戶總表 / Calendar Backfill";
const PASTE_NOTE_MARKER = "來源：貼上式行事曆 / 客戶總表回填";
const CREATED_FROM_MARKER = "created_from：calendar_backfill";
const PASTE_CREATED_FROM_MARKER = "created_from：calendar_backfill_paste";
const DEFAULT_CLIENT_STATUS = "未判斷";
const DEFAULT_CONTACT_METHOD = "unknown";

type CsvRow = Record<string, string>;
type ExistingClient = {
  id: string;
  client_code: string | null;
  display_name: string | null;
  client_name: string | null;
  name?: string | null;
  nickname: string | null;
  line_id: string | null;
  instagram: string | null;
  phone: string | null;
  internal_notes: string | null;
  notes?: string | null;
  priority: string | null;
};
type ImportPayload = {
  mode?: "dry_run" | "confirm";
  clientsCsv?: string;
  serviceRecordsCsv?: string;
  followupsCsv?: string;
  pasteText?: string;
  pasteFormat?: "auto" | "tsv" | "csv";
};

type Issue = { file: string; row: number; reason: string; value?: string };
type Duplicate = { file: string; row: number; reason: string; incoming: string; existing?: string };
type Review = { file: string; row: number; reason: string; value: string };
type ImportWarning = { table: string; row?: number; message: string };
type ImportError = { table: string; row?: number; message: string };
type ExistingClientSelect = Pick<ExistingClient, "id"> & Partial<Omit<ExistingClient, "id">>;
type SupabaseClientLike = Awaited<ReturnType<typeof requireClinicAdmin>>["supabase"];
type SupabaseImportError = { code?: string; message?: string };
type SchemaInfo = {
  clients: Set<string>;
  service_records: Set<string>;
  followups: Set<string>;
  warnings: ImportWarning[];
};

const columnAliases = {
  clientCode: ["client_code", "客戶編號", "原始客戶編號", "編號", "id", "client_id"],
  displayName: ["display_name", "客戶姓名", "姓名", "暱稱", "客戶稱呼", "client_name", "nickname", "name"],
  priority: ["priority", "優先級", "追蹤優先級", "分級"],
  status: ["client_status", "客戶狀態", "狀態"],
  contactMethod: ["contact_method", "聯絡方式", "聯絡方式類型", "contact_type"],
  contactValue: ["contact_value", "聯絡方式內容", "電話", "line", "line_id", "ig", "instagram", "phone"],
  serviceDate: ["service_date", "服務日期", "日期", "date"],
  serviceType: ["service_type", "服務類型", "類型"],
  serviceName: ["service_name", "服務名稱", "項目", "課程名稱"],
  duration: ["duration_min", "duration_minutes", "服務時長", "分鐘", "時長"],
  location: ["location", "服務地點", "地點"],
  paymentStatus: ["payment_status", "付款狀態", "收款狀態", "payment"],
  amount: ["amount", "金額", "price", "price_twd", "費用"],
  note: ["note", "notes", "備註", "record_note", "內容"],
} as const;

const priorityText: Record<string, string> = {
  P1: "高潛力客戶，建議優先追蹤。",
  P2: "中潛力客戶，可安排後續關懷。",
  P3: "低潛力或資料不足，暫時保留。"
};

const clientsAllowedColumns = [
  "id",
  "client_name",
  "name",
  "line_id",
  "phone",
  "client_code",
  "display_name",
  "nickname",
  "instagram",
  "source",
  "first_contact_date",
  "first_pain_point",
  "current_stage",
  "priority",
  "notes",
  "internal_notes",
  "created_at",
  "updated_at"
];

const serviceRecordsAllowedColumns = [
  "id",
  "client_id",
  "service_date",
  "record_mode",
  "service_code",
  "service_name_snapshot",
  "duration_minutes",
  "price_twd",
  "main_complaint",
  "processed_area",
  "body_region",
  "followup_needed",
  "internal_notes"
];

const followupsAllowedColumns = [
  "id",
  "client_id",
  "followup_type",
  "scheduled_date",
  "message_summary",
  "response_status",
  "next_action",
  "is_done"
];

const schemaErrorCodes = new Set(["42703", "PGRST204", "PGRST200", "42P01"]);


function keepAllowedColumns(input: Record<string, unknown>, allowed: string[]) {
  return Object.fromEntries(
    allowed
      .filter((key) => Object.prototype.hasOwnProperty.call(input, key))
      .map((key) => [key, input[key] === "" ? null : input[key]])
  );
}

function isSupabaseSchemaError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? "";
  return Boolean(error.code && schemaErrorCodes.has(error.code)) || message.includes("column") || message.includes("schema cache") || message.includes("relation");
}

function logSupabaseImportError(table: string, error: { code?: string; message?: string } | null | undefined) {
  console.error("calendar backfill Supabase error", { table, code: error?.code, message: error?.message });
}

function publicTableError(table: string, fallback = "Supabase insert 回傳錯誤，請查看 server log。") {
  if (table === "clients") return "Confirm Import clients 寫入失敗：clients 欄位不相容。";
  if (table === "service_records") return "service_records 寫入失敗：欄位不相容，已略過該筆。";
  if (table === "followups") return "followups 寫入失敗：欄位不相容，已略過該筆。";
  return `匯入失敗：${fallback}`;
}

async function detectAvailableColumns(supabase: SupabaseClientLike, table: keyof SchemaInfo, candidates: string[]) {
  const available = new Set<string>();
  for (const column of candidates) {
    const { error } = await supabase.from(table).select(column).limit(1);
    if (!error) {
      available.add(column);
    } else if (!isSupabaseSchemaError(error as SupabaseImportError)) {
      logSupabaseImportError(table, error as SupabaseImportError);
    }
  }
  return available;
}

async function detectSchemaInfo(supabase: SupabaseClientLike): Promise<SchemaInfo> {
  const [clients, serviceRecords, followups] = await Promise.all([
    detectAvailableColumns(supabase, "clients", clientsAllowedColumns),
    detectAvailableColumns(supabase, "service_records", serviceRecordsAllowedColumns),
    detectAvailableColumns(supabase, "followups", followupsAllowedColumns)
  ]);
  const warnings: ImportWarning[] = [];
  if (!clients.has("display_name") && !clients.has("client_name") && !clients.has("name")) {
    warnings.push({ table: "clients", message: "Dry Run schema check：clients 找不到 display_name / client_name / name，正式匯入會失敗。" });
  }
  if (!serviceRecords.has("client_id")) warnings.push({ table: "service_records", message: "Dry Run schema check：service_records schema 不完整，正式匯入會略過服務紀錄。" });
  if (!followups.has("client_id")) warnings.push({ table: "followups", message: "Dry Run schema check：followups schema 不完整，正式匯入會略過追蹤候選。" });
  return { clients, service_records: serviceRecords, followups, warnings };
}

function selectForAvailableColumns(availableColumns: Set<string>, preferred: string[]) {
  return ["id", ...preferred].filter((column, index, columns) => availableColumns.has(column) && columns.indexOf(column) === index).join(", ");
}

function buildClientInsertPayload(row: CsvRow, availableColumns: Set<string>) {
  const displayName = getValue(row, columnAliases.displayName);
  const clientCode = getValue(row, columnAliases.clientCode);
  const priority = normalizedPriority(row);
  const contactMethod = getValue(row, columnAliases.contactMethod) || DEFAULT_CONTACT_METHOD;
  const contactValue = getValue(row, columnAliases.contactValue);
  const status = getValue(row, columnAliases.status) || DEFAULT_CLIENT_STATUS;
  const notes = [
    sourceLabel(row),
    createdFromLabel(row),
    `client_status：${status}`,
    `contact_method：${contactMethod}`,
    contactValue ? `contact_value：${contactValue}` : "",
    priorityText[priority],
    getValue(row, columnAliases.note)
  ].filter(Boolean).join("\n");
  const payload: Record<string, unknown> = {};
  if (availableColumns.has("display_name")) payload.display_name = displayName;
  if (availableColumns.has("client_name")) payload.client_name = displayName;
  if (!availableColumns.has("display_name") && availableColumns.has("name")) payload.name = displayName;
  if (availableColumns.has("client_code") && clientCode) payload.client_code = clientCode;
  if (availableColumns.has("nickname")) payload.nickname = displayName;
  if (availableColumns.has("source")) payload.source = "other";
  if (availableColumns.has("priority")) payload.priority = priority;
  if (availableColumns.has("current_stage")) payload.current_stage = status === "流失" ? "lost" : status === "熟客" ? "repeat" : "followup";
  if (availableColumns.has("first_contact_date")) payload.first_contact_date = new Date().toISOString().slice(0, 10);
  if (availableColumns.has("first_pain_point")) payload.first_pain_point = "Calendar Backfill";
  if (availableColumns.has("notes")) payload.notes = notes;
  if (availableColumns.has("internal_notes")) payload.internal_notes = notes;
  if (availableColumns.has("updated_at")) payload.updated_at = new Date().toISOString();

  const method = contactMethod.toLowerCase();
  if (availableColumns.has("line_id") && contactValue && (method.includes("line") || method === "line")) payload.line_id = contactValue;
  if (availableColumns.has("instagram") && contactValue && (method.includes("ig") || method.includes("instagram"))) payload.instagram = contactValue;
  if (availableColumns.has("phone") && contactValue && (method.includes("電話") || method.includes("phone") || method.includes("手機"))) payload.phone = contactValue;
  if (availableColumns.has("line_id") && !payload.line_id) payload.line_id = clientCode ? `clinic-${clientCode}` : `clinic-import-${crypto.randomUUID()}`;
  return keepAllowedColumns(payload, Array.from(availableColumns));
}

function buildClientUpdatePayload(existingClient: ExistingClient, row: CsvRow, availableColumns: Set<string>) {
  const insertPayload = buildClientInsertPayload(row, availableColumns);
  const notes = [existingClient.internal_notes, insertPayload.internal_notes ?? insertPayload.notes].filter(Boolean).join("\n---\n");
  return keepAllowedColumns({
    internal_notes: notes,
    notes,
    priority: insertPayload.priority,
    updated_at: new Date().toISOString()
  }, Array.from(availableColumns));
}

async function insertClientSchemaSafe(supabase: SupabaseClientLike, row: CsvRow, availableColumns: Set<string>) {
  if (!getValue(row, columnAliases.displayName)) return { data: null, error: { message: "缺少必要欄位 display_name。" } };
  const payload = buildClientInsertPayload(row, availableColumns);
  if (!Object.keys(payload).length) return { data: null, error: { message: "clients 沒有可寫入的安全欄位。" } };
  const select = selectForAvailableColumns(availableColumns, ["client_code", "display_name", "client_name", "name", "nickname"]);
  const query = supabase.from("clients").insert(payload);
  const { data, error } = select ? await query.select(select).single() : await query.select("id").single();
  if (!error && data) return { data: data as ExistingClientSelect, warning: "" };
  logSupabaseImportError("clients", error as SupabaseImportError);
  return { data: null, error: error as SupabaseImportError };
}

function buildRecordPayloadSchemaSafe(row: CsvRow, clientId: string, availableColumns: Set<string>) {
  return keepAllowedColumns(buildRecordPayload(row, clientId), Array.from(availableColumns));
}

function buildFollowupPayloadSchemaSafe(row: CsvRow, clientId: string, availableColumns: Set<string>) {
  return keepAllowedColumns(buildFollowupPayload(row, clientId), Array.from(availableColumns));
}

async function insertOptionalSchemaSafe(supabase: SupabaseClientLike, table: "service_records" | "followups", payload: Record<string, unknown>) {
  if (!Object.keys(payload).length) return { ok: false, warning: `${table} 沒有可寫入的安全欄位，已略過該筆。` };
  const { error } = await supabase.from(table).insert(payload);
  if (!error) return { ok: true, warning: "" };
  logSupabaseImportError(table, error as SupabaseImportError);
  const message = isSupabaseSchemaError(error as SupabaseImportError)
    ? `${publicTableError(table)} 不影響 clients 匯入。`
    : `匯入失敗：${table} insert 回傳錯誤，已略過該筆。`;
  return { ok: false, warning: message };
}

function normalizeExistingClient(client: ExistingClientSelect): ExistingClient {
  const clientWithLegacyFields = client as ExistingClientSelect & { name?: string | null; notes?: string | null };
  return {
    id: client.id,
    client_code: client.client_code ?? null,
    display_name: client.display_name ?? client.client_name ?? clientWithLegacyFields.name ?? null,
    client_name: client.client_name ?? client.display_name ?? clientWithLegacyFields.name ?? null,
    name: clientWithLegacyFields.name ?? null,
    nickname: client.nickname ?? null,
    line_id: client.line_id ?? null,
    instagram: client.instagram ?? null,
    phone: client.phone ?? null,
    internal_notes: client.internal_notes ?? clientWithLegacyFields.notes ?? null,
    notes: clientWithLegacyFields.notes ?? null,
    priority: client.priority ?? null
  };
}

function normalize(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeKey(value: string) {
  return value.trim().replace(/^\uFEFF/, "").toLowerCase();
}

function getValue(row: CsvRow, aliases: readonly string[]) {
  for (const alias of aliases) {
    const direct = row[alias];
    if (direct !== undefined && direct.trim()) return direct.trim();
    const normalizedAlias = normalizeKey(alias);
    const foundKey = Object.keys(row).find((key) => normalizeKey(key) === normalizedAlias);
    if (foundKey && row[foundKey].trim()) return row[foundKey].trim();
  }
  return "";
}

function parseDelimited(input: string | undefined, delimiter: "," | "\t") {
  const content = normalize(input);
  if (!content) return [];
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  const [headers = [], ...dataRows] = rows;
  return dataRows.map((cells) => Object.fromEntries(headers.map((header, index) => [header.trim().replace(/^\uFEFF/, ""), normalize(cells[index])]))) as CsvRow[];
}

function detectPasteDelimiter(input: string | undefined, format: ImportPayload["pasteFormat"]) {
  if (format === "tsv") return "\t";
  if (format === "csv") return ",";
  const firstNonEmptyLine = normalize(input).split(/\r?\n/).find((line) => line.trim()) ?? "";
  return firstNonEmptyLine.includes("\t") ? "\t" : ",";
}

function parseCsv(input: string | undefined) {
  return parseDelimited(input, ",");
}

function parsePasteRows(input: string | undefined, format: ImportPayload["pasteFormat"]) {
  return parseDelimited(input, detectPasteDelimiter(input, format));
}

function rowHasServiceData(row: CsvRow) {
  return Boolean(getValue(row, columnAliases.serviceDate) || getValue(row, columnAliases.serviceType) || getValue(row, columnAliases.serviceName));
}

function normalizedPriority(row: CsvRow) {
  const priority = getValue(row, columnAliases.priority).toUpperCase();
  return ["P1", "P2", "P3"].includes(priority) ? priority : "P3";
}

function parseAmount(value: string) {
  const cleaned = value.replace(/NT\$/gi, "").replace(/,/g, "").trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseServiceDate(value: string) {
  const raw = normalize(value);
  if (!raw) return { value: "", warning: false };
  const chinese = raw.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  const slashOrDash = raw.match(/^(?:(\d{4})[/-])?(\d{1,2})[/-](\d{1,2})$/);
  const match = chinese ?? slashOrDash;
  if (!match) return { value: "", warning: true };
  const year = Number(match[1] ?? new Date().getFullYear());
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    return { value: "", warning: true };
  }
  return { value: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, warning: false };
}

function normalizePaymentStatus(status: string) {
  const map: Record<string, string> = {
    已收: "paid",
    未收: "outstanding",
    不確定: "unknown",
    贈送: "comped",
    套票扣除: "package_deduction"
  };
  return map[status] ?? (status ? "unknown" : "");
}

function sourceLabel(row: CsvRow) {
  return row.__source === "paste" ? PASTE_NOTE_MARKER : BACKFILL_NOTE_MARKER;
}

function createdFromLabel(row: CsvRow) {
  return row.__source === "paste" ? PASTE_CREATED_FROM_MARKER : CREATED_FROM_MARKER;
}

function contactValues(row: CsvRow) {
  const generic = getValue(row, columnAliases.contactValue);
  return [generic, getValue(row, ["line_id", "LINE", "Line"]), getValue(row, ["instagram", "IG", "ig"]), getValue(row, ["phone", "電話", "手機"])]
    .filter(Boolean)
    .map((value) => value.toLowerCase());
}

function clientNames(client: ExistingClient) {
  return [client.display_name, client.client_name, client.nickname]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function rememberClient(client: Pick<ExistingClient, "id"> & Partial<Pick<ExistingClient, "client_code" | "display_name" | "client_name" | "nickname">>, clientByCode: Map<string, string>, clientByName: Map<string, string>) {
  if (client.client_code) clientByCode.set(client.client_code, client.id);
  [client.display_name, client.client_name, client.nickname]
    .filter(Boolean)
    .forEach((name) => clientByName.set(String(name).trim(), client.id));
}

function findExistingClient(row: CsvRow, existing: ExistingClient[]) {
  const code = getValue(row, columnAliases.clientCode);
  const name = getValue(row, columnAliases.displayName);
  const contacts = contactValues(row);
  const byCode = code ? existing.find((client) => client.client_code === code) : null;
  if (byCode) return { client: byCode, reason: "client_code 相同" };
  const byContact = contacts.length ? existing.find((client) => [client.line_id, client.instagram, client.phone].filter(Boolean).map((value) => String(value).toLowerCase()).some((value) => contacts.includes(value))) : null;
  if (byContact) return { client: byContact, reason: "聯絡方式相同" };
  const contactMethod = getValue(row, columnAliases.contactMethod);
  const byNameAndMethod = name && contactMethod
    ? existing.find((client) => clientNames(client).some((value) => value === name) && (client.internal_notes ?? "").includes(`contact_method：${contactMethod}`))
    : null;
  if (byNameAndMethod) return { client: byNameAndMethod, reason: "client_name + contact_method 相同" };
  const byName = name ? existing.find((client) => clientNames(client).some((value) => value === name)) : null;
  if (byName) return { client: byName, reason: "display_name 完全相同" };
  return null;
}

function buildRecordPayload(row: CsvRow, clientId: string) {
  const serviceType = getValue(row, columnAliases.serviceType) || "其他";
  const serviceName = getValue(row, columnAliases.serviceName) || serviceType;
  const duration = Number(getValue(row, columnAliases.duration));
  const serviceDate = parseServiceDate(getValue(row, columnAliases.serviceDate));
  const amount = parseAmount(getValue(row, columnAliases.amount));
  const paymentStatus = getValue(row, columnAliases.paymentStatus);
  const paymentCode = normalizePaymentStatus(paymentStatus);
  return keepAllowedColumns({
    client_id: clientId,
    service_date: serviceDate.value || null,
    record_mode: "quick",
    service_code: serviceType,
    service_name_snapshot: serviceName,
    duration_minutes: Number.isFinite(duration) && duration > 0 ? duration : null,
    price_twd: amount,
    main_complaint: "行事曆 / 客戶總表回填",
    processed_area: serviceType,
    body_region: getValue(row, columnAliases.location) || "未知",
    followup_needed: false,
    internal_notes: [sourceLabel(row), `source：${row.__source === "paste" ? "calendar_backfill_paste" : "calendar_backfill"}`, getValue(row, columnAliases.note) || "貼上式行事曆 / 客戶總表回填，詳細內容未補。", paymentStatus ? `payment_status：${paymentStatus} / ${paymentCode}` : "", amount !== null ? `amount：${amount}` : "", "歷史回填紀錄，不自動扣 balances。"].filter(Boolean).join("\n")
  }, serviceRecordsAllowedColumns);
}

function buildFollowupPayload(row: CsvRow, clientId: string) {
  const priority = normalizedPriority(row);
  return keepAllowedColumns({
    client_id: clientId,
    followup_type: "other",
    scheduled_date: new Date().toISOString().slice(0, 10),
    message_summary: priorityText[priority],
    next_action: `${priority}｜Calendar Backfill followup candidate`,
    response_status: "not_sent",
    is_done: false
  }, followupsAllowedColumns);
}

async function loadExistingClients(supabase: SupabaseClientLike, availableColumns: Set<string>, strict = true) {
  const select = selectForAvailableColumns(availableColumns, ["client_code", "display_name", "client_name", "name", "nickname", "line_id", "instagram", "phone", "internal_notes", "notes", "priority"]);
  if (!select) return [];

  const { data, error } = await supabase
    .from("clients")
    .select(select)
    .limit(10000);
  if (!error) return (data ?? []).map((client) => normalizeExistingClient(client as unknown as ExistingClientSelect));

  logSupabaseImportError("clients", error as SupabaseImportError);
  if (strict) throw new Error(error.message);
  return [];
}

function analyze(clientsRows: CsvRow[], serviceRows: CsvRow[], followupRows: CsvRow[], existingClients: ExistingClient[]) {
  const issues: Issue[] = [];
  const duplicates: Duplicate[] = [];
  let unparseableRows = 0;
  const reviewList: Review[] = [];
  const namesInFile = new Set<string>();
  let newClients = 0;

  clientsRows.forEach((row, index) => {
    const rowNumber = index + 2;
    const name = getValue(row, columnAliases.displayName);
    if (!name) issues.push({ file: "clients", row: rowNumber, reason: "缺少姓名" });
    const existing = findExistingClient(row, existingClients);
    if (existing) duplicates.push({ file: "clients", row: rowNumber, reason: existing.reason, incoming: name || getValue(row, columnAliases.clientCode), existing: `${existing.client.client_code ?? "無編號"}｜${existing.client.display_name ?? existing.client.client_name ?? "未命名"}` });
    if (name && namesInFile.has(name)) duplicates.push({ file: "clients", row: rowNumber, reason: "匯入檔內姓名重複", incoming: name });
    if (name) namesInFile.add(name);
    if (name && !existing) newClients += 1;
    if (existing?.reason === "display_name 完全相同" && !getValue(row, columnAliases.clientCode)) reviewList.push({ file: "clients", row: rowNumber, reason: "只有姓名相同，正式匯入會先略過並列入 review list", value: name });
  });

  serviceRows.forEach((row, index) => {
    const name = getValue(row, columnAliases.displayName);
    const code = getValue(row, columnAliases.clientCode);
    if (!name && !code) issues.push({ file: "service_records", row: index + 2, reason: "缺少姓名或 client_code" });
    const rawDate = getValue(row, columnAliases.serviceDate);
    if (rawDate && parseServiceDate(rawDate).warning) {
      unparseableRows += 1;
      issues.push({ file: "service_records", row: index + 2, reason: "日期無法解析，正式匯入會保留空白日期", value: rawDate });
    }
    const rawAmount = getValue(row, columnAliases.amount);
    if (rawAmount && parseAmount(rawAmount) === null) {
      unparseableRows += 1;
      issues.push({ file: "service_records", row: index + 2, reason: "金額無法解析，正式匯入會保留空白金額", value: rawAmount });
    }
  });

  followupRows.forEach((row, index) => {
    const name = getValue(row, columnAliases.displayName);
    const code = getValue(row, columnAliases.clientCode);
    if (!name && !code) issues.push({ file: "followups", row: index + 2, reason: "缺少姓名或 client_code" });
  });

  return {
    summary: {
      clients_rows: clientsRows.length,
      service_records_rows: serviceRows.length,
      followup_rows: followupRows.length,
      planned_new_clients: newClients,
      planned_service_records: serviceRows.length,
      planned_followups: followupRows.length,
      missing_names: issues.filter((issue) => issue.reason.includes("缺少姓名")).length,
      possible_duplicates: duplicates.length,
      unparseable_rows: unparseableRows
    },
    issues,
    duplicates,
    review_list: reviewList
  };
}

function buildDryRunResponse(dryRun: ReturnType<typeof analyze>, schemaWarnings: ImportWarning[]) {
  const missingNameRows = dryRun.issues.filter((issue) => issue.reason.includes("缺少姓名"));
  const invalidDateRows = dryRun.issues.filter((issue) => issue.reason.includes("日期無法解析"));
  const invalidAmountRows = dryRun.issues.filter((issue) => issue.reason.includes("金額無法解析"));
  const validRows = Math.max(0, dryRun.summary.clients_rows - missingNameRows.length);
  return {
    parsedRows: dryRun.summary.clients_rows,
    validRows,
    missingNameRows,
    possibleDuplicates: dryRun.duplicates,
    invalidDateRows,
    invalidAmountRows,
    previewClientsCount: dryRun.summary.planned_new_clients,
    previewServiceRecordsCount: dryRun.summary.planned_service_records,
    warnings: schemaWarnings
  };
}

export async function GET() {
  const auth = await requireClinicAdmin("/api/clinic/calendar-backfill");
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("service_records")
    .select("id, service_date, service_code, service_name_snapshot, body_region, price_twd, internal_notes, followup_needed, clients(client_code, display_name, client_name)")
    .or(`internal_notes.ilike.%${BACKFILL_NOTE_MARKER}%,internal_notes.ilike.%${PASTE_NOTE_MARKER}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message, requestPath: "/api/clinic/calendar-backfill", failedRequest: "Supabase service_records select" }, { status: 500 });
  return NextResponse.json({ records: data ?? [] });
}

export async function POST(req: Request) {
  const auth = await requireClinicAdmin("/api/clinic/calendar-backfill");
  if (!auth.ok) return auth.response;

  const body = await readJson(req) as ImportPayload;
  const mode = body.mode === "confirm" ? "confirm" : "dry_run";
  const pasteRows = parsePasteRows(body.pasteText, body.pasteFormat).map((row) => ({ ...row, __source: "paste" }));
  const csvClientRows = parseCsv(body.clientsCsv);
  const csvServiceRows = parseCsv(body.serviceRecordsCsv);
  const csvFollowupRows = parseCsv(body.followupsCsv);
  const clientsRows = [...csvClientRows, ...pasteRows];
  const serviceRows = [...csvServiceRows, ...pasteRows.filter(rowHasServiceData)];
  const followupRows = [...csvFollowupRows, ...pasteRows.filter((row) => ["P1", "P2"].includes(normalizedPriority(row)))];
  const schemaInfo = await detectSchemaInfo(auth.supabase);
  let existingClients: ExistingClient[] = [];
  try {
    existingClients = await loadExistingClients(auth.supabase, schemaInfo.clients, mode === "confirm");
  } catch (error) {
    console.error("calendar backfill load clients failed", { message: error instanceof Error ? error.message : String(error) });
    if (mode === "confirm") return NextResponse.json({ error: "Confirm Import clients 寫入失敗：無法讀取既有 clients 對照。" }, { status: 500 });
  }
  const dryRun = analyze(clientsRows, serviceRows, followupRows, existingClients);
  const dryRunResponse = buildDryRunResponse(dryRun, schemaInfo.warnings);

  if (mode === "dry_run") {
    return NextResponse.json({ mode, ...dryRun, ...dryRunResponse });
  }

  const clientByCode = new Map<string, string>();
  const clientByName = new Map<string, string>();
  existingClients.forEach((client) => rememberClient(client, clientByCode, clientByName));
  const importReview: Review[] = [...dryRun.review_list];
  const warnings: ImportWarning[] = [];
  const errors: ImportError[] = [];
  const result = {
    clients_created: 0,
    clients_updated: 0,
    clients_skipped: 0,
    service_records_created: 0,
    followups_created: 0,
    failed: 0,
    createdClients: 0,
    createdServiceRecords: 0,
    createdFollowups: 0,
    skippedRows: 0,
    warnings,
    errors
  };

  for (const [index, row] of clientsRows.entries()) {
    const name = getValue(row, columnAliases.displayName);
    const code = getValue(row, columnAliases.clientCode);
    if (!name) {
      result.clients_skipped += 1;
      result.skippedRows += 1;
      errors.push({ table: "clients", row: index + 2, message: "匯入失敗：缺少必要欄位 display_name。" });
      continue;
    }
    const existingMatch = findExistingClient(row, existingClients);
    if (existingMatch?.reason === "display_name 完全相同" && !code) {
      result.clients_skipped += 1;
      result.skippedRows += 1;
      importReview.push({ file: "clients", row: index + 2, reason: "姓名相同但無 client_code / 聯絡方式佐證，已略過避免重複新增", value: name });
    } else if (existingMatch) {
      const updatePayload = buildClientUpdatePayload(existingMatch.client, row, schemaInfo.clients);
      if (!Object.keys(updatePayload).length) {
        warnings.push({ table: "clients", row: index + 2, message: "clients schema 沒有可安全更新欄位，已保留既有 client 對應。" });
        result.clients_skipped += 1;
        result.skippedRows += 1;
        rememberClient({ ...existingMatch.client, display_name: name || existingMatch.client.display_name }, clientByCode, clientByName);
        continue;
      }
      const { error } = await auth.supabase
        .from("clients")
        .update(updatePayload)
        .eq("id", existingMatch.client.id);
      if (error) {
        logSupabaseImportError("clients", error as SupabaseImportError);
        if (isSupabaseSchemaError(error as SupabaseImportError)) {
          warnings.push({ table: "clients", row: index + 2, message: "clients schema 不支援備註 / priority 更新，已保留既有 client 對應。" });
          result.clients_skipped += 1;
          result.skippedRows += 1;
          rememberClient({ ...existingMatch.client, display_name: name || existingMatch.client.display_name }, clientByCode, clientByName);
        } else {
          result.failed += 1;
          errors.push({ table: "clients", row: index + 2, message: "匯入失敗：Supabase insert 回傳錯誤，請查看 server log。" });
        }
      } else {
        result.clients_updated += 1;
        rememberClient({ ...existingMatch.client, display_name: name || existingMatch.client.display_name }, clientByCode, clientByName);
      }
    } else {
      const inserted = await insertClientSchemaSafe(auth.supabase, row, schemaInfo.clients);
      if (inserted.error || !inserted.data) {
        result.failed += 1;
        errors.push({ table: "clients", row: index + 2, message: inserted.error?.message === "缺少必要欄位 display_name。" ? "匯入失敗：缺少必要欄位 display_name。" : publicTableError("clients") });
      } else {
        result.clients_created += 1;
        result.createdClients += 1;
        if (inserted.warning) warnings.push({ table: "clients", row: index + 2, message: inserted.warning });
        rememberClient(normalizeExistingClient(inserted.data), clientByCode, clientByName);
      }
    }
  }

  const resolveClientId = (row: CsvRow) => {
    const code = getValue(row, columnAliases.clientCode);
    const name = getValue(row, columnAliases.displayName);
    return (code && clientByCode.get(code)) || (name && clientByName.get(name)) || "";
  };

  for (const [index, row] of serviceRows.entries()) {
    const clientId = resolveClientId(row);
    if (!clientId) {
      result.skippedRows += 1;
      warnings.push({ table: "service_records", row: index + 2, message: "找不到可對應 client，未建立服務紀錄。" });
      importReview.push({ file: "service_records", row: index + 2, reason: "找不到可對應 client，未建立服務紀錄", value: getValue(row, columnAliases.displayName) || getValue(row, columnAliases.clientCode) });
      continue;
    }
    const inserted = await insertOptionalSchemaSafe(auth.supabase, "service_records", buildRecordPayloadSchemaSafe(row, clientId, schemaInfo.service_records));
    if (inserted.ok) {
      result.service_records_created += 1;
      result.createdServiceRecords += 1;
    } else {
      result.skippedRows += 1;
    }
    if (inserted.warning) warnings.push({ table: "service_records", row: index + 2, message: inserted.warning });
  }

  for (const [index, row] of followupRows.entries()) {
    const clientId = resolveClientId(row);
    if (!clientId) {
      result.skippedRows += 1;
      warnings.push({ table: "followups", row: index + 2, message: "找不到可對應 client，未建立追蹤候選。" });
      importReview.push({ file: "followups", row: index + 2, reason: "找不到可對應 client，未建立追蹤候選", value: getValue(row, columnAliases.displayName) || getValue(row, columnAliases.clientCode) });
      continue;
    }
    const inserted = await insertOptionalSchemaSafe(auth.supabase, "followups", buildFollowupPayloadSchemaSafe(row, clientId, schemaInfo.followups));
    if (inserted.ok) {
      result.followups_created += 1;
      result.createdFollowups += 1;
    } else {
      result.skippedRows += 1;
    }
    if (inserted.warning) warnings.push({ table: "followups", row: index + 2, message: inserted.warning });
  }

  return NextResponse.json({ mode, ...dryRun, ...dryRunResponse, result, review_list: importReview, warnings, errors });
}
