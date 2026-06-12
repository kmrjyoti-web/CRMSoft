"use client";

import { Icon } from "@/components/ui";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

const SIZES = { sm: 18, md: 28, lg: 40 } as const;

export function LoadingSpinner({ size = "md", fullPage }: LoadingSpinnerProps) {
  const icon = (
    <span className="crm-spinner" style={{ display: "inline-flex" }}>
      <Icon name="loader" size={SIZES[size]} />
    </span>
  );

  if (fullPage) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        {icon}
      </div>
    );
  }

  return icon;
}
