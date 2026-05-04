"use client";

import { useState, useEffect, useCallback } from "react";

import { Button, Icon, Badge } from "@/components/ui";

import { useAuthStore } from "@/stores/auth.store";
import { useMenuStore } from "@/stores/menu.store";
import { usePermissionStore } from "@/stores/permission.store";

function formatSize(str: string): string {
  const bytes = new Blob([str]).size;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function StoreCard({
  name,
  state,
  expanded,
  onToggle,
}: {
  name: string;
  state: Record<string, unknown>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const jsonStr = JSON.stringify(state, null, 2);
  const size = formatSize(jsonStr);
  const keyCount = Object.keys(state).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <Icon name={expanded ? "chevron-down" : "chevron-right"} size={16} className="text-gray-400" />
          <Icon name="database" size={16} className="text-blue-500" />
          <span className="font-medium text-sm text-gray-900">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{keyCount} keys</Badge>
          <Badge variant="default">{size}</Badge>
          <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="p-1 hover:bg-gray-200 rounded" title="Copy state">
            <Icon name="copy" size={14} className="text-gray-400" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="p-4 bg-white border-t border-gray-200 overflow-x-auto">
          <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-words max-h-80 overflow-y-auto">
            {jsonStr}
          </pre>
        </div>
      )}
    </div>
  );
}

export function StoreInspectorTab() {
  const authState = useAuthStore.getState();
  const menuState = useMenuStore.getState();
  const permState = usePermissionStore.getState();
  const [expandedStores, setExpandedStores] = useState<Record<string, boolean>>({});
  const [, forceUpdate] = useState(0);

  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  // Auto-refresh every 3 seconds
  const [autoRefresh, setAutoRefresh] = useState(false);
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  const toggleStore = (name: string) => {
    setExpandedStores((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Sanitize auth state (hide full token)
  const sanitizedAuth = {
    ...authState,
    token: authState.token ? `${authState.token.slice(0, 20)}...` : null,
    refreshToken: authState.refreshToken ? `${authState.refreshToken.slice(0, 20)}...` : null,
  };

  const stores = [
    { name: "auth.store", state: sanitizedAuth as unknown as Record<string, unknown> },
    { name: "menu.store", state: menuState as unknown as Record<string, unknown> },
    { name: "permission.store", state: permState as unknown as Record<string, unknown> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {stores.length} Zustand stores loaded
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-refresh (3s)
          </label>
          <Button variant="outline" onClick={refresh}>
            <Icon name="refresh" size={14} /> Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {stores.map((store) => (
          <StoreCard
            key={store.name}
            name={store.name}
            state={store.state}
            expanded={!!expandedStores[store.name]}
            onToggle={() => toggleStore(store.name)}
          />
        ))}
      </div>
    </div>
  );
}
