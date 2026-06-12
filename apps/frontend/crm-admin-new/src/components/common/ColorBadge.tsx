"use client";

// Default color palette for status/source values
const DEFAULT_COLORS: Record<string, string> = {
  // Statuses
  ACTIVE: "#dcfce7",
  INACTIVE: "#f3f4f6",
  NEW: "#dbeafe",
  QUALIFIED: "#fef9c3",
  CONTACTED: "#e0e7ff",
  CONVERTED: "#d1fae5",
  LOST: "#fee2e2",
  WON: "#bbf7d0",
  CLOSED: "#e5e7eb",
  OPEN: "#dbeafe",
  IN_PROGRESS: "#fef3c7",
  PENDING: "#fef9c3",
  COMPLETED: "#d1fae5",
  CANCELLED: "#fee2e2",

  // Priorities
  LOW: "#dbeafe",
  MEDIUM: "#fef9c3",
  HIGH: "#fed7aa",
  URGENT: "#fecaca",

  // Sources
  WEBSITE: "#dbeafe",
  REFERRAL: "#d1fae5",
  COLD_CALL: "#e0e7ff",
  SOCIAL_MEDIA: "#fce7f3",
  EMAIL_CAMPAIGN: "#fef3c7",
  TRADE_SHOW: "#f3e8ff",
  PARTNER: "#ccfbf1",
  DIRECT: "#cffafe",

  // Activity types
  CALL: "#dbeafe",
  EMAIL: "#fef3c7",
  MEETING: "#d1fae5",
  NOTE: "#f3f4f6",
  WHATSAPP: "#dcfce7",
  SMS: "#e0e7ff",
  VISIT: "#fce7f3",
};

const DEFAULT_TEXT_COLORS: Record<string, string> = {
  ACTIVE: "#166534",
  INACTIVE: "#6b7280",
  NEW: "#1e40af",
  QUALIFIED: "#854d0e",
  CONTACTED: "#3730a3",
  CONVERTED: "#065f46",
  LOST: "#991b1b",
  WON: "#166534",
  LOW: "#1e40af",
  MEDIUM: "#854d0e",
  HIGH: "#9a3412",
  URGENT: "#991b1b",
};

interface ColorBadgeProps {
  value: string;
  colorMap?: Record<string, string>;
}

export function ColorBadge({ value, colorMap }: ColorBadgeProps) {
  if (!value || value === "—") return <span>{value}</span>;

  const colors = colorMap ?? DEFAULT_COLORS;
  const bgColor = colors[value] ?? "#f3f4f6";
  const textColor = DEFAULT_TEXT_COLORS[value] ?? "#374151";

  const displayText = value.replace(/_/g, " ");

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {displayText}
    </span>
  );
}
