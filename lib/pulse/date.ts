const TAIPEI = "Asia/Taipei";

export function getTodayInTaipei(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TAIPEI, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
