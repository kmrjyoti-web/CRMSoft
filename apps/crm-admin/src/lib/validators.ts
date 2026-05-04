import { z } from "zod";

// ── Indian Phone (10 digits starting with 6-9) ─────────
export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number");

// ── Email ───────────────────────────────────────────────
export const emailSchema = z
  .string()
  .email("Invalid email address");

// ── GST Number (15 chars) ───────────────────────────────
// Format: [0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]
export const gstSchema = z
  .string()
  .regex(
    /^[0-3]\d[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
    "Invalid GST number",
  );

// ── PAN Number (10 chars) ───────────────────────────────
// Format: [A-Z]{3}[ABCFGHJTLP][A-Z][0-9]{4}[A-Z]
export const panSchema = z
  .string()
  .regex(/^[A-Z]{3}[ABCFGHJTLP][A-Z]\d{4}[A-Z]$/, "Invalid PAN number");

// ── Pincode (6 digits starting 1-9) ────────────────────
export const pincodeSchema = z
  .string()
  .regex(/^[1-9]\d{5}$/, "Invalid pincode");
