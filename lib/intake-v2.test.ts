import { describe, expect, it } from "vitest";
import { emptyIntake, normalizeIntake, validateIntake, birthProfile, bookingSummary, lineBookingUrl, taipeiToday, intakeSchema } from "./intake-v2";
import { INTAKE_SERVICES, serviceById, serviceQuote } from "./bodyfix-services";
const now = new Date("2026-11-26T16:10:00Z");
const complete = () => ({ ...emptyIntake(), visit: "第一次預約", name: "測試", contact: "LINE測試", contactMethod: "LINE", service: "body-reset", date: "2026-11-27", time: "14:00", place: "discuss", safety: "沒有上述需要告知的狀況", privacyConsent: true, serviceConsent: true });
describe("Intake V2 contracts", () => {
  it.each([["body-reset", true, 90, 3200], ["relaxation", true, 90, 2300], ["pelvic-core", true, 90, 3500], ["multi-line", true, 90, 3600]])("quotes %s from shared catalog", (id, extension, minutes, amount) => {
    expect(serviceQuote(id, extension)).toMatchObject({ minutes, amount });
  });
  it("retains legacy IDs without public entry or a default paid selection", () => {
    expect(serviceById("fascia-line")).toBeDefined(); expect(serviceById("pelvic-vip")).toBeDefined();
    expect(INTAKE_SERVICES.map(s => s.id)).toEqual(["body-reset", "relaxation", "multi-line", "pelvic-core", "movement", "unsure"]);
    expect(emptyIntake().service).toBe("");
  });
  it("accepts first and returning with no optional profile/body details", () => {
    expect(validateIntake(complete(), now)).toEqual({});
    expect(validateIntake({ ...complete(), visit: "我之前來過" }, now)).toEqual({});
  });
  it("computes birthdays in Taipei, with birthday before/after and leap day", () => {
    expect(taipeiToday(now)).toBe("2026-11-27");
    expect(birthProfile("1990-11-28", now)).toMatchObject({ age: 35, sunSign: "射手座", annualBirthday: "11-28" });
    expect(birthProfile("1990-11-27", now)?.age).toBe(36);
    expect(birthProfile("2000-02-29", now)?.age).toBe(26);
    expect(birthProfile("2001-02-29", now)).toBeNull();
    expect(birthProfile("2027-01-01", now)).toBeNull();
  });
  it.each([["2000-01-19", "摩羯座"], ["2000-01-20", "水瓶座"], ["2000-02-19", "雙魚座"], ["2000-03-21", "牡羊座"], ["2000-04-20", "金牛座"], ["2000-05-21", "雙子座"], ["2000-06-22", "巨蟹座"], ["2000-07-23", "獅子座"], ["2000-08-23", "處女座"], ["2000-09-23", "天秤座"], ["2000-10-24", "天蠍座"], ["2000-11-23", "射手座"], ["2000-12-22", "摩羯座"]])("zodiac %s", (date, sign) => expect(birthProfile(date, now)?.sunSign).toBe(sign));
  it("blocks past/invalid dates, invalid optional numbers and unconfirmed consents", () => {
    expect(validateIntake({ ...complete(), date: "2026-11-26", height: "500", weight: "NaN", privacyConsent: false }, now)).toHaveProperty("date");
    expect(validateIntake({ ...complete(), date: "2026-02-30" }, now)).toHaveProperty("date");
    expect(intakeSchema.safeParse({ ...complete(), time: "09:15" }).success).toBe(false);
  });
  it("validates only normalized active fields and strips hidden service/profile data", () => {
    const stale = { ...complete(), service: "movement", extended: true, needs: ["肌肉容易緊繃"], regions: ["肩頸"], feelings: ["緊"], duration: "半年以上", pelvicConsent: true, pelvicRegions: ["腹部"] };
    const n = normalizeIntake(stale);
    expect(n).toMatchObject({ extended: false, needs: [], regions: [], feelings: [], duration: "", pelvicConsent: false, pelvicRegions: [] });
    expect(normalizeIntake({ ...complete(), visit: "我之前來過", birthday: "bad", height: "bad", trainingGoals: ["增加肌力"], sports: ["跑步"] })).toMatchObject({ birthday: "", height: "", trainingGoals: [], sports: [] });
    expect(validateIntake(normalizeIntake({ ...complete(), visit: "我之前來過", height: "bad" }), now)).toEqual({});
  });
  it("requires pelvic external consent and adult male confirmation", () => {
    expect(validateIntake({ ...complete(), service: "pelvic-core" }, now)).toHaveProperty("pelvicConsent");
    expect(validateIntake({ ...complete(), service: "pelvic-core", birthMode: "年齡", age: "17", adultMale: true, pelvicConsent: true }, now)).toHaveProperty("adultMale");
  });
  it("copies the requested profile and needs but excludes sensitive details and empty optionals", () => {
    const a = { ...complete(), birthMode: "生日", birthday: "1990-10-10", safetyNote: "機密健康", noTouch: "碰觸界線", notes: "私人補充", safetyFlags: ["近期受傷、手術或骨折"], occupation: "工程師", height: "175", weight: "75", work: ["長時間坐著"], exerciseFrequency: "每週 1–2 次", sports: ["跑步"], needs: ["單純想放鬆"], regions: ["肩頸"] };
    const summary = bookingSummary(a, "討論地點", "receipt");
    for (const secret of [a.birthday, a.contact, a.safetyNote, a.noTouch, a.notes, ...a.safetyFlags]) expect(summary).not.toContain(secret);
    for (const value of ["天秤座", a.occupation, a.height, a.weight, ...a.work, ...a.sports, ...a.needs, ...a.regions, "receipt"]) expect(summary).toContain(value);
    const offline = bookingSummary(complete(), "討論地點");
    expect(offline).toContain("尚未確認同步");
    expect(offline).not.toContain("職業：");
    expect(offline).not.toContain("資料編號：");
    expect(lineBookingUrl()).toBe("https://line.me/R/ti/p/@359gzxzi");
    expect(new URL(lineBookingUrl()).search).toBe("");
  });
});
