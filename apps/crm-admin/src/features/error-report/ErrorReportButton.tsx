'use client';

import { Bug } from 'lucide-react';

interface ErrorReportButtonProps {
  onClick: () => void;
}

/**
 * Floating "Report Issue" button fixed to bottom-right corner.
 * Uses only Tailwind — no AIC components (the Drawer is the AIC component).
 */
export function ErrorReportButton({ onClick }: ErrorReportButtonProps) {
  return (
    <button
      onClick={onClick}
      title="Report an issue"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-medium shadow-lg shadow-red-900/30 transition-all"
    >
      <Bug className="w-4 h-4 flex-shrink-0" />
      Report Issue
    </button>
  );
}
