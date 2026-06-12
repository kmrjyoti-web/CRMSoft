'use client';

import { useState, useMemo, useCallback } from 'react';

import { Icon, Input } from '@/components/ui';

import { NODE_CATEGORIES } from '../../constants/node-definitions';
import type { NodeCategory, NodeDefinition } from '../../types/visual-workflow.types';

// ── Styles ──────────────────────────────────────────────

const PANEL_STYLE: React.CSSProperties = {
  width: 280,
  height: '100%',
  background: '#fff',
  borderRight: '1px solid #e5e7eb',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  flexShrink: 0,
};

const HEADER_STYLE: React.CSSProperties = {
  padding: '12px 14px 8px',
  borderBottom: '1px solid #f3f4f6',
};

const CONTENT_STYLE: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '6px 10px 16px',
};

// ── Category Group ──────────────────────────────────────

interface CategoryGroupProps {
  category: NodeCategory;
  filteredNodes: NodeDefinition[];
  isExpanded: boolean;
  onToggle: () => void;
}

function CategoryGroup({ category, filteredNodes, isExpanded, onToggle }: CategoryGroupProps) {
  if (filteredNodes.length === 0) return null;

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Category Header */}
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: '8px 4px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <Icon
          name={isExpanded ? 'chevron-down' : 'chevron-right'}
          size={14}
          color="#9ca3af"
        />
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: 4,
            background: category.color + '18',
          }}
        >
          <Icon name={category.icon as any} size={12} color={category.color} />
        </span>
        <span style={{ flex: 1, textAlign: 'left' }}>{category.label}</span>
        <span
          style={{
            fontSize: 11,
            color: '#9ca3af',
            fontWeight: 400,
          }}
        >
          {filteredNodes.length}
        </span>
      </button>

      {/* Node Cards */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: isExpanded ? filteredNodes.length * 80 : 0,
          transition: 'max-height 0.25s ease-in-out',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 4 }}>
          {filteredNodes.map((node) => (
            <NodeCard key={node.type} node={node} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Node Card ───────────────────────────────────────────

interface NodeCardProps {
  node: NodeDefinition;
}

function NodeCard({ node }: NodeCardProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData('application/reactflow', node.type);
      e.dataTransfer.effectAllowed = 'move';
    },
    [node.type],
  );

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 6,
        border: '1px solid #e5e7eb',
        background: '#fafafa',
        cursor: 'grab',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = node.color;
        e.currentTarget.style.boxShadow = `0 0 0 1px ${node.color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 6,
          background: node.color + '18',
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <Icon name={node.icon as any} size={14} color={node.color} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#1f2937',
            lineHeight: '18px',
          }}
        >
          {node.label}
        </div>
        <div
          style={{
            fontSize: 11,
            color: '#6b7280',
            lineHeight: '15px',
            marginTop: 1,
          }}
        >
          {node.description}
        </div>
      </div>
    </div>
  );
}

// ── NodePalette ─────────────────────────────────────────

export function NodePalette() {
  const [search, setSearch] = useState('');
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NODE_CATEGORIES.map((c) => [c.label, true])),
  );

  const toggleCategory = useCallback((label: string) => {
    setExpandedMap((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    return NODE_CATEGORIES.map((cat) => ({
      category: cat,
      nodes: q
        ? cat.nodes.filter(
            (n) =>
              n.label.toLowerCase().includes(q) ||
              n.description.toLowerCase().includes(q),
          )
        : cat.nodes,
    }));
  }, [search]);

  return (
    <div style={PANEL_STYLE}>
      {/* Search */}
      <div style={HEADER_STYLE}>
        <Input
          label="Search nodes..."
          leftIcon={<Icon name="search" size={14} />}
          value={search}
          onChange={(val: any) => setSearch(String(val ?? ''))}
        />
      </div>

      {/* Category List */}
      <div style={CONTENT_STYLE}>
        {filteredCategories.map(({ category, nodes }) => (
          <CategoryGroup
            key={category.label}
            category={category}
            filteredNodes={nodes}
            isExpanded={expandedMap[category.label] ?? true}
            onToggle={() => toggleCategory(category.label)}
          />
        ))}

        {filteredCategories.every((c) => c.nodes.length === 0) && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 0',
              color: '#9ca3af',
              fontSize: 13,
            }}
          >
            No nodes match your search.
          </div>
        )}
      </div>
    </div>
  );
}
