"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DigitalReadingOrderInput } from "@/types/bodyfix";

export async function createDigitalReadingOrder(input: DigitalReadingOrderInput) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("digital_reading_orders")
    .insert({
      customer_id: input.customer_id ?? null,
      service_id: input.service_id,
      question_text: input.question_text,
      input_data: input.input_data ?? {},
      price: input.price,
      payment_status: input.payment_status ?? "unpaid",
      delivery_format: input.delivery_format ?? "line_text",
      reading_status: "pending",
      upsell_target_service_id: input.service_id === "BF-SR-ZW-TXT-001" ? "BF-SR-ZW-001" : null
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
    message: "已建立文字解析訂單",
    data
  };
}

export async function markReadingDelivered(readingOrderId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("digital_reading_orders")
    .update({
      reading_status: "delivered",
      delivered_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("reading_order_id", readingOrderId)
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
    message: "已標記為已交付",
    data
  };
}
