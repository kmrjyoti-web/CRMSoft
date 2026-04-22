'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

type MenuItem = {
  id: string;
  menuKey: string;
  label: string;
  labelHi: string;
  icon?: string;
  parentKey?: string;
  route?: string;
  moduleCode?: string;
  sortOrder: number;
  isActive: boolean;
  children?: MenuItem[];
};

type BrandMenuItem = MenuItem & {
  isHidden?: boolean;
  customLabel?: string;
  customIcon?: string;
  isWhitelisted?: boolean;
};

type Override = {
  id: string;
  menuKey: string;
  customLabel?: string;
  customIcon?: string;
  isHidden?: boolean;
  sortOrder?: number;
};

export default function BrandMenuOverridesPage() {
  const params = useParams();
  const brandId = params.brandId as string;

  const [globalTree, setGlobalTree] = useState<MenuItem[]>([]);
  const [brandTree, setBrandTree] = useState<BrandMenuItem[]>([]);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(true);

  // Add override form
  const [showAddOverride, setShowAddOverride] = useState(false);
  const [newMenuKey, setNewMenuKey] = useState('');
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newIsHidden, setNewIsHidden] = useState(false);
  const [newSortOrder, setNewSortOrder] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Collapsed state
  const [collapsedGlobal, setCollapsedGlobal] = useState<Set<string>>(new Set());
  const [collapsedBrand, setCollapsedBrand] = useState<Set<string>>(new Set());

  // Flat menu for the override select
  const [flatMenuItems, setFlatMenuItems] = useState<Array<{ menuKey: string; label: string }>>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gTree, bTree, oData, flatData] = await Promise.all([
        api.menus.tree() as Promise<MenuItem[] | { items: MenuItem[] }>,
        api.menus.brandMenu(brandId) as Promise<BrandMenuItem[] | { items: BrandMenuItem[] }>,
        api.menus.brandOverrides(brandId) as Promise<Override[] | { items: Override[] }>,
        api.menus.flat() as Promise<Array<{ menuKey: string; label: string }> | { items: Array<{ menuKey: string; label: string }> }>,
      ]);
      setGlobalTree(Array.isArray(gTree) ? gTree : (gTree as any).items ?? []);
      setBrandTree(Array.isArray(bTree) ? bTree : (bTree as any).items ?? []);
      setOverrides(Array.isArray(oData) ? oData : (oData as any).items ?? []);
      setFlatMenuItems(Array.isArray(flatData) ? flatData : (flatData as any).items ?? []);
    } catch {
      setGlobalTree([]);
      setBrandTree([]);
      setOverrides([]);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddOverride = async () => {
    if (!newMenuKey) return;
    setSubmitting(true);
    try {
      await api.menus.setBrandOverride(brandId, {
        menuKey: newMenuKey,
        ...(newCustomLabel.trim() ? { customLabel: newCustomLabel.trim() } : {}),
        isHidden: newIsHidden,
        ...(newSortOrder ? { sortOrder: parseInt(newSortOrder, 10) } : {}),
      });
      setShowAddOverride(false);
      setNewMenuKey('');
      setNewCustomLabel('');
      setNewIsHidden(false);
      setNewSortOrder('');
      fetchData();
    } catch {
      // silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveOverride = async (override: Override) => {
    if (!confirm(`Remove override for "${override.menuKey}"?`)) return;
    try {
      await api.menus.removeBrandOverride(brandId, override.id);
      fetchData();
    } catch {
      // silently
    }
  };

  const toggleGlobal = (key: string) => {
    setCollapsedGlobal((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleBrand = (key: string) => {
    setCollapsedBrand((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const renderGlobalItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isCollapsed = collapsedGlobal.has(item.menuKey);

    return (
      <div key={item.menuKey}>
        <div
          className="flex items-center gap-2 py-1.5"
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleGlobal(item.menuKey)} className="text-[#8b949e]">
              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          ) : (
            <span className="w-3" />
          )}
          <span className="text-xs text-[#c9d1d9]">{item.label}</span>
          {item.moduleCode && (
            <code className="text-[10px] bg-white/5 px-1 py-0.5 rounded text-[#8b949e]">{item.moduleCode}</code>
          )}
        </div>
        {hasChildren && !isCollapsed && item.children!.map((c) => renderGlobalItem(c, depth + 1))}
      </div>
    );
  };

  const renderBrandItem = (item: BrandMenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isCollapsed = collapsedBrand.has(item.menuKey);

    return (
      <div key={item.menuKey}>
        <div
          className="flex items-center gap-2 py-1.5"
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleBrand(item.menuKey)} className="text-[#8b949e]">
              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          ) : (
            <span className="w-3" />
          )}
          <span className={`text-xs ${item.isHidden ? 'text-[#8b949e] line-through' : 'text-[#c9d1d9]'}`}>
            {item.customLabel ? (
              <>
                <span className="text-[#8b949e] line-through mr-1">{item.label}</span>
                <span className="text-[#58a6ff]">{item.customLabel}</span>
              </>
            ) : (
              item.label
            )}
          </span>
          {item.isHidden && (
            <span className="text-[10px] bg-[#30363d] text-[#8b949e] px-1.5 py-0.5 rounded">HIDDEN</span>
          )}
          {item.isWhitelisted === false && (
            <span className="text-[10px] bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded">NOT WHITELISTED</span>
          )}
        </div>
        {hasChildren && !isCollapsed && (item.children as BrandMenuItem[])!.map((c) => renderBrandItem(c, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
          <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href={`/brands/${brandId}`} className="flex items-center gap-1 text-xs text-[#58a6ff] hover:underline mb-3">
          <ArrowLeft className="w-3 h-3" /> Back to brand
        </Link>
        <h2 className="text-base font-semibold text-[#c9d1d9]">Menu Overrides for {brandId}</h2>
        <p className="text-xs text-[#8b949e] mt-0.5">Compare global menu with brand-specific customizations</p>
      </div>

      {/* Side-by-side trees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Global menu */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Global Menu</h3>
          {globalTree.length > 0 ? (
            globalTree.map((item) => renderGlobalItem(item))
          ) : (
            <p className="text-xs text-[#8b949e]">No menu items</p>
          )}
        </div>

        {/* Brand menu */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Brand Menu (with overrides)</h3>
          {brandTree.length > 0 ? (
            brandTree.map((item) => renderBrandItem(item))
          ) : (
            <p className="text-xs text-[#8b949e]">No menu items</p>
          )}
        </div>
      </div>

      {/* Override Management */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#c9d1d9]">Overrides</h3>
          <button
            onClick={() => setShowAddOverride(!showAddOverride)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Override
          </button>
        </div>

        {/* Add override inline form */}
        {showAddOverride && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-wrap items-end gap-3 mb-4">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Menu Key</label>
              <select
                value={newMenuKey}
                onChange={(e) => setNewMenuKey(e.target.value)}
                className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
              >
                <option value="">Select...</option>
                {flatMenuItems.map((item) => (
                  <option key={item.menuKey} value={item.menuKey}>
                    {item.label} ({item.menuKey})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Custom Label</label>
              <input
                type="text"
                value={newCustomLabel}
                onChange={(e) => setNewCustomLabel(e.target.value)}
                placeholder="Optional"
                className="bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#8b949e]">Hidden</label>
              <button
                type="button"
                onClick={() => setNewIsHidden(!newIsHidden)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  newIsHidden ? 'bg-[#238636]' : 'bg-[#21262d]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    newIsHidden ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Sort Order</label>
              <input
                type="number"
                value={newSortOrder}
                onChange={(e) => setNewSortOrder(e.target.value)}
                placeholder="Optional"
                className="w-20 bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddOverride}
              disabled={submitting || !newMenuKey}
              className="px-3 py-2 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => setShowAddOverride(false)}
              className="px-3 py-2 text-xs bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Overrides table */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363d]">
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Menu Key</th>
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Custom Label</th>
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Hidden</th>
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Sort Order</th>
                <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {overrides.length > 0 ? (
                overrides.map((o) => (
                  <tr key={o.id} className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-[#c9d1d9] font-mono text-xs">{o.menuKey}</td>
                    <td className="px-4 py-3 text-[#c9d1d9] text-xs">{o.customLabel || '—'}</td>
                    <td className="px-4 py-3">
                      {o.isHidden ? (
                        <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded">Yes</span>
                      ) : (
                        <span className="text-xs text-[#8b949e]">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#8b949e] text-xs">{o.sortOrder ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/menus/brands/${brandId}`}
                          className="text-xs text-[#58a6ff] hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleRemoveOverride(o)}
                          className="text-xs text-red-400 hover:underline"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#8b949e]">
                    No overrides configured
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
