"use client";

import { IpRuleList } from "@/features/settings/components/IpRuleList";

export default function SecuritySettingsPage() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage IP access rules and security policies for your workspace.
        </p>
      </div>
      <IpRuleList />
    </div>
  );
}
