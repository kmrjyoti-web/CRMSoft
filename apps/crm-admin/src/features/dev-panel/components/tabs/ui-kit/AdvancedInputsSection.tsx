"use client";

import { Icon } from "@/components/ui";

import { ComponentCard } from "./ComponentCard";

import type { ComponentDef } from "./types";

function mkDef(partial: Omit<ComponentDef, "category"> & { category?: string }): ComponentDef {
  return { category: "Advanced Inputs", ...partial };
}

const DEFS: ComponentDef[] = [
  mkDef({
    name: "SelectInput", wraps: "AICSelectInput", wrapperFile: "src/components/ui/SelectInput.tsx",
    description: "Searchable dropdown select with floating label. Most-used select in CRM forms.",
    preview: <div className="max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 flex items-center justify-between">Select country... <Icon name="chevron-down" size={14} /></div>,
    props: [
      { name: "label", type: "string", required: false, description: "Floating label" },
      { name: "options", type: "array", required: true, description: "Array of { value, label }" },
      { name: "value", type: "string", required: false, description: "Selected value" },
      { name: "searchable", type: "boolean", required: false, default: "true", description: "Enable search" },
      { name: "clearable", type: "boolean", required: false, default: "false", description: "Show clear button" },
      { name: "disabled", type: "boolean", required: false, default: "false", description: "Disabled" },
    ],
    cssTokens: [{ token: "--st-select-border-color", defaultValue: "#ccc", description: "Border" }, { token: "--st-select-border-radius", defaultValue: "4px", crmOverride: "8px", description: "Radius" }],
    playground: [{ name: "label", type: "text", default: "Country", label: "Label" }, { name: "searchable", type: "boolean", default: true, label: "Searchable" }, { name: "clearable", type: "boolean", default: false, label: "Clearable" }],
    codeExamples: [{ title: "Basic", code: `<SelectInput\n  label="Country"\n  options={[{ value: "IN", label: "India" }, { value: "US", label: "USA" }]}\n  value={country}\n  onChange={setCountry}\n/>` }],
    events: [{ name: "onChange", signature: "(value: string|number|boolean|null) => void", description: "Selection changed" }],
    slots: [], apiNotes: "onChange returns the VALUE, not the event. Use options array, not children.",
  }),
  mkDef({
    name: "MultiSelectInput", wraps: "AICMultiSelectInput", wrapperFile: "src/components/ui/MultiSelectInput.tsx",
    description: "Multi-select dropdown with chips for selected values.",
    preview: <div className="max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm flex gap-1"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">Tag 1</span><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">Tag 2</span></div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "options", type: "array", required: true, description: "Options array" }, { name: "value", type: "array", required: false, description: "Selected values" }, { name: "searchable", type: "boolean", required: false, default: "true", description: "Search" }],
    cssTokens: [], playground: [{ name: "label", type: "text", default: "Tags", label: "Label" }, { name: "searchable", type: "boolean", default: true, label: "Searchable" }],
    codeExamples: [{ title: "Basic", code: `<MultiSelectInput\n  label="Tags"\n  options={tagOptions}\n  value={selected}\n  onChange={setSelected}\n/>` }],
    events: [{ name: "onChange", signature: "(values: (string|number)[]) => void", description: "Selection changed" }], slots: [],
  }),
  mkDef({
    name: "DatePicker", wraps: "AICDatePicker", wrapperFile: "src/components/ui/DatePicker.tsx",
    description: "Date picker with calendar popup, range support, and format options.",
    preview: <div className="max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 flex items-center gap-2"><Icon name="calendar" size={16} /> Select date...</div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "value", type: "string", required: false, description: "Date value" }, { name: "format", type: "string", required: false, default: '"yyyy-MM-dd"', description: "Date format" }, { name: "range", type: "boolean", required: false, default: "false", description: "Range mode" }, { name: "minDate", type: "string", required: false, description: "Minimum date" }, { name: "maxDate", type: "string", required: false, description: "Maximum date" }],
    cssTokens: [{ token: "--st-datepicker-border-radius", defaultValue: "4px", crmOverride: "8px", description: "Radius" }],
    playground: [{ name: "label", type: "text", default: "Birth Date", label: "Label" }, { name: "format", type: "text", default: "yyyy-MM-dd", label: "Format" }, { name: "range", type: "boolean", default: false, label: "Range" }],
    codeExamples: [{ title: "Basic", code: `<DatePicker label="Start Date" value={date} onChange={setDate} />` }, { title: "Range", code: `<DatePicker label="Date Range" range value={range} onChange={setRange} />` }],
    events: [{ name: "onChange", signature: "(value: Date | [Date, Date]) => void", description: "Date selected" }], slots: [],
  }),
  mkDef({
    name: "CurrencyInput", wraps: "AICCurrencyInput", wrapperFile: "src/components/ui/CurrencyInput.tsx",
    description: "Currency-formatted number input with locale support.",
    preview: <div className="max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm flex items-center gap-1"><span className="text-gray-400">₹</span> 1,00,000.00</div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "value", type: "number", required: false, description: "Numeric value" }, { name: "currency", type: "string", required: false, default: '"INR"', description: "Currency code" }, { name: "locale", type: "string", required: false, default: '"en-IN"', description: "Number locale" }],
    cssTokens: [{ token: "--st-input-border-color-focus", defaultValue: "#1976d2", crmOverride: "#d95322", description: "Focus border" }],
    playground: [{ name: "label", type: "text", default: "Amount", label: "Label" }, { name: "currency", type: "text", default: "INR", label: "Currency" }],
    codeExamples: [{ title: "Basic", code: `<CurrencyInput label="Amount" value={amount} onChange={setAmount} />` }],
    events: [{ name: "onChange", signature: "(value: number|null) => void", description: "Value changed" }], slots: [],
    apiNotes: "onChange returns NUMBER, not string. Null when empty.",
  }),
  mkDef({
    name: "NumberInput", wraps: "AICNumber", wrapperFile: "src/components/ui/NumberInput.tsx",
    description: "Numeric input with stepper buttons, min/max, step.",
    preview: <div className="max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm flex items-center justify-between">42 <div className="flex flex-col"><Icon name="chevron-up" size={12} /><Icon name="chevron-down" size={12} /></div></div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "value", type: "number", required: false, description: "Value" }, { name: "min", type: "number", required: false, description: "Minimum" }, { name: "max", type: "number", required: false, description: "Maximum" }, { name: "step", type: "number", required: false, default: "1", description: "Step increment" }],
    cssTokens: [], playground: [{ name: "label", type: "text", default: "Quantity", label: "Label" }, { name: "min", type: "number", default: 0, label: "Min" }, { name: "max", type: "number", default: 100, label: "Max" }, { name: "step", type: "number", default: 1, label: "Step" }],
    codeExamples: [{ title: "Basic", code: `<NumberInput label="Qty" value={qty} onChange={setQty} min={0} max={100} />` }],
    events: [{ name: "onChange", signature: "(value: number|null) => void", description: "Value changed" }], slots: [],
    apiNotes: "onChange returns NUMBER, not string. Null when cleared.",
  }),
  mkDef({
    name: "MobileInput", wraps: "AICMobileInput", wrapperFile: "src/components/ui/MobileInput.tsx",
    description: "Phone number input with country code picker.",
    preview: <div className="max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm flex items-center gap-2"><span className="text-gray-500">+91</span> 98765 43210</div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "value", type: "string", required: false, description: "Phone number" }, { name: "defaultCountry", type: "string", required: false, default: '"IN"', description: "Default country code" }],
    cssTokens: [], playground: [{ name: "label", type: "text", default: "Mobile", label: "Label" }, { name: "defaultCountry", type: "text", default: "IN", label: "Country" }],
    codeExamples: [{ title: "Basic", code: `<MobileInput label="Phone" value={phone} onChange={setPhone} />` }],
    events: [{ name: "onChange", signature: "(value: string) => void", description: "Phone changed" }], slots: [],
  }),
  mkDef({
    name: "InputMask", wraps: "AICInputMask", wrapperFile: "src/components/ui/InputMask.tsx",
    description: "Masked input for formatted values (GST, PAN, etc.).",
    preview: <div className="max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 font-mono">__-____-____-__</div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "mask", type: "string", required: true, description: "Mask pattern" }, { name: "placeholder", type: "string", required: false, description: "Placeholder" }],
    cssTokens: [], playground: [{ name: "label", type: "text", default: "GST No.", label: "Label" }, { name: "mask", type: "text", default: "99-AAAA-9999-A9", label: "Mask" }],
    codeExamples: [{ title: "Basic", code: `<InputMask label="GST Number" mask="99-AAAA-9999-A9" />` }],
    events: [{ name: "onChange", signature: "(value: string) => void", description: "Value changed" }], slots: [],
  }),
  mkDef({
    name: "Autocomplete", wraps: "AICAutocomplete", wrapperFile: "src/components/ui/Autocomplete.tsx",
    description: "Autocomplete input with suggestion dropdown.",
    preview: <div className="max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 flex items-center gap-2"><Icon name="search" size={16} /> Search contacts...</div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "options", type: "array", required: true, description: "Suggestions" }, { name: "freeSolo", type: "boolean", required: false, default: "false", description: "Allow free text" }],
    cssTokens: [], playground: [{ name: "label", type: "text", default: "Contact", label: "Label" }, { name: "freeSolo", type: "boolean", default: false, label: "Free Solo" }],
    codeExamples: [{ title: "Basic", code: `<Autocomplete\n  label="Contact"\n  options={contacts.map(c => ({ value: c.id, label: c.name }))}\n  onChange={setSelected}\n/>` }],
    events: [{ name: "onChange", signature: "(value: any) => void", description: "Selection changed" }, { name: "onInputChange", signature: "(text: string) => void", description: "Input text changed" }], slots: [],
  }),
  mkDef({
    name: "SmartAutocomplete", wraps: "SmartAutocomplete", wrapperFile: "src/components/ui/SmartAutocomplete.tsx",
    description: "Enhanced autocomplete with smart matching and custom rendering.",
    preview: <div className="max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 flex items-center gap-2"><Icon name="search" size={16} /> Smart search...</div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "options", type: "array", required: true, description: "Options" }],
    cssTokens: [], playground: [{ name: "label", type: "text", default: "Search", label: "Label" }],
    codeExamples: [{ title: "Basic", code: `<SmartAutocomplete label="Search" options={items} onChange={setItem} />` }],
    events: [{ name: "onChange", signature: "(value: any) => void", description: "Selection changed" }], slots: [],
  }),
  mkDef({
    name: "TagsInput", wraps: "AICTagsInput", wrapperFile: "src/components/ui/TagsInput.tsx",
    description: "Input for adding multiple tags/chips.",
    preview: <div className="max-w-md border border-gray-300 rounded-lg px-3 py-2 flex gap-1 flex-wrap"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs flex items-center gap-1">React <span className="cursor-pointer">×</span></span><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs flex items-center gap-1">TypeScript <span className="cursor-pointer">×</span></span></div>,
    props: [{ name: "label", type: "string", required: false, description: "Label" }, { name: "value", type: "array", required: false, description: "Array of tags" }, { name: "maxTags", type: "number", required: false, description: "Max tags allowed" }],
    cssTokens: [{ token: "--st-tags-chip-bg", defaultValue: "#e3f2fd", description: "Chip background" }],
    playground: [{ name: "label", type: "text", default: "Skills", label: "Label" }, { name: "maxTags", type: "number", default: 10, label: "Max Tags" }],
    codeExamples: [{ title: "Basic", code: `<TagsInput label="Skills" value={tags} onChange={setTags} />` }],
    events: [{ name: "onChange", signature: "(tags: string[]) => void", description: "Tags changed" }], slots: [],
    apiNotes: "onChange returns the full array of tags, not individual tag.",
  }),
  mkDef({
    name: "OTPInput", wraps: "AICOTPInput", wrapperFile: "src/components/ui/OTPInput.tsx",
    description: "One-time password input with individual digit cells.",
    preview: <div className="flex gap-2">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-10 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center text-lg font-bold text-gray-700">{i <= 3 ? i : ""}</div>)}</div>,
    props: [{ name: "length", type: "number", required: false, default: "6", description: "Number of digits" }, { name: "value", type: "string", required: false, description: "Current OTP" }],
    cssTokens: [{ token: "--st-otp-border-color-focus", defaultValue: "#1976d2", crmOverride: "#d95322", description: "Focus border" }],
    playground: [{ name: "length", type: "number", default: 6, label: "Length" }],
    codeExamples: [{ title: "Basic", code: `<OTPInput length={6} value={otp} onChange={setOtp} onComplete={handleVerify} />` }],
    events: [{ name: "onChange", signature: "(value: string) => void", description: "Value changed" }, { name: "onComplete", signature: "(value: string) => void", description: "All digits filled" }], slots: [],
  }),
];

export function AdvancedInputsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {DEFS.map((def) => <ComponentCard key={def.name} def={def} fullWidth={def.name === "SelectInput"} />)}
    </div>
  );
}
