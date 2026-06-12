'use client';

import { useMemo } from 'react';

import { Badge, Button, Icon } from '@/components/ui';

import type { WorkflowTemplate, TemplateCategory } from '../../constants/predefined-workflows';
import type { BaseNodeData } from '../../types/visual-workflow.types';

// ── Props ─────────────────────────────────────────────────

interface TemplatePreviewProps {
  template: WorkflowTemplate;
  onUse: () => void;
  onBack: () => void;
}

// ── Styles ────────────────────────────────────────────────

const CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
};

const HEADER_SECTION_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 16,
};

const ICON_BOX_STYLE: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 12,
  background: '#f3f4f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const SECTION_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const SECTION_TITLE_STYLE: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: 0,
};

const NODE_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 12px',
  borderRadius: 6,
  background: '#f9fafb',
  border: '1px solid #f3f4f6',
};

const FLOW_ARROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px 0',
  color: '#d1d5db',
};

const STATS_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  flexWrap: 'wrap',
};

const STAT_BOX_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  borderRadius: 6,
  background: '#f9fafb',
  border: '1px solid #f3f4f6',
  fontSize: 13,
  color: '#374151',
};

const TAGS_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
};

const TAG_STYLE: React.CSSProperties = {
  padding: '3px 8px',
  borderRadius: 4,
  background: '#f3f4f6',
  fontSize: 11,
  color: '#6b7280',
  fontWeight: 500,
};

const ACTIONS_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  paddingTop: 8,
  borderTop: '1px solid #f3f4f6',
};

// ── Category badge config ────────────────────────────────

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

// ── Node category color dots ─────────────────────────────

const NODE_CATEGORY_COLORS: Record<string, string> = {
  trigger: '#22C55E',
  condition: '#EAB308',
  action: '#3B82F6',
  flow: '#A855F7',
  utility: '#6B7280',
};

// ── Component ─────────────────────────────────────────────

export function TemplatePreview({ template, onUse, onBack }: TemplatePreviewProps) {
  // Build a text flow summary from nodes and edges
  const flowSummary = useMemo(() => {
    const nodeMap = new Map<string, BaseNodeData>();
    for (const n of template.nodes) {
      nodeMap.set(n.id, n.data as BaseNodeData);
    }

    // Find the trigger (start) node — no incoming edges
    const targetIds = new Set(template.edges.map((e: any) => e.target));
    const startNodes = template.nodes.filter((n: any) => !targetIds.has(n.id));

    // Simple BFS to build ordered labels
    const visited = new Set<string>();
    const labels: string[] = [];
    const queue = startNodes.map((n: any) => n.id);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const data = nodeMap.get(currentId);
      if (data) labels.push(data.label);

      const outEdges = template.edges.filter((e: any) => e.source === currentId);
      for (const e of outEdges) {
        if (!visited.has(e.target)) {
          queue.push(e.target);
        }
      }
    }

    return labels;
  }, [template]);

  // Count node categories
  const nodeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of template.nodes) {
      const cat = (n.data as BaseNodeData).nodeCategory;
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [template]);

  return (
    <div style={CONTAINER_STYLE}>
      {/* Header */}
      <div style={HEADER_SECTION_STYLE}>
        <div style={ICON_BOX_STYLE}>
          <Icon name={template.icon} size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>{template.name}</h2>
          <p style={{ margin: '0 0 8px', fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
            {template.description}
          </p>
          <Badge variant={CATEGORY_BADGE[template.category]}>
            {CATEGORY_LABELS[template.category]}
          </Badge>
        </div>
      </div>

      {/* Statistics */}
      <div style={SECTION_STYLE}>
        <h4 style={SECTION_TITLE_STYLE}>Overview</h4>
        <div style={STATS_STYLE}>
          <div style={STAT_BOX_STYLE}>
            <Icon name="box" size={14} />
            <span>{template.nodes.length} Nodes</span>
          </div>
          <div style={STAT_BOX_STYLE}>
            <Icon name="git-commit" size={14} />
            <span>{template.edges.length} Connections</span>
          </div>
          {Object.entries(nodeCounts).map(([cat, count]) => (
            <div key={cat} style={STAT_BOX_STYLE}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: NODE_CATEGORY_COLORS[cat] || '#6B7280',
                  flexShrink: 0,
                }}
              />
              <span>
                {count} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Flow Summary */}
      <div style={SECTION_STYLE}>
        <h4 style={SECTION_TITLE_STYLE}>Flow Summary</h4>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexWrap: 'wrap',
            padding: '12px 16px',
            background: '#f9fafb',
            borderRadius: 8,
            border: '1px solid #f3f4f6',
          }}
        >
          {flowSummary.map((label, idx) => (
            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</span>
              {idx < flowSummary.length - 1 && (
                <Icon name="arrow-right" size={14} />
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div style={SECTION_STYLE}>
        <h4 style={SECTION_TITLE_STYLE}>Nodes</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {template.nodes.map((n: any, idx: number) => {
            const data = n.data as BaseNodeData;
            return (
              <div key={n.id}>
                <div style={NODE_ROW_STYLE}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: data.color,
                      flexShrink: 0,
                    }}
                  />
                  <Icon name={data.icon} size={16} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', flex: 1 }}>
                    {data.label}
                  </span>
                  <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>
                    {data.nodeCategory}
                  </span>
                </div>
                {idx < template.nodes.length - 1 && (
                  <div style={FLOW_ARROW_STYLE}>
                    <Icon name="chevron-down" size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div style={SECTION_STYLE}>
        <h4 style={SECTION_TITLE_STYLE}>Tags</h4>
        <div style={TAGS_STYLE}>
          {template.tags.map((tag) => (
            <span key={tag} style={TAG_STYLE}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={ACTIONS_STYLE}>
        <Button variant="primary" onClick={onUse}>
          <Icon name="download" size={16} />
          Use This Template
        </Button>
        <Button variant="outline" onClick={onBack}>
          <Icon name="arrow-left" size={16} />
          Back to Gallery
        </Button>
      </div>
    </div>
  );
}
