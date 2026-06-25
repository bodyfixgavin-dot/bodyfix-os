"use client";

import { useTransition } from "react";
import { markRecommendationComplete } from "../actions";

export function CompleteRecommendationButton({ id, completed }: { id: string; completed?: boolean }) {
  const [pending, startTransition] = useTransition();
  return <button className="client-complete-button" disabled={completed || pending} onClick={() => startTransition(() => { void markRecommendationComplete(id); })}>{completed ? "今天已完成" : pending ? "標記中…" : "標記今天完成"}</button>;
}
