"use client";

interface FormErrorsProps {
  errors: Record<string, { message?: string }>;
}

export function FormErrors({ errors }: FormErrorsProps) {
  const entries = Object.entries(errors).filter(([, e]) => e.message);
  if (!entries.length) return null;

  return (
    <div
      role="alert"
      style={{
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 6,
        padding: "10px 14px",
        marginBottom: 16,
      }}
    >
      <ul
        style={{
          margin: 0,
          padding: "0 0 0 18px",
          fontSize: 13,
          color: "#dc2626",
        }}
      >
        {entries.map(([key, err]) => (
          <li key={key}>{err.message}</li>
        ))}
      </ul>
    </div>
  );
}
