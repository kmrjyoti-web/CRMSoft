'use client';

import { useCallback, useState } from 'react';
import { Icon, Button } from '@/components/ui';

interface DocumentUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}

export function DocumentUploadZone({ onFilesSelected, accept, multiple = true, disabled }: DocumentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFilesSelected(multiple ? files : [files[0]]);
  }, [disabled, multiple, onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onFilesSelected(files);
    e.target.value = '';
  }, [onFilesSelected]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (!disabled) document.getElementById('doc-upload-input')?.click();
      }}
    >
      <Icon name="upload-cloud" size={40} className="mx-auto text-gray-400 mb-3" />
      <p className="text-sm text-gray-600 mb-1">
        Drag & drop files here, or click to browse
      </p>
      <p className="text-xs text-gray-400">
        {multiple ? 'You can upload multiple files' : 'Select a single file'}
      </p>
      <input
        id="doc-upload-input"
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
      />
    </div>
  );
}
