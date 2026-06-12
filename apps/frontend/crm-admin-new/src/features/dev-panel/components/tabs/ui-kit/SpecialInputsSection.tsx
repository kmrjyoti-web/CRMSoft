"use client";

import { Icon } from "@/components/ui";

import { ComponentCard } from "./ComponentCard";

import type { ComponentDef } from "./types";

const DEFS: ComponentDef[] = [
  {
    name: "Rating", wraps: "AICRating", wrapperFile: "src/components/ui/Rating.tsx", category: "Special Inputs",
    description: "Star rating component with half-star support.",
    preview: <div className="flex gap-1">{[1, 2, 3, 4, 5].map(i => <Icon key={i} name="star" size={20} className={i <= 3 ? "text-yellow-400" : "text-gray-300"} />)}</div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "value", type: "number", required: false, description: "Rating value" }, { name: "max", type: "number", required: false, default: "5", description: "Max stars" }, { name: "readOnly", type: "boolean", required: false, default: "false", description: "Read-only" }],
    cssTokens: [{ token: "--st-rating-color", defaultValue: "#fbbf24", description: "Star fill color" }],
    playground: [{ name: "max", type: "number", default: 5, label: "Max Stars" }, { name: "readOnly", type: "boolean", default: false, label: "Read Only" }],
    codeExamples: [{ title: "Basic", code: `<Rating label="Quality" value={rating} onChange={setRating} max={5} />` }],
    events: [{ name: "onChange", signature: "(value: number) => void", description: "Rating changed" }], slots: [],
  },
  {
    name: "Slider", wraps: "AICSlider", wrapperFile: "src/components/ui/Slider.tsx", category: "Special Inputs",
    description: "Range slider with min/max and step support.",
    preview: <div className="max-w-md"><div className="h-1.5 bg-gray-200 rounded-full relative"><div className="h-1.5 bg-[#d95322] rounded-full w-[60%]" /><div className="w-4 h-4 bg-[#d95322] rounded-full absolute top-1/2 -translate-y-1/2 left-[60%] -translate-x-1/2 shadow" /></div></div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "value", type: "number", required: false, description: "Value" }, { name: "min", type: "number", required: false, default: "0", description: "Minimum" }, { name: "max", type: "number", required: false, default: "100", description: "Maximum" }, { name: "step", type: "number", required: false, default: "1", description: "Step" }],
    cssTokens: [{ token: "--st-slider-track-color", defaultValue: "#1976d2", crmOverride: "#d95322", description: "Track color" }],
    playground: [{ name: "min", type: "number", default: 0, label: "Min" }, { name: "max", type: "number", default: 100, label: "Max" }, { name: "step", type: "number", default: 1, label: "Step" }],
    codeExamples: [{ title: "Basic", code: `<Slider label="Volume" value={vol} onChange={setVol} min={0} max={100} />` }],
    events: [{ name: "onChange", signature: "(value: number) => void", description: "Value changed" }], slots: [],
  },
  {
    name: "ColorPicker", wraps: "AICColorPicker", wrapperFile: "src/components/ui/ColorPicker.tsx", category: "Special Inputs",
    description: "Color picker with hex/rgb support.",
    preview: <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg border border-gray-200" style={{ backgroundColor: "#d95322" }} /><span className="text-sm font-mono text-gray-600">#d95322</span></div>,
    props: [{ name: "value", type: "string", required: false, description: "Color value" }, { name: "format", type: "enum", required: false, default: '"hex"', description: "Format", enumValues: ["hex", "rgb"] }],
    cssTokens: [], playground: [{ name: "format", type: "select", default: "hex", label: "Format", options: ["hex", "rgb"] }],
    codeExamples: [{ title: "Basic", code: `<ColorPicker value={color} onChange={setColor} />` }],
    events: [{ name: "onChange", signature: "(value: string) => void", description: "Color changed" }], slots: [],
  },
  {
    name: "FileUpload", wraps: "AICFileUpload", wrapperFile: "src/components/ui/FileUpload.tsx", category: "Special Inputs",
    description: "File upload with drag-and-drop, preview, and progress.",
    preview: <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"><Icon name="upload" size={24} className="mx-auto mb-2 text-gray-400" /><p className="text-sm text-gray-500">Drop files here or click to upload</p></div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "accept", type: "string", required: false, description: "Accepted file types" }, { name: "multiple", type: "boolean", required: false, default: "false", description: "Multiple files" }, { name: "maxSize", type: "number", required: false, description: "Max file size (bytes)" }],
    cssTokens: [{ token: "--st-fileupload-border-color", defaultValue: "#ccc", description: "Border color" }],
    playground: [{ name: "label", type: "text", default: "Documents", label: "Label" }, { name: "multiple", type: "boolean", default: false, label: "Multiple" }, { name: "accept", type: "text", default: ".pdf,.doc,.docx", label: "Accept" }],
    codeExamples: [{ title: "Basic", code: `<FileUpload label="Documents" accept=".pdf,.doc" multiple onChange={setFiles} />` }],
    events: [{ name: "onChange", signature: "(files: File[]) => void", description: "Files selected" }, { name: "onRemove", signature: "(file: File) => void", description: "File removed" }], slots: [],
  },
  {
    name: "Signature", wraps: "AICSignature", wrapperFile: "src/components/ui/Signature.tsx", category: "Special Inputs",
    description: "Signature pad for capturing handwritten signatures.",
    preview: <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 text-center"><p className="text-sm text-gray-400 italic">Signature pad area</p></div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "width", type: "number", required: false, default: "400", description: "Canvas width" }, { name: "height", type: "number", required: false, default: "200", description: "Canvas height" }],
    cssTokens: [], playground: [{ name: "label", type: "text", default: "Your Signature", label: "Label" }, { name: "width", type: "number", default: 400, label: "Width" }, { name: "height", type: "number", default: 200, label: "Height" }],
    codeExamples: [{ title: "Basic", code: `<Signature label="Sign Here" onChange={setSignature} onClear={handleClear} />` }],
    events: [{ name: "onChange", signature: "(dataUrl: string) => void", description: "Signature changed" }, { name: "onClear", signature: "() => void", description: "Pad cleared" }], slots: [],
  },
  {
    name: "RichTextEditor", wraps: "AICRichTextEditor", wrapperFile: "src/components/ui/RichTextEditor.tsx", category: "Special Inputs",
    description: "WYSIWYG rich text editor with toolbar formatting.",
    preview: <div className="border border-gray-300 rounded-lg overflow-hidden"><div className="flex gap-1 px-2 py-1 bg-gray-50 border-b border-gray-200"><Icon name="bold" size={14} className="text-gray-500" /><Icon name="italic" size={14} className="text-gray-500" /><Icon name="underline" size={14} className="text-gray-500" /></div><div className="px-3 py-2 text-sm text-gray-500 min-h-[60px]">Type rich content here...</div></div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "value", type: "string", required: false, description: "HTML content" }, { name: "placeholder", type: "string", required: false, description: "Placeholder" }],
    cssTokens: [{ token: "--st-rte-border-color", defaultValue: "#ccc", description: "Border color" }, { token: "--st-rte-toolbar-bg", defaultValue: "#f9fafb", description: "Toolbar background" }],
    playground: [{ name: "label", type: "text", default: "Description", label: "Label" }, { name: "placeholder", type: "text", default: "Enter content...", label: "Placeholder" }],
    codeExamples: [{ title: "Basic", code: `<RichTextEditor\n  label="Description"\n  value={html}\n  onChange={setHtml}\n/>` }],
    events: [{ name: "onChange", signature: "(html: string) => void", description: "HTML content changed" }], slots: [],
    apiNotes: "onChange returns HTML string. Use DOMPurify for sanitization before saving.",
  },
];

export function SpecialInputsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {DEFS.map((def) => <ComponentCard key={def.name} def={def} fullWidth={def.name === "RichTextEditor"} />)}
    </div>
  );
}
