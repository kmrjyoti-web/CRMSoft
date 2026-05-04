'use client';

import { useMemo } from 'react';
import { SelectInput, Icon, Badge } from '@/components/ui';
import { useAiModels } from '../hooks/useAi';

interface AiModelSelectorProps {
  provider: string;
  model: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  suggestedProvider?: string;
  suggestedModel?: string;
}

const PROVIDER_OPTIONS = [
  { value: 'ANTHROPIC_CLAUDE', label: 'Claude' },
  { value: 'OPENAI_GPT', label: 'GPT' },
  { value: 'GOOGLE_GEMINI', label: 'Gemini' },
  { value: 'GROQ', label: 'Groq' },
];

export function AiModelSelector({
  provider, model,
  onProviderChange, onModelChange,
  suggestedProvider, suggestedModel,
}: AiModelSelectorProps) {
  const { data: modelsData } = useAiModels();

  const modelsResponse = modelsData?.data;
  const models = (modelsResponse as any)?.models;

  const modelOptions = useMemo(() => {
    if (!models) return [];
    const providerModels = models[provider] ?? [];
    return providerModels.map((m: any) => ({
      value: m.id,
      label: `${m.label} (${Math.round(m.context / 1000)}K)`,
    }));
  }, [models, provider]);

  const isSuggested = provider === suggestedProvider && model === suggestedModel;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SelectInput
            label="Provider"
            leftIcon={<Icon name="cpu" size={14} />}
            value={provider}
            onChange={(v) => {
              onProviderChange(v as string);
              const pm = models?.[v as string];
              if (pm?.[0]) onModelChange(pm[0].id);
            }}
            options={PROVIDER_OPTIONS}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SelectInput
            label="Model"
            leftIcon={<Icon name="zap" size={14} />}
            value={model}
            onChange={(v) => onModelChange(v as string)}
            options={modelOptions}
          />
        </div>
        {isSuggested && (
          <Badge variant="success" className="text-[10px] mt-4">Suggested</Badge>
        )}
      </div>
      {suggestedProvider && !isSuggested && (
        <button
          className="text-xs text-blue-600 hover:underline"
          onClick={() => {
            onProviderChange(suggestedProvider);
            if (suggestedModel) onModelChange(suggestedModel);
          }}
        >
          Use suggested model
        </button>
      )}
    </div>
  );
}
