'use client';

import { useState, useCallback, useRef } from 'react';
import { Badge, Button, Card, Input } from '@/components/ui';
import { Icon } from '@/components/ui';
import { SelectInput } from '@/components/ui';
import { useContentPanel } from '@/hooks/useEntityPanel';
import {
  useDatasets, useCreateDataset, useDeleteDataset,
  useTrainingJobs, useStartTraining, useCancelTraining,
  useImportCrmData, useUploadFile, useImportUrl, useAddDocument,
  useAiModels,
} from '../hooks/useSelfHostedAi';
import type { AiDataset, AiTrainingJob, AiModel } from '../types/self-hosted-ai.types';
import { formatDate } from "@/lib/format-date";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: '#F3F4F6', text: '#6B7280' },
  PROCESSING: { bg: '#FEF3C7', text: '#D97706' },
  READY: { bg: '#D1FAE5', text: '#059669' },
  FAILED: { bg: '#FEE2E2', text: '#DC2626' },
  QUEUED: { bg: '#EBF5FF', text: '#2563EB' },
  RUNNING: { bg: '#FEF3C7', text: '#D97706' },
  COMPLETED: { bg: '#D1FAE5', text: '#059669' },
  CANCELLED: { bg: '#F3F4F6', text: '#6B7280' },
};

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] ?? { bg: '#F3F4F6', text: '#6B7280' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
      background: colors.bg, color: colors.text, display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      {(status === 'RUNNING' || status === 'PROCESSING') && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.text, animation: 'pulse 1.5s infinite' }} />
      )}
      {status}
    </span>
  );
}


// ── Tab button style helper ──

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 14px', fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer',
    borderBottom: active ? '2px solid #2563EB' : '2px solid transparent',
    color: active ? '#2563EB' : '#6B7280', background: 'none', border: 'none',
    borderBottomStyle: 'solid',
  };
}

// ── Panel: Create Dataset ──

function CreateDatasetPanel({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const createDataset = useCreateDataset();

  const handleCreate = () => {
    if (!name.trim()) return;
    createDataset.mutate({ name, description: desc }, {
      onSuccess: () => onCreated(),
      onError: () => alert('Failed to create dataset'),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
        Create a knowledge base to train your AI on CRM data.
      </p>
      <Input label="Dataset Name" leftIcon={<Icon name="folder" size={16} />}
        value={name} onChange={setName} placeholder="e.g. Sales Knowledge Base" />
      <Input label="Description (optional)" leftIcon={<Icon name="file-text" size={16} />}
        value={desc} onChange={setDesc} placeholder="What data will this contain?" />
      <Button variant="primary" onClick={handleCreate} disabled={!name.trim() || createDataset.isPending}>
        {createDataset.isPending ? 'Creating...' : 'Create Dataset'}
      </Button>
    </div>
  );
}

// ── Panel: Add Data (All Sources in Tabs) ──

function AddDataPanel({ dataset, onDone }: { dataset: AiDataset; onDone: () => void }) {
  const [tab, setTab] = useState<'crm' | 'file' | 'url' | 'text'>('crm');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
    if (type === 'success') setTimeout(() => onDone(), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Dataset info */}
      <div style={{
        background: '#F9FAFB', borderRadius: 8, padding: 12, marginBottom: 14,
        fontSize: 12, color: '#6B7280', display: 'flex', gap: 12,
      }}>
        <span><strong>{dataset.documentCount}</strong> docs</span>
        <span><strong>{dataset.totalChunks}</strong> chunks</span>
        <span><strong>{dataset.totalTokens?.toLocaleString()}</strong> tokens</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 16 }}>
        <button style={tabStyle(tab === 'crm')} onClick={() => setTab('crm')}>
          <Icon name="database" size={13} /> CRM Data
        </button>
        <button style={tabStyle(tab === 'file')} onClick={() => setTab('file')}>
          <Icon name="upload" size={13} /> Upload File
        </button>
        <button style={tabStyle(tab === 'url')} onClick={() => setTab('url')}>
          <Icon name="globe" size={13} /> Website URL
        </button>
        <button style={tabStyle(tab === 'text')} onClick={() => setTab('text')}>
          <Icon name="file-text" size={13} /> Paste Text
        </button>
      </div>

      {/* Message */}
      {msg && (
        <div style={{
          padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 12,
          background: msg.type === 'success' ? '#D1FAE5' : '#FEE2E2',
          color: msg.type === 'success' ? '#059669' : '#DC2626',
        }}>
          <Icon name={msg.type === 'success' ? 'check' : 'alert-circle'} size={14} /> {msg.text}
        </div>
      )}

      {/* Tab content */}
      {tab === 'crm' && <CrmTab datasetId={dataset.id} onSuccess={showMsg} />}
      {tab === 'file' && <FileTab datasetId={dataset.id} onSuccess={showMsg} />}
      {tab === 'url' && <UrlTab datasetId={dataset.id} onSuccess={showMsg} />}
      {tab === 'text' && <TextTab datasetId={dataset.id} onSuccess={showMsg} />}

      {/* Reminder */}
      <div style={{ marginTop: 14, padding: 10, background: '#FEF3C7', borderRadius: 8, fontSize: 11, color: '#92400E' }}>
        <Icon name="alert-circle" size={13} /> After adding data, click <strong>Train</strong> on the dataset card for the AI to use it.
      </div>
    </div>
  );
}

