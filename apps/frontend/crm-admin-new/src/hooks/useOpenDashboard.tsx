"use client";

import { useCallback } from "react";

import { useSidePanelStore } from "@/stores/side-panel.store";

// ── Types ──────────────────────────────────────────────

interface DashboardComponentProps {
  entityId: string;
  onEdit: () => void;
  onClose: () => void;
}

interface OpenDashboardOptions {
  entityKey: string;
  entityLabel: string;
  entityId: string;
  displayName: string;
  DashboardComponent: React.ComponentType<DashboardComponentProps>;
  width?: number;
}

// ── Hook ───────────────────────────────────────────────

export function useOpenDashboard() {
  const openPanel = useSidePanelStore((s) => s.openPanel);
  const closePanel = useSidePanelStore((s) => s.closePanel);

  const openDashboard = useCallback(
    (opts: OpenDashboardOptions) => {
      const { entityKey, entityLabel, entityId, displayName, DashboardComponent, width = 900 } = opts;
      const panelId = `${entityKey}-view-${entityId}`;

      openPanel({
        id: panelId,
        title: `${entityLabel}: ${displayName}`,
        width,
        noPadding: true,
        footerButtons: [
          {
            id: "close",
            label: "Close",
            showAs: "text",
            variant: "secondary",
            onClick: () => closePanel(panelId),
          },
        ],
        content: (
          <DashboardComponent
            entityId={entityId}
            onEdit={() => closePanel(panelId)}
            onClose={() => closePanel(panelId)}
          />
        ),
      });
    },
    [openPanel, closePanel],
  );

  return openDashboard;
}
