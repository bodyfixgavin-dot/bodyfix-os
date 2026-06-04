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
    const payload = { error: error.message, errorType: describeSupabaseError(error) };
    console.error("Unable to delete availability slot in Supabase", { error, payload });
    return NextResponse.json(payload, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
