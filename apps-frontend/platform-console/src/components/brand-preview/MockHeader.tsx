'use client';

import { Search, Bell } from 'lucide-react';
import { useBrandPreview } from './BrandPreviewContext';

export function MockHeader({ primary, secondary }: { primary: string; secondary: string }) {
  const { brand } = useBrandPreview();
  if (!brand) return null;

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center flex-1 gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            readOnly
            type="text"
            placeholder="Search…"
            className="w-full bg-gray-50 border border-gray-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-gray-500 focus:outline-none cursor-default"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          style={{ color: primary }}
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: secondary }}
          />
        </button>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: primary }}
        >
          U
        </div>
      </div>
    </header>
  );
}
