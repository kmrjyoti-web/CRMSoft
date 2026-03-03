"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Icon, useLayout } from "@/components/ui";

// ── Props ────────────────────────────────────────────────

interface CRMHeaderProps {
  storeName?: string;
  companyCode?: string | null;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  version?: string;
  onLogout?: () => void;
  onOpenShortcuts?: () => void;
}

// ── Component ────────────────────────────────────────────

export function CRMHeader({
  storeName = "CRM Admin",
  companyCode,
  userName,
  userEmail,
  userRole,
  version = "V 1.0",
  onLogout,
  onOpenShortcuts,
}: CRMHeaderProps) {
  const router = useRouter();
  const toggleSidebar = useLayout((s) => s.toggleSidebar);
  const headerRef = useRef<HTMLElement | null>(null);
  const [isCompanyPanelOpen, setCompanyPanelOpen] = useState(false);
  const [isProfilePanelOpen, setProfilePanelOpen] = useState(false);

  const companyInitial = (storeName?.trim()?.[0] || "A").toUpperCase();

  const storeTitle = companyCode
    ? `${storeName} (${companyCode.toUpperCase()})`
    : storeName;

  const fiscalMeta = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const fyStartYear = month >= 3 ? year : year - 1;
    const fyEndYear = fyStartYear + 1;
    return {
      year: `${fyStartYear} - ${fyEndYear}`,
      booksFrom: `01-04-${fyStartYear} to 31-03-${fyEndYear}`,
    };
  }, []);

  const lastLoginLabel = useMemo(() => {
    const time = new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());
    return `Today, ${time}`;
  }, []);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!headerRef.current) return;
      if (!headerRef.current.contains(event.target as Node)) {
        setCompanyPanelOpen(false);
        setProfilePanelOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCompanyPanelOpen(false);
        setProfilePanelOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const topActions: Array<{
    key: string;
    icon: Parameters<typeof Icon>[0]["name"];
    label: string;
    title: string;
    onClick?: () => void;
  }> = [
    { key: "import", icon: "download", label: "Pur. Import", title: "Import data", onClick: () => router.push("/settings") },
    { key: "ticket", icon: "mail", label: "Ticket", title: "Support tickets", onClick: () => router.push("/support-tickets") },
    { key: "help", icon: "help-circle", label: "Help", title: "Help & documentation" },
    { key: "settings", icon: "settings", label: "Settings", title: "Settings", onClick: () => router.push("/settings") },
    { key: "notification", icon: "bell", label: "Notification", title: "Notifications" },
    { key: "shortcut", icon: "command", label: "Shortcut", title: "Keyboard shortcuts", onClick: onOpenShortcuts },
    { key: "history", icon: "history", label: "History", title: "History", onClick: () => router.push("/activities") },
  ];

  return (
    <header className="marg-header travelos-header" ref={headerRef}>
      <div className="travelos-left">
        <button
          className="travelos-menu-toggle"
          onClick={toggleSidebar}
          type="button"
          aria-label="Toggle sidebar"
        >
          <Icon name="menu" size={20} />
        </button>

        <div className="travelos-company-wrap">
          <button
            className={`travelos-company-chip${isCompanyPanelOpen ? " is-active" : ""}`}
            type="button"
            title={storeTitle}
            onClick={() => {
              setCompanyPanelOpen((v) => !v);
              setProfilePanelOpen(false);
            }}
          >
            <span className="travelos-company-chip__avatar">{companyInitial}</span>
            <span className="travelos-company-chip__text">
              <strong>{storeTitle}</strong>
              <small>Books From {fiscalMeta.booksFrom}</small>
            </span>
          </button>

          {isCompanyPanelOpen && (
            <div className="travelos-popover travelos-company-popover" role="dialog" aria-label="Company details">
              <div className="travelos-popover__head">
                <div className="travelos-popover__brand">
                  <span className="travelos-popover__avatar">{companyInitial}</span>
                  <div>
                    <strong>{storeTitle}</strong>
                    <small>CRM Soft Pvt Ltd</small>
                  </div>
                </div>
                <button
                  className="travelos-popover__close"
                  type="button"
                  aria-label="Close company details"
                  onClick={() => setCompanyPanelOpen(false)}
                >
                  <Icon name="x" size={18} />
                </button>
              </div>

              <div className="travelos-popover__body">
                <div className="travelos-info-row">
                  <span>Financial Year</span>
                  <strong>{fiscalMeta.year}</strong>
                </div>
                <div className="travelos-info-row">
                  <span>Books From</span>
                  <strong>{fiscalMeta.booksFrom.split(" to ")[0]}</strong>
                </div>
                <div className="travelos-info-row">
                  <span>GSTIN</span>
                  <strong>27AADCB2230M1Z2</strong>
                </div>
                <div className="travelos-info-row">
                  <span>Branch</span>
                  <strong>Head Office</strong>
                </div>
              </div>

              <div className="travelos-popover__foot">
                <button type="button" className="travelos-btn travelos-btn--ghost">Switch Company</button>
                <button type="button" className="travelos-btn travelos-btn--primary">Edit Details</button>
              </div>
            </div>
          )}
        </div>

        <div className="travelos-network-chip">
          <span className="travelos-network-chip__left">
            <Icon name="wifi" size={14} />
            <span>10 Mb/s</span>
          </span>
          <span className="travelos-network-chip__version">{version}</span>
          <span className="travelos-network-chip__dot" />
        </div>
      </div>

      <div className="travelos-right">
        {topActions.map((action) => (
          <button
            key={action.key}
            type="button"
            className="travelos-action"
            title={action.title}
            onClick={action.onClick}
          >
            <span className="travelos-action__icon">
              <Icon name={action.icon} size={17} />
            </span>
            <span className="travelos-action__label">{action.label}</span>
          </button>
        ))}

        <div className="travelos-profile-wrap">
          <button
            type="button"
            className="travelos-action"
            title="Profile"
            onClick={() => {
              setProfilePanelOpen((v) => !v);
              setCompanyPanelOpen(false);
            }}
          >
            <span className="travelos-action__icon">
              <Icon name="user" size={17} />
            </span>
            <span className="travelos-action__label">Profile</span>
          </button>

          {isProfilePanelOpen && (
            <div className="travelos-popover travelos-profile-popover" role="dialog" aria-label="Profile details">
              <div className="travelos-popover__head">
                <div className="travelos-popover__brand">
                  <div>
                    <strong>{userName || "User"}</strong>
                    <small>{userEmail || "admin@travelos.com"}</small>
                  </div>
                </div>
                <button
                  className="travelos-popover__close"
                  type="button"
                  aria-label="Close profile details"
                  onClick={() => setProfilePanelOpen(false)}
                >
                  <Icon name="x" size={18} />
                </button>
              </div>

              <div className="travelos-popover__body">
                <div className="travelos-info-row">
                  <span>Role</span>
                  <strong>{userRole || "Administrator"}</strong>
                </div>
                <div className="travelos-info-row">
                  <span>Status</span>
                  <strong className="travelos-status-active">
                    <span className="travelos-status-dot" />
                    Active
                  </strong>
                </div>
                <div className="travelos-info-row">
                  <span>Last Login</span>
                  <strong>{lastLoginLabel}</strong>
                </div>
              </div>

              <div className="travelos-popover__foot">
                <button
                  type="button"
                  className="travelos-btn travelos-btn--logout"
                  onClick={onLogout}
                >
                  <Icon name="log-out" size={16} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
