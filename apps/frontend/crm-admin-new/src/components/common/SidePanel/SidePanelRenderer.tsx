"use client";

import { useSidePanelStore } from "@/stores/side-panel.store";

import { SidePanel } from "./SidePanel";

export function SidePanelRenderer() {
  const panels = useSidePanelStore((s) => s.panels);
  const panelList = Object.values(panels);

  if (panelList.length === 0) return null;

  return (
    <>
      {panelList.map((panel) => (
        <SidePanel key={panel.config.id} panel={panel} />
      ))}
    </>
  );
}
