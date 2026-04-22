// Pure TypeScript — no framework imports
// Source: core/ui-kit/angular/src/lib/control-library/models/ui-config.model.ts

import { z } from "zod";

// ── Primitives ──────────────────────────────────────────

export type FloatingMode = "IN" | "ON";
export type ControlSize = "large" | "medium" | "small" | "xsmall" | "tiny";

export const FloatingModeSchema = z.enum(["IN", "ON"]);
export const ControlSizeSchema = z.enum([
  "large",
  "medium",
  "small",
  "xsmall",
  "tiny",
]);

// ── Control Size Config ─────────────────────────────────

export interface ControlSizeConfig {
  input: string;
  label: string;
  checkbox: string;
  checkboxLabel: string;
  selectIcon: string;
  button: string;
  icon: string;
}

// ── UiConfig ────────────────────────────────────────────

export interface UiConfig {
  floatingMode: FloatingMode;

  container: string;
  input: string;
  inputOutlined: string;
  inputFilled: string;
  inputStandard: string;
  label: string;
  labelOutlined: string;
  labelFilled: string;
  labelStandard: string;
  controlContainer?: string;

  // State Styles
  activeOn: string;
  activeIn: string;
  idle: string;

  // Icon wrappers & modifiers
  iconPrefixWrapper: string;
  iconSuffixWrapper: string;
  inputHasPrefix: string;
  inputHasSuffix: string;
  labelHasPrefix: string;

  error: string;
  selectIconWrapper?: string;
  checkboxWrapper?: string;
  checkboxInput?: string;
  checkboxLabel?: string;

  // Switch Specific
  switchWrapper: string;
  switchTrack: string;

  // Mobile Specific
  mobileGroup: string;
  mobileCountrySelect: string;
  mobileInput: string;
  mobileButton: string;

  // Color Picker Specific
  colorPreview: string;

  // Option Groups (Radio/Checkbox Lists)
  optionGroupContainer: string;
  optionCard: string;
  optionCardSelected: string;
  optionCardHover: string;
  optionContent: string;
  optionLabel: string;
  optionDescription: string;
  optionIcon: string;
  optionImage: string;

  // Editor
  editorContainer: string;
  editorToolbar: string;
  editorBtn: string;
  editorBtnActive: string;
  editorContent: string;

  // Segmented Control
  segmentContainer: string;
  segmentButton: string;
  segmentButtonActive: string;
  segmentButtonIdle: string;

  // File Upload
  fileUploadDropzone: string;
  fileUploadPreview: string;

  // Signature
  signaturePad: string;
  signatureClearBtn: string;

  // OTP
  otpContainer: string;
  otpInput: string;

  // Action Button
  actionButton: string;
  buttonGroup: string;
  buttonGroupItem: string;
  splitButtonContainer: string;
  splitButtonMain: string;
  splitButtonToggle: string;
  dropdownMenu: string;
  dropdownItem: string;

  // Fieldset
  fieldsetContainer: string;
  fieldsetHeader: string;
  fieldsetLegend: string;
  fieldsetContent: string;
  fieldsetToggleIcon: string;

  // Fieldset Variant (Notched Outline)
  fieldsetOutline: string;
  fieldsetOutlineLegend: string;
}

// ── Zod Schema ──────────────────────────────────────────

export const UiConfigSchema = z.object({
  floatingMode: FloatingModeSchema,

  container: z.string(),
  input: z.string(),
  inputOutlined: z.string(),
  inputFilled: z.string(),
  inputStandard: z.string(),
  label: z.string(),
  labelOutlined: z.string(),
  labelFilled: z.string(),
  labelStandard: z.string(),
  controlContainer: z.string().optional(),

  activeOn: z.string(),
  activeIn: z.string(),
  idle: z.string(),

  iconPrefixWrapper: z.string(),
  iconSuffixWrapper: z.string(),
  inputHasPrefix: z.string(),
  inputHasSuffix: z.string(),
  labelHasPrefix: z.string(),

  error: z.string(),
  selectIconWrapper: z.string().optional(),
  checkboxWrapper: z.string().optional(),
  checkboxInput: z.string().optional(),
  checkboxLabel: z.string().optional(),

  switchWrapper: z.string(),
  switchTrack: z.string(),

  mobileGroup: z.string(),
  mobileCountrySelect: z.string(),
  mobileInput: z.string(),
  mobileButton: z.string(),

  colorPreview: z.string(),

  optionGroupContainer: z.string(),
  optionCard: z.string(),
  optionCardSelected: z.string(),
  optionCardHover: z.string(),
  optionContent: z.string(),
  optionLabel: z.string(),
  optionDescription: z.string(),
  optionIcon: z.string(),
  optionImage: z.string(),

  editorContainer: z.string(),
  editorToolbar: z.string(),
  editorBtn: z.string(),
  editorBtnActive: z.string(),
  editorContent: z.string(),

  segmentContainer: z.string(),
  segmentButton: z.string(),
  segmentButtonActive: z.string(),
  segmentButtonIdle: z.string(),

  fileUploadDropzone: z.string(),
  fileUploadPreview: z.string(),

  signaturePad: z.string(),
  signatureClearBtn: z.string(),

  otpContainer: z.string(),
  otpInput: z.string(),

  actionButton: z.string(),
  buttonGroup: z.string(),
  buttonGroupItem: z.string(),
  splitButtonContainer: z.string(),
  splitButtonMain: z.string(),
  splitButtonToggle: z.string(),
  dropdownMenu: z.string(),
  dropdownItem: z.string(),

  fieldsetContainer: z.string(),
  fieldsetHeader: z.string(),
  fieldsetLegend: z.string(),
  fieldsetContent: z.string(),
  fieldsetToggleIcon: z.string(),

  fieldsetOutline: z.string(),
  fieldsetOutlineLegend: z.string(),
});

