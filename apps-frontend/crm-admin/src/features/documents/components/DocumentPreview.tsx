'use client';

import { Button, Icon } from '@/components/ui';

interface DocumentPreviewProps {
  open: boolean;
  onClose: () => void;
  url: string;
  mimeType: string;
  fileName: string;
}

export function DocumentPreview({ open, onClose, url, mimeType, fileName }: DocumentPreviewProps) {
  if (!open) return null;

  const renderContent = () => {
    if (mimeType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full">
          <img src={url} alt={fileName} className="max-w-full max-h-[70vh] object-contain" />
        </div>
      );
    }
    if (mimeType === 'application/pdf') {
      return <iframe src={url} className="w-full h-[70vh] border-0" title={fileName} />;
    }
    if (mimeType.startsWith('video/')) {
      return (
        <div className="flex items-center justify-center h-full">
          <video src={url} controls className="max-w-full max-h-[70vh]" />
        </div>
      );
    }
    if (mimeType.startsWith('audio/')) {
      return (
        <div className="flex items-center justify-center h-full py-20">
          <audio src={url} controls />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-gray-500">
        <Icon name="file" size={48} className="mb-3" />
        <p className="text-sm">Preview not available for this file type</p>
        <a href={url} download={fileName} className="mt-3 text-blue-600 hover:underline text-sm">
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-[90vw] max-w-4xl max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-medium text-gray-900 truncate">{fileName}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="x" size={16} />
          </Button>
        </div>
        <div className="p-4">{renderContent()}</div>
      </div>
    </div>
  );
}
