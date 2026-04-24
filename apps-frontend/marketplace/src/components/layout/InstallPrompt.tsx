'use client';

import { X, Download } from 'lucide-react';
import { useInstallPWA } from '../../hooks/useInstallPWA';
import { useState } from 'react';

export function InstallPrompt() {
  const { canInstall, install } = useInstallPWA();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 shadow-xl flex items-center gap-3 max-w-lg mx-auto">
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <Download size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">Install Marketplace</p>
        <p className="text-orange-100 text-xs">Add to home screen for the best experience</p>
      </div>
      <button
        onClick={() => install()}
        className="bg-white text-orange-600 text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
      >
        Install
      </button>
      <button onClick={() => setDismissed(true)} className="p-1 text-white/70">
        <X size={18} />
      </button>
    </div>
  );
}
