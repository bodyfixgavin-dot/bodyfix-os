/**
 * Preserve every Rich Menu action and pixel coordinate except the two primary
 * booking CTAs on B. LINE Rich Menu definitions cannot be edited in place.
 */
export type MenuArea = {
  bounds: { x: number; y: number; width: number; height: number };
  action: {
    type: string;
    label?: string;
    data?: string;
    text?: string;
    [key: string]: unknown;
  };
};

const BOOKING_MESSAGES = new Map([
  ["action=booking&mode=immediate", "我想預約 BodyFix"],
  ["action=booking&mode=this-week", "我想查看本週可約時段"]
]);

export function convertBBookingActions(areas: MenuArea[]): MenuArea[] {
  const seen = new Set<string>();

  const updated = areas.map(area => {
    const data = area.action?.data || "";
    const text = BOOKING_MESSAGES.get(data);
    if (!text) return area;

    if (area.action.type !== "postback" || seen.has(data)) {
      throw new Error("B 頁預約熱區已更新或重複，停止操作");
    }
    seen.add(data);
    return {
      ...area,
      action: {
        type: "message",
        label: area.action.label || "預約詢問",
        text
      }
    };
  });

  if (seen.size !== BOOKING_MESSAGES.size) {
    throw new Error("B 頁找不到全部兩個預約熱區，為保護現有選單已停止操作");
  }
  return updated;
}
