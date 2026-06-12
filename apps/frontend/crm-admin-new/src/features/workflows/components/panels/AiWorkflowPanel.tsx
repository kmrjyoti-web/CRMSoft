'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon, Button, Badge } from '@/components/ui';
import { workflowAiService } from '../../services/workflow-ai.service';

/* ── Types ─────────────────────────────────────────────── */

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  nodes?: any[];
  edges?: any[];
  description?: string;
}

interface AiWorkflowPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (nodes: any[], edges: any[]) => void;
}

/* ── Example Prompts ───────────────────────────────────── */

const EXAMPLE_PROMPTS = [
  'When a new lead is created, assign it to the sales team and send a welcome email',
  'Send a payment reminder 7 days after invoice creation if unpaid',
  "When a lead reaches 'won' stage, notify the team via email, WhatsApp, and in-app",
  'Create a daily digest of all open tasks and email it to managers',
  "Auto-escalate leads that haven't been contacted in 4 hours",
];

/* ── Component ─────────────────────────────────────────── */

export function AiWorkflowPanel({ isOpen, onClose, onApply }: AiWorkflowPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await workflowAiService.generateFromPrompt({
        prompt: prompt.trim(),
        context: { existingNodes: 0 },
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.description,
        nodes: result.nodes,
        edges: result.edges,
        description: result.description,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'system',
        content: 'Failed to generate workflow. Please try again with a different description.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (msg: Message) => {
    if (msg.nodes && msg.edges) {
      onApply(msg.nodes, msg.edges);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 400,
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderLeft: '1px solid #e5e7eb',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.08)',
        animation: 'ai-panel-slide-in 0.25s ease-out',
      }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #7c3aed08, #6d28d908)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="sparkles" size={20} color="#7c3aed" />
          <span style={{ fontWeight: 600, fontSize: 16 }}>AI Workflow Builder</span>
          <Badge variant="primary">Beta</Badge>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
          }}
        >
          <Icon name="x" size={20} />
        </button>
      </div>

      {/* ── Messages ───────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.length === 0 && !isLoading && (
          <EmptyState onSelect={(prompt) => handleSubmit(prompt)} />
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onApply={handleApply} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ─────────────────────────────────── */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e5e7eb',
          background: '#fafafa',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your workflow in plain English..."
            rows={2}
            disabled={isLoading}
            style={{
              flex: 1,
              resize: 'none',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
              lineHeight: 1.5,
            }}
          />
          <Button
            variant="primary"
            onClick={() => handleSubmit(input)}
            disabled={!input.trim() || isLoading}
            style={{
              height: 40,
              width: 40,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              flexShrink: 0,
            }}
          >
            <Icon name="send" size={16} />
          </Button>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      <style>{`
        @keyframes ai-panel-slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes ai-typing-dot {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────── */

function EmptyState({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <Icon name="sparkles" size={32} color="#7c3aed" />
        <p style={{ marginTop: 8, fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
          Describe your workflow in plain English and I will generate the nodes and connections for
          you.
        </p>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Try an example:</div>
      {EXAMPLE_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          style={{
            textAlign: 'left',
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            color: '#374151',
            lineHeight: 1.4,
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#7c3aed';
            e.currentTarget.style.background = '#f5f3ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.background = '#fff';
          }}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

function MessageBubble({
  message,
  onApply,
}: {
  message: Message;
  onApply: (msg: Message) => void;
}) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          maxWidth: '85%',
          padding: '10px 14px',
          borderRadius: 12,
          fontSize: 13,
          lineHeight: 1.5,
          ...(isUser
            ? { background: '#3b82f6', color: '#fff', borderBottomRightRadius: 4 }
            : isSystem
              ? { background: '#fef2f2', color: '#b91c1c', borderBottomLeftRadius: 4 }
              : { background: '#f3f4f6', color: '#1f2937', borderBottomLeftRadius: 4 }),
        }}
      >
        <div>{message.content}</div>

        {/* AI response with nodes */}
        {message.role === 'assistant' && message.nodes && message.nodes.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                color: '#374151',
              }}
            >
              Generated nodes:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
              {message.nodes.map((node: any, idx: number) => (
                <div
                  key={node.id ?? idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: '#4b5563',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: node.data?.color ?? '#6b7280',
                      flexShrink: 0,
                    }}
                  />
                  {node.data?.label ?? `Node ${idx + 1}`}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="primary"
                onClick={() => onApply(message)}
                style={{ fontSize: 12, padding: '6px 12px', height: 'auto' }}
              >
                <Icon name="check" size={14} />
                <span style={{ marginLeft: 4 }}>Apply to Canvas</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div
        style={{
          background: '#f3f4f6',
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          borderBottomLeftRadius: 4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#9ca3af',
              animation: `ai-typing-dot 1.4s infinite ${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
