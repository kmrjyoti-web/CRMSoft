'use client';

import { Icon, Badge, Button } from '@/components/ui';
import { useDocumentVersions, useUploadVersion } from '../hooks/useDocuments';
import { formatFileSize } from '../utils/document-helpers';
import toast from 'react-hot-toast';

interface DocumentVersionTimelineProps {
  documentId: string;
}

export function DocumentVersionTimeline({ documentId }: DocumentVersionTimelineProps) {
  const { data } = useDocumentVersions(documentId);
  const uploadMut = useUploadVersion();

  const versions = (() => {
    const d = data?.data;
    if (Array.isArray(d)) return d;
    const nested = d as unknown as { data?: any[] };
    return nested?.data ?? [];
  })();

  const handleUploadVersion = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      uploadMut.mutate(
        { id: documentId, file },
        {
          onSuccess: () => toast.success('New version uploaded'),
          onError: () => toast.error('Failed to upload version'),
        },
      );
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Version History</h3>
        <Button variant="outline" size="sm" onClick={handleUploadVersion} disabled={uploadMut.isPending}>
          <Icon name="upload" size={14} className="mr-1" />
          {uploadMut.isPending ? 'Uploading...' : 'Upload New Version'}
        </Button>
      </div>

      {versions.length === 0 ? (
        <p className="text-sm text-gray-500">No version history available.</p>
      ) : (
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200" />
          {versions.map((v: any, i: number) => (
            <div key={v.id} className="relative flex items-start gap-3">
              <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 ${
                i === 0 ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
              }`} />
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={i === 0 ? 'primary' : 'outline'}>v{v.version}</Badge>
                    <span className="text-sm font-medium text-gray-900">{v.originalName}</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatFileSize(v.fileSize)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{v.uploadedBy?.firstName} {v.uploadedBy?.lastName}</span>
                  <span>&middot;</span>
                  <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
