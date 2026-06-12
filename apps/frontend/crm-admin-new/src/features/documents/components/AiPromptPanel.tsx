'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

import { Button, Icon, SelectInput, Badge } from '@/components/ui';
import { AiModelSelector } from './AiModelSelector';
import {
  useAiGenerate, useAiImprove, useAiTranslate,
  useAiSummarize, useAiChangeTone,
} from '../hooks/useAi';

// ── Model Suggestions ────────────────────────────────────

const MODEL_SUGGESTIONS: Record<string, { provider: string; model: string; reason: string }> = {
  generate:  { provider: 'ANTHROPIC_CLAUDE', model: 'claude-sonnet-4-20250514', reason: 'Best for long-form generation' },
  improve:   { provider: 'OPENAI_GPT', model: 'gpt-4o', reason: 'Strong at text refinement' },
  translate: { provider: 'GOOGLE_GEMINI', model: 'gemini-1.5-pro', reason: 'Excellent multilingual support' },
  summarize: { provider: 'GROQ', model: 'llama3-70b-8192', reason: 'Fast summarization' },
  tone:      { provider: 'ANTHROPIC_CLAUDE', model: 'claude-sonnet-4-20250514', reason: 'Precise tone control' },
};

type Operation = 'generate' | 'improve' | 'translate' | 'summarize' | 'tone';

const OPERATIONS: { key: Operation; label: string; icon: string }[] = [
  { key: 'generate', label: 'Generate', icon: 'zap' },
  { key: 'improve', label: 'Improve', icon: 'edit' },
  { key: 'translate', label: 'Translate', icon: 'globe' },
  { key: 'summarize', label: 'Summarize', icon: 'align-left' },
  { key: 'tone', label: 'Tone', icon: 'sliders' },
];

const TONE_OPTIONS = [
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'persuasive', label: 'Persuasive' },
];

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Arabic', label: 'Arabic' },
];

// ── Props ────────────────────────────────────────────────

interface AiPromptPanelProps {
  onInsert: (text: string) => void;
  selectedText?: string;
  onClose: () => void;
}

// ── Component ────────────────────────────────────────────

export function AiPromptPanel({ onInsert, selectedText, onClose }: AiPromptPanelProps) {
  const [operation, setOperation] = useState<Operation>('generate');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [provider, setProvider] = useState(MODEL_SUGGESTIONS.generate.provider);
  const [model, setModel] = useState(MODEL_SUGGESTIONS.generate.model);
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('English');

  const generateMut = useAiGenerate();
  const improveMut = useAiImprove();
  const translateMut = useAiTranslate();
  const summarizeMut = useAiSummarize();
  const toneMut = useAiChangeTone();

  const isLoading = generateMut.isPending || improveMut.isPending ||
    translateMut.isPending || summarizeMut.isPending || toneMut.isPending;

  const handleOperationChange = useCallback((op: Operation) => {
    setOperation(op);
    setResult('');
    const suggestion = MODEL_SUGGESTIONS[op];
    if (suggestion) {
      setProvider(suggestion.provider);
      setModel(suggestion.model);
    }
  }, []);

  const handleExecute = useCallback(async () => {
    const inputText = selectedText || prompt;
    if (!inputText.trim()) {
      toast.error('Please enter a prompt or select text');
      return;
    }

    try {
      let response: any;
      switch (operation) {
        case 'generate':
          response = await generateMut.mutateAsync({ prompt: inputText, provider, model });
          break;
        case 'improve':
          response = await improveMut.mutateAsync({ text: inputText, instruction: prompt || undefined, provider, model });
          break;
        case 'translate':
          response = await translateMut.mutateAsync({ text: inputText, targetLanguage: language, provider, model });
          break;
        case 'summarize':
          response = await summarizeMut.mutateAsync({ text: inputText, provider, model });
          break;
        case 'tone':
          response = await toneMut.mutateAsync({ text: inputText, tone, provider, model });
          break;
      }
      const content = response?.data?.content ?? response?.content ?? '';
      setResult(content);
    } catch {
      toast.error('AI request failed. Check your API credentials in Settings.');
    }
  }, [operation, prompt, selectedText, provider, model, tone, language,
    generateMut, improveMut, translateMut, summarizeMut, toneMut]);

  const handleInsert = useCallback(() => {
    if (result) {
      onInsert(result);
      setResult('');
      toast.success('Inserted into document');
    }
  }, [result, onInsert]);

  const handleCopy = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success('Copied to clipboard');
    }
  }, [result]);

  const suggestion = MODEL_SUGGESTIONS[operation];

  return (
    <div className="w-80 border-l bg-gray-50 flex flex-col fixed right-0 top-0 h-full z-10 pt-16">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <Icon name="cpu" size={16} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <Icon name="x" size={14} />
        </Button>
      </div>

      {/* Model Selector */}
      <div className="px-4 py-3 border-b">
        <AiModelSelector
          provider={provider}
          model={model}
          onProviderChange={setProvider}
          onModelChange={setModel}
          suggestedProvider={suggestion?.provider}
          suggestedModel={suggestion?.model}
        />
        {suggestion && (
          <p className="text-[10px] text-gray-400 mt-1">{suggestion.reason}</p>
        )}
      </div>

      {/* Operation Tabs */}
      <div className="flex flex-wrap gap-1 px-4 py-2 border-b">
        {OPERATIONS.map((op) => (
          <button
            key={op.key}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
              operation === op.key
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            onClick={() => handleOperationChange(op.key)}
          >
            <Icon name={op.icon} size={12} />
            {op.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Prompt */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {operation === 'generate' ? 'Prompt' : operation === 'improve' ? 'Instructions (optional)' : 'Source Text'}
          </label>
          <textarea
            className="w-full border rounded-md p-2 text-sm resize-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            rows={4}
            placeholder={
              operation === 'generate'
                ? 'Write a professional proposal for...'
                : operation === 'improve'
                ? 'Make it more concise and professional...'
                : 'Enter or select text from the editor...'
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {/* Selected text indicator */}
        {selectedText && (
          <div className="p-2 bg-blue-50 rounded-md">
            <p className="text-[10px] text-blue-600 font-medium mb-0.5">Selected Text:</p>
            <p className="text-xs text-blue-700 line-clamp-3">{selectedText}</p>
          </div>
        )}

        {/* Operation-specific options */}
        {operation === 'tone' && (
          <SelectInput
            label="Tone"
            leftIcon={<Icon name="sliders" size={14} />}
            value={tone}
            onChange={(v) => setTone(v as string)}
            options={TONE_OPTIONS}
          />
        )}

        {operation === 'translate' && (
          <SelectInput
            label="Target Language"
            leftIcon={<Icon name="globe" size={14} />}
            value={language}
            onChange={(v) => setLanguage(v as string)}
            options={LANGUAGE_OPTIONS}
          />
        )}

        {/* Execute Button */}
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={handleExecute}
          disabled={isLoading}
        >
          <Icon name="zap" size={14} className="mr-1" />
          {isLoading ? 'Processing...' : `${OPERATIONS.find((o) => o.key === operation)?.label ?? 'Execute'}`}
        </Button>

        {/* Result */}
        {result && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Result</label>
            <div className="border rounded-md p-3 bg-white max-h-60 overflow-y-auto">
              <div className="text-sm text-gray-800 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: result }} />
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" className="flex-1" onClick={handleInsert}>
                <Icon name="plus" size={12} className="mr-1" />
                Insert
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={handleCopy}>
                <Icon name="copy" size={12} className="mr-1" />
                Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExecute} disabled={isLoading}>
                <Icon name="refresh" size={12} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
