import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBookingAdmin } from "@/lib/booking-admin";

function describeSupabaseError(error: { message?: string; code?: string; details?: string; hint?: string } | null | undefined) {
  if (!error) return "unknown";
  const message = error.message ?? "";
  const text = `${message} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();

  if (error.code === "42P01" || text.includes("does not exist")) return "table not found";
  if (error.code === "42501" || text.includes("row-level security") || text.includes("rls") || text.includes("permission denied")) return "RLS denied";
  if (text.includes("invalid api key") || text.includes("jwt") || text.includes("signature")) return "invalid key";
  if (text.includes("invalid url") || text.includes("failed to fetch")) return "invalid url";
  return error.code ? `${error.code}: ${message}` : message || "unknown";
}

const slotSchema = z.object({
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  city: z.enum(["taipei", "taichung", "kaohsiung"]),
  slot_type: z.enum(["normal", "late_night", "last_minute", "vip_hold"]),
  note: z.string().trim().max(500).optional().nullable()
}).refine((value) => new Date(value.ends_at).getTime() > new Date(value.starts_at).getTime(), {
  message: "End time must be after start time",
  path: ["ends_at"]
});

export async function GET() {
  const admin = await requireBookingAdmin();
  if (!admin.ok) return admin.response;

  const [{ data: bookings, error: bookingError }, { data: slots, error: slotError }, { data: services, error: serviceError }] = await Promise.all([
    admin.supabase
      .from("booking_requests")
      .select("*, availability_slots(*), services(*)")
      .order("created_at", { ascending: false }),
    admin.supabase
      .from("availability_slots")
      .select("*")
      .order("starts_at", { ascending: true }),
    admin.supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true })
  ]);

  if (bookingError || slotError || serviceError) {
    const primaryError = bookingError || slotError || serviceError;
    const payload = {
      error: primaryError?.message || "Unable to load admin data",
      errorType: describeSupabaseError(primaryError),
      details: {
        booking: bookingError ? describeSupabaseError(bookingError) : null,
        slots: slotError ? describeSupabaseError(slotError) : null,
        services: serviceError ? describeSupabaseError(serviceError) : null
      }
    };
    console.error("Unable to load admin data from Supabase", { bookingError, slotError, serviceError, payload });
    return NextResponse.json(payload, { status: 500 });
  }

  return NextResponse.json({ bookings: bookings ?? [], slots: slots ?? [], services: services ?? [] });
}

export async function POST(req: Request) {
  const admin = await requireBookingAdmin();
  if (!admin.ok) return admin.response;

  const parsed = slotSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid slot input" }, { status: 400 });
  }

  const { error } = await admin.supabase.from("availability_slots").insert({
    starts_at: parsed.data.starts_at,
    ends_at: parsed.data.ends_at,
    city: parsed.data.city,
    slot_type: parsed.data.slot_type,
    note: parsed.data.note || null,
    status: "available"
  });

  if (error) {
    const payload = { error: error.message, errorType: describeSupabaseError(error) };
    console.error("Unable to create availability slot in Supabase", { error, payload });
    return NextResponse.json(payload, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
