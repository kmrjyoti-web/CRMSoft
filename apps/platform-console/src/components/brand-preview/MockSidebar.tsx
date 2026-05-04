'use client';

import { useBrandPreview } from './BrandPreviewContext';

type Menu = {
  id: string;
  menu_code: string;
  menu_label: string;
  icon_name?: string;
  route?: string;
  parent_menu_id?: string | null;
  sort_order?: number;
  badge_type?: string;
  badge_value?: string;
};

export function MockSidebar({ primary, secondary }: { primary: string; secondary: string }) {
  const { brand, effectiveConfig, effectiveLoading } = useBrandPreview();

  if (!brand) return null;

  const verticalName = effectiveConfig
    ? (effectiveConfig.vertical as Record<string, unknown>).display_name as string
    : '';
  const menus: Menu[] = (effectiveConfig?.menus ?? []) as Menu[];
  const rootMenus = menus
    .filter((m) => !m.parent_menu_id)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col"
      style={{ backgroundColor: primary, minHeight: '100%' }}
    >
      {/* Brand header */}
      <div className="px-4 py-4 border-b border-white/20">
        <div className="flex items-center gap-2.5">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.brandName} className="h-7 w-auto object-contain" />
          ) : (
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: secondary }}
            >
              {(brand.displayName || brand.brandName)[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate leading-tight">
              {brand.displayName || brand.brandName}
            </p>
            {verticalName && (
              <p className="text-white/50 text-[10px] truncate leading-tight">{verticalName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {effectiveLoading ? (
          <div className="px-4 py-3 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 bg-white/10 rounded animate-pulse" />
            ))}
          </div>
        ) : rootMenus.length === 0 ? (
          <p className="text-white/40 text-xs px-4 py-4">No menus configured</p>
        ) : (
          rootMenus.map((menu) => (
            <MenuRow
              key={menu.id}
              menu={menu}
              allMenus={menus}
              depth={0}
              secondary={secondary}
            />
          ))
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 py-3 border-t border-white/20 flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: secondary }}
        >
          U
        </div>
        <div className="min-w-0">
          <p className="text-white text-xs font-medium leading-tight truncate">Demo User</p>
          <p className="text-white/40 text-[10px] leading-tight truncate">user@{brand.domain || 'example.com'}</p>
        </div>
      </div>
    </aside>
  );
}

function MenuRow({
  menu,
  allMenus,
  depth,
  secondary,
}: {
  menu: Menu;
  allMenus: Menu[];
  depth: number;
  secondary: string;
}) {
  const children = allMenus
    .filter((m) => m.parent_menu_id === menu.id)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <>
      <div
        className="flex items-center gap-2 py-2 text-white/80 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
        style={{ paddingLeft: `${depth * 12 + 16}px`, paddingRight: '16px' }}
      >
        <span className="text-xs flex-1 leading-tight">{menu.menu_label}</span>
        {menu.badge_value && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-medium text-white flex-shrink-0"
            style={{ backgroundColor: secondary }}
          >
            {menu.badge_value}
          </span>
        )}
      </div>
      {children.map((child) => (
        <MenuRow key={child.id} menu={child} allMenus={allMenus} depth={depth + 1} secondary={secondary} />
      ))}
    </>
  );
}
