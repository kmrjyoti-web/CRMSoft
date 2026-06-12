'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { Button, Icon, SelectInput, RichTextEditor, Input } from '@/components/ui';
import { useDocumentDetail, useUpdateDocument, useUploadDocument } from '../hooks/useDocuments';
import { useDocumentEditor } from '../hooks/useDocumentEditor';
import { AiPromptPanel } from './AiPromptPanel';
import type { DocumentCategory } from '../types/documents.types';

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'QUOTATION', label: 'Quotation' },
  { value: 'REPORT', label: 'Report' },
  { value: 'OTHER', label: 'Other' },
];

interface DocumentEditorProps {
  documentId?: string;
}

export function DocumentEditor({ documentId }: DocumentEditorProps) {
  const router = useRouter();
  const isNew = !documentId;
  const { data } = useDocumentDetail(documentId ?? '');
  const updateMut = useUpdateDocument();
  const uploadMut = useUploadDocument();

  const doc = useMemo(() => {
    if (!data?.data) return null;
    const d = data.data;
    if ('originalName' in (d as any)) return d as any;
    const nested = d as unknown as { data?: any };
    return nested?.data ?? null;
  }, [data]);

  const editor = useDocumentEditor(doc?.content ?? '', doc?.originalName ?? '');

  useEffect(() => {
    if (doc) {
      editor.setContent(doc.content ?? '');
      editor.setTitle(doc.originalName ?? '');
      editor.markClean();
    }
  }, [doc]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!editor.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    editor.setSaving(true);
    try {
      if (isNew) {
        const blob = new Blob([editor.content], { type: 'text/html' });
        const file = new File([blob], `${editor.title}.html`, { type: 'text/html' });
        await uploadMut.mutateAsync({ file, category: 'GENERAL' });
        toast.success('Document created');
        router.push('/documents');
      } else {
        await updateMut.mutateAsync({
          id: documentId,
          data: { description: editor.content },
        });
        toast.success('Document saved');
        editor.markClean();
      }
    } catch {
      toast.error('Failed to save document');
    } finally {
      editor.setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/documents')}>
            <Icon name="arrow-left" size={16} />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">
            {isNew ? 'New Document' : 'Edit Document'}
          </h1>
          {editor.isDirty && (
            <span className="text-xs text-amber-500 font-medium">Unsaved changes</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={editor.toggleAiPanel}
            className={editor.aiPanelOpen ? 'bg-blue-50 text-blue-600' : ''}
          >
            <Icon name="cpu" size={14} className="mr-1" />
            AI Assistant
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={editor.isSaving || (!editor.isDirty && !isNew)}
          >
            <Icon name="save" size={14} className="mr-1" />
            {editor.isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex min-h-0">
        <div className={`flex-1 flex flex-col min-w-0 ${editor.aiPanelOpen ? 'mr-80' : ''}`}>
          <div className="px-6 py-4 border-b bg-gray-50">
            <Input
              label="Document Title"
              leftIcon={<Icon name="type" size={16} />}
              value={editor.title}
              onChange={editor.setTitle}
            />
          </div>
          <div className="flex-1 min-h-0 p-6">
            <RichTextEditor
              label="Content"
              value={editor.content}
              onChange={editor.setContent}
            />
          </div>
        </div>

        {/* AI Prompt Panel */}
        {editor.aiPanelOpen && (
          <AiPromptPanel
            onInsert={editor.insertAtCursor}
            onClose={() => editor.setAiPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
