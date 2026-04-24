'use client';
import Link from 'next/link';
import { Package, Shield, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';

interface Props {
  module: {
    id: string;
    moduleCode: string;
    moduleName: string;
    displayName: string;
    description?: string;
    colorTheme?: string;
    iconName?: string;
    isRequired: boolean;
    isPremium: boolean;
    isDefaultEnabled: boolean;
    packagePath?: string;
    addonPrice?: string | number;
    _count?: { features: number; menus: number };
  };
  verticalCode: string;
}

export function ModuleCard({ module, verticalCode }: Props) {
  const initial = module.displayName[0].toUpperCase();
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base flex-shrink-0"
          style={{ backgroundColor: module.colorTheme ?? '#238636' }}
        >
          {initial}
        </div>
        <div className="flex items-center gap-1.5">
          {module.isRequired && (
            <span title="Required" className="text-yellow-500">
              <Shield className="w-3.5 h-3.5" />
            </span>
          )}
          {module.isPremium && (
            <span title="Premium" className="text-purple-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          )}
          {module.isDefaultEnabled
            ? <ToggleRight className="w-5 h-5 text-green-400" />
            : <ToggleLeft className="w-5 h-5 text-[#484f58]" />
          }
        </div>
      </div>

      <Link href={`/vertical-config/${verticalCode}/module/${module.moduleCode}`}>
        <h3 className="font-semibold text-[#c9d1d9] hover:text-[#58a6ff] transition-colors text-sm">
          {module.moduleName}
        </h3>
      </Link>
      <p className="text-xs font-mono text-[#8b949e] mt-0.5">{module.moduleCode}</p>

      {module.description && (
        <p className="text-xs text-[#8b949e] mt-2 line-clamp-2">{module.description}</p>
      )}

      <div className="mt-3 pt-3 border-t border-[#21262d] flex items-center justify-between text-xs text-[#484f58]">
        <div className="flex items-center gap-1">
          <Package className="w-3 h-3" />
          <span>{module._count?.menus ?? 0} menus · {module._count?.features ?? 0} features</span>
        </div>
        {module.addonPrice && (
          <span className="text-green-400">+₹{module.addonPrice}/mo</span>
        )}
      </div>
    </div>
  );
}
