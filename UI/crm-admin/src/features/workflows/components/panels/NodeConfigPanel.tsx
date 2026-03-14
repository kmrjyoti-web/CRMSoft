'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

import type { Node } from '@xyflow/react';

import { Button, Icon, Input, SelectInput, Switch, Badge } from '@/components/ui';

import { getNodeDefinition } from '../../constants/node-definitions';
import { TRIGGER_EVENTS } from '../../constants/trigger-events';
import type { BaseNodeData, ConfigField } from '../../types/visual-workflow.types';

// ── Props ───────────────────────────────────────────────

export interface NodeConfigPanelProps {
  node: Node<BaseNodeData>;
  onUpdate: (nodeId: string, data: Partial<BaseNodeData>) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

// ── Styles ──────────────────────────────────────────────

const PANEL_STYLE: React.CSSProperties = {
  width: 360,
  height: '100%',
  background: '#fff',
  borderLeft: '1px solid #e5e7eb',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  flexShrink: 0,
  animation: 'slideInRight 0.2s ease-out',
};

const HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 16px',
  borderBottom: '1px solid #e5e7eb',
};

const BODY_STYLE: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
};

const FOOTER_STYLE: React.CSSProperties = {
  padding: '12px 16px',
  borderTop: '1px solid #e5e7eb',
  display: 'flex',
  gap: 8,
};

// ── Config Field Renderer ───────────────────────────────

interface ConfigFieldInputProps {
  field: ConfigField;
  value: any;
  onChange: (key: string, value: any) => void;
  nodeSubType: string;
}

function ConfigFieldInput({ field, value, onChange, nodeSubType }: ConfigFieldInputProps) {
  // Special handling: trigger_event eventCode uses TRIGGER_EVENTS
  if (field.key === 'eventCode' && nodeSubType === 'trigger_event') {
    const triggerOptions = TRIGGER_EVENTS.map((e) => ({
      label: `${e.label} (${e.entity ?? 'System'})`,
      value: e.code,
    }));

    return (
      <SelectInput
        label={field.label}
        leftIcon={<Icon name="zap" size={14} />}
        options={triggerOptions}
        value={value ?? ''}
        onChange={(v) => onChange(field.key, v)}
        placeholder={field.placeholder}
        required={field.required}
      />
    );
  }

  switch (field.type) {
    case 'text':
      return (
        <Input
          label={field.label}
          leftIcon={<Icon name="type" size={14} />}
          value={value ?? ''}
          onChange={(v: any) => onChange(field.key, String(v ?? ''))}
          placeholder={field.placeholder}
          required={field.required}
        />
      );

    case 'number':
      return (
        <Input
          label={field.label}
          leftIcon={<Icon name="hash" size={14} />}
          type="number"
          value={value ?? field.defaultValue ?? ''}
          onChange={(v: any) => onChange(field.key, v ? Number(v) : null)}
          placeholder={field.placeholder}
          required={field.required}
        />
      );

    case 'select':
      return (
        <SelectInput
          label={field.label}
          leftIcon={<Icon name="list" size={14} />}
          options={field.options ?? []}
          value={value ?? ''}
          onChange={(v) => onChange(field.key, v)}
          placeholder={field.placeholder}
          required={field.required}
        />
      );

    case 'boolean':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Switch
            checked={value ?? field.defaultValue ?? false}
            onChange={(e: any) => {
              const checked = typeof e === 'boolean' ? e : e?.target?.checked;
              onChange(field.key, checked);
            }}
            label={field.label}
          />
        </div>
      );

    case 'json':
      return (
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#374151',
              marginBottom: 4,
              display: 'block',
            }}
          >
            {field.label}
            {field.required && <span style={{ color: '#ef4444' }}> *</span>}
          </label>
          <textarea
            style={{
              width: '100%',
              minHeight: 80,
              padding: '8px 10px',
              fontSize: 12,
              fontFamily: 'monospace',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              resize: 'vertical',
              outline: 'none',
            }}
            value={typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2)}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      );

    case 'entity-field':
      return (
        <Input
          label={field.label}
          leftIcon={<Icon name="database" size={14} />}
          value={value ?? ''}
          onChange={(v: any) => onChange(field.key, String(v ?? ''))}
          placeholder={field.placeholder ?? 'e.g. lead.status'}
          required={field.required}
        />
      );

    case 'cron':
      return (
        <Input
          label={field.label}
          leftIcon={<Icon name="clock" size={14} />}
          value={value ?? ''}
          onChange={(v: any) => onChange(field.key, String(v ?? ''))}
          placeholder={field.placeholder ?? '0 9 * * *'}
          required={field.required}
        />
      );

    case 'template':
      return (
        <Input
          label={field.label}
          leftIcon={<Icon name="file-text" size={14} />}
          value={value ?? ''}
          onChange={(v: any) => onChange(field.key, String(v ?? ''))}
          placeholder={field.placeholder ?? 'Template ID'}
        />
      );

    default:
      return null;
  }
}

