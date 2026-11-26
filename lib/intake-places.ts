// Shared, offline-safe locations already confirmed for Intake V2.
export type IntakePlace = { id: string; name: string };
export const CONFIRMED_INTAKE_PLACES: IntakePlace[] = [
  { id: "liuzhangli", name: "六張犁工作室 · 主要地點" },
  { id: "ximen", name: "西門 · 次要地點，場地需確認" },
  { id: "sun_yat_sen_memorial", name: "國父紀念館 · 次要地點，場地需確認" },
];
export const DISCUSS_PLACE: IntakePlace = { id: "discuss", name: "指定地點服務（到府）／與 Gavin 討論" };
export const OFFLINE_INTAKE_PLACES = [...CONFIRMED_INTAKE_PLACES, DISCUSS_PLACE];
