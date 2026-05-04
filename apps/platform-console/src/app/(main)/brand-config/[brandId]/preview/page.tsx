'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Layers } from 'lucide-react';
import { BrandPreviewProvider, useBrandPreview } from '@/components/brand-preview/BrandPreviewContext';
import { MockSidebar } from '@/components/brand-preview/MockSidebar';
import { MockHeader } from '@/components/brand-preview/MockHeader';
import { MockDashboard } from '@/components/brand-preview/MockDashboard';
import { PreviewControls, DeviceSize } from '@/components/brand-preview/PreviewControls';

export default function BrandPreviewPage() {
  const params = useParams();
  const brandId = params.brandId as string;

  return (
    <BrandPreviewProvider brandId={brandId}>
      <PreviewShell brandId={brandId} />
    </BrandPreviewProvider>
  );
}

function PreviewShell({ brandId }: { brandId: string }) {
  const { brand, verticals, loading } = useBrandPreview();
  const [device, setDevice] = useState<DeviceSize>('desktop');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xs text-[#8b949e] animate-pulse">Loading preview…</p>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-3">
        <p className="text-sm text-[#8b949e]">Brand not found.</p>
        <Link href="/brand-config" className="text-xs text-[#58a6ff] hover:underline">
          ← Back to brands
        </Link>
      </div>
    );
  }

  const primary = brand.primaryColor || '#1976d2';
  const secondary = brand.secondaryColor || '#dc004e';

  return (
    <div className="space-y-0 -mx-6 -mt-6">
      {/* Top bar */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex items-center gap-3">
        <Link
          href={`/brand-config/${brandId}`}
          className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {brand.brandName}
        </Link>
        <span className="text-[#30363d]">/</span>
        <div className="flex items-center gap-1.5 text-xs text-[#c9d1d9]">
          <Eye className="w-3.5 h-3.5 text-[#58a6ff]" />
          Live Preview
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primary }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: secondary }} />
          <span className="text-xs text-[#8b949e]">{brand.displayName || brand.brandName}</span>
        </div>
      </div>

      {/* No verticals state */}
      {verticals.length === 0 && (
        <div className="p-12 text-center space-y-3">
          <Layers className="w-10 h-10 mx-auto text-[#8b949e] opacity-30" />
          <p className="text-sm text-[#8b949e]">No verticals enabled for this brand.</p>
          <p className="text-xs text-[#8b949e]/60">
            Enable at least one vertical in the Verticals tab to see the live preview.
          </p>
          <Link
            href={`/brand-config/${brandId}`}
            className="inline-block text-xs px-3 py-1.5 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors mt-2"
          >
            Configure Verticals
          </Link>
        </div>
      )}

      {/* Preview */}
      {verticals.length > 0 && (
        <>
          <PreviewControls device={device} onDeviceChange={setDevice} />

          <div className="bg-[#0d1117] p-4 flex justify-center min-h-[calc(100vh-140px)]">
            <PreviewFrame primary={primary} secondary={secondary} device={device} />
          </div>

          {/* Legend */}
          <div className="bg-[#161b22] border-t border-[#30363d] px-4 py-3">
            <p className="text-[11px] text-[#8b949e]">
              <span className="text-[#c9d1d9] font-medium">What you see:</span>{' '}
              brand colors applied · only enabled modules shown · overridden menus hidden ·
              disabled features removed · custom pricing reflected
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function PreviewFrame({
  primary,
  secondary,
  device,
}: {
  primary: string;
  secondary: string;
  device: DeviceSize;
}) {
  const widthClass =
    device === 'mobile'
      ? 'w-[375px]'
      : device === 'tablet'
      ? 'w-[768px]'
      : 'w-full max-w-5xl';

  return (
    <div
      className={`${widthClass} bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col transition-all duration-200`}
      style={{ minHeight: '600px' }}
    >
      <div className="flex flex-1 min-h-0" style={{ minHeight: '600px' }}>
        {/* Sidebar hidden on mobile */}
        {device !== 'mobile' && (
          <MockSidebar primary={primary} secondary={secondary} />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <MockHeader primary={primary} secondary={secondary} />
          <MockDashboard primary={primary} secondary={secondary} />
        </div>
      </div>
    </div>
  );
}
