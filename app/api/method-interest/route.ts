import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  professional_background: z.string().trim().min(1).max(120),
  interested_route: z.string().trim().min(1).max(120),
  contact_method: z.enum(["LINE", "Instagram", "Email"]),
  contact_value: z.string().trim().min(1).max(180),
  learning_question: z.string().trim().max(1200).optional().default(""),
  consent: z.literal("true"),
});

let lastSubmitAt = 0;

export async function POST(request: Request) {
  const now = Date.now();
  if (now - lastSubmitAt < 1500) return NextResponse.json({ error: "請稍候再送出。" }, { status: 429 });
  lastSubmitAt = now;

  const data = schema.safeParse(Object.fromEntries((await request.formData()).entries()));
  if (!data.success) return NextResponse.json({ error: "表單資料不完整。" }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "登記功能建置中。" }, { status: 503 });

  const { error } = await supabase.from("method_interest_registrations").insert({
    ...data.data,
    learning_question: data.data.learning_question || null,
    consent: true,
    source: "method-register",
    status: "new",
  });

  if (error) return NextResponse.json({ error: "目前無法送出，請稍後再試。" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
