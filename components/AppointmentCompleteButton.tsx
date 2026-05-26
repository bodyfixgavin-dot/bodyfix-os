"use client";

import { useState } from "react";
import { completeAppointmentAndDeductItems } from "@/app/actions/appointments";
import type { CompleteAppointmentInput } from "@/types/bodyfix";

type Props = {
  payload: CompleteAppointmentInput;
};

export function AppointmentCompleteButton({ payload }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    const result = await completeAppointmentAndDeductItems(payload);
    setLoading(false);
    setMessage(result.message);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "處理中..." : "完成並扣堂"}
      </button>
      {message ? <p className="text-sm text-gray-600">{message}</p> : null}
    </div>
  );
}
