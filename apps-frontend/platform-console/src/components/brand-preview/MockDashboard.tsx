'use client';

import { useBrandPreview } from './BrandPreviewContext';

type Module = { id: string; module_code: string; module_name: string; display_name: string; description?: string; color_theme?: string; icon_name?: string };
type Feature = { id: string; feature_code: string; feature_name: string; category?: string; is_premium?: boolean; is_beta?: boolean };

export function MockDashboard({ primary, secondary }: { primary: string; secondary: string }) {
  const { brand, effectiveConfig, effectiveLoading } = useBrandPreview();

  if (!brand) return null;

  if (effectiveLoading) {
    return (
      <div className="flex-1 bg-gray-50 p-5 overflow-y-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const vertical = effectiveConfig?.vertical as Record<string, unknown> | undefined;
  const modules: Module[] = (effectiveConfig?.modules ?? []) as Module[];
  const features: Feature[] = (effectiveConfig?.features ?? []) as Feature[];
  const brandCfg = effectiveConfig?.brand_config as Record<string, unknown> | null;

  const verticalName = vertical?.display_name as string ?? 'Your Platform';
  const description = vertical?.description as string ?? `Welcome to your ${brand.displayName} platform`;
  const basePrice = (brandCfg?.custom_price ?? vertical?.base_price) as number | null;
  const perUserPrice = (brandCfg?.custom_per_user_price ?? vertical?.per_user_price) as number | null;

  return (
    <div className="flex-1 bg-gray-50 p-5 overflow-y-auto">
      {/* Hero banner */}
      <div
        className="rounded-lg p-5 text-white mb-5"
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
        }}
      >
        <p className="text-[10px] font-mono opacity-60 mb-0.5">{brand.brandCode}</p>
        <h1 className="text-lg font-bold leading-tight">
          {brand.displayName || brand.brandName}
        </h1>
        <p className="text-xs opacity-80 mt-1">{description}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Modules" value={modules.length} color={primary} />
        <StatCard label="Features" value={features.length} color={secondary} />
        <StatCard label="Users" value="—" color="#6366f1" />
        <StatCard label="Uptime" value="99.9%" color="#10b981" />
      </div>

      {/* Modules */}
      {modules.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: primary }}
            />
            Enabled Modules ({modules.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {modules.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100"
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: m.color_theme || primary }}
                >
                  {(m.display_name || m.module_name)[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{m.module_name}</p>
                  {m.description && (
                    <p className="text-[10px] text-gray-500 truncate">{m.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      {features.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: secondary }}
            />
            Active Features ({features.length})
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {features.map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-[11px] border border-gray-200"
              >
                {f.feature_name}
                {f.is_premium && (
                  <span
                    className="text-[9px] px-1 py-0.5 rounded text-white font-medium"
                    style={{ backgroundColor: secondary }}
                  >
                    PRO
                  </span>
                )}
                {f.is_beta && (
                  <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-500 text-white font-medium">
                    BETA
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* No content */}
      {modules.length === 0 && features.length === 0 && (
        <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
          <p className="text-sm text-gray-500">No modules or features configured for this vertical.</p>
          <p className="text-xs text-gray-400 mt-1">Add modules and features to see them here.</p>
        </div>
      )}

      {/* Pricing */}
      {(basePrice != null || perUserPrice != null) && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Subscription</h2>
          <div className="flex items-baseline gap-1.5">
            {basePrice != null && (
              <>
                <span className="text-2xl font-bold" style={{ color: primary }}>
                  ₹{Number(basePrice).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-500">/mo</span>
              </>
            )}
            {perUserPrice != null && (
              <span className="text-xs text-gray-500 ml-1">
                + ₹{Number(perUserPrice).toLocaleString('en-IN')}/user
              </span>
            )}
          </div>
          {brandCfg?.custom_price != null && (
            <p className="text-[10px] text-green-600 mt-1">Custom brand pricing applied</p>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold mt-0.5" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
