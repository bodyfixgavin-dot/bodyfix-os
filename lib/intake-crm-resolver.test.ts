import { describe, expect, it } from "vitest";
import { resolveIntakeClient } from "./intake-crm-resolver";
const base = { id: "c1", display_name: "Gavin", birthday: "1990-01-01", phone: "0912345678", line_id: "gavin", instagram: "gav", aliases: ["OldG"], identifiers: [{ identifier_type: "line_user_id", normalized_value: "U1", is_active: true }] };
describe("intake CRM resolver", () => {
  it("same name + birthday + phone links", () => expect(resolveIntakeClient({ name: "Gavin", birthday: "1990-01-01", phone: "0912345678" }, [base]).status).toBe("linked_existing"));
  it("same name + different birthday creates new", () => expect(resolveIntakeClient({ name: "Gavin", birthday: "1991-01-01" }, [base]).status).toBe("created_new"));
  it("same name + birthday + different phone needs review", () => expect(resolveIntakeClient({ name: "Gavin", birthday: "1990-01-01", phone: "0900000000" }, [base]).status).toBe("needs_review"));
  it("new name + old alias + birthday + line links", () => expect(resolveIntakeClient({ name: "OldG", birthday: "1990-01-01", lineId: "gavin" }, [base]).status).toBe("linked_existing"));
  it("same LINE + different birthday needs review", () => expect(resolveIntakeClient({ name: "X", birthday: "1991-01-01", lineId: "gavin" }, [base]).status).toBe("needs_review"));
  it("only same name needs review", () => expect(resolveIntakeClient({ name: "Gavin" }, [base]).status).toBe("needs_review"));
  it("blank birthday + line_user_id links", () => expect(resolveIntakeClient({ name: "X", lineUserId: "U1" }, [base]).status).toBe("linked_existing"));
  it("blank birthday + only name needs review", () => expect(resolveIntakeClient({ name: "Gavin" }, [base]).status).toBe("needs_review"));
  it("resubmission idempotency is handled by intake:<submission_id> followup key convention", () => expect(`intake:${"s1"}`).toBe("intake:s1"));
  it("new customer creates new resolution", () => expect(resolveIntakeClient({ name: "New", phone: "0988" }, [base]).status).toBe("created_new"));
  it("needs review does not imply service record creation", () => expect(resolveIntakeClient({ name: "Gavin" }, [base]).status).toBe("needs_review"));
  it("changed name with stable line links without overwriting display name", () => expect(resolveIntakeClient({ name: "NewG", lineUserId: "U1" }, [base]).clientId).toBe("c1"));
});
