'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Card, Badge } from '@/components/ui';
import { Icon } from '@/components/ui';
import { SelectInput } from '@/components/ui';
import {
  useChatSessions, useChatSession, useCreateChatSession,
  useSendMessage, useDeleteChatSession, useAiModels,
  useDatasets, useSystemPrompts,
} from '../hooks/useSelfHostedAi';
import type { AiModel, AiChatSession, AiChatMessage } from '../types/self-hosted-ai.types';

export function AiChatPage() {
  const { data: sessionsResp } = useChatSessions();
  const { data: modelsResp } = useAiModels();
  const { data: datasetsResp } = useDatasets();
  const { data: promptsResp } = useSystemPrompts();
  const createSession = useCreateChatSession();
  const deleteSession = useDeleteChatSession();

  const [activeSessionId, setActiveSessionId] = useState('');
  const [newModelId, setNewModelId] = useState('');

  const sessions: AiChatSession[] = (sessionsResp as any)?.data ?? [];
  const models: AiModel[] = ((modelsResp as any)?.data ?? []).filter(
    (m: AiModel) => !m.isEmbedding && m.status === 'AVAILABLE',
  );
  const datasets = (datasetsResp as any)?.data ?? [];
  const prompts = (promptsResp as any)?.data ?? [];

  const readyDatasets = datasets.filter((d: any) => d.status === 'READY');

  const handleNewChat = () => {
    if (!newModelId) return;
    createSession.mutate(
      { modelId: newModelId, datasetIds: readyDatasets.map((d: any) => d.id) },
      { onSuccess: (data: any) => setActiveSessionId(data?.data?.id ?? '') },
    );
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
      {/* Sidebar */}
      <div style={{ width: 280, borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
        <div style={{ padding: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>
            <Icon name="message-square" size={16} /> AI Chat
          </h3>
          <SelectInput
            options={models.map((m) => ({ label: m.name, value: m.modelId }))}
            value={newModelId}
            onChange={(v) => setNewModelId(String(v ?? ''))}
            placeholder="Select model..."
            label="Model"
          />
          <Button
            variant="primary"
            onClick={handleNewChat}
            disabled={!newModelId || createSession.isPending}
            style={{ width: '100%', marginTop: 8 }}
          >
            <Icon name="plus" size={16} /> New Chat
          </Button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}>
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              style={{
                padding: '10px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                background: s.id === activeSessionId ? '#e5e7eb' : 'transparent',
                marginBottom: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>
                  {s.messageCount} msgs
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={(e: any) => { e.stopPropagation(); deleteSession.mutate(s.id); }}
                style={{ padding: 4, minWidth: 0 }}
              >
                <Icon name="x" size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeSessionId ? (
          <ChatWindow sessionId={activeSessionId} />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            <div style={{ textAlign: 'center' }}>
              <Icon name="message-square" size={48} />
              <p style={{ marginTop: 12 }}>Select a chat or create a new one</p>
              {readyDatasets.length > 0 && (
                <p style={{ fontSize: 13 }}>
                  {readyDatasets.length} dataset{readyDatasets.length > 1 ? 's' : ''} available for RAG
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatWindow({ sessionId }: { sessionId: string }) {
  const { data: sessionResp } = useChatSession(sessionId);
  const sendMessage = useSendMessage();
  const [input, setInput] = useState('');
  const [lastError, setLastError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const session = (sessionResp as any)?.data;
  const messages: AiChatMessage[] = session?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, lastError]);

  const handleSend = () => {
    if (!input.trim() || sendMessage.isPending) return;
    setLastError('');
    sendMessage.mutate(
      { sessionId, message: input.trim() },
      {
        onError: (err: any) => {
          const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to get response';
          setLastError(msg);
        },
      },
    );
    setInput('');
  };

  return (
    <>
      {/* Header */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="message-square" size={18} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>{session?.title ?? 'Chat'}</span>
        {session?.modelId && (
          <Badge variant="secondary" style={{ fontSize: 11 }}>{session.modelId}</Badge>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: 12,
                background: msg.role === 'user' ? '#2563EB' : '#f3f4f6',
                color: msg.role === 'user' ? '#fff' : '#111827',
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: 'rgba(0,0,0,0.05)', fontSize: 11 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Sources:</div>
                  {msg.sources.map((s, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>
                      <span style={{ color: '#6B7280' }}>Score: {s.score}</span> — {s.content}
                    </div>
                  ))}
                </div>
              )}

              {/* Meta */}
              {msg.role === 'assistant' && msg.latencyMs && (
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>
                  {msg.tokenCount} tokens · {msg.latencyMs}ms
                </div>
              )}
            </div>
          </div>
        ))}
        {sendMessage.isPending && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
            <div style={{ padding: '10px 14px', borderRadius: 12, background: '#f3f4f6', color: '#6B7280' }}>
              <Icon name="loader" size={16} /> Thinking...
            </div>
          </div>
        )}
        {lastError && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
            <div style={{
              maxWidth: '75%', padding: '10px 14px', borderRadius: 12,
              background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
              fontSize: 14, lineHeight: 1.5,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                <Icon name="alert-circle" size={14} /> Error
              </div>
              <div>{lastError}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                Make sure Ollama is running and a model is available.
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about your CRM data..."
          style={{
            flex: 1, padding: '10px 14px', border: '1px solid #d1d5db',
            borderRadius: 8, fontSize: 14,
          }}
          disabled={sendMessage.isPending}
        />
        <Button variant="primary" onClick={handleSend} disabled={sendMessage.isPending || !input.trim()}>
          <Icon name="send" size={16} />
        </Button>
      </div>
    </>
  );
}