// ── CRM Tab ──

function CrmTab({ datasetId, onSuccess }: { datasetId: string; onSuccess: (msg: string, type: 'success' | 'error') => void }) {
  const [entity, setEntity] = useState('');
  const importCrm = useImportCrmData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SelectInput
        options={[
          { label: 'Contacts', value: 'CONTACT' },
          { label: 'Organizations', value: 'ORGANIZATION' },
          { label: 'Products', value: 'PRODUCT' },
          { label: 'Leads', value: 'LEAD' },
        ]}
        value={entity}
        onChange={(v) => setEntity(String(v ?? ''))}
        label="Entity Type"
        leftIcon={<Icon name="database" size={16} />}
      />
      <Button variant="primary" disabled={!entity || importCrm.isPending}
        onClick={() => importCrm.mutate({ datasetId, entityType: entity }, {
          onSuccess: (r: any) => onSuccess(`Imported ${r?.data?.imported ?? 0} ${entity.toLowerCase()} records`, 'success'),
          onError: () => onSuccess('Import failed', 'error'),
        })}
      >
        {importCrm.isPending ? <><Icon name="loader" size={14} /> Importing...</> : <><Icon name="download" size={14} /> Import</>}
      </Button>
    </div>
  );
}

// ── File Upload Tab ──

function FileTab({ datasetId, onSuccess }: { datasetId: string; onSuccess: (msg: string, type: 'success' | 'error') => void }) {
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadFile();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border: '2px dashed #d1d5db', borderRadius: 8, padding: 24,
          textAlign: 'center', cursor: 'pointer', background: file ? '#F0FDF4' : '#FAFAFA',
          transition: 'background 0.2s',
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.csv,.xlsx,.xls,.pdf,.json"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div>
            <Icon name="file" size={24} />
            <div style={{ fontWeight: 600, fontSize: 13, marginTop: 6 }}>{file.name}</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>
        ) : (
          <div>
            <Icon name="upload" size={24} />
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>
              Click to select a file
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
              Supported: .txt, .md, .csv, .xlsx, .xls, .pdf, .json (max 10 MB)
            </div>
          </div>
        )}
      </div>
      <Button variant="primary" disabled={!file || upload.isPending}
        onClick={() => {
          if (!file) return;
          upload.mutate({ datasetId, file }, {
            onSuccess: (r: any) => onSuccess(`File uploaded: ${r?.message ?? 'done'}`, 'success'),
            onError: (e: any) => onSuccess(e?.response?.data?.error?.message ?? 'Upload failed', 'error'),
          });
        }}
      >
        {upload.isPending ? <><Icon name="loader" size={14} /> Extracting text...</> : <><Icon name="upload" size={14} /> Upload & Extract</>}
      </Button>
    </div>
  );
}

// ── URL Tab ──

function UrlTab({ datasetId, onSuccess }: { datasetId: string; onSuccess: (msg: string, type: 'success' | 'error') => void }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const importUrlMut = useImportUrl();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Input label="Website URL" leftIcon={<Icon name="globe" size={16} />}
        value={url} onChange={setUrl} placeholder="https://example.com/about" />
      <Input label="Title (optional)" leftIcon={<Icon name="type" size={16} />}
        value={title} onChange={setTitle} placeholder="Auto-detected from page" />
      <Button variant="primary" disabled={!url.startsWith('http') || importUrlMut.isPending}
        onClick={() => importUrlMut.mutate({ datasetId, url, title: title || undefined }, {
          onSuccess: (r: any) => onSuccess(`URL scraped: ${r?.message ?? 'done'}`, 'success'),
          onError: (e: any) => onSuccess(e?.response?.data?.error?.message ?? 'Scraping failed', 'error'),
        })}
      >
        {importUrlMut.isPending ? <><Icon name="loader" size={14} /> Scraping...</> : <><Icon name="globe" size={14} /> Scrape & Import</>}
      </Button>
    </div>
  );
}

// ── Text Tab ──

