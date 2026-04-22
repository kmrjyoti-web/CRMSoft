import { formatINR } from "../format-currency";
import { relativeTime, formatDate } from "../format-date";
import {
  phoneSchema,
  emailSchema,
  gstSchema,
  panSchema,
  pincodeSchema,
} from "../validators";

// ── formatINR ───────────────────────────────────────────

describe("formatINR", () => {
  it("formats integer with Indian grouping", () => {
    expect(formatINR(100000)).toBe("₹1,00,000");
  });

  it("formats large number with lakh/crore groups", () => {
    expect(formatINR(1234567)).toBe("₹12,34,567");
  });

  it("includes decimals when non-zero", () => {
    expect(formatINR(1234567.89)).toBe("₹12,34,567.89");
  });

  it("handles negative amounts", () => {
    expect(formatINR(-5000)).toBe("-₹5,000");
  });

  it("handles zero", () => {
    expect(formatINR(0)).toBe("₹0");
  });
});

// ── relativeTime ────────────────────────────────────────

describe("relativeTime", () => {
  it("returns a human-readable relative string", () => {
    const result = relativeTime(new Date());
    expect(result).toContain("ago");
  });

  it("accepts ISO string input", () => {
    const result = relativeTime(new Date().toISOString());
    expect(typeof result).toBe("string");
  });
});

// ── formatDate ──────────────────────────────────────────

describe("formatDate", () => {
  it("formats with default pattern (dd MMM yyyy)", () => {
    const result = formatDate(new Date(2026, 1, 28));
    expect(result).toBe("28 Feb 2026");
  });

  it("formats with custom pattern", () => {
    const result = formatDate(new Date(2026, 1, 28), "dd/MM/yyyy");
    expect(result).toBe("28/02/2026");
  });
});

// ── validators ──────────────────────────────────────────

describe("validators", () => {
  it("phoneSchema accepts valid Indian mobile", () => {
    expect(phoneSchema.safeParse("9876543210").success).toBe(true);
  });

  it("phoneSchema rejects invalid number", () => {
    expect(phoneSchema.safeParse("1234567890").success).toBe(false);
  });

  it("emailSchema accepts valid email", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
  });

  it("emailSchema rejects invalid email", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });

  it("gstSchema accepts valid GST", () => {
    expect(gstSchema.safeParse("22AAAAA0000A1Z5").success).toBe(true);
  });

  it("gstSchema rejects invalid GST", () => {
    expect(gstSchema.safeParse("INVALIDGST").success).toBe(false);
  });

  it("panSchema accepts valid PAN", () => {
    expect(panSchema.safeParse("ABCPD1234E").success).toBe(true);
  });

  it("pincodeSchema accepts valid pincode", () => {
    expect(pincodeSchema.safeParse("400001").success).toBe(true);
  });

  it("pincodeSchema rejects invalid pincode", () => {
    expect(pincodeSchema.safeParse("000001").success).toBe(false);
  });
});
