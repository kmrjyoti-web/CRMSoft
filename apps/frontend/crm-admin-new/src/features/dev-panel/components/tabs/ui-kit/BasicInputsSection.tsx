"use client";

import { Icon } from "@/components/ui";

import { ComponentCard } from "./ComponentCard";

import type { ComponentDef } from "./types";

const INPUT_DEF: ComponentDef = {
  name: "Input",
  wraps: "AICInput",
  wrapperFile: "src/components/ui/Input.tsx",
  category: "Basic Inputs",
  description: "Text input with floating label, icons, validation, multiline support.",
  defaultProps: 'size="md"',
  preview: (
    <div className="space-y-3 max-w-md">
      <div className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">Full Name (outlined)</div>
      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">
        <Icon name="mail" size={16} /> Email with icon
      </div>
      <div className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-300 bg-gray-50">Disabled input</div>
      <div className="border border-red-400 rounded-lg px-3 py-2 text-sm text-red-600">Error state</div>
    </div>
  ),
  props: [
    { name: "label", type: "string", required: false, description: "Floating label text" },
    { name: "type", type: "enum", required: false, default: '"text"', description: "Input type", enumValues: ["text", "email", "password", "number", "tel", "url", "search"] },
    { name: "variant", type: "enum", required: false, default: '"outlined"', description: "Visual style", enumValues: ["outlined", "filled", "standard"] },
    { name: "size", type: "enum", required: false, default: '"md"', description: "Component size", enumValues: ["sm", "md", "lg"] },
    { name: "placeholder", type: "string", required: false, description: "Placeholder text" },
    { name: "value", type: "string", required: false, description: "Controlled value" },
    { name: "required", type: "boolean", required: false, default: "false", description: "Shows required indicator" },
    { name: "disabled", type: "boolean", required: false, default: "false", description: "Disables interaction" },
    { name: "error", type: "boolean", required: false, default: "false", description: "Error state (red border)" },
    { name: "errorText", type: "string", required: false, description: "Error message below" },
    { name: "helperText", type: "string", required: false, description: "Helper text below" },
    { name: "leftIcon", type: "ReactNode", required: false, description: "Icon on left side" },
    { name: "multiline", type: "boolean", required: false, default: "false", description: "Renders as textarea" },
    { name: "rows", type: "number", required: false, default: "3", description: "Textarea rows" },
  ],
  cssTokens: [
    { token: "--st-input-border-color", defaultValue: "#ccc", crmOverride: "#d0d5dd", description: "Border color (idle)" },
    { token: "--st-input-border-color-focus", defaultValue: "#1976d2", crmOverride: "#d95322", description: "Border color (focused)" },
    { token: "--st-input-border-radius", defaultValue: "4px", crmOverride: "8px", description: "Corner radius" },
    { token: "--st-input-bg", defaultValue: "#fff", description: "Background color" },
    { token: "--st-input-font-size", defaultValue: "14px", description: "Text size" },
    { token: "--st-input-label-color-focus", defaultValue: "#1976d2", crmOverride: "#d95322", description: "Label color (focused)" },
  ],
  playground: [
    { name: "label", type: "text", default: "Full Name", label: "Label" },
    { name: "placeholder", type: "text", default: "Enter...", label: "Placeholder" },
    { name: "type", type: "select", default: "text", label: "Type", options: ["text", "email", "password", "number", "tel", "search"] },
    { name: "variant", type: "select", default: "outlined", label: "Variant", options: ["outlined", "filled", "standard"] },
    { name: "size", type: "select", default: "md", label: "Size", options: ["sm", "md", "lg"] },
    { name: "required", type: "boolean", default: false, label: "Required" },
    { name: "disabled", type: "boolean", default: false, label: "Disabled" },
    { name: "error", type: "boolean", default: false, label: "Error" },
  ],
  codeExamples: [
    { title: "Basic", code: `import { Input } from "@/components/ui";\n\n<Input label="Full Name" required />\n<Input label="Email" type="email" />\n<Input label="Notes" multiline rows={4} />` },
    { title: "With Icons", code: `import { Input, Icon } from "@/components/ui";\n\n<Input\n  label="Email"\n  leftIcon={<Icon name="mail" size={16} />}\n  placeholder="user@example.com"\n/>` },
    { title: "react-hook-form", code: `const { register, formState: { errors } } = useForm();\n\n<Input\n  label="Name"\n  {...register("name")}\n  error={!!errors.name}\n  errorText={errors.name?.message}\n/>` },
  ],
  events: [
    { name: "onChange", signature: "(value: string) => void", description: "Fires on value change" },
    { name: "onBlur", signature: "(e: FocusEvent) => void", description: "Fires when loses focus" },
    { name: "onFocus", signature: "(e: FocusEvent) => void", description: "Fires when gains focus" },
  ],
  slots: [
    { name: "leftIcon", type: "ReactNode", description: "Icon rendered inside input on the left" },
  ],
  apiNotes: "Ref forwarded to native <input>. Size defaults to 'md' (set in wrapper). All native HTML input attributes forwarded.",
};

