import { AppointmentCompleteButton } from "@/components/AppointmentCompleteButton";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { CompleteAppointmentInput } from "@/types/bodyfix";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">BodyFix OS 尚未連接 Supabase</h1>
        <p className="text-sm text-gray-600">
          請先在 Vercel Environment Variables 設定 NEXT_PUBLIC_SUPABASE_URL 與 NEXT_PUBLIC_SUPABASE_ANON_KEY。
        </p>
      </main>
    );
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data: appointments } = await supabase
    .from("appointments")
    .select("appointment_id,customer_id,status,start_at,appointment_items(*)")
    .order("start_at", { ascending: true })
    .limit(30);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">預約列表</h1>
      <div className="space-y-4">
        {(appointments ?? []).map((appointment: any) => {
          const payload: CompleteAppointmentInput = {
            appointment_id: appointment.appointment_id,
            customer_id: appointment.customer_id,
            items: (appointment.appointment_items ?? []).map((item: any) => ({
              service_id: item.service_id,
              billing_type: item.billing_type,
              bucket_id: item.bucket_id,
              entitlement_id: item.entitlement_id,
              units_to_deduct: item.units_to_deduct,
              unit_price: item.unit_price,
              quantity: item.quantity,
              note: item.note
            }))
          };

          return (
            <div key={appointment.appointment_id} className="rounded-2xl border p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">{appointment.start_at}</p>
                  <p className="font-medium">預約 #{appointment.appointment_id}</p>
                  <p className="text-sm">狀態：{appointment.status}</p>
                </div>
                <AppointmentCompleteButton payload={payload} />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
