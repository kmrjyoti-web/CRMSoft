'use client';

import { useState } from 'react';
import { Button, Icon } from '@/components/ui';
import { useAiImprove, useAiTranslate, useAiChangeTone } from '../hooks/useAi';
import toast from 'react-hot-toast';

interface AiInlineToolbarProps {
  selectedText: string;
  position: { top: number; left: number };
  onReplace: (text: string) => void;
  onClose: () => void;
}

export function AiInlineToolbar({ selectedText, position, onReplace, onClose }: AiInlineToolbarProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const improveMut = useAiImprove();
  const translateMut = useAiTranslate();
  const toneMut = useAiChangeTone();

  const handleAction = async (action: string) => {
    if (!selectedText.trim()) return;
    setLoading(action);
    try {
      let response: any;
      switch (action) {
        case 'improve':
          response = await improveMut.mutateAsync({ text: selectedText });
          break;
        case 'rewrite':
          response = await improveMut.mutateAsync({ text: selectedText, instruction: 'Rewrite this text to be clearer and more professional' });
          break;
        case 'translate':
          response = await translateMut.mutateAsync({ text: selectedText, targetLanguage: 'Hindi' });
          break;
        case 'formal':
          response = await toneMut.mutateAsync({ text: selectedText, tone: 'formal' });
          break;
        case 'casual':
          response = await toneMut.mutateAsync({ text: selectedText, tone: 'casual' });
          break;
      }
      const content = response?.data?.content ?? response?.content ?? '';
      if (content) {
        onReplace(content);
        toast.success('Text updated');
      }
    } catch {
      toast.error('AI request failed');
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    { key: 'improve', label: 'Improve', icon: 'edit' },
    { key: 'rewrite', label: 'Rewrite', icon: 'refresh' },
    { key: 'formal', label: 'Formal', icon: 'briefcase' },
    { key: 'casual', label: 'Casual', icon: 'message-circle' },
  ];

  return (
    <div
      className="fixed z-50 bg-white border rounded-lg shadow-lg flex items-center gap-0.5 px-1 py-0.5"
      style={{ top: position.top - 40, left: position.left }}
    >
      {actions.map((action) => (
        <Button
          key={action.key}
          variant="ghost"
          size="sm"
          onClick={() => handleAction(action.key)}
          disabled={loading !== null}
          className="text-xs px-2 py-1"
        >
          {loading === action.key ? (
            <Icon name="loader" size={12} className="animate-spin" />
          ) : (
            <>
              <Icon name={action.icon} size={12} className="mr-0.5" />
              {action.label}
            </>
          )}
        </Button>
      ))}
      <Button variant="ghost" size="sm" onClick={onClose} className="px-1">
        <Icon name="x" size={12} />
      </Button>
    </div>
  );
}