const SELECT_DEF: ComponentDef = {
  name: "Select", wraps: "AICSelect", wrapperFile: "src/components/ui/Select.tsx", category: "Basic Inputs",
  description: "Native HTML select with CoreUI styling and floating label.",
  preview: (
    <div className="max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600">
      <select className="w-full bg-transparent outline-none"><option>India</option><option>United States</option></select>
    </div>
  ),
  props: [
    { name: "label", type: "string", required: false, description: "Floating label" },
    { name: "variant", type: "enum", required: false, default: '"outlined"', description: "Visual style", enumValues: ["outlined", "filled", "standard"] },
    { name: "disabled", type: "boolean", required: false, default: "false", description: "Disables interaction" },
    { name: "error", type: "boolean", required: false, default: "false", description: "Error state" },
  ],
  cssTokens: [{ token: "--st-select-border-color", defaultValue: "#ccc", description: "Border color" }, { token: "--st-select-border-radius", defaultValue: "4px", crmOverride: "8px", description: "Corner radius" }],
  playground: [{ name: "label", type: "text", default: "Country", label: "Label" }, { name: "variant", type: "select", default: "outlined", label: "Variant", options: ["outlined", "filled", "standard"] }, { name: "disabled", type: "boolean", default: false, label: "Disabled" }],
  codeExamples: [{ title: "Basic", code: `<Select label="Status">\n  <option value="ACTIVE">Active</option>\n  <option value="INACTIVE">Inactive</option>\n</Select>` }],
  events: [{ name: "onChange", signature: "(e: ChangeEvent) => void", description: "Selection changed" }],
  slots: [{ name: "children", type: "ReactNode (<option>)", description: "Native option elements" }],
};

