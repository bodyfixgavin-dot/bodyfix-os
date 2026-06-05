import { NextResponse } from "next/server";
import { z } from "zod";
import { buildAdminDataErrorPayload } from "@/lib/admin-diagnostics";
import { requireBookingAdmin } from "@/lib/booking-admin";

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
  const admin = await requireBookingAdmin("/api/admin/slots");
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
    return NextResponse.json(
      {
        ...buildAdminDataErrorPayload("/api/admin/slots", bookingError?.message || slotError?.message || serviceError?.message || "Unable to load admin data"),
        error: bookingError?.message || slotError?.message || serviceError?.message || "Unable to load admin data",
        failedRequest: bookingError ? "Supabase booking_requests select" : slotError ? "Supabase availability_slots select" : "Supabase services select"
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ bookings: bookings ?? [], slots: slots ?? [], services: services ?? [] });
}

export async function POST(req: Request) {
  const admin = await requireBookingAdmin("/api/admin/slots");
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
