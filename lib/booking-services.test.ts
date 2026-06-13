import { describe, expect, it } from "vitest";
import {
  FALLBACK_BOOKING_SERVICES,
  FASCIA_LINE_OPTIONS,
  getPublicBookingServices,
} from "./booking-services";

describe("public booking services", () => {
  it("only exposes the four main booking services", () => {
    expect(FALLBACK_BOOKING_SERVICES.map((service) => service.code)).toEqual([
      "fascia_chain_reset_60",
      "pelvic_core_reset_60",
      "fascia_line_selected_reset_60",
      "multi_line_reset_90",
    ]);
    expect(FALLBACK_BOOKING_SERVICES.every((service) => !service.is_addon)).toBe(true);
  });

  it("keeps add-ons out when merging API services", () => {
    const addon = {
      ...FALLBACK_BOOKING_SERVICES[0],
      id: "addon",
      code: "fascia_chain_extension_30",
    };

    expect(getPublicBookingServices([...FALLBACK_BOOKING_SERVICES, addon]).length).toBe(4);
  });

  it("provides seven fascia lines and an unknown fallback", () => {
    expect(FASCIA_LINE_OPTIONS.map((line) => line.code)).toEqual([
      "sbl",
      "sfl",
      "ll",
      "sl",
      "al",
      "fl",
      "dfl",
      "unknown",
    ]);
  });
});
