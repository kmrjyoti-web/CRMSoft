"use client";

import { PluginDetail } from "@/features/plugin-store/components/PluginDetail";

export default function PluginDetailPage({ params }: { params: { code: string } }) {
  return (
    <div className="p-6">
      <PluginDetail pluginCode={params.code} />
    </div>
  );
}
