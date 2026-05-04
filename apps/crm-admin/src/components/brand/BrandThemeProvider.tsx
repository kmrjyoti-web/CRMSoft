"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useActiveCompany } from "@/hooks/useActiveCompany";
import { api } from "@/services/api-client";

const CACHE_TTL = 10 * 60 * 1000; // 10 min

interface TenantBrandingData {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  sidebarColor: string;
  sidebarTextColor: string;
  headerColor: string;
  headerTextColor: string;
  buttonColor: string;
  buttonTextColor: string;
  linkColor: string;
  dangerColor: string;
  successColor: string;
  warningColor: string;
  fontFamily: string;
  headingFontFamily: string | null;
  fontSize: string;
  faviconUrl: string | null;
  logoUrl: string | null;
}

function getCached(companyId: string): TenantBrandingData | null {
  try {
    const raw = sessionStorage.getItem(`brand-css-vars-${companyId}`);
    if (!raw) return null;
    const { data, fetchedAt } = JSON.parse(raw);
    if (Date.now() - fetchedAt > CACHE_TTL) return null;
    return data as TenantBrandingData;
  } catch {
    return null;
  }
}

function setCached(companyId: string, data: TenantBrandingData): void {
  try {
    sessionStorage.setItem(
      `brand-css-vars-${companyId}`,
      JSON.stringify({ data, fetchedAt: Date.now() }),
    );
  } catch {}
}

function applyBrandingVars(root: HTMLElement, b: TenantBrandingData): void {
  if (b.primaryColor) {
    root.style.setProperty("--brand-primary", b.primaryColor);
    root.style.setProperty("--primary", b.primaryColor);
  }
  if (b.secondaryColor) {
    root.style.setProperty("--brand-secondary", b.secondaryColor);
    root.style.setProperty("--secondary", b.secondaryColor);
  }
  if (b.accentColor) root.style.setProperty("--accent", b.accentColor);
  if (b.sidebarColor) root.style.setProperty("--sidebar-bg", b.sidebarColor);
  if (b.sidebarTextColor) root.style.setProperty("--sidebar-text", b.sidebarTextColor);
  if (b.headerColor) root.style.setProperty("--header-bg", b.headerColor);
  if (b.headerTextColor) root.style.setProperty("--header-text", b.headerTextColor);
  if (b.buttonColor) root.style.setProperty("--button-bg", b.buttonColor);
  if (b.buttonTextColor) root.style.setProperty("--button-text", b.buttonTextColor);
  if (b.linkColor) root.style.setProperty("--link", b.linkColor);
  if (b.dangerColor) {
    root.style.setProperty("--brand-danger", b.dangerColor);
    root.style.setProperty("--danger", b.dangerColor);
  }
  if (b.successColor) {
    root.style.setProperty("--brand-success", b.successColor);
    root.style.setProperty("--success", b.successColor);
  }
  if (b.warningColor) {
    root.style.setProperty("--brand-warning", b.warningColor);
    root.style.setProperty("--warning", b.warningColor);
  }
  if (b.fontFamily) {
    root.style.setProperty("--font-family", b.fontFamily);
    root.style.setProperty("--font-body", b.fontFamily);
  }
  if (b.headingFontFamily) {
    root.style.setProperty("--heading-font", b.headingFontFamily);
    root.style.setProperty("--font-heading", b.headingFontFamily);
  }
  if (b.fontSize) root.style.setProperty("--font-size", b.fontSize);
}

function injectFavicon(url: string): void {
  const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-brand]');
  if (existing) { existing.href = url; return; }
  const link = document.createElement("link");
  link.rel = "icon";
  link.href = url;
  link.dataset.brand = "1";
  document.head.appendChild(link);
}

function removeFavicon(): void {
  document.querySelector('link[rel="icon"][data-brand]')?.remove();
}

const DEFAULT_FONTS = new Set(["Inter", "inter", "var(--font-sans)", ""]);

