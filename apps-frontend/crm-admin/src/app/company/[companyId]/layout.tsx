"use client";

import { useEffect, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { BrandThemeProvider } from "@/components/brand/BrandThemeProvider";
import { CompanyHeader } from "@/components/company/CompanyHeader";

export default function CompanyLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ companyId: string }>();
  const router = useRouter();
  const activeCompany = useAuthStore((s) => s.activeCompany);

  useEffect(() => {
    // If no active company, or URL company doesn't match store, send back to self-care
    if (!activeCompany || activeCompany.id !== params.companyId) {
      router.replace("/self-care");
    }
  }, [activeCompany, params.companyId, router]);

  if (!activeCompany || activeCompany.id !== params.companyId) {
    return null;
  }

  return (
    <BrandThemeProvider>
      <CompanyHeader />
      <main>{children}</main>
    </BrandThemeProvider>
  );
}
