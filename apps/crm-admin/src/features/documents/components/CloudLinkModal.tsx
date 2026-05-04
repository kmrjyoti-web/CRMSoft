'use client';

import { useState } from 'react';
import { Input, SelectInput, Button, Icon } from '@/components/ui';
import { useLinkCloudDocument } from '../hooks/useDocuments';
import toast from 'react-hot-toast';
import type { DocumentCategory } from '../types/documents.types';

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'REPORT', label: 'Report' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'SPREADSHEET', label: 'Spreadsheet' },
  { value: 'OTHER', label: 'Other' },
];

function detectProvider(url: string): string {
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) return 'Google Drive';
  if (url.includes('onedrive.live.com') || url.includes('sharepoint.com')) return 'OneDrive';
  if (url.includes('dropbox.com')) return 'Dropbox';
  return 'Cloud';
}

interface CloudLinkModalProps {
  open: boolean;
  onClose: () => void;
  folderId?: string;
}

export function CloudLinkModal({ open, onClose, folderId }: CloudLinkModalProps) {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('GENERAL');
  const [description, setDescription] = useState('');
  const linkMut = useLinkCloudDocument();

  if (!open) return null;

  const provider = url ? detectProvider(url) : '';

  const handleSubmit = () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    linkMut.mutate(
      { url, category, description: description || undefined, folderId },
      {
        onSuccess: () => {
          toast.success('Cloud document linked');
          setUrl('');
          setDescription('');
          onClose();
        },
        onError: () => toast.error('Failed to link cloud document'),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-900">Link Cloud Document</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="x" size={16} />
          </Button>
        </div>
        <div className="p-4 space-y-4">
          <Input
            label="Document URL"
            leftIcon={<Icon name="link" size={16} />}
            value={url}
            onChange={setUrl}
            placeholder="https://docs.google.com/..."
          />
          {provider && (
            <p className="text-xs text-blue-600 -mt-2">
              Detected: {provider}
            </p>
          )}
          <SelectInput
            label="Category"
            leftIcon={<Icon name="tag" size={16} />}
            value={category}
            onChange={(v) => setCategory(v as DocumentCategory)}
            options={CATEGORY_OPTIONS}
          />
          <Input
            label="Description (optional)"
            leftIcon={<Icon name="align-left" size={16} />}
            value={description}
            onChange={setDescription}
          />
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={linkMut.isPending}>
            {linkMut.isPending ? 'Linking...' : 'Link Document'}
          </Button>
        </div>
      </div>
    </div>
  );
}
