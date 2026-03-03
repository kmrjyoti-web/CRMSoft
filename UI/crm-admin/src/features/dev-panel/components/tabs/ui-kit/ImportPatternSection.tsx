"use client";

import { Icon, Badge } from "@/components/ui";

export function ImportPatternSection() {
  return (
    <div className="space-y-6">
      {/* Correct patterns */}
      <div className="border border-green-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-green-50 border-b border-green-200 flex items-center gap-2">
          <Icon name="check-circle" size={16} className="text-green-600" />
          <span className="font-semibold text-sm text-green-800">Correct Import Patterns</span>
        </div>
        <div className="p-4 bg-gray-900 rounded-b-lg">
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{`// ✅ Import from @/components/ui — ALWAYS
import { Button, Input, Badge, Icon } from "@/components/ui";
import { TableFull } from "@/components/ui";
import { Modal, Drawer, ConfirmDialog } from "@/components/ui";
import { SelectInput, DatePicker, CurrencyInput } from "@/components/ui";
import { useToast, ToastProvider } from "@/components/ui";
import type { FilterValues, TableFilterConfig } from "@/components/ui";

// ✅ Icon usage — via Icon component only
<Icon name="user" size={18} />
<Icon name="mail" size={16} className="text-gray-500" />
<Icon name="check-circle" size={24} color="#22c55e" />`}</pre>
        </div>
      </div>

      {/* Forbidden patterns */}
      <div className="border border-red-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 flex items-center gap-2">
          <Icon name="x-circle" size={16} className="text-red-600" />
          <span className="font-semibold text-sm text-red-800">Forbidden Patterns (ESLint enforced)</span>
        </div>
        <div className="p-4 bg-gray-900 rounded-b-lg">
          <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">{`// ❌ NEVER import from @coreui/* in features/pages
import { AICInput } from "@coreui/ui-react";  // FORBIDDEN

// ❌ NEVER import from lucide-react in features/pages
import { Mail, User } from "lucide-react";  // FORBIDDEN

// ❌ NEVER use inline SVGs
<svg>...</svg>  // FORBIDDEN — use <Icon name="..." />

// ❌ NEVER edit lib/coreui/ for styling
// Use src/styles/crm-theme.css instead`}</pre>
        </div>
      </div>

      {/* Full 56-component wrapper map */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <Icon name="layers" size={16} className="text-blue-600" />
          <span className="font-semibold text-sm text-gray-800">56 Wrapper Components Map</span>
          <Badge variant="primary">Complete</Badge>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-1.5 px-2 font-semibold text-gray-600">#</th>
                <th className="py-1.5 px-2 font-semibold text-gray-600">Wrapper</th>
                <th className="py-1.5 px-2 font-semibold text-gray-600">CoreUI</th>
                <th className="py-1.5 px-2 font-semibold text-gray-600">Category</th>
              </tr>
            </thead>
            <tbody>
              {WRAPPER_MAP.map((row, i) => (
                <tr key={row.wrapper} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-1 px-2 text-gray-400">{i + 1}</td>
                  <td className="py-1 px-2"><code className="text-[#d95322]">{row.wrapper}</code></td>
                  <td className="py-1 px-2"><code className="text-purple-600">{row.coreui}</code></td>
                  <td className="py-1 px-2 text-gray-500">{row.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture diagram */}
      <div className="bg-gray-900 rounded-lg p-4">
        <pre className="text-xs text-green-400 font-mono">{`3-Layer Import Chain:

  lib/coreui/          →   src/components/ui/    →   src/features/
  ────────────              ──────────────────         ──────────────
  AICInput                  Input.tsx                  ContactForm.tsx
  AICButton                 Button.tsx                 LeadList.tsx
  AICTable                  Table.tsx                  ...
  ...                       (56 wrappers)

  Only ui/ can import    Features import from     NEVER from @coreui
  from @coreui/*         @/components/ui          or lucide-react`}</pre>
      </div>
    </div>
  );
}

const WRAPPER_MAP = [
  { wrapper: "Input", coreui: "AICInput", category: "Basic Inputs" },
  { wrapper: "Select", coreui: "AICSelect", category: "Basic Inputs" },
  { wrapper: "Checkbox", coreui: "AICCheckbox", category: "Basic Inputs" },
  { wrapper: "CheckboxGroup", coreui: "AICCheckboxGroup", category: "Basic Inputs" },
  { wrapper: "CheckboxInput", coreui: "AICCheckboxInput", category: "Basic Inputs" },
  { wrapper: "Radio", coreui: "AICRadio", category: "Basic Inputs" },
  { wrapper: "RadioGroup", coreui: "AICRadioGroup", category: "Basic Inputs" },
  { wrapper: "Switch", coreui: "AICSwitch", category: "Basic Inputs" },
  { wrapper: "SwitchInput", coreui: "AICSwitchInput", category: "Basic Inputs" },
  { wrapper: "SelectInput", coreui: "AICSelectInput", category: "Advanced Inputs" },
  { wrapper: "MultiSelectInput", coreui: "AICMultiSelectInput", category: "Advanced Inputs" },
  { wrapper: "DatePicker", coreui: "AICDatePicker", category: "Advanced Inputs" },
  { wrapper: "CurrencyInput", coreui: "AICCurrencyInput", category: "Advanced Inputs" },
  { wrapper: "NumberInput", coreui: "AICNumber", category: "Advanced Inputs" },
  { wrapper: "MobileInput", coreui: "AICMobileInput", category: "Advanced Inputs" },
  { wrapper: "InputMask", coreui: "AICInputMask", category: "Advanced Inputs" },
  { wrapper: "Autocomplete", coreui: "AICAutocomplete", category: "Advanced Inputs" },
  { wrapper: "SmartAutocomplete", coreui: "Custom", category: "Advanced Inputs" },
  { wrapper: "TagsInput", coreui: "AICTagsInput", category: "Advanced Inputs" },
  { wrapper: "OTPInput", coreui: "AICOTPInput", category: "Advanced Inputs" },
  { wrapper: "Rating", coreui: "AICRating", category: "Special Inputs" },
  { wrapper: "Slider", coreui: "AICSlider", category: "Special Inputs" },
  { wrapper: "ColorPicker", coreui: "AICColorPicker", category: "Special Inputs" },
  { wrapper: "FileUpload", coreui: "AICFileUpload", category: "Special Inputs" },
  { wrapper: "Signature", coreui: "AICSignature", category: "Special Inputs" },
  { wrapper: "RichTextEditor", coreui: "AICRichTextEditor", category: "Special Inputs" },
  { wrapper: "ListCheckbox", coreui: "AICListCheckbox", category: "Selection Controls" },
  { wrapper: "SegmentedControl", coreui: "AICSegmentedControl", category: "Selection Controls" },
  { wrapper: "ToggleButton", coreui: "AICToggleButton", category: "Selection Controls" },
  { wrapper: "Button", coreui: "AICButton", category: "Buttons" },
  { wrapper: "SmartButton", coreui: "Custom", category: "Buttons" },
  { wrapper: "ButtonControl", coreui: "AICButtonControl", category: "Buttons" },
  { wrapper: "DialogButton", coreui: "AICDialogButton", category: "Buttons" },
  { wrapper: "Modal", coreui: "AICModal", category: "Overlays" },
  { wrapper: "Drawer", coreui: "AICDrawer", category: "Overlays" },
  { wrapper: "SmartDialog", coreui: "Custom", category: "Overlays" },
  { wrapper: "SmartDrawer", coreui: "Custom", category: "Overlays" },
  { wrapper: "ConfirmDialog", coreui: "AICConfirmDialog", category: "Overlays" },
  { wrapper: "Popover", coreui: "AICPopover", category: "Overlays" },
  { wrapper: "Tooltip", coreui: "AICTooltip", category: "Overlays" },
  { wrapper: "Portal", coreui: "AICPortal", category: "Overlays" },
  { wrapper: "Toast", coreui: "AICToastProvider", category: "Overlays" },
  { wrapper: "SmartToast", coreui: "Custom", category: "Overlays" },
  { wrapper: "Badge", coreui: "AICBadge", category: "Display" },
  { wrapper: "Avatar", coreui: "AICAvatar", category: "Display" },
  { wrapper: "Typography", coreui: "AICTypography", category: "Display" },
  { wrapper: "SyncIndicator", coreui: "AICSyncIndicator", category: "Display" },
  { wrapper: "SmartError", coreui: "Custom", category: "Display" },
  { wrapper: "Table", coreui: "AICTable", category: "Table" },
  { wrapper: "TableFull", coreui: "AICTableFull", category: "Table" },
  { wrapper: "DynamicField", coreui: "AICDynamicField", category: "Forms" },
  { wrapper: "DynamicForm", coreui: "AICDynamicForm", category: "Forms" },
  { wrapper: "SchemaBuilder", coreui: "Custom", category: "Forms" },
  { wrapper: "Fieldset", coreui: "AICFieldset", category: "Forms" },
  { wrapper: "Toolbar", coreui: "AICToolbar", category: "Toolbar" },
  { wrapper: "ToolbarButton", coreui: "AICToolbarButton", category: "Toolbar" },
  { wrapper: "ToolbarButtonGroup", coreui: "AICToolbarButtonGroup", category: "Toolbar" },
];
