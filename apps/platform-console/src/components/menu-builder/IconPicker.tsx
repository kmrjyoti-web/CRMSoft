'use client';

import { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Search, X } from 'lucide-react';

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  onClose: () => void;
}

const ICON_NAMES = [
  'Home', 'LayoutDashboard', 'LayoutGrid', 'Layout',
  'Users', 'User', 'UserPlus', 'UserCheck', 'UserCircle', 'Contact',
  'Settings', 'Settings2', 'SlidersHorizontal', 'Wrench', 'Tool',
  'Bell', 'BellRing', 'BellOff',
  'Search', 'SearchCode',
  'FileText', 'File', 'FilePlus', 'FileCheck', 'FileEdit', 'Files',
  'Folder', 'FolderOpen', 'FolderPlus',
  'Save', 'Download', 'Upload', 'CloudUpload', 'CloudDownload',
  'Mail', 'Inbox', 'Send', 'Reply',
  'MessageSquare', 'MessageCircle', 'MessagesSquare',
  'Phone', 'PhoneCall', 'Video',
  'Calendar', 'CalendarDays', 'CalendarCheck', 'Clock', 'Timer',
  'ShoppingCart', 'ShoppingBag', 'Package', 'Package2', 'Box',
  'DollarSign', 'CreditCard', 'Wallet', 'Receipt', 'Banknote', 'Tag', 'Tags',
  'Building', 'Building2', 'Store', 'Warehouse', 'Factory',
  'BarChart', 'BarChart2', 'LineChart', 'PieChart', 'TrendingUp', 'TrendingDown', 'Activity',
  'Target', 'Crosshair', 'Flag', 'Bookmark', 'Heart', 'Star', 'Award',
  'Check', 'CheckCircle', 'CheckSquare', 'CircleCheck',
  'X', 'XCircle', 'AlertCircle', 'AlertTriangle', 'Info',
  'Plus', 'PlusCircle', 'Minus', 'MinusCircle',
  'Edit', 'Edit2', 'Edit3', 'Pencil',
  'Trash', 'Trash2', 'Delete',
  'Eye', 'EyeOff', 'Lock', 'Unlock', 'Key', 'Shield', 'ShieldCheck',
  'Globe', 'Map', 'MapPin', 'Navigation', 'Compass', 'Plane', 'Car', 'Truck',
  'Smartphone', 'Laptop', 'Monitor', 'Tablet', 'Tv', 'Camera',
  'Code', 'Code2', 'Terminal', 'GitBranch', 'GitCommit', 'GitMerge',
  'Database', 'Server', 'Cloud', 'Wifi', 'Signal',
  'Palette', 'Brush', 'Image', 'Layers', 'Sparkles',
  'Zap', 'Crown', 'Gem', 'Rocket',
  'Book', 'BookOpen', 'Library', 'Newspaper', 'Briefcase',
  'Archive', 'Paperclip', 'Link', 'ExternalLink',
  'Filter', 'SortAsc', 'SortDesc', 'RefreshCw', 'RotateCw',
  'Copy', 'Clipboard', 'ClipboardCheck', 'Scissors',
  'ChevronRight', 'ChevronDown', 'ArrowRight', 'ArrowLeft',
  'LifeBuoy', 'HelpCircle', 'List', 'ListChecks',
  'Grid', 'Grid2X2', 'Grid3X3', 'LayoutList',
  'Percent', 'Hash', 'AtSign', 'Repeat', 'Share', 'Share2',
];

export function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? ICON_NAMES.filter((n) => n.toLowerCase().includes(q)) : ICON_NAMES;
  }, [search]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-console-sidebar border border-console-border rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-console-border flex items-center gap-3">
          <h2 className="text-sm font-semibold text-console-text">Choose Icon</h2>
          <div className="flex-1 max-w-xs relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-console-muted" />
            <input
              type="text"
              placeholder="Search icons…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full bg-console-bg border border-console-border rounded pl-8 pr-3 py-1.5 text-xs text-console-text placeholder-console-muted focus:outline-none focus:border-[#58a6ff]"
            />
          </div>
          <p className="text-xs text-console-muted ml-auto">{filtered.length} icons</p>
          <button onClick={onClose} className="text-console-muted hover:text-console-text ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
            {filtered.map((iconName) => {
              const Icon = (Icons as Record<string, any>)[iconName];
              if (!Icon) return null;
              const isSelected = value === iconName;
              return (
                <button
                  key={iconName}
                  onClick={() => { onChange(iconName); onClose(); }}
                  className={`aspect-square rounded flex flex-col items-center justify-center gap-1 p-1.5 border transition-colors ${
                    isSelected
                      ? 'bg-[#58a6ff]/20 border-[#58a6ff] text-[#58a6ff]'
                      : 'bg-console-bg border-console-border hover:border-[#58a6ff]/50 text-console-muted hover:text-console-text'
                  }`}
                  title={iconName}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[8px] truncate w-full text-center leading-tight">{iconName}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 border-t border-console-border flex items-center justify-between">
          <p className="text-xs text-console-muted">
            Selected: {value ? <span className="font-mono text-console-text ml-1">{value}</span> : <span className="italic">none</span>}
          </p>
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 bg-console-card border border-console-border text-console-text rounded hover:bg-[#21262d] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function IconByName({ name, className }: { name?: string | null; className?: string }) {
  if (!name) return null;
  const Icon = (Icons as Record<string, any>)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
