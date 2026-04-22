'use client';

import { useState } from 'react';
import { Badge, Button, Card } from '@/components/ui';
import { Icon } from '@/components/ui';
import {
  useOllamaHealth, useAiModels, usePullModel,
  useDeleteModel, useSetDefaultModel, useVectorStats, useCancelPull,
} from '../hooks/useSelfHostedAi';
import type { AiModel } from '../types/self-hosted-ai.types';

function formatSize(bytes: number): string {
  if (!bytes) return '—';
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: connected ? '#16A34A' : '#DC2626',
        marginRight: 8,
      }}
    />
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div style={{
      width: '100%', height: 6, background: '#e5e7eb',
      borderRadius: 3, marginTop: 8, overflow: 'hidden',
    }}>
      <div style={{
        width: `${Math.min(percent, 100)}%`, height: '100%',
        background: percent >= 100 ? '#16A34A' : '#2563EB',
        borderRadius: 3,
        transition: 'width 0.3s ease',
      }} />
    </div>
  );
}

export function AiSettingsPage() {
  const { data: healthResp } = useOllamaHealth();
  const { data: modelsResp, isLoading } = useAiModels();
  const { data: statsResp } = useVectorStats();
  const pullModel = usePullModel();
  const deleteModel = useDeleteModel();
  const cancelPull = useCancelPull();
  const setDefault = useSetDefaultModel();
  const [pullInput, setPullInput] = useState('');

  const health = (healthResp as any)?.data;
  const models: AiModel[] = (modelsResp as any)?.data ?? [];
  const stats = (statsResp as any)?.data;

  const chatModels = models.filter((m) => !m.isEmbedding);
  const embeddingModels = models.filter((m) => m.isEmbedding);

  const handlePull = () => {
    if (!pullInput.trim()) return;
    pullModel.mutate(pullInput.trim());
    setPullInput('');
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
        <Icon name="brain" size={22} /> Self-Hosted AI Settings
      </h2>

      {/* Chat Server Connection Status */}
      <Card style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Chat Server</h3>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center' }}>
              <StatusDot connected={health?.connected ?? false} />
              <span>{health?.connected ? 'Connected' : 'Disconnected'}</span>
              {health?.error && (
                <span style={{ marginLeft: 12, color: '#DC2626', fontSize: 13 }}>
                  {health.error}
                </span>
              )}
            </div>
          </div>
          {stats && (
            <div style={{ textAlign: 'right', fontSize: 13 }}>
              <div><strong>{stats.totalEmbeddings}</strong> embeddings stored</div>
              <div><strong>{stats.totalTokens?.toLocaleString()}</strong> tokens indexed</div>
            </div>
          )}
        </div>
      </Card>

      {/* Pull Model */}
      <Card style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Pull Model</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={pullInput}
            onChange={(e) => setPullInput(e.target.value)}
            placeholder="e.g. llama3.2:3b, nomic-embed-text, mistral:7b"
            style={{
              flex: 1, padding: '8px 12px', border: '1px solid #d1d5db',
              borderRadius: 6, fontSize: 14,
            }}
            onKeyDown={(e) => e.key === 'Enter' && handlePull()}
          />
          <Button variant="primary" onClick={handlePull} disabled={pullModel.isPending}>
            <Icon name="download" size={16} /> Pull
          </Button>
        </div>
      </Card>

      {/* Chat Models */}
      <Card style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          <Icon name="message-square" size={16} /> Chat / Generation Models
        </h3>
        {isLoading ? (
          <div>Loading models...</div>
        ) : chatModels.length === 0 ? (
          <div style={{ color: '#9CA3AF', fontSize: 13 }}>No chat models configured</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {chatModels.map((m) => (
              <ModelCard
                key={m.id}
                model={m}
                onPull={() => pullModel.mutate(m.modelId)}
                onDelete={() => { if (confirm(`Remove "${m.name}"?`)) deleteModel.mutate(m.modelId); }}
                onCancel={() => cancelPull.mutate(m.modelId)}
                onSetDefault={() => setDefault.mutate({ modelId: m.modelId, isEmbedding: false })}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Embedding Models */}
      <Card style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          <Icon name="layers" size={16} /> Embedding Models
        </h3>
        {embeddingModels.length === 0 ? (
          <div style={{ color: '#9CA3AF', fontSize: 13 }}>No embedding models configured</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {embeddingModels.map((m) => (
              <ModelCard
                key={m.id}
                model={m}
                onPull={() => pullModel.mutate(m.modelId)}
                onDelete={() => { if (confirm(`Remove "${m.name}"?`)) deleteModel.mutate(m.modelId); }}
                onCancel={() => cancelPull.mutate(m.modelId)}
                onSetDefault={() => setDefault.mutate({ modelId: m.modelId, isEmbedding: true })}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ModelCard({
  model,
  onPull,
  onDelete,
  onCancel,
  onSetDefault,
}: {
  model: AiModel;
  onPull: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onSetDefault: () => void;
}) {
  const isDownloading = model.status === 'DOWNLOADING';
  const isAvailable = model.status === 'AVAILABLE';
  const isNotInstalled = model.status === 'NOT_INSTALLED';
  const isError = model.status === 'ERROR';
  const progress = model.downloadProgress ?? 0;

  const statusColors: Record<string, string> = {
    AVAILABLE: '#16A34A',
    DOWNLOADING: '#2563EB',
    NOT_INSTALLED: '#6B7280',
    ERROR: '#DC2626',
  };

  const statusLabels: Record<string, string> = {
    AVAILABLE: 'Installed',
    DOWNLOADING: `Downloading ${progress}%`,
    NOT_INSTALLED: 'Not Installed',
    ERROR: 'Error',
  };

  return (
    <div
      style={{
        border: `1px solid ${model.isDefault ? '#2563EB' : isDownloading ? '#93C5FD' : '#e5e7eb'}`,
        borderRadius: 10,
        padding: 16,
        background: model.isDefault ? '#EFF6FF' : isDownloading ? '#F0F7FF' : '#fff',
        transition: 'all 0.2s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{model.name}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{model.modelId}</div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {model.isDefault && <Badge variant="primary">Default</Badge>}
        </div>
      </div>

      {/* Specs */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 11, color: '#6B7280' }}>
        {model.parameterCount && (
          <span style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
            {model.parameterCount}
          </span>
        )}
        {model.sizeBytes > 0 && (
          <span style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
            {formatSize(model.sizeBytes)}
          </span>
        )}
        {model.contextLength > 0 && (
          <span style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
            {model.contextLength.toLocaleString()} ctx
          </span>
        )}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: statusColors[model.status] ?? '#6B7280',
            animation: isDownloading ? 'pulse 1.5s infinite' : 'none',
          }}
        />
        <span style={{ fontSize: 12, color: statusColors[model.status] ?? '#6B7280', fontWeight: 500 }}>
          {statusLabels[model.status] ?? model.status}
        </span>
      </div>

      {/* Progress Bar — visible during download */}
      {isDownloading && (
        <>
          <ProgressBar percent={progress} />
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4, textAlign: 'right' }}>
            {progress}% complete
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        {/* Not Installed → Install button */}
        {isNotInstalled && (
          <Button variant="primary" onClick={onPull} style={{ fontSize: 12, padding: '5px 12px' }}>
            <Icon name="download" size={14} /> Install
          </Button>
        )}

        {/* Downloading → Stop button */}
        {isDownloading && (
          <Button
            variant="danger"
            onClick={onCancel}
            style={{ fontSize: 12, padding: '5px 12px' }}
          >
            <Icon name="x" size={14} /> Stop
          </Button>
        )}

        {/* Error → Retry + Remove */}
        {isError && (
          <>
            <Button variant="primary" onClick={onPull} style={{ fontSize: 12, padding: '5px 12px' }}>
              <Icon name="refresh-cw" size={14} /> Retry
            </Button>
            <Button
              variant="ghost"
              onClick={onDelete}
              style={{ fontSize: 12, padding: '5px 12px', color: '#DC2626' }}
            >
              <Icon name="trash-2" size={14} /> Remove
            </Button>
          </>
        )}

        {/* Available → Set Default + Remove */}
        {isAvailable && !model.isDefault && (
          <Button variant="outline" onClick={onSetDefault} style={{ fontSize: 12, padding: '5px 12px' }}>
            <Icon name="star" size={14} /> Set Default
          </Button>
        )}
        {isAvailable && (
          <Button
            variant="ghost"
            onClick={onDelete}
            style={{ fontSize: 12, padding: '5px 12px', color: '#DC2626' }}
          >
            <Icon name="trash-2" size={14} /> Remove
          </Button>
        )}
      </div>
    </div>
  );
}
