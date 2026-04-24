'use client';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

export type Tab = {
  key: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
};

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export function TabNav({ tabs, active, onChange }: Props) {
  return (
    <div className="border-b border-[#30363d] mb-6">
      <div className="flex gap-0.5 overflow-x-auto">
        {tabs.map(tab => {
          const isActive = tab.key === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5',
                isActive
                  ? 'text-[#58a6ff] border-[#58a6ff]'
                  : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9] hover:border-[#484f58]',
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {tab.label}
              {tab.count !== undefined && (
                <span className={clsx(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  isActive ? 'bg-[#58a6ff]/20 text-[#58a6ff]' : 'bg-[#30363d] text-[#8b949e]',
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
