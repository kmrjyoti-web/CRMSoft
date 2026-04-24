'use client';

import { useState } from 'react';
import { Badge, Button, Card, Input } from '@/components/ui';
import { Icon } from '@/components/ui';
import {
  useDataset, useAddDocument, useDeleteDocument,
} from '../hooks/useSelfHostedAi';
import type { AiDocument } from '../types/self-hosted-ai.types';

export function DatasetDetailPage({ datasetId }: { datasetId: string }) {
  const { data: dsResp, isLoading } = useDataset(datasetId);
  const addDoc = useAddDocument();
  const deleteDoc = useDeleteDocument();

  const [showAdd, setShowAdd] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');

  const dataset = (dsResp as any)?.data;
  const documents: AiDocument[] = dataset?.documents ?? [];

  const handleAdd = () => {
    if (!docTitle.trim() || !docContent.trim()) return;
    addDoc.mutate({ datasetId, title: docTitle, content: docContent });
    setDocTitle('');
    setDocContent('');
    setShowAdd(false);
  };

  if (isLoading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!dataset) return <div style={{ padding: 24 }}>Dataset not found</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button variant="ghost" onClick={() => window.history.back()}>
          <Icon name="arrow-left" size={18} />
        </Button>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{dataset.name}</h2>
          {dataset.description && (
            <div style={{ fontSize: 13, color: '#6B7280' }}>{dataset.description}</div>
          )}
        </div>
        <Badge variant={dataset.status === 'READY' ? 'success' : 'secondary'}>
          {dataset.status}
        </Badge>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <Card style={{ padding: 16, flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{dataset.documentCount}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Documents</div>
        </Card>
        <Card style={{ padding: 16, flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{dataset.totalChunks}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Chunks</div>
        </Card>
        <Card style={{ padding: 16, flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{dataset.totalTokens?.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Tokens</div>
        </Card>
      </div>

      {/* Add Document */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Documents</h3>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={16} /> Add Document
        </Button>
      </div>

      {showAdd && (
        <Card style={{ padding: 20, marginBottom: 16 }}>
          <Input
            label="Title"
            leftIcon={<Icon name="file-text" size={16} />}
            value={docTitle}
            onChange={setDocTitle}
          />
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>Content</label>
            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              rows={8}
              style={{
                width: '100%', padding: 12, border: '1px solid #d1d5db',
                borderRadius: 6, fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
              }}
              placeholder="Paste your knowledge base content here..."
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Button variant="primary" onClick={handleAdd} disabled={addDoc.isPending}>
              {addDoc.isPending ? 'Adding...' : 'Add Document'}
            </Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <Card style={{ padding: 30, textAlign: 'center', color: '#6B7280' }}>
          No documents yet. Add documents or import CRM data.
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {documents.map((doc) => (
            <Card key={doc.id} style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{doc.title}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    {doc.tokenCount} tokens · {doc.chunkCount} chunks ·{' '}
                    {doc.isProcessed ? (
                      <span style={{ color: '#059669' }}>Processed</span>
                    ) : (
                      <span style={{ color: '#6B7280' }}>Pending</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Badge variant="secondary">{doc.contentType}</Badge>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Delete document "${doc.title}"?`)) deleteDoc.mutate(doc.id);
                    }}
                    style={{ color: '#DC2626' }}
                  >
                    <Icon name="trash-2" size={14} />
                  </Button>
                </div>
              </div>
              {doc.content && (
                <div
                  style={{
                    marginTop: 8, padding: 8, background: '#f9fafb', borderRadius: 4,
                    fontSize: 12, color: '#374151', maxHeight: 80, overflow: 'hidden',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {doc.content.substring(0, 300)}
                  {doc.content.length > 300 && '...'}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
