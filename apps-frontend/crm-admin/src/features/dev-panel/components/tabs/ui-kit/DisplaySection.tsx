"use client";

import { Icon } from "@/components/ui";

import { ComponentCard } from "./ComponentCard";

import type { ComponentDef } from "./types";

const DEFS: ComponentDef[] = [
  {
    name: "Badge", wraps: "AICBadge", wrapperFile: "src/components/ui/Badge.tsx", category: "Display",
    description: "Status/label badge with color variants.",
    preview: (
      <div className="flex flex-wrap gap-2">
        <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">Default</span>
        <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Primary</span>
        <span className="bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Secondary</span>
        <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Success</span>
        <span className="bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Warning</span>
        <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Danger</span>
        <span className="border border-gray-300 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">Outline</span>
      </div>
    ),
    props: [{ name: "variant", type: "enum", required: false, default: '"default"', description: "Color variant", enumValues: ["default", "primary", "secondary", "success", "warning", "danger", "outline"] }, { name: "size", type: "enum", required: false, default: '"md"', description: "Size", enumValues: ["sm", "md", "lg"] }],
    cssTokens: [{ token: "--st-badge-border-radius", defaultValue: "9999px", description: "Radius (pill shape)" }, { token: "--st-badge-font-size", defaultValue: "12px", description: "Text size" }],
    playground: [{ name: "variant", type: "select", default: "default", label: "Variant", options: ["default", "primary", "secondary", "success", "warning", "danger", "outline"] }, { name: "size", type: "select", default: "md", label: "Size", options: ["sm", "md", "lg"] }],
    codeExamples: [{ title: "Basic", code: `<Badge variant="success">Active</Badge>\n<Badge variant="danger">Overdue</Badge>\n<Badge variant="warning">Pending</Badge>` }],
    events: [], slots: [{ name: "children", type: "ReactNode", description: "Badge text" }],
  },
  {
    name: "Avatar", wraps: "AICAvatar", wrapperFile: "src/components/ui/Avatar.tsx", category: "Display",
    description: "User avatar with image, initials fallback, and group support.",
    preview: (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">VS</div>
        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">MK</div>
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">RJ</div>
        <div className="flex -space-x-2">
          {["bg-blue-200", "bg-green-200", "bg-red-200"].map((c, i) => <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center text-xs font-bold`}>{String.fromCharCode(65 + i)}</div>)}
          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">+3</div>
        </div>
      </div>
    ),
    props: [{ name: "name", type: "string", required: false, description: "Name for initials fallback" }, { name: "src", type: "string", required: false, description: "Image URL" }, { name: "size", type: "enum", required: false, default: '"md"', description: "Size", enumValues: ["sm", "md", "lg", "xl"] }],
    cssTokens: [{ token: "--st-avatar-size-md", defaultValue: "40px", description: "Medium size" }],
    playground: [{ name: "name", type: "text", default: "Vikram Sharma", label: "Name" }, { name: "size", type: "select", default: "md", label: "Size", options: ["sm", "md", "lg", "xl"] }],
    codeExamples: [{ title: "Basic", code: `<Avatar name="Vikram Sharma" />\n<Avatar src="/photo.jpg" />\n\n{/* Group */}\n<AvatarGroup max={3}>\n  <Avatar name="User 1" />\n  <Avatar name="User 2" />\n  <Avatar name="User 3" />\n</AvatarGroup>` }],
    events: [{ name: "onClick", signature: "(e: MouseEvent) => void", description: "Click" }], slots: [],
  },
  {
    name: "Typography", wraps: "AICTypography", wrapperFile: "src/components/ui/Typography.tsx", category: "Display",
    description: "Styled text component with variant presets.",
    preview: (
      <div className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">Heading 1</div>
        <div className="text-xl font-semibold text-gray-800">Heading 2</div>
        <div className="text-base text-gray-700">Body text — The quick brown fox jumps over the lazy dog.</div>
        <div className="text-sm text-gray-500">Caption text — Secondary information</div>
      </div>
    ),
    props: [{ name: "variant", type: "enum", required: false, default: '"body1"', description: "Text preset", enumValues: ["h1", "h2", "h3", "h4", "body1", "body2", "caption", "overline"] }, { name: "color", type: "string", required: false, description: "Text color" }, { name: "weight", type: "enum", required: false, description: "Font weight", enumValues: ["normal", "medium", "semibold", "bold"] }],
    cssTokens: [{ token: "--st-typography-h1-size", defaultValue: "2rem", description: "H1 font size" }],
    playground: [{ name: "variant", type: "select", default: "body1", label: "Variant", options: ["h1", "h2", "h3", "h4", "body1", "body2", "caption", "overline"] }, { name: "weight", type: "select", default: "normal", label: "Weight", options: ["normal", "medium", "semibold", "bold"] }],
    codeExamples: [{ title: "Basic", code: `<Typography variant="h2">Section Title</Typography>\n<Typography variant="body1">Paragraph text here.</Typography>\n<Typography variant="caption" color="textSecondary">Hint text</Typography>` }],
    events: [], slots: [{ name: "children", type: "ReactNode", description: "Text content" }],
  },
  {
    name: "SyncIndicator", wraps: "AICSyncIndicator", wrapperFile: "src/components/ui/SyncIndicator.tsx", category: "Display",
    description: "Shows data sync status (synced/syncing/error).",
    preview: (
      <div className="flex gap-4">
        <div className="flex items-center gap-1 text-sm text-green-600"><Icon name="check-circle" size={14} /> Synced</div>
        <div className="flex items-center gap-1 text-sm text-blue-600"><Icon name="loader" size={14} className="animate-spin" /> Syncing</div>
        <div className="flex items-center gap-1 text-sm text-red-600"><Icon name="alert-circle" size={14} /> Error</div>
      </div>
    ),
    props: [{ name: "status", type: "enum", required: true, description: "Sync status", enumValues: ["synced", "syncing", "error"] }],
    cssTokens: [], playground: [{ name: "status", type: "select", default: "synced", label: "Status", options: ["synced", "syncing", "error"] }],
    codeExamples: [{ title: "Basic", code: `<SyncIndicator status={isSaving ? "syncing" : "synced"} />` }],
    events: [], slots: [],
  },
  {
    name: "SmartError", wraps: "ErrorBoundary / ErrorDashboard", wrapperFile: "src/components/ui/SmartError.tsx", category: "Display",
    description: "Error boundary + error dashboard for graceful error handling.",
    preview: <div className="border border-red-200 bg-red-50 rounded-lg p-4"><div className="flex items-center gap-2 text-red-600 text-sm font-medium"><Icon name="alert-circle" size={16} /> Something went wrong</div><p className="text-xs text-red-500 mt-1">An unexpected error occurred.</p><button className="mt-2 px-3 py-1 text-xs bg-red-600 text-white rounded">Retry</button></div>,
    props: [{ name: "fallback", type: "ReactNode", required: false, description: "Custom fallback UI" }],
    cssTokens: [], playground: [],
    codeExamples: [{ title: "Error Boundary", code: `<ErrorBoundary fallback={<p>Error!</p>}>\n  <MyComponent />\n</ErrorBoundary>` }, { title: "Error Dashboard", code: `<ErrorDashboard\n  message="Failed to load contacts"\n  onRetry={handleRetry}\n/>` }],
    events: [{ name: "onRetry", signature: "() => void", description: "Retry action" }],
    slots: [{ name: "children", type: "ReactNode", description: "Protected content (ErrorBoundary)" }, { name: "fallback", type: "ReactNode", description: "Error fallback UI" }],
  },
];

export function DisplaySection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {DEFS.map((def) => <ComponentCard key={def.name} def={def} fullWidth={def.name === "Badge"} />)}
    </div>
  );
}
