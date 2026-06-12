"use client";

interface FormErrorsProps {
  errors: Record<string, { message?: string }>;
  /** Map field keys to human-readable labels */
  fieldLabels?: Record<string, string>;
}

export function FormErrors({ errors, fieldLabels }: FormErrorsProps) {
  const entries = Object.entries(errors).filter(([, e]) => e?.message);
  if (!entries.length) return null;

  return (
    <div
      role="alert"
      style={{
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 6,
        padding: "8px 12px",
        marginBottom: 8,
        animation: "shake 0.3s ease-in-out",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: "#dc2626", marginBottom: 2 }}>
        Please fix the following errors:
      </div>
      <ul
        style={{
          margin: 0,
          padding: "0 0 0 18px",
          fontSize: 12,
          color: "#dc2626",
        }}
      >
        {entries.map(([key, err]) => {
          const label = fieldLabels?.[key];
          return (
            <li key={key}>
              {label ? <strong>{label}:</strong> : null} {err.message}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
