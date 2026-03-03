"use client";

import { useState, useMemo } from "react";

import { Icon, Input } from "@/components/ui";
import { ICON_MAP } from "@/components/ui/Icon";

export function IconGallerySection() {
  const [search, setSearch] = useState("");
  const iconNames = useMemo(() => Object.keys(ICON_MAP).sort(), []);
  const filtered = useMemo(() => {
    if (!search) return iconNames;
    return iconNames.filter((n) => n.toLowerCase().includes(search.toLowerCase()));
  }, [iconNames, search]);

  const [copied, setCopied] = useState<string | null>(null);
  const copy = (name: string) => {
    navigator.clipboard.writeText(`<Icon name="${name}" size={18} />`);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-4">
      <Input placeholder="Search icons..." value={search} onChange={(v) => setSearch(v)} leftIcon={<Icon name="search" size={16} />} />
      <div className="text-sm text-gray-500">{filtered.length} of {iconNames.length} icons</div>
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
        {filtered.map((name) => (
          <button key={name} onClick={() => copy(name)} className="flex flex-col items-center gap-1 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group" title={`<Icon name="${name}" />`}>
            <Icon name={name as "home"} size={20} className="text-gray-700 group-hover:text-blue-600" />
            <span className="text-[10px] text-gray-400 group-hover:text-blue-500 truncate w-full text-center">
              {copied === name ? "Copied!" : name}
            </span>
          </button>
        ))}
      </div>
      {/* Usage examples */}
      <div className="bg-gray-900 rounded-lg p-3 mt-4">
        <pre className="text-xs text-green-400 font-mono">{`import { Icon } from "@/components/ui";\n\n<Icon name="user" size={18} />\n<Icon name="mail" size={16} className="text-gray-500" />\n<Icon name="check-circle" size={24} color="#22c55e" />\n\n// NEVER import from lucide-react directly`}</pre>
      </div>
    </div>
  );
}
