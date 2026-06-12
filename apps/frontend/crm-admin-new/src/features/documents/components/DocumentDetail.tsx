'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Badge, Button } from '@/components/ui';
import { useDocumentDetail, useDeleteDocument } from '../hooks/useDocuments';
import { DocumentVersionTimeline } from './DocumentVersionTimeline';
import { DocumentActivityLog } from './DocumentActivityLog';
import { ShareLinkManager } from './ShareLinkManager';
import { DocumentPreview } from './DocumentPreview';
import {
  formatFileSize, getCategoryLabel, getCategoryColor,
  getStorageLabel, getStatusColor,
} from '../utils/document-helpers';
import { useConfirmDialog } from '@/components/common/useConfirmDialog';
import toast from 'react-hot-toast';
import type { DocumentDetail as DocumentDetailType } from '../types/documents.types';

type TabKey = 'overview' | 'versions' | 'activity' | 'shares';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: 'info' },
  { key: 'versions', label: 'Versions', icon: 'git-commit' },
  { key: 'activity', label: 'Activity', icon: 'activity' },
  { key: 'shares', label: 'Shares', icon: 'share-2' },
];

interface DocumentDetailProps {
  documentId: string;
}

export function DocumentDetail({ documentId }: DocumentDetailProps) {
  const router = useRouter();
  const { data, isLoading } = useDocumentDetail(documentId);
  const deleteMut = useDeleteDocument();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [previewOpen, setPreviewOpen] = useState(false);

  const doc: DocumentDetailType | undefined = useMemo(() => {
    const d = data?.data;
    if (!d) return undefined;
    if ('originalName' in (d as any)) return d as unknown as DocumentDetailType;
    const nested = d as unknown as { data?: DocumentDetailType };
    return nested?.data;
  }, [data]);

  const handleDelete = async () => {
    if (!doc) return;
    const ok = await confirm({
      title: 'Delete Document',
      message: `Delete "${doc.originalName}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
    });
    if (!ok) return;
    try {
      await deleteMut.mutateAsync(doc.id);
      toast.success('Document deleted');
      router.push('/documents');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Icon name="file-x" size={48} className="mx-auto mb-3" />
        <p>Document not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/documents')}>
            <Icon name="arrow-left" size={16} />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{doc.originalName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getCategoryColor(doc.category)}>{getCategoryLabel(doc.category)}</Badge>
              <Badge variant={getStatusColor(doc.status)}>{doc.status}</Badge>
              <Badge variant="outline">v{doc.version}</Badge>
              <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
              <span className="text-xs text-gray-400">&middot;</span>
              <span className="text-xs text-gray-500">{getStorageLabel(doc.storageType)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {doc.storageUrl && (
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
              <Icon name="eye" size={14} className="mr-1" />
              Preview
            </Button>
          )}
          {doc.storageUrl && (
            <a href={doc.storageUrl} download={doc.originalName}>
              <Button variant="outline" size="sm">
                <Icon name="download" size={14} className="mr-1" />
                Download
              </Button>
            </a>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push(`/documents/editor/${doc.id}`)}>
            <Icon name="edit" size={14} className="mr-1" />
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Icon name="trash-2" size={14} />
          </Button>
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500">Uploaded By</p>
          <p className="text-sm font-medium">{doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Created</p>
          <p className="text-sm font-medium">{new Date(doc.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Updated</p>
          <p className="text-sm font-medium">{new Date(doc.updatedAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Folder</p>
          <p className="text-sm font-medium">{doc.folder?.name ?? 'Root'}</p>
        </div>
      </div>

      {doc.description && (
        <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
      )}

      {doc.tags && doc.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-6">
          {doc.tags.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-xs text-gray-500 mb-1">MIME Type</p>
              <p className="text-sm font-medium">{doc.mimeType}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Storage Provider</p>
              <p className="text-sm font-medium">{doc.storageProvider}</p>
            </div>
          </div>
          {doc.attachments && doc.attachments.length > 0 && (
            <div className="p-4 border rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Entity Attachments</p>
              {doc.attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-2 text-sm py-1">
                  <Badge variant="outline">{att.entityType}</Badge>
                  <span className="text-gray-600">{att.entityId}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'versions' && <DocumentVersionTimeline documentId={documentId} />}
      {activeTab === 'activity' && <DocumentActivityLog documentId={documentId} />}
      {activeTab === 'shares' && <ShareLinkManager documentId={documentId} />}

      {/* Preview modal */}
      {doc.storageUrl && (
        <DocumentPreview
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          url={doc.storageUrl}
          mimeType={doc.mimeType}
          fileName={doc.originalName}
        />
      )}

      <ConfirmDialogPortal />
    </div>
  );
}
