'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { IconPicker, IconByName } from './IconPicker';

export type MenuFormData = {
  menu_code: string;
  menu_label: string;
  menu_description: string;
  icon_name: string;
  route: string;
  parent_menu_id: string;
  sort_order: number;
  is_visible: boolean;
  is_enabled: boolean;
  badge_type: string;
  badge_value: string;
};

interface MenuFormDrawerProps {
  menu?: any;
  verticalCode: string;
  allMenus: any[];
  onClose: () => void;
  onSaved: () => void;
}

const BADGE_TYPES = ['', 'new', 'beta', 'pro', 'count'];

export function MenuFormDrawer({ menu, verticalCode, allMenus, onClose, onSaved }: MenuFormDrawerProps) {
  const isEdit = !!menu;
  const routeDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState<MenuFormData>({
    menu_code: menu?.menu_code ?? '',
    menu_label: menu?.menu_label ?? '',
    menu_description: menu?.menu_description ?? '',
    icon_name: menu?.icon_name ?? '',
    route: menu?.route ?? '',
    parent_menu_id: menu?.parent_menu_id ?? '',
    sort_order: menu?.sort_order ?? 0,
    is_visible: menu?.is_visible ?? true,
    is_enabled: menu?.is_enabled ?? true,
    badge_type: menu?.badge_type ?? '',
    badge_value: menu?.badge_value ?? '',
  });

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [routeState, setRouteState] = useState<{ isValid: boolean; message: string } | null>(null);

  const set = <K extends keyof MenuFormData>(key: K, val: MenuFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    if (!form.route) { setRouteState(null); return; }
    if (routeDebounce.current) clearTimeout(routeDebounce.current);
    routeDebounce.current = setTimeout(async () => {
      try {
        const data = await api.menuEditor.validateRoute(verticalCode, form.route, menu?.id) as any;
        setRouteState(data?.data ?? null);
      } catch { /* silent */ }
    }, 500);
  }, [form.route, verticalCode, menu?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        menu_label: form.menu_label.trim(),
        menu_description: form.menu_description.trim() || null,
        icon_name: form.icon_name || null,
        route: form.route.trim() || null,
        parent_menu_id: form.parent_menu_id || null,
        sort_order: form.sort_order,
        is_visible: form.is_visible,
        is_enabled: form.is_enabled,
        badge_type: form.badge_type || null,
        badge_value: form.badge_value.trim() || null,
      };
      if (!isEdit) {
        payload.menu_code = form.menu_code.trim();
      }
      if (isEdit) {
        await api.menuEditor.update(verticalCode, menu.id, payload);
      } else {
        await api.menuEditor.create(verticalCode, payload);
      }
      onSaved();
    } catch { /* silent */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete menu "${menu.menu_label}"? Its children will be re-parented.`)) return;
    setDeleting(true);
    try {
      await api.menuEditor.remove(verticalCode, menu.id);
      onSaved();
    } catch { /* silent */ }
    setDeleting(false);
  };

  const canSave = form.menu_label.trim() !== '' && (isEdit || form.menu_code.trim() !== '');

  const parentOptions = allMenus.filter((m) => m.id !== menu?.id && m.parent_menu_id !== menu?.id);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-console-sidebar border-l border-console-border z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-console-border flex-shrink-0">
          <h2 className="text-sm font-semibold text-console-text">{isEdit ? 'Edit Menu' : 'Add Menu'}</h2>
          <button onClick={onClose} className="text-console-muted hover:text-console-text">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Icon selector */}
          <div>
            <label className="block text-xs text-console-muted mb-1.5">Icon</label>
            <button
              type="button"
              onClick={() => setShowIconPicker(true)}
              className="w-full flex items-center gap-3 bg-console-bg border border-console-border rounded px-3 py-2 hover:border-[#58a6ff]/50 transition-colors text-left"
            >
              {form.icon_name ? (
                <>
                  <IconByName name={form.icon_name} className="w-4 h-4 text-[#58a6ff]" />
                  <span className="text-xs font-mono text-console-text">{form.icon_name}</span>
                </>
              ) : (
                <span className="text-xs text-console-muted">Click to choose icon…</span>
              )}
            </button>
          </div>

          {!isEdit && (
            <FormField
              label="Menu Code *"
              value={form.menu_code}
              onChange={(v) => set('menu_code', v)}
              placeholder="e.g., leads"
              mono
            />
          )}

          <FormField
            label="Menu Label *"
            value={form.menu_label}
            onChange={(v) => set('menu_label', v)}
            placeholder="e.g., Leads"
          />

          <div>
            <label className="block text-xs text-console-muted mb-1.5">Description</label>
            <textarea
              className="w-full bg-console-bg border border-console-border rounded px-3 py-2 text-xs text-console-text placeholder-console-muted resize-none focus:outline-none focus:border-[#58a6ff]"
              rows={2}
              value={form.menu_description}
              onChange={(e) => set('menu_description', e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div>
            <FormField
              label="Route"
              value={form.route}
              onChange={(v) => set('route', v)}
              placeholder="e.g., /leads"
              mono
            />
            {routeState && (
              <p className={`text-xs mt-1 ${routeState.isValid ? 'text-[#3fb950]' : 'text-red-400'}`}>
                {routeState.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-console-muted mb-1.5">Parent Menu</label>
            <select
              className="w-full bg-console-bg border border-console-border rounded px-3 py-2 text-xs text-console-text focus:outline-none focus:border-[#58a6ff]"
              value={form.parent_menu_id}
              onChange={(e) => set('parent_menu_id', e.target.value)}
            >
              <option value="">— Root (no parent)</option>
              {parentOptions.map((m) => (
                <option key={m.id} value={m.id}>{m.menu_label}</option>
              ))}
            </select>
          </div>

          {/* Badge */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-console-muted mb-1.5">Badge</label>
              <select
                className="w-full bg-console-bg border border-console-border rounded px-3 py-2 text-xs text-console-text focus:outline-none focus:border-[#58a6ff]"
                value={form.badge_type}
                onChange={(e) => set('badge_type', e.target.value)}
              >
                {BADGE_TYPES.map((t) => (
                  <option key={t} value={t}>{t || 'None'}</option>
                ))}
              </select>
            </div>
            <FormField
              label="Badge Value"
              value={form.badge_value}
              onChange={(v) => set('badge_value', v)}
              placeholder="e.g., 12"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-1">
            <Toggle label="Visible" checked={form.is_visible} onChange={(v) => set('is_visible', v)} />
            <Toggle label="Enabled" checked={form.is_enabled} onChange={(v) => set('is_enabled', v)} />
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-console-border flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 bg-console-accent hover:bg-console-accent/80 disabled:bg-console-card disabled:text-console-muted text-white rounded-md transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
          </button>
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs px-3 py-2 bg-console-danger/10 hover:bg-console-danger/20 text-red-400 border border-console-danger/30 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {showIconPicker && (
        <IconPicker
          value={form.icon_name}
          onChange={(name) => set('icon_name', name)}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </>
  );
}

function FormField({
  label, value, onChange, placeholder, mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-console-muted mb-1.5">{label}</label>
      <input
        type="text"
        className={`w-full bg-console-bg border border-console-border rounded px-3 py-2 text-xs text-console-text placeholder-console-muted focus:outline-none focus:border-[#58a6ff] ${mono ? 'font-mono' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`w-8 h-4 rounded-full transition-colors relative ${checked ? 'bg-console-accent' : 'bg-console-border'}`}
        onClick={() => onChange(!checked)}
      >
        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-xs text-console-text">{label}</span>
    </label>
  );
}