function TextTab({ datasetId, onSuccess }: { datasetId: string; onSuccess: (msg: string, type: 'success' | 'error') => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const addDoc = useAddDocument();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Input label="Title" leftIcon={<Icon name="type" size={16} />}
        value={title} onChange={setTitle} placeholder="e.g. Company FAQ" />
      <div>
        <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }}>
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your text content here..."
          style={{
            width: '100%', minHeight: 120, padding: 10, borderRadius: 6,
            border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
          {content.split(/\s+/).filter(Boolean).length} words
        </div>
      </div>
      <Button variant="primary" disabled={!title.trim() || !content.trim() || addDoc.isPending}
        onClick={() => addDoc.mutate({ datasetId, title, content }, {
          onSuccess: () => onSuccess('Document added', 'success'),
          onError: () => onSuccess('Failed to add document', 'error'),
        })}
      >
        {addDoc.isPending ? <><Icon name="loader" size={14} /> Saving...</> : <><Icon name="plus" size={14} /> Add Document</>}
      </Button>
    </div>
  );
}

// ── Panel: Train Dataset ──

function TrainDatasetPanel({ dataset, onStarted }: {
  dataset: AiDataset;
  onStarted: () => void;
}) {
  const { data: modelsResp } = useAiModels();
  const allModels: AiModel[] = (modelsResp as any)?.data ?? [];
  const embeddingModels = allModels.filter((m) => m.isEmbedding && m.status === 'AVAILABLE');
  const [model, setModel] = useState('');
  const startTraining = useStartTraining();

  // Auto-select first embedding model when available
  if (!model && embeddingModels.length > 0) {
    setModel(embeddingModels[0].modelId);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
        Generate embeddings for <strong>{dataset.name}</strong>
      </p>
      <div style={{
        background: '#F9FAFB', borderRadius: 8, padding: 12,
        fontSize: 12, color: '#6B7280', display: 'flex', gap: 12,
      }}>
        <span><strong>{dataset.documentCount}</strong> docs to process</span>
        <span><strong>{dataset.totalTokens}</strong> tokens</span>
      </div>
      <SelectInput
        options={embeddingModels.map((m) => ({ label: `${m.name} (${m.modelId})`, value: m.modelId }))}
        value={model}
        onChange={(v) => setModel(String(v ?? ''))}
        label="Embedding Model"
        leftIcon={<Icon name="brain" size={16} />}
      />
      {embeddingModels.length === 0 && (
        <div style={{ padding: 12, background: '#FEE2E2', borderRadius: 8, fontSize: 12, color: '#991B1B' }}>
          <Icon name="alert-circle" size={14} /> No embedding models available. Go to AI Settings and install one (e.g. nomic-embed-text).
        </div>
      )}
      <div style={{ padding: 12, background: '#EBF5FF', borderRadius: 8, fontSize: 12, color: '#1E40AF' }}>
        <Icon name="info" size={14} /> Training converts your documents into vectors so the AI chat can search and answer questions from this data.
      </div>
      <Button variant="primary" disabled={!model || startTraining.isPending}
        onClick={() => startTraining.mutate({ datasetId: dataset.id, modelId: model }, {
          onSuccess: () => onStarted(),
          onError: (e: any) => alert(e?.response?.data?.error?.message ?? 'Training failed'),
        })}
      >
        {startTraining.isPending ? <><Icon name="loader" size={14} /> Starting...</> : <><Icon name="zap" size={14} /> Start Training</>}
      </Button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════

export function AiTrainingPage() {
  const { data: datasetsResp, isLoading: dsLoading } = useDatasets();
  const { data: jobsResp, isLoading: jobsLoading } = useTrainingJobs();
  const deleteDataset = useDeleteDataset();
  const cancelTraining = useCancelTraining();
  const { openContent, closeContent } = useContentPanel();

  const datasets: AiDataset[] = (datasetsResp as any)?.data ?? [];
  const jobs: AiTrainingJob[] = (jobsResp as any)?.data ?? [];

  const openCreatePanel = useCallback(() => {
    const panelId = 'ai-create-dataset';
    openContent({
      id: panelId,
      title: 'New Dataset',
      icon: 'folder-plus',
      content: <CreateDatasetPanel onCreated={() => closeContent(panelId)} />,
    });
  }, [openContent, closeContent]);

  const openAddDataPanel = useCallback((ds: AiDataset) => {
    const panelId = `ai-add-data-${ds.id}`;
    openContent({
      id: panelId,
      title: `Add Data — ${ds.name}`,
      icon: 'plus-circle',
      width: 480,
      content: <AddDataPanel dataset={ds} onDone={() => closeContent(panelId)} />,
    });
  }, [openContent, closeContent]);

  const openTrainPanel = useCallback((ds: AiDataset) => {
    const panelId = `ai-train-${ds.id}`;
    openContent({
      id: panelId,
      title: 'Train Dataset',
      icon: 'zap',
      content: (
        <TrainDatasetPanel
          dataset={ds}
          onStarted={() => closeContent(panelId)}
        />
      ),
    });
  }, [openContent, closeContent]);

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
          <Icon name="database" size={22} /> AI Training & Datasets
        </h2>
        <Button variant="primary" onClick={openCreatePanel}>
          <Icon name="plus" size={16} /> New Dataset
        </Button>
      </div>

      {/* Dataset Summary Cards */}
      {dsLoading ? (
        <div style={{ color: '#6B7280', padding: 20 }}>Loading datasets...</div>
      ) : datasets.length === 0 ? (
        <Card style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
          <Icon name="inbox" size={40} />
          <p style={{ marginTop: 12 }}>No datasets yet. Create one to get started.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 28 }}>
          {datasets.map((ds) => (
            <Card key={ds.id} style={{
              padding: 16,
              border: ds.status === 'READY' ? '1px solid #D1FAE5' : ds.status === 'PROCESSING' ? '1px solid #FEF3C7' : '1px solid #e5e7eb',
              background: ds.status === 'READY' ? '#F0FDF4' : '#fff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{ds.name}</div>
                <StatusBadge status={ds.status} />
              </div>
              {ds.description && (
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{ds.description}</div>
              )}
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6B7280', marginBottom: 12 }}>
                <span><Icon name="file-text" size={13} /> {ds.documentCount} docs</span>
                <span><Icon name="layers" size={13} /> {ds.totalChunks} chunks</span>
                <span><Icon name="hash" size={13} /> {ds.totalTokens?.toLocaleString()} tokens</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button variant="outline" onClick={() => openAddDataPanel(ds)} style={{ fontSize: 11, padding: '4px 10px' }}>
                  <Icon name="plus-circle" size={13} /> Add Data
                </Button>
                <Button
                  variant="primary"
                  onClick={() => openTrainPanel(ds)}
                  disabled={ds.documentCount === 0}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                >
                  <Icon name="zap" size={13} /> Train
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { if (confirm(`Delete "${ds.name}"?`)) deleteDataset.mutate(ds.id); }}
                  style={{ fontSize: 11, padding: '4px 10px', color: '#DC2626', marginLeft: 'auto' }}
                >
                  <Icon name="trash-2" size={13} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Training Jobs Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
            <Icon name="zap" size={16} /> Training Jobs
          </h3>
          <span style={{ fontSize: 12, color: '#6B7280' }}>{jobs.length} total</span>
        </div>

        {jobsLoading ? (
          <div style={{ padding: 20, color: '#6B7280' }}>Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            No training jobs yet. Import data into a dataset, then click Train.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Dataset</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Embedding Model</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Progress</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Steps</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Started</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 500 }}>{job.dataset?.name ?? '—'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontFamily: 'monospace', fontSize: 12, background: '#F3F4F6',
                        padding: '2px 8px', borderRadius: 4,
                      }}>
                        {job.modelId}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}><StatusBadge status={job.status} /></td>
                    <td style={{ padding: '10px 16px', minWidth: 140 }}>
                      {(job.status === 'RUNNING' || job.status === 'QUEUED') ? (
                        <div>
                          <div style={{
                            width: '100%', height: 6, borderRadius: 3,
                            background: '#e5e7eb', overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${Math.min(job.progress, 100)}%`, height: '100%',
                              borderRadius: 3, background: '#2563EB',
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>
                            {Math.round(job.progress)}%
                          </div>
                        </div>
                      ) : job.status === 'COMPLETED' ? (
                        <span style={{ color: '#059669', fontWeight: 500 }}>
                          <Icon name="check" size={14} /> 100%
                        </span>
                      ) : job.status === 'FAILED' ? (
                        <span style={{ color: '#DC2626', fontSize: 11 }} title={job.errorMessage}>
                          <Icon name="alert-circle" size={14} /> Failed
                        </span>
                      ) : (
                        <span style={{ color: '#6B7280' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#6B7280' }}>
                      {job.completedSteps}/{job.totalSteps}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                      {formatDate(job.startedAt ?? job.createdAt)}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      {(job.status === 'RUNNING' || job.status === 'QUEUED') && (
                        <Button
                          variant="ghost"
                          onClick={() => cancelTraining.mutate(job.id)}
                          style={{ fontSize: 11, padding: '3px 8px', color: '#DC2626' }}
                        >
                          <Icon name="x" size={13} /> Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