const CHECKBOX_DEF: ComponentDef = {
  name: "Checkbox", wraps: "AICCheckbox", wrapperFile: "src/components/ui/Checkbox.tsx", category: "Basic Inputs",
  description: "Single checkbox with label.",
  preview: <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[#d95322]" /><span className="text-sm">Accept terms</span></div>,
  props: [{ name: "label", type: "string", required: false, description: "Label text" }, { name: "checked", type: "boolean", required: false, description: "Checked state" }, { name: "disabled", type: "boolean", required: false, default: "false", description: "Disables interaction" }],
  cssTokens: [{ token: "--st-checkbox-color", defaultValue: "#1976d2", crmOverride: "#d95322", description: "Check color" }],
  playground: [{ name: "label", type: "text", default: "Accept terms", label: "Label" }, { name: "disabled", type: "boolean", default: false, label: "Disabled" }],
  codeExamples: [{ title: "Basic", code: `<Checkbox label="Accept terms" checked={agreed} onChange={setAgreed} />` }],
  events: [{ name: "onChange", signature: "(checked: boolean) => void", description: "Toggle state" }],
  slots: [],
};

const CHECKBOX_GROUP_DEF: ComponentDef = {
  name: "CheckboxGroup", wraps: "AICCheckboxGroup", wrapperFile: "src/components/ui/CheckboxGroup.tsx", category: "Basic Inputs",
  description: "Group of checkboxes with label and direction.",
  preview: <div className="flex gap-4"><div className="flex items-center gap-1"><input type="checkbox" defaultChecked className="accent-[#d95322]" /><span className="text-sm">Option A</span></div><div className="flex items-center gap-1"><input type="checkbox" className="accent-[#d95322]" /><span className="text-sm">Option B</span></div></div>,
  props: [{ name: "label", type: "string", required: false, description: "Group label" }, { name: "direction", type: "enum", required: false, default: '"row"', description: "Layout direction", enumValues: ["row", "column"] }],
  cssTokens: [], playground: [{ name: "label", type: "text", default: "Options", label: "Label" }, { name: "direction", type: "select", default: "row", label: "Direction", options: ["row", "column"] }],
  codeExamples: [{ title: "Basic", code: `<CheckboxGroup label="Interests" direction="column">\n  <Checkbox label="Sports" />\n  <Checkbox label="Music" />\n</CheckboxGroup>` }],
  events: [{ name: "onChange", signature: "(values: string[]) => void", description: "Selected values change" }], slots: [{ name: "children", type: "Checkbox elements", description: "Individual checkboxes" }],
};

const CHECKBOX_INPUT_DEF: ComponentDef = {
  name: "CheckboxInput", wraps: "AICCheckboxInput", wrapperFile: "src/components/ui/CheckboxInput.tsx", category: "Basic Inputs",
  description: "Checkbox styled as a form input field.",
  preview: <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2"><input type="checkbox" defaultChecked className="accent-[#d95322]" /><span className="text-sm">Active</span></div>,
  props: [{ name: "label", type: "string", required: false, description: "Label text" }],
  cssTokens: [], playground: [{ name: "label", type: "text", default: "Is Active", label: "Label" }],
  codeExamples: [{ title: "Basic", code: `<CheckboxInput label="Is Active" />` }],
  events: [{ name: "onChange", signature: "(checked: boolean) => void", description: "Toggle state" }], slots: [],
};

const RADIO_DEF: ComponentDef = {
  name: "Radio", wraps: "AICRadio", wrapperFile: "src/components/ui/Radio.tsx", category: "Basic Inputs",
  description: "Single radio button with label.",
  preview: <div className="flex items-center gap-2"><input type="radio" name="demo" defaultChecked className="accent-[#d95322]" /><span className="text-sm">Option A</span></div>,
  props: [{ name: "label", type: "string", required: false, description: "Label text" }, { name: "value", type: "string", required: true, description: "Radio value" }, { name: "disabled", type: "boolean", required: false, default: "false", description: "Disables interaction" }],
  cssTokens: [{ token: "--st-radio-color", defaultValue: "#1976d2", crmOverride: "#d95322", description: "Selected color" }],
  playground: [{ name: "label", type: "text", default: "Option A", label: "Label" }, { name: "disabled", type: "boolean", default: false, label: "Disabled" }],
  codeExamples: [{ title: "Basic", code: `<RadioGroup label="Gender">\n  <Radio label="Male" value="M" />\n  <Radio label="Female" value="F" />\n</RadioGroup>` }],
  events: [{ name: "onChange", signature: "(e: ChangeEvent) => void", description: "Selection changed" }], slots: [],
};

const RADIO_GROUP_DEF: ComponentDef = {
  name: "RadioGroup", wraps: "AICRadioGroup", wrapperFile: "src/components/ui/RadioGroup.tsx", category: "Basic Inputs",
  description: "Group of radio buttons with label.",
  preview: <div className="flex gap-4"><div className="flex items-center gap-1"><input type="radio" name="rg" defaultChecked className="accent-[#d95322]" /><span className="text-sm">Yes</span></div><div className="flex items-center gap-1"><input type="radio" name="rg" className="accent-[#d95322]" /><span className="text-sm">No</span></div></div>,
  props: [{ name: "label", type: "string", required: false, description: "Group label" }, { name: "direction", type: "enum", required: false, default: '"row"', description: "Layout", enumValues: ["row", "column"] }, { name: "value", type: "string", required: false, description: "Selected value" }],
  cssTokens: [], playground: [{ name: "label", type: "text", default: "Confirm", label: "Label" }, { name: "direction", type: "select", default: "row", label: "Direction", options: ["row", "column"] }],
  codeExamples: [{ title: "Basic", code: `<RadioGroup label="Type" value={type} onChange={setType}>\n  <Radio label="Individual" value="individual" />\n  <Radio label="Company" value="company" />\n</RadioGroup>` }],
  events: [{ name: "onChange", signature: "(value: string) => void", description: "Selected value changed" }], slots: [{ name: "children", type: "Radio elements", description: "Individual radios" }],
};

const SWITCH_DEF: ComponentDef = {
  name: "Switch", wraps: "AICSwitch", wrapperFile: "src/components/ui/Switch.tsx", category: "Basic Inputs",
  description: "Toggle switch with label.",
  preview: <div className="flex items-center gap-2"><div className="w-10 h-5 bg-[#d95322] rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" /></div><span className="text-sm">Active</span></div>,
  props: [{ name: "label", type: "string", required: false, description: "Label text" }, { name: "checked", type: "boolean", required: false, description: "On/off state" }, { name: "disabled", type: "boolean", required: false, default: "false", description: "Disables interaction" }],
  cssTokens: [{ token: "--st-switch-color", defaultValue: "#1976d2", crmOverride: "#d95322", description: "Active track color" }],
  playground: [{ name: "label", type: "text", default: "Active", label: "Label" }, { name: "disabled", type: "boolean", default: false, label: "Disabled" }],
  codeExamples: [{ title: "Basic", code: `<Switch label="Active" checked={isActive} onChange={setIsActive} />` }],
  events: [{ name: "onChange", signature: "(checked: boolean) => void", description: "Toggle state" }], slots: [],
};

const SWITCH_INPUT_DEF: ComponentDef = {
  name: "SwitchInput", wraps: "AICSwitchInput", wrapperFile: "src/components/ui/SwitchInput.tsx", category: "Basic Inputs",
  description: "Switch styled as a form input field.",
  preview: <div className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2"><span className="text-sm">Notifications</span><div className="w-8 h-4 bg-gray-300 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5" /></div></div>,
  props: [{ name: "label", type: "string", required: false, description: "Label text" }],
  cssTokens: [], playground: [{ name: "label", type: "text", default: "Notifications", label: "Label" }],
  codeExamples: [{ title: "Basic", code: `<SwitchInput label="Email Notifications" />` }],
  events: [{ name: "onChange", signature: "(checked: boolean) => void", description: "Toggle state" }], slots: [],
};

const ALL_BASIC: ComponentDef[] = [INPUT_DEF, SELECT_DEF, CHECKBOX_DEF, CHECKBOX_GROUP_DEF, CHECKBOX_INPUT_DEF, RADIO_DEF, RADIO_GROUP_DEF, SWITCH_DEF, SWITCH_INPUT_DEF];

export function BasicInputsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {ALL_BASIC.map((def) => <ComponentCard key={def.name} def={def} fullWidth={def.name === "Input"} />)}
    </div>
  );
}
