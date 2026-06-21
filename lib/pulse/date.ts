const TAIPEI_TIME_ZONE = "Asia/Taipei";

export function getTodayInTaipei(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TAIPEI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function addTaipeiDays(date: string, days: number) {
  const next = new Date(`${date}T12:00:00+08:00`);
  next.setDate(next.getDate() + days);
  return getTodayInTaipei(next);
}
