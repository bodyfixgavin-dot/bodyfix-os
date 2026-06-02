import { NextResponse } from "next/server";
import { cleanPayload, CLIENT_FIELDS, FOLLOWUP_FIELDS, makeClientCode, readJson, RECORD_FIELDS, requireClinicAdmin } from "@/lib/clinic-api";

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
  nickname: string | null;
  line_id: string | null;
  instagram: string | null;
  phone: string | null;
  internal_notes: string | null;
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

function buildClientPayload(row: CsvRow) {
  const displayName = getValue(row, columnAliases.displayName);
  const clientCode = getValue(row, columnAliases.clientCode) || makeClientCode();
  const priority = normalizedPriority(row);
  const contactMethod = getValue(row, columnAliases.contactMethod) || DEFAULT_CONTACT_METHOD;
  const contactValue = getValue(row, columnAliases.contactValue);
  const status = getValue(row, columnAliases.status) || DEFAULT_CLIENT_STATUS;
  const notes = [
    sourceLabel(row),
    createdFromLabel(row),
    `client_status：${status}`,
    `contact_method：${contactMethod}`,
    priorityText[priority],
    getValue(row, columnAliases.note)
  ].filter(Boolean).join("\n");
  const payload: Record<string, unknown> = {
    client_code: clientCode,
    client_name: displayName,
    display_name: displayName,
    nickname: displayName,
    source: "other",
    priority,
    current_stage: status === "流失" ? "lost" : status === "熟客" ? "repeat" : "followup",
    first_contact_date: new Date().toISOString().slice(0, 10),
    first_pain_point: "Calendar Backfill",
    internal_notes: notes,
    updated_at: new Date().toISOString()
  };
  const method = contactMethod.toLowerCase();
  if (contactValue && (method.includes("line") || method === "line")) payload.line_id = contactValue;
  if (contactValue && (method.includes("ig") || method.includes("instagram"))) payload.instagram = contactValue;
  if (contactValue && (method.includes("電話") || method.includes("phone") || method.includes("手機"))) payload.phone = contactValue;
  if (!payload.line_id) payload.line_id = `clinic-${clientCode}`;
  return cleanPayload(payload, CLIENT_FIELDS);
}

function buildRecordPayload(row: CsvRow, clientId: string) {
  const serviceType = getValue(row, columnAliases.serviceType) || "其他";
  const serviceName = getValue(row, columnAliases.serviceName) || serviceType;
  const duration = Number(getValue(row, columnAliases.duration));
  const serviceDate = parseServiceDate(getValue(row, columnAliases.serviceDate));
  const amount = parseAmount(getValue(row, columnAliases.amount));
  const paymentStatus = getValue(row, columnAliases.paymentStatus);
  const paymentCode = normalizePaymentStatus(paymentStatus);
  return cleanPayload({
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
  }, RECORD_FIELDS);
}

function buildFollowupPayload(row: CsvRow, clientId: string) {
  const priority = normalizedPriority(row);
  return cleanPayload({
    client_id: clientId,
    followup_type: "other",
    scheduled_date: new Date().toISOString().slice(0, 10),
    message_summary: priorityText[priority],
    next_action: `${priority}｜Calendar Backfill followup candidate`,
    response_status: "not_sent",
    is_done: false
  }, FOLLOWUP_FIELDS);
}

async function loadExistingClients(supabase: Awaited<ReturnType<typeof requireClinicAdmin>>["supabase"]) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, client_code, display_name, client_name, nickname, line_id, instagram, phone, internal_notes, priority")
    .limit(10000);
  if (error) throw new Error(error.message);
  return (data ?? []) as ExistingClient[];
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

export async function GET() {
  const auth = await requireClinicAdmin();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("service_records")
    .select("id, service_date, service_code, service_name_snapshot, body_region, price_twd, internal_notes, followup_needed, clients(client_code, display_name, client_name)")
    .or(`internal_notes.ilike.%${BACKFILL_NOTE_MARKER}%,internal_notes.ilike.%${PASTE_NOTE_MARKER}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ records: data ?? [] });
}

export async function POST(req: Request) {
  const auth = await requireClinicAdmin();
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
  const existingClients = await loadExistingClients(auth.supabase);
  const dryRun = analyze(clientsRows, serviceRows, followupRows, existingClients);

  if (mode === "dry_run") {
    return NextResponse.json({ mode, ...dryRun });
  }

  const clientByCode = new Map<string, string>();
  const clientByName = new Map<string, string>();
  existingClients.forEach((client) => rememberClient(client, clientByCode, clientByName));
  const importReview: Review[] = [...dryRun.review_list];
  const result = { clients_created: 0, clients_updated: 0, clients_skipped: 0, service_records_created: 0, followups_created: 0, failed: 0 };

  for (const [index, row] of clientsRows.entries()) {
    const name = getValue(row, columnAliases.displayName);
    const code = getValue(row, columnAliases.clientCode);
    if (!name) {
      result.clients_skipped += 1;
      continue;
    }
    const payload = buildClientPayload(row);
    const existingMatch = findExistingClient(row, existingClients);
    if (existingMatch?.reason === "display_name 完全相同" && !code) {
      result.clients_skipped += 1;
      importReview.push({ file: "clients", row: index + 2, reason: "姓名相同但無 client_code / 聯絡方式佐證，已略過避免重複新增", value: name });
    } else if (existingMatch) {
      const { error } = await auth.supabase
        .from("clients")
        .update({
          internal_notes: [existingMatch.client.internal_notes, payload.internal_notes].filter(Boolean).join("\n---\n"),
          priority: payload.priority,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingMatch.client.id);
      if (error) {
        result.failed += 1;
      } else {
        result.clients_updated += 1;
        rememberClient({ ...existingMatch.client, display_name: name || existingMatch.client.display_name }, clientByCode, clientByName);
      }
    } else {
      const { data, error } = await auth.supabase.from("clients").insert(payload).select("id, client_code, display_name").single();
      if (error || !data) {
        result.failed += 1;
      } else {
        result.clients_created += 1;
        rememberClient(data, clientByCode, clientByName);
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
      result.failed += 1;
      importReview.push({ file: "service_records", row: index + 2, reason: "找不到可對應 client，未建立服務紀錄", value: getValue(row, columnAliases.displayName) || getValue(row, columnAliases.clientCode) });
      continue;
    }
    const { error } = await auth.supabase.from("service_records").insert(buildRecordPayload(row, clientId));
    if (error) result.failed += 1; else result.service_records_created += 1;
  }

  for (const [index, row] of followupRows.entries()) {
    const clientId = resolveClientId(row);
    if (!clientId) {
      result.failed += 1;
      importReview.push({ file: "followups", row: index + 2, reason: "找不到可對應 client，未建立追蹤候選", value: getValue(row, columnAliases.displayName) || getValue(row, columnAliases.clientCode) });
      continue;
    }
    const { error } = await auth.supabase.from("followups").insert(buildFollowupPayload(row, clientId));
    if (error) result.failed += 1; else result.followups_created += 1;
  }

  return NextResponse.json({ mode, ...dryRun, result, review_list: importReview });
}
