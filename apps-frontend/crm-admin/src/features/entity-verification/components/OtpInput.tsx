"use client";

import { useRef } from "react";

// ── OTP Input (6 boxes) ─────────────────────────────────

export interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  devOtp?: string;
}

export function OtpInput({ value, onChange, disabled, devOtp }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    onChange(next.join("").trim());
    if (d && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text) {
      onChange(text);
      e.preventDefault();
    }
  };

  // Dev mode: use actual OTP from API response
  const devHint = devOtp || null;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            placeholder="·"
            style={{
              width: 44,
              height: 52,
              textAlign: "center",
              fontSize: 22,
              fontWeight: 600,
              border: "2px solid #e5e7eb",
              borderRadius: 8,
              outline: "none",
              caretColor: "transparent",
              background: d ? "#f0f9ff" : "#fff",
              borderColor: d ? "#0ea5e9" : "#e5e7eb",
              transition: "border-color 0.15s",
              boxSizing: "border-box",
              opacity: disabled ? 0.6 : 1,
            }}
            onFocus={(e) => !disabled && (e.target.style.borderColor = "#0ea5e9")}
            onBlur={(e) =>
              (e.target.style.borderColor = digits[i] ? "#0ea5e9" : "#e5e7eb")
            }
          />
        ))}
      </div>
      {devHint && (
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <button
            type="button"
            onClick={() => onChange(devHint)}
            style={{
              fontSize: 10, color: "#9ca3af", background: "none", border: "none",
              cursor: "pointer", textDecoration: "underline",
            }}
          >
            DEV: Auto-fill {devHint}
          </button>
        </div>
      )}
    </div>
  );
}
