"use client";

import Link from "next/link";
import { User, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

export function ProfileSummaryCard() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : user.email.split("@")[0];

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        position: "relative",
        background:
          "linear-gradient(135deg, rgba(20, 24, 35, 0.7) 0%, rgba(28, 22, 18, 0.5) 100%)",
        border: "1px solid rgba(201, 162, 95, 0.15)",
        borderRadius: 16,
        padding: "28px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        transition: "all 300ms ease",
        overflow: "hidden",
        gap: 16,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(201, 162, 95, 0.3)";
        e.currentTarget.style.boxShadow =
          "0 8px 32px rgba(201, 162, 95, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(201, 162, 95, 0.15)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Subtle gold accent line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: "linear-gradient(180deg, #c9a25f 0%, transparent 100%)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0, flex: 1 }}>
        {/* Avatar with gold gradient */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #c9a25f 0%, #8b6334 100%)",
            color: "#1a1410",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "var(--font-serif)",
            letterSpacing: "0.05em",
            boxShadow: "0 4px 16px rgba(201, 162, 95, 0.3)",
            flexShrink: 0,
            userSelect: "none",
          }}
        >
          {initials}
        </div>

        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              fontWeight: 500,
              color: "#f1f5f9",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Welcome back, {displayName}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "#94a3b8",
              margin: "4px 0 0",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {(user as any).talentId && (
              <>
                <span
                  style={{
                    color: "#c9a25f",
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                  }}
                >
                  {(user as any).talentId}
                </span>
                <span style={{ color: "#475569" }}>·</span>
              </>
            )}
            <span>{user.email}</span>
          </p>
        </div>
      </div>

      <Link
        href="/profile"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 18px",
          fontSize: 13,
          fontWeight: 500,
          color: "#c9a25f",
          background: "rgba(201, 162, 95, 0.1)",
          border: "1px solid rgba(201, 162, 95, 0.3)",
          borderRadius: 10,
          textDecoration: "none",
          transition: "all 200ms ease",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(201, 162, 95, 0.2)";
          e.currentTarget.style.borderColor = "rgba(201, 162, 95, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(201, 162, 95, 0.1)";
          e.currentTarget.style.borderColor = "rgba(201, 162, 95, 0.3)";
        }}
      >
        <User style={{ width: 14, height: 14 }} />
        View profile
        <ArrowRight style={{ width: 14, height: 14 }} />
      </Link>
    </div>
  );
}
