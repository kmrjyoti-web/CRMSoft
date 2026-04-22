'use client';

import { Icon, type IconName } from '@/components/ui';
import type { WaChatbotNodeType } from '../types/whatsapp.types';

interface NodeType {
  type: WaChatbotNodeType;
  label: string;
  icon: IconName;
  color: string;
}

const NODE_TYPES: NodeType[] = [
  { type: 'WELCOME', label: 'Welcome', icon: 'message-circle', color: '#10b981' },
  { type: 'KEYWORD_TRIGGER', label: 'Keyword Trigger', icon: 'zap', color: '#f59e0b' },
  { type: 'MENU', label: 'Menu', icon: 'list', color: '#3b82f6' },
  { type: 'TEXT_REPLY', label: 'Text Reply', icon: 'message-square', color: '#6366f1' },
  { type: 'MEDIA_REPLY', label: 'Media Reply', icon: 'image', color: '#8b5cf6' },
  { type: 'QUICK_BUTTONS', label: 'Quick Buttons', icon: 'grid', color: '#ec4899' },
  { type: 'COLLECT_INPUT', label: 'Collect Input', icon: 'edit', color: '#14b8a6' },
  { type: 'CONDITION', label: 'Condition', icon: 'git-branch', color: '#f97316' },
  { type: 'API_CALL', label: 'API Call', icon: 'globe', color: '#06b6d4' },
  { type: 'ASSIGN_AGENT', label: 'Assign Agent', icon: 'user-check', color: '#ef4444' },
];

interface ChatbotNodePaletteProps {
  onAddNode: (type: WaChatbotNodeType) => void;
}

export function ChatbotNodePalette({ onAddNode }: ChatbotNodePaletteProps) {
  return (
    <div
      style={{
        width: 220,
        borderRight: '1px solid #e5e7eb',
        background: '#fafafa',
        padding: 12,
        overflowY: 'auto',
      }}
    >
      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12, paddingLeft: 4 }}>
        Node Types
      </h3>
      {NODE_TYPES.map((nt) => (
        <button
          key={nt.type}
          onClick={() => onAddNode(nt.type)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '10px 12px',
            marginBottom: 4,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'border-color 0.15s',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: `${nt.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name={nt.icon} size={14} color={nt.color} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{nt.label}</span>
        </button>
      ))}
    </div>
  );
}
