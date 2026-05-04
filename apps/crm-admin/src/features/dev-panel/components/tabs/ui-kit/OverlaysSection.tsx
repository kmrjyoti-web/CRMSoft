"use client";

import { Icon } from "@/components/ui";

import { ComponentCard } from "./ComponentCard";

import type { ComponentDef } from "./types";

const DEFS: ComponentDef[] = [
  {
    name: "Modal", wraps: "AICModal", wrapperFile: "src/components/ui/Modal.tsx", category: "Overlays",
    description: "Centered modal dialog with backdrop, title, and close button.",
    preview: <div className="border border-gray-200 rounded-lg shadow-lg max-w-sm"><div className="flex items-center justify-between px-4 py-3 border-b border-gray-200"><span className="font-semibold text-sm">Modal Title</span><Icon name="x" size={16} className="text-gray-400" /></div><div className="px-4 py-3 text-sm text-gray-600">Modal content goes here...</div><div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200"><button className="px-3 py-1.5 text-xs border border-gray-300 rounded">Cancel</button><button className="px-3 py-1.5 text-xs bg-[#d95322] text-white rounded">Save</button></div></div>,
    props: [{ name: "isOpen", type: "boolean", required: true, description: "Open state" }, { name: "title", type: "string", required: false, description: "Header title" }, { name: "size", type: "enum", required: false, default: '"md"', description: "Size", enumValues: ["sm", "md", "lg", "xl"] }, { name: "closeOnOverlay", type: "boolean", required: false, default: "true", description: "Close on backdrop click" }],
    cssTokens: [{ token: "--st-modal-border-radius", defaultValue: "8px", description: "Border radius" }, { token: "--st-modal-backdrop-bg", defaultValue: "rgba(0,0,0,0.5)", description: "Backdrop" }],
    playground: [{ name: "title", type: "text", default: "Edit Contact", label: "Title" }, { name: "size", type: "select", default: "md", label: "Size", options: ["sm", "md", "lg", "xl"] }, { name: "closeOnOverlay", type: "boolean", default: true, label: "Close on Overlay" }],
    codeExamples: [{ title: "Basic", code: `<Modal isOpen={open} onClose={() => setOpen(false)} title="Edit">\n  <p>Content here</p>\n</Modal>` }],
    events: [{ name: "onClose", signature: "() => void", description: "Close requested" }],
    slots: [{ name: "children", type: "ReactNode", description: "Modal body content" }],
  },
  {
    name: "Drawer", wraps: "AICDrawer", wrapperFile: "src/components/ui/Drawer.tsx", category: "Overlays",
    description: "Slide-out panel from left/right edge.",
    preview: <div className="border border-gray-200 rounded-lg shadow-lg max-w-xs"><div className="flex items-center justify-between px-4 py-3 border-b border-gray-200"><span className="font-semibold text-sm">Drawer Title</span><Icon name="x" size={16} className="text-gray-400" /></div><div className="px-4 py-3 text-sm text-gray-600">Side panel content...</div></div>,
    props: [{ name: "isOpen", type: "boolean", required: true, description: "Open state" }, { name: "title", type: "string", required: false, description: "Title" }, { name: "position", type: "enum", required: false, default: '"right"', description: "Position", enumValues: ["left", "right"] }, { name: "size", type: "enum", required: false, default: '"md"', description: "Width", enumValues: ["sm", "md", "lg", "xl"] }],
    cssTokens: [{ token: "--st-drawer-width-md", defaultValue: "400px", description: "Medium width" }],
    playground: [{ name: "title", type: "text", default: "Details", label: "Title" }, { name: "position", type: "select", default: "right", label: "Position", options: ["left", "right"] }, { name: "size", type: "select", default: "md", label: "Size", options: ["sm", "md", "lg", "xl"] }],
    codeExamples: [{ title: "Basic", code: `<Drawer isOpen={open} onClose={() => setOpen(false)} title="Details" position="right">\n  <ContactDetail id={contactId} />\n</Drawer>` }],
    events: [{ name: "onClose", signature: "() => void", description: "Close requested" }],
    slots: [{ name: "children", type: "ReactNode", description: "Drawer content" }],
  },
  {
    name: "SmartDialog", wraps: "SmartDialog", wrapperFile: "src/components/ui/SmartDialog.tsx", category: "Overlays",
    description: "Enhanced dialog with built-in form handling.",
    preview: <div className="border border-gray-200 rounded-lg p-4 max-w-sm text-sm text-gray-500">Smart Dialog (auto form + validation)</div>,
    props: [{ name: "isOpen", type: "boolean", required: true, description: "Open state" }, { name: "title", type: "string", required: false, description: "Title" }],
    cssTokens: [], playground: [{ name: "title", type: "text", default: "Quick Edit", label: "Title" }],
    codeExamples: [{ title: "Basic", code: `<SmartDialog isOpen={open} onClose={() => setOpen(false)} title="Edit">\n  <Input label="Name" />\n</SmartDialog>` }],
    events: [{ name: "onClose", signature: "() => void", description: "Close" }], slots: [{ name: "children", type: "ReactNode", description: "Content" }],
  },
  {
    name: "SmartDrawer", wraps: "SmartDrawer", wrapperFile: "src/components/ui/SmartDrawer.tsx", category: "Overlays",
    description: "Enhanced drawer with built-in form handling.",
    preview: <div className="border border-gray-200 rounded-lg p-4 max-w-sm text-sm text-gray-500">Smart Drawer (auto form)</div>,
    props: [{ name: "isOpen", type: "boolean", required: true, description: "Open state" }, { name: "title", type: "string", required: false, description: "Title" }],
    cssTokens: [], playground: [{ name: "title", type: "text", default: "Edit Record", label: "Title" }],
    codeExamples: [{ title: "Basic", code: `<SmartDrawer isOpen={open} onClose={() => setOpen(false)} title="Edit">\n  <Input label="Name" />\n</SmartDrawer>` }],
    events: [{ name: "onClose", signature: "() => void", description: "Close" }], slots: [{ name: "children", type: "ReactNode", description: "Content" }],
  },
  {
    name: "ConfirmDialog", wraps: "AICConfirmDialog", wrapperFile: "src/components/ui/ConfirmDialog.tsx", category: "Overlays",
    description: "Confirmation dialog with confirm/cancel buttons.",
    preview: <div className="border border-gray-200 rounded-lg shadow-lg max-w-sm p-4"><p className="font-semibold text-sm mb-2">Are you sure?</p><p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p><div className="flex justify-end gap-2"><button className="px-3 py-1.5 text-xs border border-gray-300 rounded">Cancel</button><button className="px-3 py-1.5 text-xs bg-red-600 text-white rounded">Delete</button></div></div>,
    props: [{ name: "isOpen", type: "boolean", required: true, description: "Open state" }, { name: "title", type: "string", required: false, description: "Title" }, { name: "message", type: "string", required: false, description: "Message" }, { name: "confirmLabel", type: "string", required: false, default: '"Confirm"', description: "Confirm button text" }, { name: "dangerMode", type: "boolean", required: false, default: "false", description: "Red confirm button" }],
    cssTokens: [], playground: [{ name: "title", type: "text", default: "Delete Contact?", label: "Title" }, { name: "message", type: "text", default: "This cannot be undone.", label: "Message" }, { name: "dangerMode", type: "boolean", default: true, label: "Danger Mode" }],
    codeExamples: [{ title: "Basic", code: `<ConfirmDialog\n  isOpen={open}\n  title="Delete?"\n  message="This cannot be undone."\n  dangerMode\n  onConfirm={handleDelete}\n  onCancel={() => setOpen(false)}\n/>` }],
    events: [{ name: "onConfirm", signature: "() => void", description: "Confirmed" }, { name: "onCancel", signature: "() => void", description: "Cancelled" }], slots: [],
  },
  {
    name: "Popover", wraps: "AICPopover", wrapperFile: "src/components/ui/Popover.tsx", category: "Overlays",
    description: "Popover overlay anchored to a trigger element.",
    preview: <div className="inline-block"><button className="px-3 py-1.5 text-sm border border-gray-300 rounded">Hover me</button><div className="mt-2 border border-gray-200 rounded-lg shadow-lg p-3 text-sm max-w-xs bg-white">Popover content</div></div>,
    props: [{ name: "placement", type: "enum", required: false, default: '"bottom"', description: "Position", enumValues: ["top", "bottom", "left", "right"] }, { name: "trigger", type: "enum", required: false, default: '"click"', description: "Trigger", enumValues: ["hover", "click"] }],
    cssTokens: [{ token: "--st-popover-border-radius", defaultValue: "8px", description: "Border radius" }],
    playground: [{ name: "placement", type: "select", default: "bottom", label: "Placement", options: ["top", "bottom", "left", "right"] }, { name: "trigger", type: "select", default: "click", label: "Trigger", options: ["hover", "click"] }],
    codeExamples: [{ title: "Basic", code: `<Popover content={<div>Info here</div>} placement="top">\n  <Button>Show Info</Button>\n</Popover>` }],
    events: [{ name: "onOpen", signature: "() => void", description: "Opened" }, { name: "onClose", signature: "() => void", description: "Closed" }],
    slots: [{ name: "children", type: "ReactNode", description: "Trigger element" }, { name: "content", type: "ReactNode", description: "Popover body" }],
  },
  {
    name: "Tooltip", wraps: "AICTooltip", wrapperFile: "src/components/ui/Tooltip.tsx", category: "Overlays",
    description: "Hover tooltip for brief info.",
    preview: <div className="inline-block relative"><button className="px-3 py-1.5 text-sm border border-gray-300 rounded">Hover</button><div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">Tooltip text</div></div>,
    props: [{ name: "content", type: "string", required: true, description: "Tooltip text" }, { name: "placement", type: "enum", required: false, default: '"top"', description: "Position", enumValues: ["top", "bottom", "left", "right"] }],
    cssTokens: [{ token: "--st-tooltip-bg", defaultValue: "#333", description: "Background" }],
    playground: [{ name: "content", type: "text", default: "Helpful tip", label: "Content" }, { name: "placement", type: "select", default: "top", label: "Placement", options: ["top", "bottom", "left", "right"] }],
    codeExamples: [{ title: "Basic", code: `<Tooltip content="Edit this record">\n  <Button variant="ghost"><Icon name="edit" size={14} /></Button>\n</Tooltip>` }],
    events: [], slots: [{ name: "children", type: "ReactNode", description: "Element to attach tooltip to" }],
  },
  {
    name: "Portal", wraps: "AICPortal", wrapperFile: "src/components/ui/Portal.tsx", category: "Overlays",
    description: "Renders children into document.body via React Portal.",
    preview: <div className="text-sm text-gray-500 italic">Portal renders children outside the DOM tree (into document.body)</div>,
    props: [],
    cssTokens: [], playground: [],
    codeExamples: [{ title: "Basic", code: `<Portal>\n  <div className="fixed bottom-4 right-4">Floating element</div>\n</Portal>` }],
    events: [], slots: [{ name: "children", type: "ReactNode", description: "Content to portal" }],
  },
  {
    name: "Toast", wraps: "AICToastProvider", wrapperFile: "src/components/ui/Toast.tsx", category: "Overlays",
    description: "Toast notification system (Provider + Container + useToast hook).",
    preview: <div className="space-y-2 max-w-sm">{[{ color: "bg-green-500", text: "Success toast" }, { color: "bg-red-500", text: "Error toast" }, { color: "bg-blue-500", text: "Info toast" }].map(t => <div key={t.text} className={`${t.color} text-white text-sm px-4 py-2.5 rounded-lg flex items-center gap-2`}><Icon name="check-circle" size={16} /> {t.text}</div>)}</div>,
    props: [{ name: "variant", type: "enum", required: false, description: "Style variant", enumValues: ["success", "error", "info", "warning"] }, { name: "position", type: "enum", required: false, default: '"top-right"', description: "Position", enumValues: ["top-right", "top-left", "bottom-right", "bottom-left"] }],
    cssTokens: [{ token: "--st-toast-border-radius", defaultValue: "8px", description: "Radius" }],
    playground: [{ name: "variant", type: "select", default: "success", label: "Variant", options: ["success", "error", "info", "warning"] }, { name: "position", type: "select", default: "top-right", label: "Position", options: ["top-right", "top-left", "bottom-right", "bottom-left"] }],
    codeExamples: [{ title: "Hook usage", code: `import { useToast } from "@/components/ui";\n\nconst toast = useToast();\ntoast.success("Contact saved!");\ntoast.error("Something went wrong");` }, { title: "Provider setup", code: `// In layout.tsx\nimport { ToastProvider, ToastContainer } from "@/components/ui";\n\n<ToastProvider>\n  {children}\n  <ToastContainer />\n</ToastProvider>` }],
    events: [{ name: "onClose", signature: "() => void", description: "Toast dismissed" }], slots: [],
    apiNotes: "Requires ToastProvider + ToastContainer in layout. Use useToast() hook to trigger toasts programmatically.",
  },
  {
    name: "SmartToast", wraps: "SmartToast", wrapperFile: "src/components/ui/SmartToast.tsx", category: "Overlays",
    description: "Enhanced toast wrapper with custom CRM styling.",
    preview: <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-2.5 rounded-lg max-w-sm">Smart toast notification</div>,
    props: [{ name: "variant", type: "enum", required: false, description: "Style", enumValues: ["success", "error", "info", "warning"] }],
    cssTokens: [], playground: [{ name: "variant", type: "select", default: "success", label: "Variant", options: ["success", "error", "info", "warning"] }],
    codeExamples: [{ title: "Basic", code: `<SmartToast variant="success">Saved successfully!</SmartToast>` }],
    events: [], slots: [{ name: "children", type: "ReactNode", description: "Toast content" }],
  },
];

export function OverlaysSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {DEFS.map((def) => <ComponentCard key={def.name} def={def} fullWidth={def.name === "Modal"} />)}
    </div>
  );
}
