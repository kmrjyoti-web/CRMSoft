"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import AnimatedBackground from "@/features/auth/components/AnimatedBackground";
import BrandingPanel from "@/features/auth/components/BrandingPanel";
import { getTimePeriod, type TimePeriod } from "@/features/auth/utils/time-utils";

function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<TimePeriod>("working");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const brandCode = searchParams.get("brand");
  const isRegister = pathname?.includes("/register");

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const params = new URLSearchParams(window.location.search);
      const override = params.get("tod") as TimePeriod | null;
      if (override && ["morning", "working", "afternoon", "evening", "night"].includes(override)) {
        setPeriod(override);
        return;
      }
    }
    setPeriod(getTimePeriod());
  }, []);

  // Brand-specific pages and generic register render fullscreen — skip the glass card wrapper
  if (brandCode || isRegister) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      <AnimatedBackground period={period} />

      {/* Left column — form */}
      <div className={isRegister ? "tod-auth-left tod-auth-left--wide" : "tod-auth-left"}>
        <div className={isRegister ? "tod-auth-left-inner tod-auth-left-inner--wide" : "tod-auth-left-inner"}>
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
                <path d="M10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16C22 19.314 19.314 22 16 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="text-2xl font-bold text-white drop-shadow-sm">CRM Admin</span>
            </div>
          </div>

          {/* Card — dark glassmorphism */}
          <div className="tod-dark-glass-card st-animate-fade-in">
            {children}
          </div>

          {/* Footer */}
          <p className="text-center text-xs mt-6 text-slate-300">
            &copy; {new Date().getFullYear()} CRM Admin. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right column — branding (hidden on mobile, hidden on register) */}
      {!isRegister && <BrandingPanel period={period} />}
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#0f172a" }} />}>
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </Suspense>
  );
}
