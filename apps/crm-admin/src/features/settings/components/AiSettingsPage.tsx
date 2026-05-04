'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { Button, SelectInput, Input, Icon, Fieldset, Badge } from '@/components/ui';

import { useAiSettings, useUpdateAiSettings, useAiModels, useAiUsage } from '../hooks/useAiSettings';
import type { AiProvider } from '../types/ai-settings.types';

// ── Schema ──────────────────────────────────────────────

const schema = z.object({
  defaultProvider: z.string().min(1),
  defaultModel: z.string().min(1),
  isEnabled: z.boolean(),
  monthlyTokenBudget: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof schema>;

const PROVIDER_OPTIONS: { value: AiProvider; label: string }[] = [
  { value: 'ANTHROPIC_CLAUDE', label: 'Anthropic Claude' },
  { value: 'OPENAI_GPT', label: 'OpenAI GPT' },
  { value: 'GOOGLE_GEMINI', label: 'Google Gemini' },
  { value: 'GROQ', label: 'Groq' },
];

const OPERATIONS = [
  { key: 'generate', label: 'Generate Document' },
  { key: 'improve', label: 'Improve Text' },
  { key: 'translate', label: 'Translate' },
  { key: 'summarize', label: 'Summarize' },
  { key: 'tone', label: 'Change Tone' },
];

// ── Component ───────────────────────────────────────────

export function AiSettingsPage() {
  const { data: settingsData } = useAiSettings();
  const { data: modelsData } = useAiModels();
  const { data: usageData } = useAiUsage();
  const updateMut = useUpdateAiSettings();

  const settings = settingsData?.data;
  const modelsResponse = modelsData?.data;
  const usage = usageData?.data;
  const suggestions = modelsResponse?.suggestions;

  const { handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      defaultProvider: 'ANTHROPIC_CLAUDE',
      defaultModel: 'claude-sonnet-4-20250514',
      isEnabled: true,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        defaultProvider: settings.defaultProvider,
        defaultModel: settings.defaultModel,
        isEnabled: settings.isEnabled,
        monthlyTokenBudget: settings.monthlyTokenBudget ?? undefined,
      });
    }
  }, [settings, reset]);

  const selectedProvider = watch('defaultProvider');

  const modelOptions = useMemo(() => {
    if (!modelsResponse?.models) return [];
    const models = modelsResponse.models[selectedProvider as AiProvider] ?? [];
    return models.map((m) => ({ value: m.id, label: `${m.label} (${Math.round(m.context / 1000)}K ctx)` }));
  }, [modelsResponse, selectedProvider]);

  const onSubmit = (data: FormValues) => {
    updateMut.mutate(data, {
      onSuccess: () => toast.success('AI settings updated'),
      onError: () => toast.error('Failed to update settings'),
    });
  };

  const totalTokens = useMemo(() => {
    if (!usage) return 0;
    return usage.reduce((sum, s) => sum + s.totalTokens, 0);
  }, [usage]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">AI Configuration</h1>
        <p className="text-sm text-gray-500">
          Configure AI providers, default models, and monitor usage
        </p>
      </div>

      {/* Default Provider & Model */}
      <form onSubmit={handleSubmit(onSubmit) as any}>
        <Fieldset title="Default AI Provider">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectInput
              label="Provider"
              leftIcon={<Icon name="cpu" size={16} />}
              value={watch('defaultProvider')}
              onChange={(v) => {
                setValue('defaultProvider', v as string);
                // Reset model when provider changes
                const models = modelsResponse?.models?.[v as AiProvider];
                if (models?.[0]) setValue('defaultModel', models[0].id);
              }}
              options={PROVIDER_OPTIONS}
            />
            <SelectInput
              label="Default Model"
              leftIcon={<Icon name="zap" size={16} />}
              value={watch('defaultModel')}
              onChange={(v) => setValue('defaultModel', v as string)}
              options={modelOptions}
            />
            <Input
              label="Monthly Token Budget"
              leftIcon={<Icon name="bar-chart" size={16} />}
              value={watch('monthlyTokenBudget') != null ? String(watch('monthlyTokenBudget')) : ''}
              onChange={(v) => setValue('monthlyTokenBudget', v ? Number(v) : undefined)}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="mt-4"
            disabled={updateMut.isPending}
          >
            {updateMut.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </Fieldset>
      </form>

      {/* Model Suggestions */}
      {suggestions && (
        <Fieldset title="Recommended Models by Task">
          <div className="space-y-2">
            {OPERATIONS.map((op) => {
              const suggestion = suggestions[op.key];
              if (!suggestion) return null;
              return (
                <div key={op.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{op.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">
                      {PROVIDER_OPTIONS.find((p) => p.value === suggestion.provider)?.label ?? suggestion.provider}
                    </Badge>
                    <span className="text-xs text-gray-500">{suggestion.reason}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Fieldset>
      )}

      {/* Usage Stats */}
      <Fieldset title="Usage Statistics">
        {(!usage || usage.length === 0) ? (
          <p className="text-sm text-gray-500">No AI usage recorded yet.</p>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-4">
              <div className="bg-blue-50 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-500">Total Tokens Used</p>
                <p className="text-lg font-semibold text-blue-600">{totalTokens.toLocaleString()}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">Provider</th>
                    <th className="pb-2 font-medium">Model</th>
                    <th className="pb-2 font-medium text-right">Requests</th>
                    <th className="pb-2 font-medium text-right">Tokens</th>
                    <th className="pb-2 font-medium text-right">Success</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.map((stat, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2">
                        <Badge variant="outline">{stat.provider}</Badge>
                      </td>
                      <td className="py-2 text-gray-700">{stat.model}</td>
                      <td className="py-2 text-right text-gray-700">{stat.requestCount}</td>
                      <td className="py-2 text-right text-gray-700">{stat.totalTokens.toLocaleString()}</td>
                      <td className="py-2 text-right">
                        <Badge variant={stat.failureCount > 0 ? 'warning' : 'success'}>
                          {stat.successCount}/{stat.requestCount}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Fieldset>
    </div>
  );
}