// ── Runtime Constants ───────────────────────────────────

export const CONTROL_SIZES: Record<ControlSize, ControlSizeConfig> = {
  large: {
    input: "h-12 text-lg pt-1 pb-0 px-4",
    label: "text-base peer-focus:translate-y-[-2px]",
    checkbox: "h-6 w-6",
    checkboxLabel: "text-base",
    selectIcon: "top-3.5",
    button: "px-5 py-2 text-lg",
    icon: "w-6 h-6",
  },
  medium: {
    input: "h-10 text-base pt-0.5 pb-0 px-3",
    label: "text-sm",
    checkbox: "h-5 w-5",
    checkboxLabel: "text-base",
    selectIcon: "top-2.5",
    button: "px-4 py-1.5 text-base",
    icon: "w-5 h-5",
  },
  small: {
    input: "h-9 text-sm pt-0 pb-0 px-3",
    label: "text-xs",
    checkbox: "h-4 w-4",
    checkboxLabel: "text-sm",
    selectIcon: "top-2.5",
    button: "px-3 py-1 text-sm",
    icon: "w-4 h-4",
  },
  xsmall: {
    input: "h-8 text-xs pt-0 pb-0 px-2",
    label: "text-[11px] peer-focus:-translate-y-[2px]",
    checkbox: "h-3.5 w-3.5",
    checkboxLabel: "text-xs",
    selectIcon: "top-2",
    button: "px-2 py-0.5 text-xs",
    icon: "w-3.5 h-3.5",
  },
  tiny: {
    input: "h-6 text-[10px] pt-0 pb-0 px-1.5",
    label: "text-[9px] peer-focus:-translate-y-[1px]",
    checkbox: "h-3 w-3",
    checkboxLabel: "text-[10px]",
    selectIcon: "top-1",
    button: "px-1.5 py-0 text-[10px]",
    icon: "w-3 h-3",
  },
};

