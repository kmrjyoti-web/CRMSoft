'use client';

import { useState } from 'react';
import { Input, SelectInput, Button, Icon, TagsInput } from '@/components/ui';
import { useUploadDocument } from '../hooks/useDocuments';
import { DocumentUploadZone } from './DocumentUploadZone';
import toast from 'react-hot-toast';
import type { DocumentCategory } from '../types/documents.types';

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'QUOTATION', label: 'Quotation' },
  { value: 'REPORT', label: 'Report' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'SPREADSHEET', label: 'Spreadsheet' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'OTHER', label: 'Other' },
];

interface DocumentFormProps {
  folderId?: string;
  onClose?: () => void;
}

export function DocumentForm({ folderId, onClose }: DocumentFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>('GENERAL');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const uploadMut = useUploadDocument();

  const handleFilesSelected = (files: File[]) => {
    if (files[0]) setFile(files[0]);
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    uploadMut.mutate(
      {
        file,
        category,
        description: description || undefined,
        tags: tags.length > 0 ? tags : undefined,
        folderId,
      },
      {
        onSuccess: () => {
          toast.success('Document uploaded');
          setFile(null);
          setDescription('');
          setTags([]);
          onClose?.();
        },
        onError: () => toast.error('Failed to upload document'),
      },
    );
  };

  return (
    <div className="space-y-4 p-4">
      <DocumentUploadZone
        onFilesSelected={handleFilesSelected}
        multiple={false}
        disabled={uploadMut.isPending}
      />

      {file && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <Icon name="file" size={16} className="text-blue-600" />
          <span className="text-sm text-blue-700 truncate flex-1">{file.name}</span>
          <span className="text-xs text-blue-500">
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </span>
          <button onClick={() => setFile(null)} className="text-blue-400 hover:text-blue-600">
            <Icon name="x" size={14} />
          </button>
        </div>
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

      <TagsInput
        label="Tags (optional)"
        tags={tags}
        onChange={setTags}
      />

      <div className="flex gap-2 pt-2">
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!file || uploadMut.isPending}>
          {uploadMut.isPending ? 'Uploading...' : 'Upload Document'}
        </Button>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        )}
      </div>
    </div>
  );
}
