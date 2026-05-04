"use client";

import { ComponentCard } from "./ComponentCard";

import type { ComponentDef } from "./types";

const DEFS: ComponentDef[] = [
  {
    name: "ListCheckbox", wraps: "AICListCheckbox", wrapperFile: "src/components/ui/ListCheckbox.tsx", category: "Selection Controls",
    description: "List of checkboxes with select-all support.",
    preview: <div className="border border-gray-300 rounded-lg p-2 max-w-sm space-y-1">{["Select All", "Option A", "Option B", "Option C"].map((o, i) => <div key={o} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded"><input type="checkbox" defaultChecked={i === 0 || i === 1} className="accent-[#d95322]" /><span className="text-sm">{o}</span></div>)}</div>,
    props: [{ name: "options", type: "array", required: true, description: "Options list" }, { name: "value", type: "array", required: false, description: "Selected values" }, { name: "direction", type: "enum", required: false, default: '"column"', description: "Layout", enumValues: ["row", "column"] }],
    cssTokens: [], playground: [{ name: "direction", type: "select", default: "column", label: "Direction", options: ["row", "column"] }],
    codeExamples: [{ title: "Basic", code: `<ListCheckbox\n  options={[{ value: "a", label: "Option A" }, { value: "b", label: "Option B" }]}\n  value={selected}\n  onChange={setSelected}\n/>` }],
    events: [{ name: "onChange", signature: "(values: string[]) => void", description: "Selection changed" }], slots: [],
  },
  {
    name: "SegmentedControl", wraps: "AICSegmentedControl", wrapperFile: "src/components/ui/SegmentedControl.tsx", category: "Selection Controls",
    description: "Segmented button group for single selection.",
    preview: <div className="flex border border-gray-300 rounded-lg overflow-hidden max-w-sm"><button className="flex-1 px-4 py-2 text-sm font-medium bg-[#d95322] text-white">Day</button><button className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 border-l border-gray-300">Week</button><button className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 border-l border-gray-300">Month</button></div>,
    props: [{ name: "options", type: "array", required: true, description: "Segment options" }, { name: "value", type: "string", required: false, description: "Selected value" }, { name: "size", type: "enum", required: false, default: '"md"', description: "Size", enumValues: ["sm", "md", "lg"] }, { name: "fullWidth", type: "boolean", required: false, default: "false", description: "Full width" }],
    cssTokens: [{ token: "--st-segmented-active-bg", defaultValue: "#1976d2", crmOverride: "#d95322", description: "Active segment bg" }],
    playground: [{ name: "size", type: "select", default: "md", label: "Size", options: ["sm", "md", "lg"] }, { name: "fullWidth", type: "boolean", default: false, label: "Full Width" }],
    codeExamples: [{ title: "Basic", code: `<SegmentedControl\n  options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }]}\n  value={view}\n  onChange={setView}\n/>` }],
    events: [{ name: "onChange", signature: "(value: string) => void", description: "Selection changed" }], slots: [],
  },
  {
    name: "ToggleButton", wraps: "AICToggleButton", wrapperFile: "src/components/ui/ToggleButton.tsx", category: "Selection Controls",
    description: "Button that toggles between on/off states.",
    preview: <div className="flex gap-2"><button className="px-4 py-2 text-sm font-medium rounded-lg bg-[#d95322] text-white">ON</button><button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600">OFF</button></div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "pressed", type: "boolean", required: false, description: "Toggle state" }, { name: "size", type: "enum", required: false, default: '"md"', description: "Size", enumValues: ["sm", "md", "lg"] }],
    cssTokens: [{ token: "--st-toggle-active-bg", defaultValue: "#1976d2", crmOverride: "#d95322", description: "Active background" }],
    playground: [{ name: "label", type: "text", default: "Bold", label: "Label" }, { name: "size", type: "select", default: "md", label: "Size", options: ["sm", "md", "lg"] }],
    codeExamples: [{ title: "Basic", code: `<ToggleButton label="Bold" pressed={isBold} onChange={setIsBold} />` }],
    events: [{ name: "onChange", signature: "(pressed: boolean) => void", description: "Toggle changed" }], slots: [],
  },
];

export function SelectionControlsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {DEFS.map((def) => <ComponentCard key={def.name} def={def} />)}
    </div>
  );
}
