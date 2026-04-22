"use client";

import { useMemo } from "react";

import { Icon, Badge } from "@/components/ui";

import { useAuthStore } from "@/stores/auth.store";
import { usePermissionStore } from "@/stores/permission.store";

function InfoCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
        <Icon name={icon as any} size={16} />
        {title}
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

export function SystemInfoTab() {
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId);
  const roles = useAuthStore((s) => s.roles);
  const permissionCount = usePermissionStore((s) => s.codes.length);
  const featureCount = usePermissionStore((s) => s.features.length);

  const browserInfo = useMemo(() => {
    if (typeof window === "undefined") return null;
    return {
      userAgent: navigator.userAgent.slice(0, 80),
      language: navigator.language,
      platform: navigator.platform,
      screenSize: `${screen.width}x${screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      online: navigator.onLine,
      cookiesEnabled: navigator.cookieEnabled,
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <InfoCard title="Application" icon="monitor">
        <InfoRow label="Name" value="CRM Admin" />
        <InfoRow label="Version" value="1.0.0" />
        <InfoRow label="Environment" value={<Badge variant="warning">{process.env.NODE_ENV}</Badge>} />
        <InfoRow label="API URL" value={process.env.NEXT_PUBLIC_API_URL ?? "—"} />
      </InfoCard>

      <InfoCard title="Runtime" icon="code">
        <InfoRow label="Next.js" value="14.x" />
        <InfoRow label="React" value="18.x" />
        <InfoRow label="Node Env" value={process.env.NODE_ENV ?? "—"} />
        <InfoRow label="UI Library" value="CoreUI (crm-custom)" />
      </InfoCard>

      {browserInfo && (
        <InfoCard title="Browser" icon="globe">
          <InfoRow label="Language" value={browserInfo.language} />
          <InfoRow label="Platform" value={browserInfo.platform} />
          <InfoRow label="Screen" value={browserInfo.screenSize} />
          <InfoRow label="Window" value={browserInfo.windowSize} />
          <InfoRow label="Online" value={browserInfo.online ? <Badge variant="success">Yes</Badge> : <Badge variant="danger">No</Badge>} />
          <InfoRow label="Cookies" value={browserInfo.cookiesEnabled ? "Enabled" : "Disabled"} />
        </InfoCard>
      )}

      <InfoCard title="Auth Context" icon="user">
        <InfoRow label="User" value={user ? `${user.firstName} ${user.lastName}` : "—"} />
        <InfoRow label="Email" value={user?.email ?? "—"} />
        <InfoRow label="Tenant ID" value={tenantId ?? "—"} />
        <InfoRow label="Roles" value={roles.length > 0 ? roles.join(", ") : "—"} />
        <InfoRow label="Permissions" value={String(permissionCount)} />
        <InfoRow label="Features" value={String(featureCount)} />
      </InfoCard>

      <InfoCard title="Architecture" icon="layers">
        <InfoRow label="State Mgmt" value="Zustand + React Query" />
        <InfoRow label="Forms" value="react-hook-form + zod" />
        <InfoRow label="HTTP Client" value="Axios" />
        <InfoRow label="CSS" value="Tailwind + CoreUI tokens" />
        <InfoRow label="Icons" value="lucide-react (via Icon.tsx)" />
      </InfoCard>

      <InfoCard title="CSS Import Order" icon="palette">
        <div className="space-y-1 text-xs font-mono">
          <div className="text-gray-500">1. globals.css (Tailwind)</div>
          <div className="text-gray-500">2. default.css (CoreUI tokens)</div>
          <div className="text-gray-500">3. base.css (CoreUI base)</div>
          <div className="text-gray-500">4. crm-theme.css (CRM overrides)</div>
          <div className="mt-2"><Badge variant="success">LOCKED</Badge></div>
        </div>
      </InfoCard>
    </div>
  );
}
