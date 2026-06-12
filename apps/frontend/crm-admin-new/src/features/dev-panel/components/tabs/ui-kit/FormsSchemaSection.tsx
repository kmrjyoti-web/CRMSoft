"use client";

import { ComponentCard } from "./ComponentCard";

import type { ComponentDef } from "./types";

const DEFS: ComponentDef[] = [
  {
    name: "DynamicField", wraps: "AICDynamicField", wrapperFile: "src/components/ui/DynamicField.tsx", category: "Forms",
    description: "Renders a single form field from a JSON schema definition.",
    preview: <div className="space-y-2 max-w-sm"><div className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">Dynamic field from schema</div><div className="text-xs text-gray-400">Type: text | number | date | select | ...</div></div>,
    props: [{ name: "schema", type: "object", required: true, description: "Field schema definition" }, { name: "value", type: "string", required: false, description: "Field value" }],
    cssTokens: [], playground: [],
    codeExamples: [{ title: "Basic", code: `<DynamicField\n  schema={{ type: "text", label: "Name", required: true }}\n  value={value}\n  onChange={setValue}\n/>` }],
    events: [{ name: "onChange", signature: "(value: any) => void", description: "Value changed" }], slots: [],
  },
  {
    name: "DynamicForm", wraps: "AICDynamicForm", wrapperFile: "src/components/ui/DynamicForm.tsx", category: "Forms",
    description: "Renders a complete form from a JSON schema array.",
    preview: <div className="border border-gray-200 rounded-lg p-4 max-w-sm"><div className="space-y-3"><div className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-500">Field 1</div><div className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-500">Field 2</div><button className="px-4 py-2 text-sm bg-[#d95322] text-white rounded-lg w-full">Submit</button></div></div>,
    props: [{ name: "schema", type: "array", required: true, description: "Array of field schemas" }, { name: "values", type: "object", required: false, description: "Form values" }],
    cssTokens: [], playground: [],
    codeExamples: [{ title: "Basic", code: `<DynamicForm\n  schema={[\n    { type: "text", name: "firstName", label: "First Name", required: true },\n    { type: "email", name: "email", label: "Email" },\n    { type: "select", name: "country", label: "Country", options: [...] },\n  ]}\n  onSubmit={handleSubmit}\n/>` }],
    events: [{ name: "onSubmit", signature: "(values: Record<string, any>) => void", description: "Form submitted" }], slots: [],
  },
  {
    name: "SchemaBuilder", wraps: "SchemaBuilder", wrapperFile: "src/components/ui/SchemaBuilder.tsx", category: "Forms",
    description: "Visual drag-and-drop form schema builder.",
    preview: <div className="border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500">Visual form builder — drag fields to create schemas</div>,
    props: [{ name: "schema", type: "array", required: false, description: "Initial schema" }],
    cssTokens: [], playground: [],
    codeExamples: [{ title: "Basic", code: `<SchemaBuilder schema={schema} onChange={setSchema} />` }],
    events: [{ name: "onChange", signature: "(schema: FieldDef[]) => void", description: "Schema modified" }], slots: [],
  },
  {
    name: "Fieldset", wraps: "AICFieldset", wrapperFile: "src/components/ui/Fieldset.tsx", category: "Forms",
    description: "Collapsible fieldset for grouping form fields.",
    preview: <div className="border border-gray-200 rounded-lg"><div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 cursor-pointer"><span className="font-medium text-sm">Personal Details</span><span className="text-gray-400 text-xs">▼</span></div><div className="px-4 py-3 text-sm text-gray-500">Form fields inside...</div></div>,
    props: [{ name: "label", type: "string", required: true, description: "Section label" }, { name: "collapsible", type: "boolean", required: false, default: "true", description: "Can collapse" }, { name: "defaultOpen", type: "boolean", required: false, default: "true", description: "Initially open" }],
    cssTokens: [{ token: "--st-fieldset-border-color", defaultValue: "#e5e7eb", description: "Border color" }],
    playground: [{ name: "label", type: "text", default: "Personal Details", label: "Label" }, { name: "collapsible", type: "boolean", default: true, label: "Collapsible" }],
    codeExamples: [{ title: "Basic", code: `<Fieldset label="Personal Details" collapsible>\n  <Input label="First Name" />\n  <Input label="Last Name" />\n</Fieldset>` }],
    events: [{ name: "onToggle", signature: "(isOpen: boolean) => void", description: "Expand/collapse" }],
    slots: [{ name: "children", type: "ReactNode", description: "Form fields" }],
  },
];

export function FormsSchemaSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {DEFS.map((def) => <ComponentCard key={def.name} def={def} />)}
    </div>
  );
}
