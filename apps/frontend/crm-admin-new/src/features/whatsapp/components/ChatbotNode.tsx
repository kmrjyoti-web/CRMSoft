'use client';

import { Icon, type IconName } from '@/components/ui';
import type { ChatbotNode as ChatbotNodeType } from '../types/chatbot.types';

const NODE_CONFIG: Record<string, { icon: IconName; color: string; label: string }> = {
  WELCOME: { icon: 'message-circle', color: '#10b981', label: 'Welcome' },
  KEYWORD_TRIGGER: { icon: 'zap', color: '#f59e0b', label: 'Keyword Trigger' },
  MENU: { icon: 'list', color: '#3b82f6', label: 'Menu' },
  TEXT_REPLY: { icon: 'message-square', color: '#6366f1', label: 'Text Reply' },
  MEDIA_REPLY: { icon: 'image', color: '#8b5cf6', label: 'Media Reply' },
  QUICK_BUTTONS: { icon: 'grid', color: '#ec4899', label: 'Quick Buttons' },
  COLLECT_INPUT: { icon: 'edit', color: '#14b8a6', label: 'Collect Input' },
  CONDITION: { icon: 'git-branch', color: '#f97316', label: 'Condition' },
  API_CALL: { icon: 'globe', color: '#06b6d4', label: 'API Call' },
  ASSIGN_AGENT: { icon: 'user-check', color: '#ef4444', label: 'Assign Agent' },
};

interface ChatbotNodeComponentProps {
  node: ChatbotNodeType;
  isSelected: boolean;
  onClick: () => void;
}

export function ChatbotNodeComponent({ node, isSelected, onClick }: ChatbotNodeComponentProps) {
  const config = NODE_CONFIG[node.type] ?? { icon: 'circle', color: '#94a3b8', label: node.type };

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        width: 200,
        background: '#fff',
        border: `2px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
        borderRadius: 10,
        boxShadow: isSelected ? '0 0 0 3px rgba(37,99,235,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        zIndex: isSelected ? 10 : 1,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderBottom: '1px solid #f1f5f9',
          background: `${config.color}08`,
          borderRadius: '8px 8px 0 0',
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: `${config.color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={config.icon} size={14} color={config.color} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{config.label}</span>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 12px' }}>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
          {node.data?.label || node.data?.message || node.data?.text || 'Configure this node'}
        </p>
      </div>

      {/* Connection dots */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: -6,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#e5e7eb',
          border: '2px solid #fff',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: -6,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: config.color,
          border: '2px solid #fff',
        }}
      />
    </div>
  );
}
