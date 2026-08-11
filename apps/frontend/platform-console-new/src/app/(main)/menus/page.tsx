'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, ChevronDown, ChevronRight, GripVertical, ArrowUp, ArrowDown, Save, Menu } from 'lucide-react';
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

export default function MenusPage() {
  const [tree, setTree] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [localTree, setLocalTree] = useState<MenuItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.menus.tree() as MenuItem[] | { items: MenuItem[] };
      const items = Array.isArray(data) ? data : (data as any).items ?? [];
      setTree(items);
      setLocalTree(JSON.parse(JSON.stringify(items)));
      setHasChanges(false);
    } catch {
      setTree([]);
      setLocalTree([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCollapse = (menuKey: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(menuKey)) next.delete(menuKey);
      else next.add(menuKey);
      return next;
    });
  };

  const moveItem = (items: MenuItem[], index: number, direction: 'up' | 'down'): MenuItem[] => {
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return items;
    const newItems = [...items];
    const tempOrder = newItems[index].sortOrder;
    newItems[index].sortOrder = newItems[swapIdx].sortOrder;
    newItems[swapIdx].sortOrder = tempOrder;
    [newItems[index], newItems[swapIdx]] = [newItems[swapIdx], newItems[index]];
    return newItems;
  };

  const handleMove = (parentKey: string | undefined, index: number, direction: 'up' | 'down') => {
    setLocalTree((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as MenuItem[];
      if (!parentKey) {
        return moveItem(next, index, direction);
      }
      // Find parent and move child
      const findAndMove = (items: MenuItem[]): MenuItem[] => {
        return items.map((item) => {
          if (item.menuKey === parentKey && item.children) {
            return { ...item, children: moveItem(item.children, index, direction) };
          }
          if (item.children) {
            return { ...item, children: findAndMove(item.children) };
          }
          return item;
        });
      };
      return findAndMove(next);
    });
    setHasChanges(true);
  };

  const collectAllItems = (items: MenuItem[]): Array<{ id: string; sortOrder: number; parentKey?: string }> => {
    const result: Array<{ id: string; sortOrder: number; parentKey?: string }> = [];
    items.forEach((item) => {
      result.push({ id: item.id, sortOrder: item.sortOrder, parentKey: item.parentKey });
      if (item.children) {
        result.push(...collectAllItems(item.children));
      }
    });
    return result;
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const items = collectAllItems(localTree);
      await api.menus.reorder(items);
      setHasChanges(false);
      fetchData();
    } catch {
      // error silently
    } finally {
      setSaving(false);
    }
  };

  const renderItem = (item: MenuItem, index: number, siblings: MenuItem[], parentKey?: string, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isCollapsed = collapsed.has(item.menuKey);

    return (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 px-4 py-2.5 border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors`}
          style={{ paddingLeft: `${16 + depth * 24}px` }}
        >
          {/* Drag handle (visual) */}
          <GripVertical className="w-3.5 h-3.5 text-[#8b949e]/40 flex-shrink-0" />

          {/* Expand/collapse for parents */}
          {hasChildren ? (
            <button onClick={() => toggleCollapse(item.menuKey)} className="text-[#8b949e] hover:text-[#c9d1d9]">
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-3.5" />
          )}

          {/* Icon name */}
          {item.icon && (
            <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-[#8b949e] flex-shrink-0">
              {item.icon}
            </code>
          )}

          {/* Label */}
          <span className={`text-sm flex-1 ${item.isActive ? 'text-[#c9d1d9]' : 'text-[#8b949e] line-through'}`}>
            {item.label}
            <span className="text-xs text-[#8b949e] ml-1">({item.labelHi})</span>
          </span>

          {/* Module code badge */}
          {item.moduleCode && (
            <span className="text-xs bg-[#58a6ff]/10 text-[#58a6ff] px-1.5 py-0.5 rounded flex-shrink-0">
              {item.moduleCode}
            </span>
          )}

          {/* Route */}
          {item.route && (
            <code className="text-xs text-[#8b949e] bg-white/5 px-1.5 py-0.5 rounded flex-shrink-0 max-w-32 truncate">
              {item.route}
            </code>
          )}

          {/* Active indicator */}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isActive ? 'bg-[#3fb950]' : 'bg-[#8b949e]'}`} />

          {/* Move buttons */}
          <button
            onClick={() => handleMove(parentKey, index, 'up')}
            disabled={index === 0}
            className="p-1 text-[#8b949e] hover:text-[#c9d1d9] disabled:opacity-20 transition-colors"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleMove(parentKey, index, 'down')}
            disabled={index === siblings.length - 1}
            className="p-1 text-[#8b949e] hover:text-[#c9d1d9] disabled:opacity-20 transition-colors"
          >
            <ArrowDown className="w-3 h-3" />
          </button>

          {/* Edit link */}
          <Link href={`/menus/${item.id}`} className="text-xs text-[#58a6ff] hover:underline flex-shrink-0">
            Edit
          </Link>
        </div>

        {/* Children */}
        {hasChildren && !isCollapsed && (
          <div>
            {item.children!.map((child, cIdx) =>
              renderItem(child, cIdx, item.children!, item.menuKey, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Global Menu Tree</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">Manage the master menu structure for all brands</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Order'}
            </button>
          )}
          <Link
            href="/menus/new"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Menu Item
          </Link>
        </div>
      </div>

      {/* Tree */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        {localTree.length > 0 ? (
          localTree.map((item, idx) => renderItem(item, idx, localTree, undefined, 0))
        ) : (
          <div className="px-4 py-12 text-center">
            <Menu className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
            <p className="text-sm text-[#8b949e]">No menu items found</p>
          </div>
        )}
      </div>
    </div>
  );
}
