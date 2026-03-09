'use client';

import { Input, SelectInput, Icon, Button } from '@/components/ui';
import type { ChatbotNode } from '../types/chatbot.types';

interface ChatbotNodeEditorProps {
  node: ChatbotNode;
  allNodes: ChatbotNode[];
  onUpdate: (nodeId: string, data: Record<string, any>) => void;
  onDelete: (nodeId: string) => void;
  onAddConnection: (fromId: string, toId: string) => void;
  onClose: () => void;
}

export function ChatbotNodeEditor({
  node,
  allNodes,
  onUpdate,
  onDelete,
  onAddConnection,
  onClose,
}: ChatbotNodeEditorProps) {
  const data = node.data ?? {};

  const updateField = (key: string, value: any) => {
    onUpdate(node.id, { ...data, [key]: value });
  };

  return (
    <div
      style={{
        width: 300,
        borderLeft: '1px solid #e5e7eb',
        background: '#fff',
        padding: 16,
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
          Configure Node
        </h3>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <Icon name="x" size={16} color="#64748b" />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Common: Label */}
        <Input
          label="Label"
          value={data.label ?? ''}
          onChange={(v) => updateField('label', v)}
          leftIcon={<Icon name="tag" size={16} />}
        />

        {/* Text/Message */}
        {['TEXT_REPLY', 'WELCOME', 'MEDIA_REPLY'].includes(node.type) && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4, display: 'block' }}>
              Message
            </label>
            <textarea
              value={data.message ?? ''}
              onChange={(e) => updateField('message', e.target.value)}
              style={{
                width: '100%',
                minHeight: 80,
                padding: 8,
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>
        )}

        {/* Keywords for KEYWORD_TRIGGER */}
        {node.type === 'KEYWORD_TRIGGER' && (
          <Input
            label="Keywords (comma-separated)"
            value={data.keywords ?? ''}
            onChange={(v) => updateField('keywords', v)}
            leftIcon={<Icon name="hash" size={16} />}
          />
        )}

        {/* Menu items */}
        {node.type === 'MENU' && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4, display: 'block' }}>
              Menu Items (one per line)
            </label>
            <textarea
              value={data.menuItems ?? ''}
              onChange={(e) => updateField('menuItems', e.target.value)}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              style={{
                width: '100%',
                minHeight: 80,
                padding: 8,
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>
        )}

        {/* Condition */}
        {node.type === 'CONDITION' && (
          <>
            <Input
              label="Variable"
              value={data.variable ?? ''}
              onChange={(v) => updateField('variable', v)}
              leftIcon={<Icon name="code" size={16} />}
            />
            <SelectInput
              label="Operator"
              value={data.operator ?? 'equals'}
              onChange={(v) => updateField('operator', v)}
              options={[
                { value: 'equals', label: 'Equals' },
                { value: 'contains', label: 'Contains' },
                { value: 'gt', label: 'Greater Than' },
                { value: 'lt', label: 'Less Than' },
              ]}
            />
            <Input
              label="Value"
              value={data.conditionValue ?? ''}
              onChange={(v) => updateField('conditionValue', v)}
            />
          </>
        )}

        {/* API Call */}
        {node.type === 'API_CALL' && (
          <>
            <SelectInput
              label="Method"
              value={data.method ?? 'GET'}
              onChange={(v) => updateField('method', v)}
              options={[
                { value: 'GET', label: 'GET' },
                { value: 'POST', label: 'POST' },
                { value: 'PUT', label: 'PUT' },
              ]}
            />
            <Input
              label="URL"
              value={data.url ?? ''}
              onChange={(v) => updateField('url', v)}
              leftIcon={<Icon name="globe" size={16} />}
            />
          </>
        )}

        {/* Collect Input */}
        {node.type === 'COLLECT_INPUT' && (
          <>
            <Input
              label="Prompt Message"
              value={data.prompt ?? ''}
              onChange={(v) => updateField('prompt', v)}
            />
            <Input
              label="Variable Name"
              value={data.variableName ?? ''}
              onChange={(v) => updateField('variableName', v)}
              leftIcon={<Icon name="code" size={16} />}
            />
          </>
        )}

        {/* Connect to */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4, display: 'block' }}>
            Connect to
          </label>
          <SelectInput
            label="Target Node"
            value=""
            onChange={(v) => {
              if (v) onAddConnection(node.id, v as string);
            }}
            options={allNodes
              .filter((n) => n.id !== node.id)
              .map((n) => ({
                value: n.id,
                label: n.data?.label || n.type,
              }))}
          />
        </div>
      </div>

      {/* Delete */}
      <div style={{ marginTop: 24 }}>
        <Button variant="danger" size="sm" onClick={() => onDelete(node.id)}>
          Delete Node
        </Button>
      </div>
    </div>
  );
}
