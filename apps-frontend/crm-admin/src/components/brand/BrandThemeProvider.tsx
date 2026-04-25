"use client";

import { useEffect, type ReactNode } from "react";
import { useActiveCompany } from "@/hooks/useActiveCompany";

export function BrandThemeProvider({ children }: { children: ReactNode }) {
  const { theme, brandConfig } = useActiveCompany();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", theme.primary);
    root.style.setProperty("--brand-secondary", theme.secondary);
    root.style.setProperty("--brand-text", theme.text);
    root.style.setProperty("--brand-font-heading", theme.fontHeading);
    root.style.setProperty("--brand-font-body", theme.fontBody);

    if (brandConfig?.name) {
      document.title = `${brandConfig.name} | CRMSoft`;
    }

    return () => {
      root.style.removeProperty("--brand-primary");
      root.style.removeProperty("--brand-secondary");
      root.style.removeProperty("--brand-text");
      root.style.removeProperty("--brand-font-heading");
      root.style.removeProperty("--brand-font-body");
      document.title = "CRM Admin";
    };
  }, [theme, brandConfig]);

  return (
    <div
      style={{
        background: theme.background,
        color: theme.text,
        minHeight: "100vh",
        fontFamily: theme.fontBody,
      }}
    >
      {children}
    </div>
  );
}
