'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Badge, Button, Icon } from '@/components/ui';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useConfirmDialog } from '@/components/common/useConfirmDialog';
import {
  useReportBookmarks,
  useToggleBookmarkPin,
  useDeleteBookmark,
} from '../hooks/useReports';
import { getCategoryLabel, getCategoryColor } from '../utils/report-helpers';
import type { ReportBookmark } from '../types/report.types';

export function ReportBookmarkList() {
  const router = useRouter();
  const { data, isLoading } = useReportBookmarks();
  const pinMut = useToggleBookmarkPin();
  const deleteMut = useDeleteBookmark();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();

  const bookmarks: ReportBookmark[] = data?.data ?? [];

  const handleOpen = useCallback((bm: ReportBookmark) => {
    router.push(`/reports/${bm.reportDef.code}`);
  }, [router]);

  const handlePin = useCallback(async (bm: ReportBookmark) => {
    try {
      await pinMut.mutateAsync({ id: bm.id, isPinned: !bm.isPinned });
      toast.success(bm.isPinned ? 'Unpinned' : 'Pinned');
    } catch {
      toast.error('Failed to update bookmark');
    }
  }, [pinMut]);

  const handleDelete = useCallback(async (bm: ReportBookmark) => {
    const ok = await confirm({
      title: 'Delete Bookmark',
      message: `Delete "${bm.name}"?`,
      type: 'danger',
      confirmText: 'Delete',
    });
    if (!ok) return;
    try {
      await deleteMut.mutateAsync(bm.id);
      toast.success('Bookmark deleted');
    } catch {
      toast.error('Failed to delete bookmark');
    }
  }, [confirm, deleteMut]);

  if (isLoading) return <LoadingSpinner />;

  if (bookmarks.length === 0) {
    return (
      <EmptyState
        icon="bookmark"
        title="No bookmarks"
        description="Save report configurations as bookmarks for quick access."
      />
    );
  }

  return (
    <>
      <div className="space-y-2">
        {bookmarks.map((bm) => (
          <div
            key={bm.id}
            className="rounded-lg border border-gray-200 bg-white p-3 flex items-center justify-between hover:border-gray-300 cursor-pointer transition-colors"
            onClick={() => handleOpen(bm)}
          >
            <div className="flex items-center gap-3">
              {bm.isPinned && <Icon name="star" size={14} className="text-yellow-500" />}
              <div>
                <h4 className="text-sm font-medium text-gray-800">{bm.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={getCategoryColor(bm.reportDef.category) as any} className="text-xs">
                    {getCategoryLabel(bm.reportDef.category)}
                  </Badge>
                  <span className="text-xs text-gray-500">{bm.reportDef.name}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="ghost" onClick={() => handlePin(bm)}>
                <Icon
                  name={bm.isPinned ? 'star' : 'star'}
                  size={14}
                  className={bm.isPinned ? 'text-yellow-500' : 'text-gray-400'}
                />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(bm)}>
                <Icon name="trash-2" size={14} className="text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialogPortal />
    </>
  );
}
