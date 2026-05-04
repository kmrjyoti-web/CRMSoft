'use client';

import { useState, useMemo, useCallback } from 'react';

import { Badge, Button, Icon, Input } from '@/components/ui';

import {
  WORKFLOW_TEMPLATES,
  getTemplateCategories,
  type WorkflowTemplate,
  type TemplateCategory,
} from '../../constants/predefined-workflows';
import { TemplatePreview } from './TemplatePreview';

// ── Props ─────────────────────────────────────────────────

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: WorkflowTemplate) => void;
}

// ── Styles ────────────────────────────────────────────────

const OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1050,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.5)',
};

const PANEL_STYLE: React.CSSProperties = {
  width: '100%',
  maxWidth: 900,
  maxHeight: '80vh',
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const HEADER_STYLE: React.CSSProperties = {
  padding: '20px 24px 16px',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
};

const BODY_STYLE: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
};

const SIDEBAR_STYLE: React.CSSProperties = {
  width: 200,
  borderRight: '1px solid #e5e7eb',
  padding: '12px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flexShrink: 0,
};

const GRID_CONTAINER_STYLE: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: 20,
};

const GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 16,
};

const CARD_STYLE: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 16,
  cursor: 'pointer',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const CARD_HOVER_BORDER = '#3b82f6';

const TAB_BASE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 16px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
  color: '#6b7280',
  textAlign: 'left',
  borderRadius: 0,
  borderRight: '2px solid transparent',
  transition: 'background 0.15s, color 0.15s',
};

const TAB_ACTIVE: React.CSSProperties = {
  ...TAB_BASE,
  background: '#eff6ff',
  color: '#3b82f6',
  borderRight: '2px solid #3b82f6',
};

const EMPTY_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 40,
  color: '#9ca3af',
  gap: 8,
};

// ── Category badge colors ────────────────────────────────

const CATEGORY_BADGE: Record<TemplateCategory, 'primary' | 'success' | 'warning' | 'secondary' | 'danger'> = {
  'lead-management': 'success',
  'communication': 'primary',
  'task-automation': 'warning',
  'data-management': 'secondary',
  'integration': 'danger',
};

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  'lead-management': 'Lead Management',
  'communication': 'Communication',
  'task-automation': 'Task Automation',
  'data-management': 'Data Management',
  'integration': 'Integration',
};

// ── Component ─────────────────────────────────────────────

export function TemplatePicker({ open, onClose, onSelect }: TemplatePickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const categories = useMemo(() => getTemplateCategories(), []);

  const filtered = useMemo(() => {
    let list = WORKFLOW_TEMPLATES;

    if (activeCategory !== 'all') {
      list = list.filter((t) => t.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [activeCategory, search]);

  const handleUseTemplate = useCallback(
    (template: WorkflowTemplate) => {
      onSelect(template);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleBack = useCallback(() => {
    setSelectedTemplate(null);
  }, []);

  if (!open) return null;

  // ── Preview Mode ──────────────────────────────────────

  if (selectedTemplate) {
    return (
      <div style={OVERLAY_STYLE} onClick={onClose}>
        <div style={PANEL_STYLE} onClick={(e) => e.stopPropagation()}>
          <div style={HEADER_STYLE}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={handleBack}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  color: '#6b7280',
                }}
              >
                <Icon name="arrow-left" size={18} />
              </button>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Template Preview</h2>
            </div>
            <button
              onClick={onClose}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#6b7280' }}
            >
              <Icon name="x" size={20} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            <TemplatePreview
              template={selectedTemplate}
              onUse={() => handleUseTemplate(selectedTemplate)}
              onBack={handleBack}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Gallery Mode ──────────────────────────────────────

  return (
    <div style={OVERLAY_STYLE} onClick={onClose}>
      <div style={PANEL_STYLE} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={HEADER_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="layout-template" size={20} />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Workflow Templates</h2>
            <Badge variant="secondary">{WORKFLOW_TEMPLATES.length}</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 240 }}>
              <Input
                label="Search templates"
                value={search}
                onChange={(v) => setSearch(v)}
                leftIcon={<Icon name="search" size={16} />}
              />
            </div>
            <button
              onClick={onClose}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#6b7280' }}
            >
              <Icon name="x" size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={BODY_STYLE}>
          {/* Category Sidebar */}
          <div style={SIDEBAR_STYLE}>
            <button
              style={activeCategory === 'all' ? TAB_ACTIVE : TAB_BASE}
              onClick={() => setActiveCategory('all')}
            >
              <Icon name="layers" size={16} />
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.key}
                style={activeCategory === cat.key ? TAB_ACTIVE : TAB_BASE}
                onClick={() => setActiveCategory(cat.key)}
              >
                <Icon name={cat.icon} size={16} />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Template Grid */}
          <div style={GRID_CONTAINER_STYLE}>
            {filtered.length === 0 ? (
              <div style={EMPTY_STYLE}>
                <Icon name="search" size={32} />
                <p style={{ margin: 0, fontSize: 14 }}>No templates found</p>
                <p style={{ margin: 0, fontSize: 12 }}>Try a different search or category</p>
              </div>
            ) : (
              <div style={GRID_STYLE}>
                {filtered.map((template) => (
                  <div
                    key={template.id}
                    style={{
                      ...CARD_STYLE,
                      borderColor: hoveredCardId === template.id ? CARD_HOVER_BORDER : '#e5e7eb',
                      boxShadow: hoveredCardId === template.id ? '0 2px 8px rgba(59,130,246,0.15)' : 'none',
                    }}
                    onClick={() => setSelectedTemplate(template)}
                    onMouseEnter={() => setHoveredCardId(template.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                  >
                    {/* Card Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon name={template.icon} size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {template.name}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: '#6b7280',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {template.description}
                    </p>

                    {/* Footer: category badge + tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      <Badge variant={CATEGORY_BADGE[template.category]}>
                        {CATEGORY_LABELS[template.category]}
                      </Badge>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        {template.nodes.length} nodes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