export const GLOBAL_UI_CONFIG: UiConfig = {
  floatingMode: "ON",

  container: "relative mb-3",

  input:
    "peer block w-full rounded-lg border border-gray-300 bg-white px-4 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none transition-all disabled:bg-gray-100 disabled:text-gray-400",

  inputOutlined:
    "peer block w-full rounded-xl bg-transparent px-4 py-3 text-gray-900 focus:outline-none focus:ring-0 border-0 appearance-none transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder-transparent",

  inputFilled:
    "peer block w-full rounded-t-lg border-b border-gray-300 bg-gray-50 px-3 pt-5 pb-1.5 text-gray-900 focus:border-primary focus:outline-none focus:ring-0 appearance-none transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder-transparent",

  inputStandard:
    "peer block w-full border-b border-gray-300 bg-transparent px-0 py-1.5 pt-5 text-gray-900 focus:border-primary focus:outline-none focus:ring-0 appearance-none transition-all disabled:text-gray-400 placeholder-transparent",

  label:
    "absolute left-2 z-10 origin-[0] max-w-[90%] truncate px-2 text-gray-500 duration-200 pointer-events-none bg-white peer-focus:text-primary",

  labelOutlined:
    "absolute left-3 top-1/2 -translate-y-1/2 z-10 origin-[0] max-w-[90%] truncate px-1 text-gray-500 duration-200 pointer-events-none bg-transparent",

  labelFilled:
    "absolute left-3 top-1/2 -translate-y-1/2 z-10 origin-[0] max-w-[90%] truncate text-gray-500 duration-200 pointer-events-none bg-transparent",

  labelStandard:
    "absolute left-0 top-1/2 -translate-y-1/2 z-10 origin-[0] max-w-[90%] truncate text-gray-500 duration-200 pointer-events-none bg-transparent",

  controlContainer: "relative mb-3",

  // MODE: ON (Cuts the border)
  activeOn: "-top-2.5 scale-90 text-primary",

  // MODE: IN (Stays inside)
  activeIn: "top-1 scale-90 text-primary",

  // IDLE: Centered
  idle: "top-1/2 -translate-y-1/2 scale-100 text-gray-500",

  // Icons
  iconPrefixWrapper:
    "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-20",
  iconSuffixWrapper:
    "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 z-20 flex items-center",

  inputHasPrefix: "pl-10",
  inputHasSuffix: "pr-10",
  labelHasPrefix: "left-9",

  // Error Text
  error: "text-xs text-danger mt-0.5",

  // Select Specific
  selectIconWrapper:
    "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-gray-400",

  // Checkbox Specific
  checkboxWrapper: "flex items-center gap-2 pt-1 pb-1",
  checkboxInput:
    "peer cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:bg-primary checked:border-primary focus:ring-1 focus:ring-primary transition-all shrink-0",
  checkboxLabel: "cursor-pointer select-none text-gray-700 font-medium",

  // Switch Specific
  switchWrapper: "flex items-center cursor-pointer",
  switchTrack:
    "relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary",

  // Mobile Specific
  mobileGroup: "flex rounded-md shadow-sm",
  mobileCountrySelect:
    "rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-2 text-gray-500 focus:ring-primary focus:border-primary",
  mobileInput:
    "block w-full min-w-0 flex-1 rounded-none rounded-r-md border border-gray-300 px-3 py-1.5 text-gray-900 focus:border-primary focus:ring-primary",
  mobileButton: "",

  // Color Picker
  colorPreview:
    "w-10 h-10 rounded-lg border border-gray-300 shadow-sm cursor-pointer overflow-hidden relative shrink-0",

  // Option Groups (Radio/Checkbox)
  optionGroupContainer: "grid gap-3",
  optionCard:
    "relative flex cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm focus:outline-none transition-all items-center",
  optionCardSelected: "border-primary ring-1 ring-primary bg-blue-50/50",
  optionCardHover: "hover:border-gray-400",
  optionContent: "flex flex-1 flex-col",
  optionLabel: "block text-sm font-medium text-gray-900",
  optionDescription: "mt-0.5 flex items-center text-xs text-gray-500",
  optionIcon: "flex-shrink-0 mr-3 text-gray-400",
  optionImage: "flex-shrink-0 w-10 h-10 rounded-md object-cover mr-3",

  // Editor
  editorContainer:
    "border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all",
  editorToolbar:
    "flex items-center gap-1 p-1.5 border-b border-gray-200 bg-gray-50",
  editorBtn:
    "p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors",
  editorBtnActive: "bg-gray-200 text-gray-900 font-medium shadow-inner",
  editorContent:
    "p-3 min-h-[100px] outline-none prose prose-sm max-w-none text-gray-800",

  // Segmented Control
  segmentContainer: "flex p-1 space-x-1 bg-gray-100 rounded-lg",
  segmentButton:
    "flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 px-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary shadow-sm",
  segmentButtonActive: "bg-white text-gray-900 shadow",
  segmentButtonIdle:
    "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 shadow-none",

  // File Upload
  fileUploadDropzone:
    "border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary hover:bg-blue-50 transition-all cursor-pointer bg-white relative",
  fileUploadPreview: "w-full h-40 object-cover rounded-lg shadow-sm",

  // Signature
  signaturePad:
    "w-full border border-gray-300 rounded-lg bg-white shadow-sm touch-none cursor-crosshair",
  signatureClearBtn:
    "absolute bottom-2 right-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded",

  // OTP
  otpContainer: "flex gap-2 justify-center",
  otpInput:
    "w-10 h-10 text-center text-lg font-bold border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all",

  // Action Button
  actionButton:
    "flex items-center justify-center gap-2 font-medium rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  buttonGroup:
    "inline-flex rounded-lg shadow-sm border border-gray-300 bg-white overflow-hidden divide-x divide-gray-300",
  buttonGroupItem:
    "flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary focus:z-10 focus:ring-2 focus:ring-primary focus:text-primary transition-colors bg-white",

  // Split Button
  splitButtonContainer: "relative inline-flex shadow-sm rounded-lg",
  splitButtonMain:
    "relative inline-flex items-center rounded-l-lg border border-r-0 focus:z-10 focus:ring-2 focus:ring-primary focus:border-primary",
  splitButtonToggle:
    "relative inline-flex items-center rounded-r-lg border border-l focus:z-10 focus:ring-2 focus:ring-primary focus:border-primary px-1.5",

  // Dropdown (Split button menu)
  dropdownMenu:
    "absolute right-0 z-50 mt-1 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100",
  dropdownItem:
    "flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer",

  // Fieldset
  fieldsetContainer:
    "border border-gray-200 rounded-lg bg-white shadow-sm relative mt-3",
  fieldsetHeader:
    "flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg select-none",
  fieldsetLegend: "font-bold text-slate-700 text-sm",
  fieldsetContent: "p-3",
  fieldsetToggleIcon:
    "text-gray-500 transition-transform duration-200 w-4 h-4",

  // Fieldset Variant
  fieldsetOutline:
    "absolute inset-0 rounded-xl border border-gray-300 pointer-events-none transition-all duration-200 group-hover:border-gray-400 has-[input:focus]:border-primary",
  fieldsetOutlineLegend:
    "mx-3 px-1 text-xs transition-all duration-200 max-w-[0.01px] h-0 overflow-hidden whitespace-nowrap text-transparent group-has-[input:focus]:max-w-full group-has-[input:not(:placeholder-shown)]:max-w-full",
};
