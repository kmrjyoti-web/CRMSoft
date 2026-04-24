'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Input, Badge } from '@/components/ui';
import { Icon } from '@/components/ui';
import { SelectInput } from '@/components/ui';
import {
  useWidgetConfig, useUpdateWidgetConfig,
  useAiModels, useDatasets, useSystemPrompts,
} from '../hooks/useSelfHostedAi';
import type { AiModel, WidgetConfig } from '../types/self-hosted-ai.types';

export function AiWidgetConfigPage() {
  const { data: configResp } = useWidgetConfig();
  const { data: modelsResp } = useAiModels();
  const { data: datasetsResp } = useDatasets();
  const { data: promptsResp } = useSystemPrompts();
  const updateConfig = useUpdateWidgetConfig();

  const config: WidgetConfig = (configResp as any)?.data ?? {
    enabled: false, title: 'AI Assistant', subtitle: '',
    primaryColor: '#2563EB', position: 'bottom-right',
    modelId: '', datasetIds: [], systemPromptId: '',
  };
  const models: AiModel[] = ((modelsResp as any)?.data ?? []).filter(
    (m: AiModel) => !m.isEmbedding && m.status === 'AVAILABLE',
  );
  const datasets = ((datasetsResp as any)?.data ?? []).filter((d: any) => d.status === 'READY');
  const prompts = (promptsResp as any)?.data ?? [];

  const [form, setForm] = useState<WidgetConfig>(config);

  useEffect(() => {
    if (config) setForm(config);
  }, [JSON.stringify(config)]);

  const handleSave = () => {
    updateConfig.mutate(form, {
      onSuccess: () => {
        // Notify the chat widget to reload config instantly
        window.dispatchEvent(new Event('ai-widget-config-updated'));
      },
    });
  };

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
        <Icon name="layout" size={22} /> Chat Widget Configuration
      </h2>

      <Card style={{ padding: 24 }}>
        {/* Enable/Disable */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Enable Chat Widget</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>
              Show an AI chat button on all CRM pages
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ fontSize: 13 }}>{form.enabled ? 'Enabled' : 'Disabled'}</span>
          </label>
        </div>

        <hr style={{ border: '1px solid #f3f4f6', margin: '16px 0' }} />

        {/* Appearance */}
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Appearance</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            label="Widget Title"
            leftIcon={<Icon name="type" size={16} />}
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
          />
          <Input
            label="Subtitle"
            leftIcon={<Icon name="align-left" size={16} />}
            value={form.subtitle}
            onChange={(v) => setForm({ ...form, subtitle: v })}
          />
          <Input
            label="Primary Color"
            leftIcon={<Icon name="palette" size={16} />}
            value={form.primaryColor}
            onChange={(v) => setForm({ ...form, primaryColor: v })}
          />
          <SelectInput
            options={[
              { label: 'Bottom Right', value: 'bottom-right' },
              { label: 'Bottom Left', value: 'bottom-left' },
            ]}
            value={form.position}
            onChange={(v) => setForm({ ...form, position: String(v ?? 'bottom-right') })}
            label="Position"
            leftIcon={<Icon name="move" size={16} />}
          />
        </div>

        <hr style={{ border: '1px solid #f3f4f6', margin: '16px 0' }} />

        {/* AI Configuration */}
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>AI Configuration</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <SelectInput
            options={models.map((m) => ({ label: m.name, value: m.modelId }))}
            value={form.modelId}
            onChange={(v) => setForm({ ...form, modelId: String(v ?? '') })}
            label="Chat Model"
            leftIcon={<Icon name="brain" size={16} />}
          />
          <SelectInput
            options={prompts.map((p: any) => ({ label: p.name, value: p.id }))}
            value={form.systemPromptId}
            onChange={(v) => setForm({ ...form, systemPromptId: String(v ?? '') })}
            label="System Prompt"
            leftIcon={<Icon name="terminal" size={16} />}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Knowledge Bases (RAG Datasets)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {datasets.map((ds: any) => {
              const selected = form.datasetIds?.includes(ds.id);
              return (
                <Button
                  key={ds.id}
                  variant={selected ? 'primary' : 'outline'}
                  onClick={() => {
                    const ids = selected
                      ? form.datasetIds.filter((id) => id !== ds.id)
                      : [...(form.datasetIds ?? []), ds.id];
                    setForm({ ...form, datasetIds: ids });
                  }}
                  style={{ fontSize: 12 }}
                >
                  {ds.name}
                  {selected && <Icon name="check" size={14} />}
                </Button>
              );
            })}
            {datasets.length === 0 && (
              <span style={{ fontSize: 13, color: '#6B7280' }}>
                No trained datasets available. Go to Training to create one.
              </span>
            )}
          </div>
        </div>

        <hr style={{ border: '1px solid #f3f4f6', margin: '16px 0' }} />

        {/* Preview */}
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Preview</h4>
        <div
          style={{
            position: 'relative',
            background: '#f9fafb',
            borderRadius: 12,
            padding: 20,
            minHeight: 320,
            border: '1px solid #e5e7eb',
          }}
        >
          {/* Mini chat window preview */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              [form.position === 'bottom-left' ? 'left' : 'right']: 16,
              width: 280,
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              background: '#fff',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '10px 14px',
                background: form.primaryColor || '#2563EB',
                color: '#fff',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>{form.title || 'AI Assistant'}</div>
              {form.subtitle && (
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{form.subtitle}</div>
              )}
            </div>
            {/* Messages */}
            <div style={{ padding: 10, minHeight: 120 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 6 }}>
                <div
                  style={{
                    padding: '6px 10px', borderRadius: 10, background: '#f3f4f6',
                    fontSize: 11, color: '#374151', maxWidth: '80%',
                  }}
                >
                  Hi! How can I help you today?
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
                <div
                  style={{
                    padding: '6px 10px', borderRadius: 10,
                    background: form.primaryColor || '#2563EB',
                    fontSize: 11, color: '#fff', maxWidth: '80%',
                  }}
                >
                  Show my top leads
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '6px 10px', borderRadius: 10, background: '#f3f4f6',
                    fontSize: 11, color: '#374151', maxWidth: '80%',
                  }}
                >
                  Here are your top 5 leads this month...
                </div>
              </div>
            </div>
            {/* Input */}
            <div style={{ padding: '6px 10px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 4 }}>
              <div
                style={{
                  flex: 1, padding: '5px 10px', border: '1px solid #d1d5db',
                  borderRadius: 16, fontSize: 11, color: '#9CA3AF',
                }}
              >
                Type a message...
              </div>
              <div
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: form.primaryColor || '#2563EB', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon name="send" size={12} />
              </div>
            </div>
          </div>

          {/* Floating button (when chat is "closed") */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              [form.position === 'bottom-left' ? 'left' : 'right']: 16,
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: form.primaryColor || '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <Icon name="message-circle" size={22} />
          </div>

          <div style={{
            position: 'absolute', top: 16,
            [form.position === 'bottom-left' ? 'right' : 'left']: 16,
            fontSize: 11, color: '#9CA3AF',
          }}>
            {form.enabled ? '✓ Widget will appear on all CRM pages' : '⚠ Enable the widget above to show it'}
          </div>
        </div>

        {/* Save */}
        <div style={{ marginTop: 24 }}>
          <Button variant="primary" onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
          {updateConfig.isSuccess && (
            <span style={{ marginLeft: 12, color: '#16A34A', fontSize: 13 }}>
              <Icon name="check" size={14} /> Saved! {form.enabled ? 'Widget is now active.' : 'Widget is disabled.'}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