function injectGoogleFont(fontName: string): HTMLLinkElement | null {
  if (!fontName || DEFAULT_FONTS.has(fontName) || fontName.startsWith("var(")) return null;
  const id = `gf-${fontName.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return document.getElementById(id) as HTMLLinkElement;
  const encodedFamily = encodeURIComponent(fontName).replace(/%20/g, "+");
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
  return link;
}

export function BrandThemeProvider({ children }: { children: ReactNode }) {
  const { theme, brandConfig, company } = useActiveCompany();
  const fontLinksRef = useRef<HTMLLinkElement[]>([]);

  useEffect(() => {
    const root = document.documentElement;

    // Fast path: inject static registry theme immediately (no API wait)
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
    root.style.setProperty("--brand-card-bg", theme.cardBg);
    root.style.setProperty("--brand-card-bg-hover", theme.cardBgHover);
    root.style.setProperty("--brand-card-border", theme.cardBorder);
    root.style.setProperty("--brand-card-border-hover", theme.cardBorderHover);
    root.style.setProperty("--brand-card-shadow", theme.cardShadow);
    root.style.setProperty("--brand-card-shadow-hover", theme.cardShadowHover);
    root.style.setProperty("--brand-border", theme.border);
    root.style.setProperty("--brand-border-emphasis", theme.borderEmphasis);
    root.style.setProperty("--brand-divider", theme.divider);
    root.style.setProperty("--brand-success", theme.success);
    root.style.setProperty("--brand-warning", theme.warning);
    root.style.setProperty("--brand-danger", theme.danger);
    root.style.setProperty("--brand-info", theme.info);
    root.style.setProperty("--font-heading", theme.fontHeading);
    root.style.setProperty("--font-body", theme.fontBody);

    if (brandConfig?.name) {
      document.title = `${brandConfig.name} | CRMSoft`;
    }

    const companyId = company?.id;
    let cancelled = false;

    if (companyId) {
      const applyFromData = (b: TenantBrandingData) => {
        if (cancelled) return;
        // Override static theme with API values
        applyBrandingVars(root, b);

        // FIX 4: inject favicon
        if (b.faviconUrl) injectFavicon(b.faviconUrl);

        // FIX 6: inject Google Fonts if not using default Inter
        const links: HTMLLinkElement[] = [];
        if (b.fontFamily) {
          const link = injectGoogleFont(b.fontFamily);
          if (link) links.push(link);
        }
        if (b.headingFontFamily && b.headingFontFamily !== b.fontFamily) {
          const link = injectGoogleFont(b.headingFontFamily);
          if (link) links.push(link);
        }
        fontLinksRef.current = links;
      };

      const cached = getCached(companyId);
      if (cached) {
        applyFromData(cached);
      } else {
        api
          .get<TenantBrandingData>("/api/v1/settings/branding")
          .then((res) => {
            const b: TenantBrandingData = (res.data as any)?.data ?? res.data;
            if (b && typeof b === "object") {
              setCached(companyId, b);
              applyFromData(b);
            }
          })
          .catch(() => {
            // graceful fallback — static theme already applied
          });
      }
    }

    return () => {
      cancelled = true;

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
      root.style.removeProperty("--primary");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--sidebar-bg");
      root.style.removeProperty("--sidebar-text");
      root.style.removeProperty("--header-bg");
      root.style.removeProperty("--header-text");
      root.style.removeProperty("--button-bg");
      root.style.removeProperty("--button-text");
      root.style.removeProperty("--link");
      root.style.removeProperty("--danger");
      root.style.removeProperty("--success");
      root.style.removeProperty("--warning");
      root.style.removeProperty("--font-family");
      root.style.removeProperty("--heading-font");
      root.style.removeProperty("--font-size");

      document.title = "CRM Admin";
      removeFavicon();
      for (const link of fontLinksRef.current) link.remove();
      fontLinksRef.current = [];
    };
  }, [theme, brandConfig, company]);

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
