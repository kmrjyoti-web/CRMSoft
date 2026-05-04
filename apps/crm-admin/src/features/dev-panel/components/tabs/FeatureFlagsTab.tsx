"use client";

import { useState, useMemo } from "react";

import { Icon, Badge, Input } from "@/components/ui";

import { usePermissionStore } from "@/stores/permission.store";

export function FeatureFlagsTab() {
  const features = usePermissionStore((s) => s.features);
  const hasFeature = usePermissionStore((s) => s.hasFeature);
  const [search, setSearch] = useState("");

  // Build flag list from features + known flags
  const knownFlags = useMemo(() => {
    const allFlags = [
      { key: "workflow_engine", label: "Workflow Engine", source: "tenant" as const },
      { key: "whatsapp", label: "WhatsApp Integration", source: "tenant" as const },
      { key: "email_campaigns", label: "Email Campaigns", source: "tenant" as const },
      { key: "support_module", label: "Support Module", source: "tenant" as const },
      { key: "custom_fields", label: "Custom Fields", source: "tenant" as const },
      { key: "api_webhooks", label: "API Webhooks", source: "env" as const },
      { key: "offline_sync", label: "Offline Sync", source: "env" as const },
      { key: "two_factor_auth", label: "Two-Factor Auth", source: "hardcoded" as const },
    ];

    // Add any features from store that aren't in known list
    features.forEach((f) => {
      if (!allFlags.find((af) => af.key === f)) {
        allFlags.push({ key: f, label: f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), source: "tenant" });
      }
    });

    return allFlags;
  }, [features]);

  const filteredFlags = useMemo(() => {
    if (!search) return knownFlags;
    return knownFlags.filter(
      (f) =>
        f.key.toLowerCase().includes(search.toLowerCase()) ||
        f.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [knownFlags, search]);

  const enabledCount = knownFlags.filter((f) => hasFeature(f.key)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {enabledCount} of {knownFlags.length} features enabled
        </div>
      </div>

      <Input
        placeholder="Search flags..."
        value={search}
        onChange={(v) => setSearch(v)}
        leftIcon={<Icon name="search" size={16} />}
      />

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Feature Flag</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-700">Status</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-700">Source</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700">Key</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlags.map((flag) => {
              const enabled = hasFeature(flag.key);
              return (
                <tr key={flag.key} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{flag.label}</td>
                  <td className="text-center px-3 py-3">
                    <Badge variant={enabled ? "success" : "danger"}>
                      {enabled ? "ON" : "OFF"}
                    </Badge>
                  </td>
                  <td className="text-center px-3 py-3">
                    <Badge variant="default">{flag.source}</Badge>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-gray-500">{flag.key}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
