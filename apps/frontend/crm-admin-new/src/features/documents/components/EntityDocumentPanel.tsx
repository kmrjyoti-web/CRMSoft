'use client';

import { useCallback } from 'react';
import { Icon, Badge, Button } from '@/components/ui';
import { useEntityDocuments, useDetachDocument } from '../hooks/useShareLinks';
import { formatFileSize, getCategoryColor, getCategoryLabel } from '../utils/document-helpers';
import toast from 'react-hot-toast';

interface EntityDocumentPanelProps {
  entityType: string;
  entityId: string;
}

export function EntityDocumentPanel({ entityType, entityId }: EntityDocumentPanelProps) {
  const { data } = useEntityDocuments(entityType, entityId);
  const detachMut = useDetachDocument();

  const documents = (() => {
    const d = data?.data;
    if (Array.isArray(d)) return d;
    const nested = d as unknown as { data?: any[] };
    return nested?.data ?? [];
  })();

  const handleDetach = useCallback(async (documentId: string) => {
    try {
      await detachMut.mutateAsync({ documentId, entityType, entityId });
      toast.success('Document detached');
    } catch {
      toast.error('Failed to detach document');
    }
  }, [detachMut, entityType, entityId]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Documents</h4>
        <span className="text-xs text-gray-400">{documents.length} attached</span>
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-gray-500">No documents attached.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc: any) => (
            <div key={doc.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg group">
              <Icon name="file-text" size={16} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.originalName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={getCategoryColor(doc.category)} className="text-[10px]">
                    {getCategoryLabel(doc.category)}
                  </Badge>
                  <span className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="hidden group-hover:flex"
                onClick={() => handleDetach(doc.id)}
              >
                <Icon name="x" size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
