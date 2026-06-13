import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const holdBookingSchema = z.object({
  slot_id: z.string().uuid(),
  service_id: z.string().uuid(),
  client_name: z.string().trim().min(1).max(80),
  line_id: z.string().trim().min(1).max(80),
  phone: z.string().trim().max(40).optional().nullable(),
  body_notes: z.string().trim().max(1200).optional().nullable(),
  message: z.string().trim().max(1200).optional().nullable(),
  selectedFasciaLineCode: z.string().trim().max(20).optional(),
  selectedFasciaLineName: z.string().trim().max(100).optional(),
});

export async function POST(req: Request) {
  const parsed = holdBookingSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid booking input" },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase admin environment is not configured" },
      { status: 500 },
    );
  }

  const input = parsed.data;
  const fasciaLineNote = input.selectedFasciaLineName
    ? `指定筋膜線：${input.selectedFasciaLineName} (${input.selectedFasciaLineCode})`
    : "";
  const message = [input.message, fasciaLineNote].filter(Boolean).join("\n");

  const { data, error } = await supabase.rpc("hold_booking_slot", {
    p_slot_id: input.slot_id,
    p_service_id: input.service_id,
    p_client_name: input.client_name,
    p_line_id: input.line_id,
    p_phone: input.phone || null,
    p_body_notes: input.body_notes || null,
    p_message: message || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data ?? { success: false, message: "Unable to hold this booking slot." },
  );
}
