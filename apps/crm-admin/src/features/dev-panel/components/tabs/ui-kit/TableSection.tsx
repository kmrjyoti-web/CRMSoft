"use client";

import { Icon } from "@/components/ui";

import { ComponentCard } from "./ComponentCard";

import type { ComponentDef } from "./types";

const DEFS: ComponentDef[] = [
  {
    name: "TableFull", wraps: "AICTableFull", wrapperFile: "src/components/ui/TableFull.tsx", category: "Table",
    description: "Universal data table with 10 view modes (table/list/card/calendar/map/bi/timeline/chart/tree/kanban), filter sidebar, column chooser, density, global search, validation, and create button.",
    preview: (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2"><span className="font-semibold text-sm">Contacts</span><div className="flex gap-0.5 bg-gray-100 p-0.5 rounded text-xs">{["T", "L", "C", "📅", "🗺", "BI", "⏱", "📊", "🌲", "K"].map(v => <span key={v} className="px-1.5 py-0.5 rounded bg-white text-gray-600">{v}</span>)}</div></div>
          <button className="px-3 py-1 text-xs bg-[#d95322] text-white rounded">Create</button>
        </div>
        <table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b"><th className="px-3 py-1.5 text-left">Name</th><th className="px-3 py-1.5 text-left">Email</th><th className="px-3 py-1.5 text-left">Status</th></tr></thead><tbody><tr className="border-b"><td className="px-3 py-1.5">Vikram S.</td><td className="px-3 py-1.5">vikram@test.com</td><td className="px-3 py-1.5"><span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px]">Active</span></td></tr></tbody></table>
      </div>
    ),
    props: [
      { name: "data", type: "array", required: true, description: "Flat Record<string, any>[] array" },
      { name: "title", type: "string", required: false, default: '"Contacts"', description: "Header title" },
      { name: "columns", type: "array", required: false, description: "ColumnDef[] — { id, label, visible }" },
      { name: "defaultViewMode", type: "enum", required: false, default: '"table"', description: "Initial view", enumValues: ["table", "list", "card", "calendar", "map", "bi", "timeline", "chart", "tree", "kanban"] },
      { name: "defaultDensity", type: "enum", required: false, default: '"comfortable"', description: "Row density", enumValues: ["comfortable", "cozy", "compact"] },
      { name: "filterConfig", type: "object", required: false, description: "TableFilterConfig for sidebar filters" },
    ],
    cssTokens: [],
    playground: [
      { name: "title", type: "text", default: "Contacts", label: "Title" },
      { name: "defaultViewMode", type: "select", default: "table", label: "View Mode", options: ["table", "list", "card", "calendar", "timeline", "tree", "kanban"] },
      { name: "defaultDensity", type: "select", default: "comfortable", label: "Density", options: ["comfortable", "cozy", "compact"] },
    ],
    codeExamples: [
      { title: "Basic", code: `import { TableFull } from "@/components/ui";\n\n<TableFull\n  data={contacts}\n  title="Contacts"\n  columns={[\n    { id: "name", label: "Name", visible: true },\n    { id: "email", label: "Email", visible: true },\n    { id: "status", label: "Status", visible: true },\n  ]}\n  onRowEdit={(row) => router.push(\`/contacts/\${row.id}\`)}\n  onCreate={() => router.push("/contacts/new")}\n/>` },
      { title: "With Filters", code: `<TableFull\n  data={data}\n  title="Leads"\n  filterConfig={{\n    sections: [{\n      title: "Status",\n      filters: [{\n        columnId: "status",\n        label: "Status",\n        filterType: "master",\n        queryParam: "status",\n        options: [{ value: "NEW", label: "New" }]\n      }]\n    }]\n  }}\n  onFilterChange={handleFilter}\n/>` },
    ],
    events: [
      { name: "onRowEdit", signature: "(row: any) => void", description: "Row edit clicked" },
      { name: "onRowDelete", signature: "(row: any) => void", description: "Row delete clicked" },
      { name: "onCreate", signature: "() => void", description: "Create button clicked" },
      { name: "onFilterChange", signature: "(filters: FilterValues) => void", description: "Filters applied" },
    ],
    slots: [],
    apiNotes: "Data must be FLAT Record<string, any>[]. Flatten nested objects before passing.\nBackend list responses: { data: { data: [...], meta: {...} } }.\nFor tests: add global.ResizeObserver polyfill in beforeAll.",
  },
  {
    name: "Table", wraps: "AICTable", wrapperFile: "src/components/ui/Table.tsx", category: "Table",
    description: "Basic HTML table with CoreUI styling. Use TableFull for data pages.",
    preview: (
      <table className="w-full text-xs border border-gray-200 rounded"><thead><tr className="bg-gray-50"><th className="px-3 py-1.5 text-left border-b">Name</th><th className="px-3 py-1.5 text-left border-b">Value</th></tr></thead><tbody><tr className="border-b hover:bg-gray-50"><td className="px-3 py-1.5">Item 1</td><td className="px-3 py-1.5">100</td></tr></tbody></table>
    ),
    props: [{ name: "hoverable", type: "boolean", required: false, default: "true", description: "Row hover effect" }, { name: "loading", type: "boolean", required: false, default: "false", description: "Loading state" }, { name: "sortable", type: "boolean", required: false, default: "false", description: "Enable sorting" }],
    cssTokens: [{ token: "--st-table-header-bg", defaultValue: "#f9fafb", description: "Header background" }],
    playground: [{ name: "hoverable", type: "boolean", default: true, label: "Hoverable" }, { name: "loading", type: "boolean", default: false, label: "Loading" }],
    codeExamples: [{ title: "Basic", code: `<Table hoverable>\n  <thead><tr><th>Name</th><th>Email</th></tr></thead>\n  <tbody>{data.map(r => <tr key={r.id}><td>{r.name}</td><td>{r.email}</td></tr>)}</tbody>\n</Table>` }],
    events: [{ name: "onRowClick", signature: "(row: any) => void", description: "Row clicked" }],
    slots: [{ name: "children", type: "thead + tbody", description: "Standard HTML table elements" }],
  },
];

export function TableSection() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {DEFS.map((def) => <ComponentCard key={def.name} def={def} fullWidth />)}
    </div>
  );
}
