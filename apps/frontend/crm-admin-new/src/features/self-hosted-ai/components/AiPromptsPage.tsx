'use client';

import { useState } from 'react';
import { Button, Card, Badge, Input } from '@/components/ui';
import { Icon } from '@/components/ui';
import { SelectInput } from '@/components/ui';
import {
  useSystemPrompts, useCreatePrompt, useUpdatePrompt, useDeletePrompt,
} from '../hooks/useSelfHostedAi';
import type { AiSystemPrompt } from '../types/self-hosted-ai.types';

const CATEGORIES = [
  { label: 'General', value: 'general' },
  { label: 'Sales', value: 'sales' },
  { label: 'Product', value: 'product' },
  { label: 'Support', value: 'support' },
  { label: 'Analytics', value: 'analytics' },
  { label: 'Communication', value: 'communication' },
];

export function AiPromptsPage() {
  const { data: promptsResp, isLoading } = useSystemPrompts();
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const deletePrompt = useDeletePrompt();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('general');
  const [isDefault, setIsDefault] = useState(false);

  const prompts: AiSystemPrompt[] = (promptsResp as any)?.data ?? [];

  const resetForm = () => {
    setEditId('');
    setName('');
    setDescription('');
    setPrompt('');
    setCategory('general');
    setIsDefault(false);
    setShowForm(false);
  };

  const openEdit = (p: AiSystemPrompt) => {
    setEditId(p.id);
    setName(p.name);
    setDescription(p.description ?? '');
    setPrompt(p.prompt);
    setCategory(p.category);
    setIsDefault(p.isDefault);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim() || !prompt.trim()) return;
    const data = { name, description, prompt, category, isDefault };
    if (editId) {
      updatePrompt.mutate({ id: editId, ...data }, { onSuccess: resetForm });
    } else {
      createPrompt.mutate(data, { onSuccess: resetForm });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
          <Icon name="terminal" size={22} /> System Prompts
        </h2>
        <Button variant="primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Icon name="plus" size={16} /> New Prompt
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card style={{ padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            {editId ? 'Edit Prompt' : 'Create Prompt'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Prompt Name"
              leftIcon={<Icon name="tag" size={16} />}
              value={name}
              onChange={setName}
            />
            <SelectInput
              options={CATEGORIES}
              value={category}
              onChange={(v) => setCategory(String(v ?? 'general'))}
              label="Category"
              leftIcon={<Icon name="folder" size={16} />}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <Input
              label="Description"
              leftIcon={<Icon name="info" size={16} />}
              value={description}
              onChange={setDescription}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>
              System Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              style={{
                width: '100%', padding: 12, border: '1px solid #d1d5db',
                borderRadius: 6, fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
              }}
              placeholder="You are a helpful CRM assistant..."
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              Set as default for this category
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant="primary" onClick={handleSave}>
              {editId ? 'Update' : 'Create'}
            </Button>
            <Button variant="ghost" onClick={resetForm}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Prompts List */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {prompts.map((p) => (
            <Card key={p.id} style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                    <Badge variant="secondary">{p.category}</Badge>
                    {p.isDefault && <Badge variant="primary">Default</Badge>}
                    {p.isSystem && <Badge variant="outline">System</Badge>}
                  </div>
                  {p.description && (
                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                      {p.description}
                    </div>
                  )}
                </div>
                {!p.isSystem && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button variant="ghost" onClick={() => openEdit(p)} style={{ fontSize: 12 }}>
                      <Icon name="edit" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => { if (confirm(`Delete "${p.name}"?`)) deletePrompt.mutate(p.id); }}
                      style={{ fontSize: 12, color: '#DC2626' }}
                    >
                      <Icon name="trash-2" size={14} />
                    </Button>
                  </div>
                )}
              </div>
              <div
                style={{
                  marginTop: 10, padding: 10, background: '#f9fafb', borderRadius: 6,
                  fontSize: 12, color: '#374151', whiteSpace: 'pre-wrap',
                  maxHeight: 100, overflow: 'hidden',
                }}
              >
                {p.prompt}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
