'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { ArrowLeft, Plus, Save, RotateCcw, List } from 'lucide-react';
import { api } from '@/lib/api';
import { MenuTreeNode } from '@/components/menu-builder/MenuTreeNode';
import { MenuFormDrawer } from '@/components/menu-builder/MenuFormDrawer';

type MenuItem = {
  id: string;
  vertical_id: string;
  menu_code: string;
  menu_label: string;
  menu_description?: string | null;
  icon_name?: string | null;
  route?: string | null;
  parent_menu_id?: string | null;
  sort_order: number;
  depth_level: number;
  is_visible: boolean;
  is_enabled: boolean;
  badge_type?: string | null;
  badge_value?: string | null;
};

type Vertical = {
  code: string;
  name: string;
  status: string;
};

type DrawerMode = { type: 'edit'; menu: MenuItem } | { type: 'create'; parentId?: string } | null;

export default function MenuBuilderPage() {
  const params = useParams();
  const code = params.code as string;

  const [vertical, setVertical] = useState<Vertical | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [snapshot, setSnapshot] = useState<MenuItem[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState<DrawerMode>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [vData, mData] = await Promise.all([
        api.verticals.get(code) as Promise<Vertical>,
        api.menuEditor.list(code) as Promise<{ success: boolean; data: MenuItem[] }>,
      ]);
      setVertical(vData);
      const items = mData?.data ?? [];
      setMenus(items);
      setSnapshot(JSON.parse(JSON.stringify(items)));
      setExpanded(new Set(items.map((m) => m.id)));
    } catch {
      /* handled via empty state */
    } finally {
      setLoading(false);
      setDirty(false);
    }
  }, [code]);

  useEffect(() => { load(); }, [load]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = menus.findIndex((m) => m.id === active.id);
    const newIdx = menus.findIndex((m) => m.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(menus, oldIdx, newIdx).map((m, i) => ({ ...m, sort_order: i }));
    setMenus(reordered);
    setDirty(true);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const updates = menus.map((m) => ({
        id: m.id,
        sort_order: m.sort_order,
        parent_menu_id: m.parent_menu_id ?? null,
        depth_level: m.depth_level,
      }));
      await api.menuEditor.bulkOrder(code, updates);
      await load();
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setMenus(JSON.parse(JSON.stringify(snapshot)));
    setDirty(false);
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  const deleteMenu = async (menu: MenuItem) => {
    if (!confirm(`Delete "${menu.menu_label}"? Its children will be re-parented.`)) return;
    await api.menuEditor.remove(code, menu.id);
    await load();
  };

  const rootMenus = menus.filter((m) => !m.parent_menu_id);

  function renderTree(menu: MenuItem, depth: number): React.ReactNode {
    const children = menus.filter((m) => m.parent_menu_id === menu.id);
    const hasChildren = children.length > 0;
    const isExpanded = expanded.has(menu.id);

    return (
      <div key={menu.id} className="space-y-1">
        <MenuTreeNode
          menu={menu}
          depth={depth}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          onToggleExpand={() => toggleExpand(menu.id)}
          onEdit={() => setDrawer({ type: 'edit', menu })}
          onDelete={() => deleteMenu(menu)}
          onAddChild={() => setDrawer({ type: 'create', parentId: menu.id })}
        />
        {isExpanded && hasChildren && (
          <div className="space-y-1 pl-4 border-l border-console-border/50">
            {children.map((c) => renderTree(c, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-20 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-console-sidebar border border-console-border rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!vertical) {
    return (
      <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
        <p className="text-sm text-console-muted">Vertical not found</p>
        <Link href="/verticals" className="text-xs text-[#58a6ff] mt-2 inline-block">← Back to verticals</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-console-muted">
        <Link href="/verticals" className="hover:text-console-text">Verticals</Link>
        <span>›</span>
        <Link href={`/verticals/${code}`} className="hover:text-console-text">{vertical.name || code}</Link>
        <span>›</span>
        <span className="text-console-text flex items-center gap-1"><List className="w-3 h-3" /> Menu Builder</span>
      </div>

      {/* Header */}
      <div className="bg-console-sidebar border border-console-border rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/verticals/${code}`} className="text-console-muted hover:text-console-text">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-console-text">
              Menu Builder — {vertical.name || code}
            </h1>
            <p className="text-xs text-console-muted mt-0.5">
              {menus.length} menus · drag to reorder · click <span className="text-[#3fb950]">+</span> to nest
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawer({ type: 'create' })}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-console-accent hover:bg-console-accent/80 text-white rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Menu
          </button>

          {dirty && (
            <>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-console-card border border-console-border text-console-text hover:bg-[#21262d] rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                onClick={saveOrder}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#58a6ff] hover:bg-[#58a6ff]/80 disabled:opacity-50 text-white rounded-md transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Order'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Unsaved notice */}
      {dirty && (
        <div className="bg-[#d29922]/10 border border-[#d29922]/30 rounded-md px-4 py-2.5 text-xs text-[#d29922]">
          Unsaved order changes — click "Save Order" to persist.
        </div>
      )}

      {/* Menu tree */}
      {menus.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <List className="w-8 h-8 mx-auto mb-3 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No menus yet</p>
          <button
            onClick={() => setDrawer({ type: 'create' })}
            className="mt-4 text-xs px-3 py-1.5 bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors"
          >
            Create First Menu
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={menus.map((m) => m.id)} strategy={verticalListSortingStrategy}>
              {rootMenus.map((m) => renderTree(m, 0))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Legend */}
      {menus.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-console-muted pt-2">
          <span>⠿ drag to reorder</span>
          <span>+ add child</span>
          <span>✎ edit</span>
          <span>🗑 delete (re-parents children)</span>
        </div>
      )}

      {/* Drawer */}
      {drawer && (
        <MenuFormDrawer
          menu={drawer.type === 'edit' ? drawer.menu : undefined}
          verticalCode={code}
          allMenus={menus}
          onClose={() => setDrawer(null)}
          onSaved={() => { setDrawer(null); load(); }}
        />
      )}
    </div>
  );
}
