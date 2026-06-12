"use client";

import { Icon } from "@/components/ui";

import { ComponentCard } from "./ComponentCard";

import type { ComponentDef } from "./types";

const DEFS: ComponentDef[] = [
  {
    name: "Toolbar", wraps: "AICToolbar", wrapperFile: "src/components/ui/Toolbar.tsx", category: "Toolbar",
    description: "Horizontal toolbar container for action buttons.",
    preview: <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1"><button className="p-1.5 hover:bg-gray-200 rounded"><Icon name="bold" size={14} /></button><button className="p-1.5 hover:bg-gray-200 rounded"><Icon name="italic" size={14} /></button><button className="p-1.5 hover:bg-gray-200 rounded"><Icon name="underline" size={14} /></button><div className="w-px h-5 bg-gray-300 mx-1" /><button className="p-1.5 hover:bg-gray-200 rounded"><Icon name="copy" size={14} /></button></div>,
    props: [],
    cssTokens: [{ token: "--st-toolbar-bg", defaultValue: "#f9fafb", description: "Background" }, { token: "--st-toolbar-border-color", defaultValue: "#e5e7eb", description: "Border" }],
    playground: [],
    codeExamples: [{ title: "Basic", code: `<Toolbar>\n  <ToolbarButton icon="bold" active={isBold} onClick={toggleBold} />\n  <ToolbarButton icon="italic" />\n  <ToolbarButtonGroup>\n    <ToolbarButton icon="align-left" />\n    <ToolbarButton icon="align-center" />\n  </ToolbarButtonGroup>\n</Toolbar>` }],
    events: [], slots: [{ name: "children", type: "ToolbarButton | ToolbarButtonGroup", description: "Toolbar items" }],
  },
  {
    name: "ToolbarButton", wraps: "AICToolbarButton", wrapperFile: "src/components/ui/ToolbarButton.tsx", category: "Toolbar",
    description: "Individual button inside a Toolbar.",
    preview: <div className="flex gap-1"><button className="p-1.5 bg-blue-100 text-blue-600 rounded"><Icon name="bold" size={14} /></button><button className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><Icon name="italic" size={14} /></button></div>,
    props: [{ name: "icon", type: "string", required: false, description: "Icon name" }, { name: "active", type: "boolean", required: false, default: "false", description: "Active state" }, { name: "disabled", type: "boolean", required: false, default: "false", description: "Disabled" }],
    cssTokens: [{ token: "--st-toolbar-btn-active-bg", defaultValue: "#e3f2fd", description: "Active bg" }],
    playground: [{ name: "active", type: "boolean", default: false, label: "Active" }, { name: "disabled", type: "boolean", default: false, label: "Disabled" }],
    codeExamples: [{ title: "Basic", code: `<ToolbarButton icon="bold" active={isBold} onClick={toggleBold} />` }],
    events: [{ name: "onClick", signature: "(e: MouseEvent) => void", description: "Click" }], slots: [],
  },
  {
    name: "ToolbarButtonGroup", wraps: "AICToolbarButtonGroup", wrapperFile: "src/components/ui/ToolbarButtonGroup.tsx", category: "Toolbar",
    description: "Groups toolbar buttons with visual separation.",
    preview: <div className="flex items-center border border-gray-200 rounded overflow-hidden"><button className="p-1.5 hover:bg-gray-100 text-gray-500"><Icon name="chevron-left" size={14} /></button><div className="w-px h-5 bg-gray-200" /><button className="p-1.5 hover:bg-gray-100 text-gray-500"><Icon name="chevron-right" size={14} /></button></div>,
    props: [],
    cssTokens: [], playground: [],
    codeExamples: [{ title: "Basic", code: `<ToolbarButtonGroup>\n  <ToolbarButton icon="align-left" />\n  <ToolbarButton icon="align-center" />\n  <ToolbarButton icon="align-right" />\n</ToolbarButtonGroup>` }],
    events: [], slots: [{ name: "children", type: "ToolbarButton[]", description: "Grouped buttons" }],
  },
];

export function ToolbarSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {DEFS.map((def) => <ComponentCard key={def.name} def={def} fullWidth={def.name === "Toolbar"} />)}
    </div>
  );
}
