"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CompleteAppointmentInput } from "@/types/bodyfix";

export async function completeAppointmentAndDeductItems(input: CompleteAppointmentInput) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("complete_appointment_and_deduct_items", {
    p_appointment_id: input.appointment_id,
    p_customer_id: input.customer_id,
    p_items: input.items,
    p_today_focus: input.today_focus ?? null,
    p_body_status: input.body_status ?? null,
    p_next_focus: input.next_focus ?? null
  });

  if (error) {
    return {
      success: false,
      message: error.message,
      data: null
    };
  }

  return {
    success: true,
    message: "已完成預約並扣堂",
    data
  };
}

export async function cancelAppointment(appointmentId: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("appointments")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString()
    })
    .eq("appointment_id", appointmentId);

  if (error) {
    return {
      success: false,
      message: error.message
    };
  }

  return {
    success: true,
    message: "已取消預約"
  };
}
