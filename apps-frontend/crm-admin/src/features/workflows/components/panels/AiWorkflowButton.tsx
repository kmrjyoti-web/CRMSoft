'use client';

import { Icon } from '@/components/ui';

interface AiWorkflowButtonProps {
  onClick: () => void;
}

export function AiWorkflowButton({ onClick }: AiWorkflowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="AI Workflow Builder"
      className="ai-workflow-fab"
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        zIndex: 50,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        animation: 'ai-fab-pulse 2s infinite',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.6)';
        e.currentTarget.style.animationPlayState = 'paused';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(124, 58, 237, 0.4)';
        e.currentTarget.style.animationPlayState = 'running';
      }}
    >
      <Icon name="sparkles" size={24} />
      <style>{`
        @keyframes ai-fab-pulse {
          0%, 100% { box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4); }
          50% { box-shadow: 0 4px 20px rgba(124, 58, 237, 0.7); }
        }
      `}</style>
    </button>
  );
}
