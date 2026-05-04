'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@/components/ui';
import * as api from '../services/self-hosted-ai.service';
import type { WidgetConfig } from '../types/self-hosted-ai.types';

interface ChatWidgetProps {
  config?: Partial<WidgetConfig>;
}

export function AiChatWidget({ config: propConfig }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string; sources?: any[] }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load config — retry until auth is ready, then poll every 30s
  useEffect(() => {
    if (propConfig) {
      setConfig(propConfig as WidgetConfig);
      return;
    }

    let retryTimer: ReturnType<typeof setTimeout>;
    let pollTimer: ReturnType<typeof setInterval>;
    let cancelled = false;

    const fetchConfig = (retryCount = 0) => {
      api.getWidgetConfig().then((resp: any) => {
        if (cancelled) return;
        // resp is the API envelope: { success, data, message }
        const widgetData = resp?.data ?? resp;
        if (widgetData && typeof widgetData === 'object') {
          setConfig(widgetData);
        }
        // Start polling after first success
        if (!pollTimer) {
          pollTimer = setInterval(() => fetchConfig(), 30000);
        }
      }).catch(() => {
        if (cancelled) return;
        // Auth might not be ready yet — retry with backoff (max 10s)
        if (retryCount < 10) {
          retryTimer = setTimeout(() => fetchConfig(retryCount + 1), Math.min(2000 * (retryCount + 1), 10000));
        }
      });
    };

    // Delay initial fetch slightly to let auth token be set
    retryTimer = setTimeout(() => fetchConfig(), 1500);

    // Instantly refresh when config page saves
    const onConfigUpdate = () => fetchConfig();
    window.addEventListener('ai-widget-config-updated', onConfigUpdate);

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      clearInterval(pollTimer);
      window.removeEventListener('ai-widget-config-updated', onConfigUpdate);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const startSession = useCallback(async () => {
    if (!config?.modelId) return;
    try {
      const resp = await api.createChatSession({
        modelId: config.modelId,
        title: 'Widget Chat',
        datasetIds: config.datasetIds,
        systemPromptId: config.systemPromptId,
      });
      setSessionId((resp as any)?.data?.id ?? '');
    } catch {
      // Fallback: no session
    }
  }, [config]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      if (sessionId) {
        const resp = await api.sendChatMessage(sessionId, userMsg);
        const data = (resp as any)?.data;
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data?.reply ?? 'No response', sources: data?.sources },
        ]);
      } else if (config?.modelId) {
        const resp = await api.quickChat({
          modelId: config.modelId,
          message: userMsg,
          datasetIds: config.datasetIds,
        });
        const data = (resp as any)?.data;
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data?.reply ?? 'No response', sources: data?.sources },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${e.message ?? 'Failed to get response'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!sessionId && config?.modelId) {
      startSession();
    }
  };

  if (!config?.enabled) return null;

  const primaryColor = config.primaryColor || '#2563EB';
  const isLeft = config.position === 'bottom-left';

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          style={{
            position: 'fixed',
            bottom: 24,
            ...(isLeft ? { left: 24 } : { right: 24 }),
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: primaryColor,
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Icon name="message-circle" size={24} />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            ...(isLeft ? { left: 24 } : { right: 24 }),
            width: 380,
            height: 520,
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              background: primaryColor,
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{config.title || 'AI Assistant'}</div>
              {config.subtitle && (
                <div style={{ fontSize: 12, opacity: 0.8 }}>{config.subtitle}</div>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: 28,
                height: 28,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#9CA3AF', padding: 20, fontSize: 13 }}>
                <Icon name="sparkles" size={24} />
                <p>Ask me anything about your CRM data!</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: msg.role === 'user' ? primaryColor : '#f3f4f6',
                    color: msg.role === 'user' ? '#fff' : '#111827',
                    fontSize: 13,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
                <div style={{
                  padding: '8px 12px', borderRadius: 12, background: '#f3f4f6',
                  fontSize: 13, color: '#6B7280',
                }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 6 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              disabled={loading}
              style={{
                flex: 1, padding: '8px 12px', border: '1px solid #d1d5db',
                borderRadius: 20, fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: primaryColor, color: '#fff', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              <Icon name="send" size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
