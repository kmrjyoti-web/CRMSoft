'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Search, Copy, Eye, Archive, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import { IndustryBadge } from '@/components/common/industry-badge';
import { IndustrySelect } from '@/components/common/industry-select';
import {
  useDocumentTemplates,
  useArchiveTemplate,
  useDuplicateTemplate,
} from '@/hooks/use-document-templates';
import { useDebounce } from '@/hooks/use-debounce';
import { formatDate, formatNumber, extractList, extractMeta } from '@/lib/utils';
import type { DocumentTemplate, DocumentTemplateFilters } from '@/types/document-template';

const DOCUMENT_TYPES = [
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'QUOTATION', label: 'Quotation' },
  { value: 'RECEIPT', label: 'Receipt' },
  { value: 'PURCHASE_ORDER', label: 'Purchase Order' },
  { value: 'DELIVERY_NOTE', label: 'Delivery Note' },
  { value: 'CREDIT_NOTE', label: 'Credit Note' },
  { value: 'PROFORMA', label: 'Proforma Invoice' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'REPORT', label: 'Report' },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const archiveMut = useArchiveTemplate();
  const duplicateMut = useDuplicateTemplate();

  const filters: DocumentTemplateFilters = {
    search: debouncedSearch || undefined,
    documentType: typeFilter || undefined,
    industryCode: industryFilter || undefined,
    page,
    limit: 12,
  };

  const { data: res, isLoading } = useDocumentTemplates(filters);

  const templates: DocumentTemplate[] = extractList(res);
  const meta = extractMeta(res);

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Archive this template? It can be restored later.')) return;
    try {
      await archiveMut.mutateAsync(id);
      toast.success('Template archived');
    } catch {
      toast.error('Failed to archive template');
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await duplicateMut.mutateAsync(id);
      toast.success('Template duplicated');
    } catch {
      toast.error('Failed to duplicate template');
    }
  };

  const handlePreview = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    window.open(`/templates/${id}?preview=true`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Templates</h1>
          <p className="text-sm text-gray-500">
            Manage document templates for invoices, quotations, and more
          </p>
        </div>
        <Button onClick={() => router.push('/templates/new')}>
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search templates by name or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          options={[
            { value: '', label: 'All Types' },
            ...DOCUMENT_TYPES,
          ]}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="w-48"
        />
        <div className="w-48">
          <IndustrySelect
            value={industryFilter}
            onChange={(v) => { setIndustryFilter(v); setPage(1); }}
            label=""
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates found"
          description={
            debouncedSearch || typeFilter || industryFilter
              ? 'No templates match the current filters. Try adjusting your search.'
              : 'Create your first document template to get started.'
          }
          actionLabel="Create Template"
          onAction={() => router.push('/templates/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <Card
              key={tpl.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/templates/${tpl.id}`)}
            >
              <CardContent className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{tpl.name}</h3>
                      <Badge variant="outline" className="mt-0.5 text-[10px] font-mono">
                        {tpl.code}
                      </Badge>
                    </div>
                  </div>
                  <StatusBadge value={tpl.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 min-h-[2.5rem]">
                  {tpl.description || 'No description provided'}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <Badge variant="secondary">
                    {DOCUMENT_TYPES.find((d) => d.value === tpl.documentType)?.label ?? tpl.documentType}
                  </Badge>
                  <IndustryBadge industryCode={tpl.industryCode} />
                  {tpl.isSystem && (
                    <Badge variant="info">System</Badge>
                  )}
                  {tpl.isDefault && (
                    <Badge variant="outline" className="gap-0.5">
                      <Check className="h-3 w-3" />
                      Default
                    </Badge>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                  <span>{tpl.availableFields?.length ?? 0} fields</span>
                  <span>{formatDate(tpl.updatedAt)}</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => handlePreview(e, tpl.id)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => handleDuplicate(e, tpl.id)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Duplicate
                  </Button>
                  {!tpl.isSystem && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-red-500 hover:text-red-700 ml-auto"
                      onClick={(e) => handleArchive(e, tpl.id)}
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta?.totalPages && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {meta.totalPages}
            {meta.total != null && (
              <span className="text-gray-400 ml-1">({formatNumber(meta.total)} total)</span>
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
