'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Badge, Button, Icon } from '@/components/ui';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useConfirmDialog } from '@/components/common/useConfirmDialog';
import { useReportTemplates, useDeleteTemplate } from '../hooks/useReports';
import type { ReportTemplate } from '../types/report.types';

export function ReportTemplateList() {
  const router = useRouter();
  const { data, isLoading } = useReportTemplates();
  const deleteMut = useDeleteTemplate();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();

  const templates: ReportTemplate[] = data?.data ?? [];

  const handleEdit = useCallback((t: ReportTemplate) => {
    router.push(`/reports/designer/${t.id}`);
  }, [router]);

  const handleDelete = useCallback(async (t: ReportTemplate) => {
    const ok = await confirm({
      title: 'Delete Template',
      message: `Delete "${t.name}"?`,
      type: 'danger',
      confirmText: 'Delete',
    });
    if (!ok) return;
    try {
      await deleteMut.mutateAsync(t.id);
      toast.success('Template deleted');
    } catch {
      toast.error('Failed to delete template');
    }
  }, [confirm, deleteMut]);

  if (isLoading) return <LoadingSpinner />;

  if (templates.length === 0) {
    return (
      <EmptyState
        icon="layout"
        title="No templates"
        description="Design a report template to customize how reports are displayed."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => handleEdit(t)}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-gray-800">{t.name}</h4>
                {t.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(t)}>
                  <Icon name="trash-2" size={14} className="text-red-500" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {t.reportDef && (
                <Badge variant="outline" className="text-xs">
                  {t.reportDef.name}
                </Badge>
              )}
              {t.isPublic && (
                <Badge variant="success" className="text-xs">Public</Badge>
              )}
              <span className="text-xs text-gray-400 ml-auto">
                {(t.layout as any)?.sections?.length ?? 0} sections
              </span>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialogPortal />
    </>
  );
}
