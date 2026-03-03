"use client";

import { useState } from "react";

import { Badge, Icon } from "@/components/ui";

import { PageHeader } from "@/components/common/PageHeader";

import { ApiHealthTab } from "./tabs/ApiHealthTab";
import { ErrorLogTab } from "./tabs/ErrorLogTab";
import { UiKitTab } from "./tabs/UiKitTab";
import { StoreInspectorTab } from "./tabs/StoreInspectorTab";
import { PermissionDebugTab } from "./tabs/PermissionDebugTab";
import { NetworkLogTab } from "./tabs/NetworkLogTab";
import { SystemInfoTab } from "./tabs/SystemInfoTab";
import { FeatureFlagsTab } from "./tabs/FeatureFlagsTab";
import { QueryInspectorTab } from "./tabs/QueryInspectorTab";

import type { DevTab, DevTabId } from "../types/dev-panel.types";

const DEV_TABS: DevTab[] = [
  { id: "api-health", label: "API Health", icon: "activity", description: "Ping all API endpoints, check backend status" },
  { id: "error-log", label: "Error Log", icon: "alert-circle", description: "Frontend errors, warnings, caught exceptions" },
  { id: "ui-kit", label: "UI Kit", icon: "palette", description: "All wrapper components + Icon gallery" },
  { id: "store-inspector", label: "Stores", icon: "database", description: "Live Zustand store state viewer" },
  { id: "permissions", label: "Permissions", icon: "shield", description: "Current user permission matrix" },
  { id: "network-log", label: "Network", icon: "wifi", description: "API request/response log (last 100)" },
  { id: "system-info", label: "System", icon: "monitor", description: "Build, browser, auth, config info" },
  { id: "feature-flags", label: "Flags", icon: "flag", description: "Feature flags & plan gates" },
  { id: "query-inspector", label: "Query Cache", icon: "layers", description: "TanStack Query cache inspector" },
];

const TAB_COMPONENTS: Record<DevTabId, React.ComponentType> = {
  "api-health": ApiHealthTab,
  "error-log": ErrorLogTab,
  "ui-kit": UiKitTab,
  "store-inspector": StoreInspectorTab,
  permissions: PermissionDebugTab,
  "network-log": NetworkLogTab,
  "system-info": SystemInfoTab,
  "feature-flags": FeatureFlagsTab,
  "query-inspector": QueryInspectorTab,
};

export function DevPanel() {
  const [activeTab, setActiveTab] = useState<DevTabId>("api-health");
  const ActiveComponent = TAB_COMPONENTS[activeTab];
  const activeTabInfo = DEV_TABS.find((t) => t.id === activeTab);

  return (
    <div className="space-y-4 p-6">
      <PageHeader
        title="Developer Tools"
        subtitle="Debug, inspect, and test the CRM frontend"
        actions={
          <Badge variant="warning">{process.env.NODE_ENV?.toUpperCase()}</Badge>
        }
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-2 border-b border-gray-200">
        {DEV_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-t-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-white border border-b-white border-gray-200 text-blue-600 font-medium -mb-px"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon name={tab.icon as any} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Description */}
      {activeTabInfo && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Icon name="info" size={14} />
          {activeTabInfo.description}
        </div>
      )}

      {/* Active Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 min-h-[500px]">
        <ActiveComponent />
      </div>
    </div>
  );
}
