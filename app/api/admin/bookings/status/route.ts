import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBookingAdmin } from "@/lib/booking-admin";

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["held", "confirmed", "cancelled", "completed", "expired"])
});

export async function POST(req: Request) {
  const admin = await requireBookingAdmin();
  if (!admin.ok) return admin.response;

  const parsed = updateStatusSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { id, status } = parsed.data;
  const { error } = await admin.supabase
    .from("booking_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
