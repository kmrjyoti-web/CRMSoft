'use client';

import { useState } from 'react';
import { Icon, Badge, Input } from '@/components/ui';
import { CONTROL_DEFINITIONS, DATA_FIELDS, FORMULA_CATEGORIES } from '../../constants/control-definitions';
import { useFormulaList } from '../../hooks/useReportDesigner';
import type { ControlType, ToolboxItem } from '../../types/report-designer.types';

type ToolboxTab = 'controls' | 'fields' | 'formulas';

export function ToolboxPanel() {
  const [activeTab, setActiveTab] = useState<ToolboxTab>('controls');
  const [search, setSearch] = useState('');
  const { data: formulasRes } = useFormulaList();
  const formulas = (formulasRes as any)?.data ?? [];

  const tabs: { key: ToolboxTab; label: string; icon: string }[] = [
    { key: 'controls', label: 'Controls', icon: 'layers' },
    { key: 'fields', label: 'Data', icon: 'database' },
    { key: 'formulas', label: 'Formulas', icon: 'percent' },
  ];

  return (
    <div style={{ width: 240, borderRight: '1px solid #e5e7eb', background: '#fafbfc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Tab headers */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '8px 4px',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? '#3b82f6' : '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Icon name={tab.icon as any} size={13} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ padding: '8px 8px 4px' }}>
        <Input
          label=""
          value={search}
          onChange={(v) => setSearch(v)}
          leftIcon={<Icon name="search" size={14} />}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 8px' }}>
        {activeTab === 'controls' && <ControlsTab search={search} />}
        {activeTab === 'fields' && <FieldsTab search={search} />}
        {activeTab === 'formulas' && <FormulasTab search={search} formulas={formulas} />}
      </div>
    </div>
  );
}

// ── Controls Tab ──
function ControlsTab({ search }: { search: string }) {
  const groups = ['basic', 'data', 'layout', 'advanced'] as const;
  const groupLabels: Record<string, string> = { basic: 'Basic', data: 'Data', layout: 'Layout', advanced: 'Advanced' };

  const filtered = CONTROL_DEFINITIONS.filter(c =>
    !search || c.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {groups.map((group) => {
        const items = filtered.filter(c => c.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>
              {groupLabels[group]}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {items.map((item) => (
                <DraggableControl key={item.type} item={item} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DraggableControl({ item }: { item: ToolboxItem }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('control-type', item.type);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      style={{
        padding: '6px 8px',
        border: '1px solid #e5e7eb',
        borderRadius: 4,
        background: '#fff',
        cursor: 'grab',
        fontSize: 11,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'border-color 0.15s',
      }}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
    >
      <Icon name={item.icon as any} size={14} />
      <span>{item.label}</span>
    </div>
  );
}

// ── Fields Tab ──
function FieldsTab({ search }: { search: string }) {
  const groups = [...new Set(DATA_FIELDS.map(f => f.group))];
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map(g => [g, true])),
  );

  const filtered = DATA_FIELDS.filter(f =>
    !search || f.label.toLowerCase().includes(search.toLowerCase()) || f.path.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {groups.map((group) => {
        const items = filtered.filter(f => f.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group} style={{ marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => setExpanded(prev => ({ ...prev, [group]: !prev[group] }))}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, width: '100%',
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, color: '#6b7280', padding: '4px 0',
              }}
            >
              <Icon name={expanded[group] ? 'chevron-down' : 'chevron-right'} size={12} />
              {group} <Badge variant="secondary">{items.length}</Badge>
            </button>
            {expanded[group] && (
              <div style={{ paddingLeft: 8 }}>
                {items.map((field) => (
                  <div
                    key={field.path}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('control-type', field.type === 'image' ? 'image' : 'text');
                      e.dataTransfer.setData('data-field', field.path);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: 11,
                      cursor: 'grab',
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#eff6ff')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ color: '#3b82f6', fontFamily: 'monospace', fontSize: 10 }}>
                      {field.type === 'number' ? '#' : field.type === 'date' ? 'D' : field.type === 'image' ? 'I' : 'T'}
                    </span>
                    <span>{field.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Formulas Tab ──
function FormulasTab({ search, formulas }: { search: string; formulas: any[] }) {
  const filtered = formulas.filter((f: any) =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = FORMULA_CATEGORIES.map(cat => ({
    ...cat,
    items: filtered.filter((f: any) => f.category === cat.value),
  })).filter(g => g.items.length > 0);

  return (
    <div>
      {grouped.length === 0 && (
        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 12, padding: 20 }}>
          No formulas found
        </div>
      )}
      {grouped.map((group) => (
        <div key={group.value} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>
            {group.label}
          </div>
          {group.items.map((formula: any) => (
            <div
              key={formula.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('control-type', 'formula');
                e.dataTransfer.setData('formula-id', formula.id);
                e.dataTransfer.setData('formula-expression', formula.expression);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              style={{
                padding: '6px 8px',
                border: '1px solid #e5e7eb',
                borderRadius: 4,
                background: '#fff',
                cursor: 'grab',
                fontSize: 11,
                marginBottom: 4,
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = '#8b5cf6')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
            >
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="percent" size={12} />
                {formula.name}
                {formula.isSystem && <Badge variant="secondary">System</Badge>}
              </div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2, fontFamily: 'monospace' }}>
                {formula.expression}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
