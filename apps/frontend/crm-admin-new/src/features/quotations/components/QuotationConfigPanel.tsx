'use client';

import { useState } from "react";
import { HeaderConfigTab } from "./config-tabs/HeaderConfigTab";
import { GridConfigTab } from "./config-tabs/GridConfigTab";
import { FooterConfigTab } from "./config-tabs/FooterConfigTab";

type Tab = "header" | "grid" | "footer";

const TABS: { id: Tab; label: string }[] = [
  { id: "header", label: "Header" },
  { id: "grid",   label: "Grid" },
  { id: "footer", label: "Footer" },
];

interface Props {
  configKey: string;
}

export function QuotationConfigPanel({ configKey }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("grid");

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "header" && <HeaderConfigTab configKey={configKey} />}
        {activeTab === "grid"   && <GridConfigTab   configKey={configKey} />}
        {activeTab === "footer" && <FooterConfigTab  configKey={configKey} />}
      </div>
    </div>
  );
}
