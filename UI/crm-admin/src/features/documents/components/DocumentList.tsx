'use client';

import { useMemo, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { TableFull, Badge, Icon, Button } from '@/components/ui';
import { useTableFilters } from '@/hooks/useTableFilters';
import { TableSkeleton } from '@/components/common/TableSkeleton';
import { useConfirmDialog } from '@/components/common/useConfirmDialog';
import { ActionsMenu } from '@/components/common/ActionsMenu';
import { useEntityPanel } from '@/hooks/useEntityPanel';

import { useDocumentsList, useDeleteDocument } from '../hooks/useDocuments';
import { FolderTree } from './FolderTree';
import { DocumentForm } from './DocumentForm';
import { CloudLinkModal } from './CloudLinkModal';
import { DOCUMENT_COLUMNS } from '../utils/document-columns';
import { DOCUMENT_FILTER_CONFIG } from '../utils/document-filters';
import {
  formatFileSize, getCategoryLabel, getCategoryColor,
  getStorageLabel, getStatusColor,
} from '../utils/document-helpers';
import type { DocumentListItem, DocumentListParams } from '../types/documents.types';

// ── Helpers ──────────────────────────────────────────────

function flattenDocuments(docs: DocumentListItem[]): Record<string, unknown>[] {
  return docs.map((d) => ({
    id: d.id,
    originalName: d.originalName,
    category: d.category,
    fileSize: formatFileSize(d.fileSize),
    storageType: getStorageLabel(d.storageType),
    version: `v${d.version}`,
    folder: d.folder?.name ?? '—',
    uploadedBy: d.uploadedBy ? `${d.uploadedBy.firstName} ${d.uploadedBy.lastName}` : '—',
    status: d.status,
    createdAt: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—',
    _raw: d,
  }));
}

// ── Component ────────────────────────────────────────────

export function DocumentList() {
  const router = useRouter();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const deleteMut = useDeleteDocument();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();

  const { handleCreate: openUploadPanel } = useEntityPanel({
    entityKey: 'document-upload',
    entityLabel: 'Upload Document',
    FormComponent: (props: any) => <DocumentForm folderId={selectedFolderId ?? undefined} {...props} />,
    idProp: 'documentId',
    displayField: 'originalName',
  });

  const { activeFilters, filterParams, handleFilterChange, clearFilters } =
    useTableFilters(DOCUMENT_FILTER_CONFIG);

  const params = useMemo<DocumentListParams>(
    () => ({
      page: 1,
      limit: 50,
      folderId: selectedFolderId ?? undefined,
      ...filterParams,
    }),
    [filterParams, selectedFolderId],
  );

  const { data, isLoading } = useDocumentsList(params);

  const documents: DocumentListItem[] = useMemo(() => {
    const d = data?.data;
    if (Array.isArray(d)) return d;
    const nested = d as unknown as { data?: DocumentListItem[] };
    return nested?.data ?? [];
  }, [data]);

  const handleRowView = useCallback(
    (row: Record<string, unknown>) => {
      router.push(`/documents/${row.id}`);
    },
    [router],
  );

  const handleRowDelete = useCallback(
    async (row: Record<string, unknown>) => {
      const ok = await confirm({
        title: 'Delete Document',
        message: `Delete "${row.originalName}"?`,
        type: 'danger',
        confirmText: 'Delete',
      });
      if (!ok) return;
      try {
        await deleteMut.mutateAsync(row.id as string);
        toast.success('Document deleted');
      } catch {
        toast.error('Failed to delete document');
      }
    },
    [confirm, deleteMut],
  );

  const tableData = useMemo(() => {
    const flat = flattenDocuments(documents);
    return flat.map((row, idx) => ({
      ...row,
      originalName: (
        <span
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
          onClick={(e) => { e.stopPropagation(); handleRowView(row); }}
        >
          {documents[idx].originalName}
        </span>
      ),
      category: (
        <Badge variant={getCategoryColor(documents[idx].category)}>
          {getCategoryLabel(documents[idx].category)}
        </Badge>
      ),
      status: (
        <Badge variant={getStatusColor(documents[idx].status)}>
          {documents[idx].status}
        </Badge>
      ),
    }));
  }, [documents, handleRowView]);

  const actionsMenuItems = useMemo(
    () => [
      {
        label: 'Write & Save',
        icon: 'edit',
        onClick: () => router.push('/documents/new'),
      },
      {
        label: 'Link Cloud Document',
        icon: 'cloud',
        onClick: () => setCloudModalOpen(true),
      },
    ],
    [router],
  );

  if (isLoading) return <TableSkeleton title="Documents" />;

  return (
    <div className="h-full flex">
      <FolderTree
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 min-h-0">
          <TableFull
            data={tableData as Record<string, any>[]}
            title="Documents"
            tableKey="documents"
            columns={DOCUMENT_COLUMNS}
            defaultViewMode="table"
            defaultDensity="compact"
            filterConfig={DOCUMENT_FILTER_CONFIG}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onFilterClear={clearFilters}
            onRowEdit={handleRowView}
            onRowDelete={handleRowDelete}
            onCreate={() => openUploadPanel()}
            headerActions={
              <ActionsMenu items={actionsMenuItems} />
            }
          />
        </div>
      </div>
      <CloudLinkModal
        open={cloudModalOpen}
        onClose={() => setCloudModalOpen(false)}
        folderId={selectedFolderId ?? undefined}
      />
      <ConfirmDialogPortal />
    </div>
  );
}
