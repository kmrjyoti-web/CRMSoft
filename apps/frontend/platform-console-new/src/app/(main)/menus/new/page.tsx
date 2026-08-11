'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

type FlatMenuItem = {
  id: string;
  menuKey: string;
  label: string;
  parentKey?: string;
};

export default function NewMenuItemPage() {
  const router = useRouter();
  const [topLevelItems, setTopLevelItems] = useState<FlatMenuItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [menuKey, setMenuKey] = useState('');
  const [label, setLabel] = useState('');
  const [labelHi, setLabelHi] = useState('');
  const [icon, setIcon] = useState('');
  const [parentKey, setParentKey] = useState('');
  const [route, setRoute] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  const fetchParents = useCallback(async () => {
    try {
      const data = await api.menus.flat() as FlatMenuItem[] | { items: FlatMenuItem[] };
      const items = Array.isArray(data) ? data : (data as any).items ?? [];
      setTopLevelItems(items.filter((i: FlatMenuItem) => !i.parentKey));
    } catch {
      setTopLevelItems([]);
    }
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuKey.trim() || !label.trim() || !labelHi.trim()) return;
    setSubmitting(true);
    try {
      await api.menus.create({
        menuKey: menuKey.trim(),
        label: label.trim(),
        labelHi: labelHi.trim(),
        ...(icon.trim() ? { icon: icon.trim() } : {}),
        ...(parentKey ? { parentKey } : {}),
        ...(route.trim() ? { route: route.trim() } : {}),
        ...(moduleCode.trim() ? { moduleCode: moduleCode.trim() } : {}),
        ...(sortOrder ? { sortOrder: parseInt(sortOrder, 10) } : {}),
      });
      router.push('/menus');
    } catch {
      // error silently
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/menus" className="flex items-center gap-1 text-xs text-[#58a6ff] hover:underline mb-3">
          <ArrowLeft className="w-3 h-3" /> Back to menus
        </Link>
        <h2 className="text-base font-semibold text-[#c9d1d9]">Create Menu Item</h2>
        <p className="text-xs text-[#8b949e] mt-0.5">Add a new item to the global menu tree</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-4">
        {/* menuKey */}
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">
            Menu Key <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={menuKey}
            onChange={(e) => setMenuKey(e.target.value)}
            placeholder="e.g. LEADS_PIPELINE"
            required
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
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
            placeholder="e.g. Leads Pipeline"
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
            placeholder="e.g. लीड्स पाइपलाइन"
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
            placeholder="e.g. 10"
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !menuKey.trim() || !label.trim() || !labelHi.trim()}
            className="px-4 py-2 text-sm bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Menu Item'}
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