// ── NodeConfigPanel ─────────────────────────────────────

export function NodeConfigPanel({ node, onUpdate, onDelete, onClose }: NodeConfigPanelProps) {
  const nodeData = node.data as BaseNodeData;
  const definition = useMemo(() => getNodeDefinition(nodeData.nodeSubType), [nodeData.nodeSubType]);

  // Local config state for editing
  const [localConfig, setLocalConfig] = useState<Record<string, any>>({});
  const [localLabel, setLocalLabel] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync local state when node changes
  useEffect(() => {
    setLocalConfig({ ...(nodeData.config ?? {}) });
    setLocalLabel(nodeData.label ?? '');
    setConfirmDelete(false);
  }, [node.id, nodeData.config, nodeData.label]);

  const handleConfigChange = useCallback((key: string, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleApply = useCallback(() => {
    const hasRequiredValues = (definition?.configFields ?? [])
      .filter((f) => f.required)
      .every((f) => {
        const val = localConfig[f.key];
        return val !== undefined && val !== null && val !== '';
      });

    onUpdate(node.id, {
      label: localLabel,
      config: localConfig,
      isConfigured: hasRequiredValues,
    });
  }, [node.id, localLabel, localConfig, definition, onUpdate]);

  const handleDelete = useCallback(() => {
    if (confirmDelete) {
      onDelete(node.id);
    } else {
      setConfirmDelete(true);
    }
  }, [node.id, confirmDelete, onDelete]);

  const configFields = definition?.configFields ?? [];

  return (
    <div style={PANEL_STYLE}>
      {/* Header */}
      <div style={HEADER_STYLE}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 8,
            background: nodeData.color + '18',
            flexShrink: 0,
          }}
        >
          <Icon name={nodeData.icon as any} size={16} color={nodeData.color} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            {definition?.label ?? nodeData.nodeSubType}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'capitalize' }}>
            {nodeData.nodeCategory}
          </div>
        </div>
        <Badge variant={nodeData.isConfigured ? 'success' : 'warning'}>
          {nodeData.isConfigured ? 'Configured' : 'Setup Required'}
        </Badge>
        <button
          type="button"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 6,
            border: 'none',
            background: '#f3f4f6',
            cursor: 'pointer',
          }}
        >
          <Icon name="x" size={14} color="#6b7280" />
        </button>
      </div>

      {/* Body */}
      <div style={BODY_STYLE}>
        {/* Node Label */}
        <Input
          label="Node Label"
          leftIcon={<Icon name="tag" size={14} />}
          value={localLabel}
          onChange={(v: any) => setLocalLabel(String(v ?? ''))}
        />

        {/* Separator */}
        {configFields.length > 0 && (
          <div style={{ borderTop: '1px solid #f3f4f6', margin: '2px 0' }} />
        )}

        {/* Config Fields */}
        {configFields.map((field) => (
          <ConfigFieldInput
            key={field.key}
            field={field}
            value={localConfig[field.key]}
            onChange={handleConfigChange}
            nodeSubType={nodeData.nodeSubType}
          />
        ))}

        {configFields.length === 0 && (
          <div
            style={{
              padding: '20px 0',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: 13,
            }}
          >
            This node has no configuration options.
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={FOOTER_STYLE}>
        <Button variant="primary" onClick={handleApply} style={{ flex: 1 }}>
          <Icon name="check" size={14} />
          Apply
        </Button>
        <Button
          variant={confirmDelete ? 'danger' : 'outline'}
          onClick={handleDelete}
          onBlur={() => setConfirmDelete(false)}
        >
          <Icon name="trash" size={14} />
          {confirmDelete ? 'Confirm?' : 'Delete'}
        </Button>
      </div>
    </div>
  );
}
