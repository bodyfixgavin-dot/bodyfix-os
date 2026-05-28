import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBookingAdmin } from "@/lib/booking-admin";

const deleteSlotSchema = z.object({ id: z.string().uuid() });

export async function POST(req: Request) {
  const admin = await requireBookingAdmin();
  if (!admin.ok) return admin.response;

  const parsed = deleteSlotSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await admin.supabase
    .from("availability_slots")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
