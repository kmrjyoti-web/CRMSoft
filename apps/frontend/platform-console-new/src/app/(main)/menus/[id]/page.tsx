'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

type FlatMenuItem = {
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
};

export default function EditMenuItemPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [allItems, setAllItems] = useState<FlatMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [menuKey, setMenuKey] = useState('');
  const [label, setLabel] = useState('');
  const [labelHi, setLabelHi] = useState('');
  const [icon, setIcon] = useState('');
  const [parentKey, setParentKey] = useState('');
  const [route, setRoute] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.menus.flat() as FlatMenuItem[] | { items: FlatMenuItem[] };
      const items = Array.isArray(data) ? data : (data as any).items ?? [];
      setAllItems(items);

      const item = items.find((i: FlatMenuItem) => i.id === id);
      if (item) {
        setMenuKey(item.menuKey);
        setLabel(item.label);
        setLabelHi(item.labelHi);
        setIcon(item.icon ?? '');
        setParentKey(item.parentKey ?? '');
        setRoute(item.route ?? '');
        setModuleCode(item.moduleCode ?? '');
        setSortOrder(String(item.sortOrder ?? ''));
        setIsActive(item.isActive);
      }
    } catch {
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const topLevelItems = allItems.filter((i) => !i.parentKey && i.id !== id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !labelHi.trim()) return;
    setSubmitting(true);
    try {
      await api.menus.update(id, {
        label: label.trim(),
        labelHi: labelHi.trim(),
        ...(icon.trim() ? { icon: icon.trim() } : { icon: null }),
        parentKey: parentKey || null,
        ...(route.trim() ? { route: route.trim() } : { route: null }),
        ...(moduleCode.trim() ? { moduleCode: moduleCode.trim() } : { moduleCode: null }),
        ...(sortOrder ? { sortOrder: parseInt(sortOrder, 10) } : {}),
        isActive,
      });
      router.push('/menus');
    } catch {
      // error silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete menu item "${label}"? This action cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.menus.delete(id);
      router.push('/menus');
    } catch {
      // error silently
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-8 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        <div className="h-96 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
      </div>
    );
  }

  const currentItem = allItems.find((i) => i.id === id);
  if (!currentItem) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
        <p className="text-sm text-[#8b949e]">Menu item not found</p>
        <Link href="/menus" className="text-xs text-[#58a6ff] hover:underline mt-2 inline-block">
          Back to menus
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/menus" className="flex items-center gap-1 text-xs text-[#58a6ff] hover:underline mb-3">
          <ArrowLeft className="w-3 h-3" /> Back to menus
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#c9d1d9]">Edit Menu Item</h2>
            <p className="text-xs text-[#8b949e] mt-0.5">
              Key: <code className="bg-white/5 px-1.5 py-0.5 rounded">{menuKey}</code>
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#da3633] text-white rounded-md hover:bg-[#f85149] disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-4">
        {/* menuKey (read-only) */}
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Menu Key</label>
          <input
            type="text"
            value={menuKey}
            disabled
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#8b949e] rounded-md px-3 py-2 text-sm cursor-not-allowed"
          />
        </div>

        {/* label */}
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">
            Label (English) <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
          />
        </div>

        {/* labelHi */}
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">
            Label (Hindi) <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={labelHi}
            onChange={(e) => setLabelHi(e.target.value)}
            required
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
          />
        </div>

        {/* icon */}
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Icon</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="e.g. Users"
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
          />
        </div>

        {/* parentKey */}
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Parent</label>
          <select
            value={parentKey}
            onChange={(e) => setParentKey(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
          >
            <option value="">None (top-level)</option>
            {topLevelItems.map((item) => (
              <option key={item.menuKey} value={item.menuKey}>
                {item.label} ({item.menuKey})
              </option>
            ))}
          </select>
        </div>

        {/* route */}
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Route</label>
          <input
            type="text"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            placeholder="e.g. /leads/pipeline"
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
          />
        </div>

        {/* moduleCode */}
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Module Code</label>
          <input
            type="text"
            value={moduleCode}
            onChange={(e) => setModuleCode(e.target.value)}
            placeholder="e.g. LEADS"
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
          />
        </div>

        {/* sortOrder */}
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
          />
        </div>

        {/* isActive toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-[#c9d1d9]">Active</label>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              isActive ? 'bg-[#238636]' : 'bg-[#21262d]'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                isActive ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !label.trim() || !labelHi.trim()}
            className="px-4 py-2 text-sm bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/menus"
            className="px-4 py-2 text-sm bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
