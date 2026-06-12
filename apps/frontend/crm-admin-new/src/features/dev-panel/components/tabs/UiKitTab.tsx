"use client";

import { useState, useRef, useCallback } from "react";

import { Icon, Badge } from "@/components/ui";

import { IconGallerySection } from "./ui-kit/IconGallerySection";
import { BasicInputsSection } from "./ui-kit/BasicInputsSection";
import { AdvancedInputsSection } from "./ui-kit/AdvancedInputsSection";
import { SpecialInputsSection } from "./ui-kit/SpecialInputsSection";
import { SelectionControlsSection } from "./ui-kit/SelectionControlsSection";
import { ButtonsSection } from "./ui-kit/ButtonsSection";
import { OverlaysSection } from "./ui-kit/OverlaysSection";
import { DisplaySection } from "./ui-kit/DisplaySection";
import { TableSection } from "./ui-kit/TableSection";
import { FormsSchemaSection } from "./ui-kit/FormsSchemaSection";
import { ToolbarSection } from "./ui-kit/ToolbarSection";
import { ImportPatternSection } from "./ui-kit/ImportPatternSection";

/* ── Section definitions ──────────────────────────────────────── */

type SectionId =
  | "icons"
  | "basic-inputs"
  | "advanced-inputs"
  | "special-inputs"
  | "selection"
  | "buttons"
  | "overlays"
  | "display"
  | "table"
  | "forms"
  | "toolbar"
  | "import-patterns";

interface SectionMeta {
  id: SectionId;
  label: string;
  icon: string;
  count: number;
}

const SECTIONS: SectionMeta[] = [
  { id: "icons", label: "Icon Gallery", icon: "palette", count: 0 },
  { id: "basic-inputs", label: "Basic Inputs", icon: "type", count: 9 },
  { id: "advanced-inputs", label: "Advanced Inputs", icon: "sliders", count: 11 },
  { id: "special-inputs", label: "Special Inputs", icon: "star", count: 6 },
  { id: "selection", label: "Selection Controls", icon: "check-square", count: 3 },
  { id: "buttons", label: "Buttons", icon: "mouse-pointer", count: 4 },
  { id: "overlays", label: "Overlays", icon: "layers", count: 10 },
  { id: "display", label: "Display", icon: "eye", count: 5 },
  { id: "table", label: "Table", icon: "grid", count: 2 },
  { id: "forms", label: "Forms & Schema", icon: "file-text", count: 4 },
  { id: "toolbar", label: "Toolbar", icon: "tool", count: 3 },
  { id: "import-patterns", label: "Import Patterns", icon: "code", count: 56 },
];

const SECTION_COMPONENTS: Record<SectionId, React.ComponentType> = {
  "icons": IconGallerySection,
  "basic-inputs": BasicInputsSection,
  "advanced-inputs": AdvancedInputsSection,
  "special-inputs": SpecialInputsSection,
  "selection": SelectionControlsSection,
  "buttons": ButtonsSection,
  "overlays": OverlaysSection,
  "display": DisplaySection,
  "table": TableSection,
  "forms": FormsSchemaSection,
  "toolbar": ToolbarSection,
  "import-patterns": ImportPatternSection,
};

/* ── Component ────────────────────────────────────────────────── */

export function UiKitTab() {
  const [activeSection, setActiveSection] = useState<SectionId>("icons");
  const pillsRef = useRef<HTMLDivElement>(null);

  const scrollPills = useCallback((direction: "left" | "right") => {
    if (!pillsRef.current) return;
    pillsRef.current.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
  }, []);

  const ActiveComponent = SECTION_COMPONENTS[activeSection];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="layers" size={20} className="text-blue-600" />
          <span className="font-semibold text-gray-800">UI Kit — 56 Wrapper Components</span>
          <Badge variant="primary">Complete</Badge>
        </div>
        <span className="text-xs text-gray-400">@/components/ui barrel</span>
      </div>

      {/* Scrollable Category Pills */}
      <div className="relative">
        <button
          onClick={() => scrollPills("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 text-gray-500"
          aria-label="Scroll left"
        >
          <Icon name="chevron-left" size={14} />
        </button>

        <div
          ref={pillsRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-9 py-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Icon name={section.icon as "home"} size={13} />
              {section.label}
              {section.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeSection === section.id
                    ? "bg-blue-200 text-blue-700"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {section.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollPills("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 text-gray-500"
          aria-label="Scroll right"
        >
          <Icon name="chevron-right" size={14} />
        </button>
      </div>

      {/* Active Section Content */}
      <ActiveComponent />
    </div>
  );
}
