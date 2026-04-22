"use client";

import { Icon } from "@/components/ui";

import { ComponentCard } from "./ComponentCard";

import type { ComponentDef } from "./types";

const DEFS: ComponentDef[] = [
  {
    name: "Button", wraps: "AICButton", wrapperFile: "src/components/ui/Button.tsx", category: "Buttons",
    description: "Primary action button with variants, sizes, loading state, and icon support.",
    defaultProps: 'size="md"',
    preview: (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[#d95322] text-white hover:bg-[#c24a1e]">Primary</button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700">Secondary</button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700">Outline</button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-100">Ghost</button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white">Danger</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-400 cursor-not-allowed" disabled>Disabled</button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[#d95322] text-white flex items-center gap-1"><Icon name="plus" size={14} /> With Icon</button>
        </div>
      </div>
    ),
    props: [
      { name: "variant", type: "enum", required: false, default: '"primary"', description: "Visual style", enumValues: ["primary", "secondary", "outline", "ghost", "danger"] },
      { name: "size", type: "enum", required: false, default: '"md"', description: "Size", enumValues: ["sm", "md", "lg"] },
      { name: "disabled", type: "boolean", required: false, default: "false", description: "Disabled state" },
      { name: "loading", type: "boolean", required: false, default: "false", description: "Loading spinner" },
      { name: "type", type: "enum", required: false, default: '"button"', description: "HTML type", enumValues: ["button", "submit", "reset"] },
    ],
    cssTokens: [
      { token: "--st-button-primary-bg", defaultValue: "#1976d2", crmOverride: "#d95322", description: "Primary bg" },
      { token: "--st-button-primary-hover", defaultValue: "#1565c0", crmOverride: "#c24a1e", description: "Primary hover" },
      { token: "--st-button-border-radius", defaultValue: "4px", crmOverride: "8px", description: "Border radius" },
      { token: "--st-button-font-weight", defaultValue: "500", description: "Font weight" },
    ],
    playground: [
      { name: "variant", type: "select", default: "primary", label: "Variant", options: ["primary", "secondary", "outline", "ghost", "danger"] },
      { name: "size", type: "select", default: "md", label: "Size", options: ["sm", "md", "lg"] },
      { name: "disabled", type: "boolean", default: false, label: "Disabled" },
      { name: "loading", type: "boolean", default: false, label: "Loading" },
    ],
    codeExamples: [
      { title: "Variants", code: `<Button variant="primary">Save</Button>\n<Button variant="secondary">Cancel</Button>\n<Button variant="outline">Export</Button>\n<Button variant="ghost">Skip</Button>\n<Button variant="danger">Delete</Button>` },
      { title: "With Icon", code: `<Button variant="primary">\n  <Icon name="plus" size={14} /> Create\n</Button>` },
    ],
    events: [{ name: "onClick", signature: "(e: MouseEvent) => void", description: "Click handler" }],
    slots: [{ name: "children", type: "ReactNode", description: "Button content (text + icons)" }],
    apiNotes: "Size defaults to 'md' (set in wrapper). Ref forwarded. All HTML button attributes forwarded.",
  },
  {
    name: "SmartButton", wraps: "SmartButton", wrapperFile: "src/components/ui/SmartButton.tsx", category: "Buttons",
    description: "Enhanced button with auto-loading and confirmation support.",
    preview: <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[#d95322] text-white">Smart Action</button>,
    props: [{ name: "label", type: "string", required: false, description: "Button text" }, { name: "confirmMessage", type: "string", required: false, description: "Confirmation message" }],
    cssTokens: [], playground: [{ name: "label", type: "text", default: "Delete", label: "Label" }],
    codeExamples: [{ title: "Basic", code: `<SmartButton label="Delete" confirmMessage="Are you sure?" onClick={handleDelete} />` }],
    events: [{ name: "onClick", signature: "(e: MouseEvent) => void | Promise<void>", description: "Click (auto-loading for async)" }], slots: [],
  },
  {
    name: "ButtonControl", wraps: "AICButtonControl", wrapperFile: "src/components/ui/ButtonControl.tsx", category: "Buttons",
    description: "Button-styled control for form actions.",
    preview: <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700">Control</button>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }],
    cssTokens: [], playground: [{ name: "label", type: "text", default: "Action", label: "Label" }],
    codeExamples: [{ title: "Basic", code: `<ButtonControl label="Add Row" onClick={addRow} />` }],
    events: [{ name: "onClick", signature: "(e: MouseEvent) => void", description: "Click" }], slots: [],
  },
  {
    name: "DialogButton", wraps: "AICDialogButton", wrapperFile: "src/components/ui/DialogButton.tsx", category: "Buttons",
    description: "Button that triggers a dialog/modal on click.",
    preview: <button className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white">Open Dialog</button>,
    props: [{ name: "label", type: "string", required: false, description: "Button text" }, { name: "dialogTitle", type: "string", required: false, description: "Dialog title" }],
    cssTokens: [], playground: [{ name: "label", type: "text", default: "Open", label: "Label" }],
    codeExamples: [{ title: "Basic", code: `<DialogButton label="Details">\n  <p>Dialog content here</p>\n</DialogButton>` }],
    events: [{ name: "onClick", signature: "(e: MouseEvent) => void", description: "Click" }], slots: [{ name: "children", type: "ReactNode", description: "Dialog content" }],
  },
];

export function ButtonsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {DEFS.map((def) => <ComponentCard key={def.name} def={def} fullWidth={def.name === "Button"} />)}
    </div>
  );
}
