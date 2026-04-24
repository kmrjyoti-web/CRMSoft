'use client';

import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { useBrandPreview } from './BrandPreviewContext';

export type DeviceSize = 'desktop' | 'tablet' | 'mobile';

interface Props {
  device: DeviceSize;
  onDeviceChange: (d: DeviceSize) => void;
}

export function PreviewControls({ device, onDeviceChange }: Props) {
  const { verticals, selectedVerticalCode, setSelectedVerticalCode, brand } = useBrandPreview();

  return (
    <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex items-center gap-4">
      {/* Vertical selector */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs text-[#8b949e] flex-shrink-0">Vertical:</span>
        {verticals.length > 1 ? (
          <select
            value={selectedVerticalCode ?? ''}
            onChange={(e) => setSelectedVerticalCode(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#c9d1d9] px-2 py-1 focus:outline-none focus:border-[#58a6ff] min-w-0"
          >
            {verticals.map((v) => (
              <option key={v.vertical_code} value={v.vertical_code}>
                {v.vertical_name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-[#c9d1d9] truncate">
            {verticals[0]?.vertical_name ?? '—'}
          </span>
        )}
      </div>

      {/* Color swatches */}
      {brand && (
        <div className="flex items-center gap-1.5 text-xs text-[#8b949e]">
          <span>Colors:</span>
          <span
            className="inline-block w-4 h-4 rounded border border-[#30363d]"
            style={{ backgroundColor: brand.primaryColor || '#1976d2' }}
            title={`Primary: ${brand.primaryColor}`}
          />
          <span
            className="inline-block w-4 h-4 rounded border border-[#30363d]"
            style={{ backgroundColor: brand.secondaryColor || '#dc004e' }}
            title={`Secondary: ${brand.secondaryColor}`}
          />
        </div>
      )}

      {/* Device switcher */}
      <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded p-0.5 gap-0.5">
        {(
          [
            { id: 'desktop', Icon: Monitor, title: 'Desktop' },
            { id: 'tablet', Icon: Tablet, title: 'Tablet (768px)' },
            { id: 'mobile', Icon: Smartphone, title: 'Mobile (375px)' },
          ] as const
        ).map(({ id, Icon, title }) => (
          <button
            key={id}
            onClick={() => onDeviceChange(id)}
            title={title}
            className={`p-1.5 rounded transition-colors ${
              device === id
                ? 'bg-[#30363d] text-[#c9d1d9]'
                : 'text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
