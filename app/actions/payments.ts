"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type CreatePaymentInput = {
  appointment_id?: string;
  customer_id: string;
  amount: number;
  payment_method: "cash" | "transfer" | "linepay" | "credit_card" | "other";
  note?: string;
};

export async function createPayment(input: CreatePaymentInput) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("payments")
    .insert({
      appointment_id: input.appointment_id ?? null,
      customer_id: input.customer_id,
      amount: input.amount,
      payment_method: input.payment_method,
      payment_status: "paid",
      note: input.note ?? null
    })
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      message: error.message,
      data: null
    };
  }

  return {
    success: true,
    message: "已新增付款紀錄",
    data
  };
}
