import React from 'react';
import type { AICTableFullViewMode } from '../types';

export function ViewToggleButton({
  icon,
  mode,
  currentMode,
  setMode,
  title,
}: {
  icon: React.ReactNode;
  mode: AICTableFullViewMode;
  currentMode: AICTableFullViewMode;
  setMode: (m: AICTableFullViewMode) => void;
  title: string;
}) {
  const isActive = currentMode === mode;
  return (
    <button
      onClick={() => setMode(mode)}
      title={title}
      className={`p-1.5 rounded-sm transition-colors ${isActive ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
    >
      {icon}
    </button>
  );
}
