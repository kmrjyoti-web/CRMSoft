'use client';

import { useState, useCallback } from 'react';
import { Icon, Button } from '@/components/ui';
import { useFolderTree, useDeleteFolder } from '../hooks/useFolders';
import { useEntityPanel } from '@/hooks/useEntityPanel';
import { useConfirmDialog } from '@/components/common/useConfirmDialog';
import { FolderForm } from './FolderForm';
import toast from 'react-hot-toast';
import type { DocumentFolder } from '../types/documents.types';

interface FolderTreeProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function FolderTree({ selectedFolderId, onSelectFolder }: FolderTreeProps) {
  const { data } = useFolderTree();
  const deleteMut = useDeleteFolder();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();

  const { handleCreate: openCreateFolder, handleRowEdit: openEditFolder } = useEntityPanel({
    entityKey: 'document-folder',
    entityLabel: 'Folder',
    FormComponent: FolderForm,
    idProp: 'folderId',
    displayField: 'name',
  });

  const folders = (() => {
    const d = data?.data;
    if (Array.isArray(d)) return d;
    const nested = d as unknown as { data?: DocumentFolder[] };
    return nested?.data ?? [];
  })();

  const handleDeleteFolder = useCallback(async (folder: DocumentFolder) => {
    const ok = await confirm({
      title: 'Delete Folder',
      message: `Delete "${folder.name}"? Documents inside will be moved to root.`,
      type: 'danger',
      confirmText: 'Delete',
    });
    if (!ok) return;
    try {
      await deleteMut.mutateAsync(folder.id);
      if (selectedFolderId === folder.id) onSelectFolder(null);
      toast.success('Folder deleted');
    } catch {
      toast.error('Failed to delete folder');
    }
  }, [confirm, deleteMut, selectedFolderId, onSelectFolder]);

  return (
    <div className="w-60 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Folders</span>
        <Button variant="ghost" size="sm" onClick={() => openCreateFolder()}>
          <Icon name="folder-plus" size={14} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        <button
          className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-gray-100 ${
            selectedFolderId === null ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
          }`}
          onClick={() => onSelectFolder(null)}
        >
          <Icon name="folder" size={14} />
          All Documents
        </button>

        {folders.map((folder) => (
          <FolderNode
            key={folder.id}
            folder={folder}
            depth={0}
            selectedFolderId={selectedFolderId}
            onSelect={onSelectFolder}
            onEdit={(f) => openEditFolder({ id: f.id, name: f.name } as any)}
            onDelete={handleDeleteFolder}
          />
        ))}
      </div>
      <ConfirmDialogPortal />
    </div>
  );
}

// ── Recursive Folder Node ────────────────────────────────

interface FolderNodeProps {
  folder: DocumentFolder;
  depth: number;
  selectedFolderId: string | null;
  onSelect: (id: string) => void;
  onEdit: (folder: DocumentFolder) => void;
  onDelete: (folder: DocumentFolder) => void;
}

function FolderNode({ folder, depth, selectedFolderId, onSelect, onEdit, onDelete }: FolderNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedFolderId === folder.id;

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-100 ${
          isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onSelect(folder.id)}
      >
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-gray-200 rounded"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={12} />
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: folder.color ?? '#9CA3AF' }}
        />
        <span className="truncate flex-1">{folder.name}</span>
        {folder._count?.documents != null && (
          <span className="text-xs text-gray-400">{folder._count.documents}</span>
        )}
        <div className="hidden group-hover:flex items-center gap-0.5">
          <button className="p-0.5 hover:bg-gray-200 rounded" onClick={(e) => { e.stopPropagation(); onEdit(folder); }}>
            <Icon name="edit-2" size={11} className="text-gray-400" />
          </button>
          <button className="p-0.5 hover:bg-gray-200 rounded" onClick={(e) => { e.stopPropagation(); onDelete(folder); }}>
            <Icon name="trash-2" size={11} className="text-gray-400" />
          </button>
        </div>
      </div>
      {hasChildren && expanded && folder.children!.map((child) => (
        <FolderNode
          key={child.id}
          folder={child}
          depth={depth + 1}
          selectedFolderId={selectedFolderId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
