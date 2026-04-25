"use client";

import { useEffect, type ReactNode } from "react";
import { useActiveCompany } from "@/hooks/useActiveCompany";

export function BrandThemeProvider({ children }: { children: ReactNode }) {
  const { theme, brandConfig } = useActiveCompany();

  useEffect(() => {
    const root = document.documentElement;

    // Base tokens
    root.style.setProperty("--brand-primary", theme.primary);
    root.style.setProperty("--brand-primary-deep", theme.primaryDeep);
    root.style.setProperty("--brand-primary-soft", theme.primarySoft);
    root.style.setProperty("--brand-primary-glow", theme.primaryGlow);
    root.style.setProperty("--brand-secondary", theme.secondary);
    root.style.setProperty("--brand-bg", theme.background);
    root.style.setProperty("--brand-bg-elevated", theme.bgElevated);
    root.style.setProperty("--brand-text", theme.text);
    root.style.setProperty("--brand-muted", theme.textMuted);
    root.style.setProperty("--brand-subtle", theme.textSubtle);

    // Card tokens
    root.style.setProperty("--brand-card-bg", theme.cardBg);
    root.style.setProperty("--brand-card-bg-hover", theme.cardBgHover);
    root.style.setProperty("--brand-card-border", theme.cardBorder);
    root.style.setProperty("--brand-card-border-hover", theme.cardBorderHover);
    root.style.setProperty("--brand-card-shadow", theme.cardShadow);
    root.style.setProperty("--brand-card-shadow-hover", theme.cardShadowHover);

    // Border tokens
    root.style.setProperty("--brand-border", theme.border);
    root.style.setProperty("--brand-border-emphasis", theme.borderEmphasis);
    root.style.setProperty("--brand-divider", theme.divider);

    // Status tokens
    root.style.setProperty("--brand-success", theme.success);
    root.style.setProperty("--brand-warning", theme.warning);
    root.style.setProperty("--brand-danger", theme.danger);
    root.style.setProperty("--brand-info", theme.info);

    // Typography
    root.style.setProperty("--font-heading", theme.fontHeading);
    root.style.setProperty("--font-body", theme.fontBody);

    if (brandConfig?.name) {
      document.title = `${brandConfig.name} | CRMSoft`;
    }

    return () => {
      // Restore :root defaults on unmount (back to neutral premium)
      root.style.removeProperty("--brand-primary");
      root.style.removeProperty("--brand-primary-deep");
      root.style.removeProperty("--brand-primary-soft");
      root.style.removeProperty("--brand-primary-glow");
      root.style.removeProperty("--brand-secondary");
      root.style.removeProperty("--brand-bg");
      root.style.removeProperty("--brand-bg-elevated");
      root.style.removeProperty("--brand-text");
      root.style.removeProperty("--brand-muted");
      root.style.removeProperty("--brand-subtle");
      root.style.removeProperty("--brand-card-bg");
      root.style.removeProperty("--brand-card-bg-hover");
      root.style.removeProperty("--brand-card-border");
      root.style.removeProperty("--brand-card-border-hover");
      root.style.removeProperty("--brand-card-shadow");
      root.style.removeProperty("--brand-card-shadow-hover");
      root.style.removeProperty("--brand-border");
      root.style.removeProperty("--brand-border-emphasis");
      root.style.removeProperty("--brand-divider");
      root.style.removeProperty("--brand-success");
      root.style.removeProperty("--brand-warning");
      root.style.removeProperty("--brand-danger");
      root.style.removeProperty("--brand-info");
      root.style.removeProperty("--font-heading");
      root.style.removeProperty("--font-body");
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
        transition: "background 400ms ease, color 300ms ease",
      }}
    >
      {children}
    </div>
  );
}
