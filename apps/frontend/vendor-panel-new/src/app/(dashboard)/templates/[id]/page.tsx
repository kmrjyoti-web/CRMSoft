'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Copy,
  Check,
  Code,
  Paintbrush,
  Settings,
  List,
  Calendar,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/common/status-badge';
import { IndustryBadge } from '@/components/common/industry-badge';
import { IndustrySelect } from '@/components/common/industry-select';
import {
  useDocumentTemplate,
  useUpdateTemplate,
  useArchiveTemplate,
  useDuplicateTemplate,
} from '@/hooks/use-document-templates';
import { documentTemplatesApi } from '@/lib/api/document-templates';
import { formatDate, cn } from '@/lib/utils';
import type { DocumentTemplate, UpdateDocumentTemplateDto } from '@/types/document-template';

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

const TABS = ['Overview', 'HTML Template', 'CSS Styles', 'Settings', 'Fields', 'Preview'] as const;
type Tab = (typeof TABS)[number];

export default function TemplateDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: res, isLoading } = useDocumentTemplate(params.id);
  const updateMut = useUpdateTemplate();
  const archiveMut = useArchiveTemplate();
  const duplicateMut = useDuplicateTemplate();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [editing, setEditing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const tpl: DocumentTemplate | undefined = res?.data;

  // ─── Edit form state ───
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDocumentType, setEditDocumentType] = useState('');
  const [editHtmlTemplate, setEditHtmlTemplate] = useState('');
  const [editCssStyles, setEditCssStyles] = useState('');
  const [editSettings, setEditSettings] = useState('');
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editIsDefault, setEditIsDefault] = useState(false);
  const [editIndustryCode, setEditIndustryCode] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{ key: string; label: string; group: string }[]>([]);

  // ─── Preview state ───
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const startEditing = () => {
    if (!tpl) return;
    setEditName(tpl.name);
    setEditDescription(tpl.description ?? '');
    setEditDocumentType(tpl.documentType);
    setEditHtmlTemplate(tpl.htmlTemplate);
    setEditCssStyles(tpl.cssStyles ?? '');
    setEditSettings(JSON.stringify(tpl.defaultSettings ?? {}, null, 2));
    setEditSortOrder(tpl.sortOrder);
    setEditIsDefault(tpl.isDefault);
    setEditIndustryCode(tpl.industryCode ?? null);
    setEditFields([...(tpl.availableFields ?? [])]);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const saveEdits = async () => {
    if (!tpl) return;
    try {
      let parsedSettings: Record<string, unknown> = {};
      try {
        parsedSettings = JSON.parse(editSettings);
      } catch {
        toast.error('Invalid JSON in settings');
        return;
      }

      const data: UpdateDocumentTemplateDto = {
        name: editName,
        description: editDescription || undefined,
        documentType: editDocumentType,
        htmlTemplate: editHtmlTemplate,
        cssStyles: editCssStyles || undefined,
        defaultSettings: parsedSettings,
        sortOrder: editSortOrder,
        isDefault: editIsDefault,
        industryCode: editIndustryCode || undefined,
      };
      await updateMut.mutateAsync({ id: tpl.id, data });
      toast.success('Template updated');
      setEditing(false);
    } catch {
      toast.error('Failed to update template');
    }
  };

  const handleArchive = async () => {
    if (!confirm('Archive this template? It can be restored later.')) return;
    try {
      await archiveMut.mutateAsync(tpl!.id);
      toast.success('Template archived');
      router.push('/templates');
    } catch {
      toast.error('Failed to archive template');
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateMut.mutateAsync(tpl!.id);
      toast.success('Template duplicated');
      router.push('/templates');
    } catch {
      toast.error('Failed to duplicate template');
    }
  };

  const loadPreview = useCallback(async () => {
    if (!tpl) return;
    setPreviewLoading(true);
    try {
      const result = await documentTemplatesApi.preview(tpl.id);
      setPreviewHtml(result?.data?.html ?? '<p>No preview available</p>');
    } catch {
      // Fallback: render the template directly
      const css = tpl.cssStyles ? `<style>${tpl.cssStyles}</style>` : '';
      setPreviewHtml(`<!DOCTYPE html><html><head><meta charset="utf-8">${css}</head><body>${tpl.htmlTemplate}</body></html>`);
    } finally {
      setPreviewLoading(false);
    }
  }, [tpl]);

  // ─── Field management helpers ───
  const addField = () => {
    setEditFields((prev) => [...prev, { key: '', label: '', group: 'General' }]);
  };

  const updateField = (index: number, field: keyof typeof editFields[0], value: string) => {
    setEditFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    );
  };

  const removeField = (index: number) => {
    setEditFields((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tpl) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Template not found</p>
        <Button variant="outline" onClick={() => router.push('/templates')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/templates')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tpl.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge value={tpl.isActive ? 'ACTIVE' : 'INACTIVE'} />
              <Badge variant="secondary">
                {DOCUMENT_TYPES.find((d) => d.value === tpl.documentType)?.label ?? tpl.documentType}
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px]">
                {tpl.code}
              </Badge>
              {tpl.isSystem && <Badge variant="info">System</Badge>}
              {tpl.isDefault && (
                <Badge variant="outline" className="gap-0.5">
                  <Check className="h-3 w-3" />
                  Default
                </Badge>
              )}
              <IndustryBadge industryCode={tpl.industryCode} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={cancelEditing}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={saveEdits} loading={updateMut.isPending}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleDuplicate}>
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button variant="outline" onClick={startEditing}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              {!tpl.isSystem && (
                <Button variant="destructive" onClick={handleArchive} loading={archiveMut.isPending}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Document Type',
            value: DOCUMENT_TYPES.find((d) => d.value === tpl.documentType)?.label ?? tpl.documentType,
            icon: Code,
            color: 'text-blue-600',
          },
          {
            label: 'Fields',
            value: String(tpl.availableFields?.length ?? 0),
            icon: List,
            color: 'text-orange-600',
          },
          {
            label: 'Sort Order',
            value: String(tpl.sortOrder),
            icon: Settings,
            color: 'text-purple-600',
          },
          {
            label: 'Updated',
            value: formatDate(tpl.updatedAt),
            icon: Calendar,
            color: 'text-teal-600',
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={cn('h-8 w-8', stat.color)} />
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'Preview' && !previewHtml) loadPreview();
              }}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* ─── Overview Tab ─── */}
      {activeTab === 'Overview' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <Select
                    label="Document Type"
                    options={DOCUMENT_TYPES}
                    value={editDocumentType}
                    onChange={(e) => setEditDocumentType(e.target.value)}
                  />
                  <Input
                    label="Sort Order"
                    type="number"
                    min={0}
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(Number(e.target.value))}
                  />
                  <IndustrySelect
                    value={editIndustryCode}
                    onChange={setEditIndustryCode}
                    label="Industry"
                    showAll
                  />
                </div>
                <Textarea
                  label="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="editIsDefault"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={editIsDefault}
                    onChange={(e) => setEditIsDefault(e.target.checked)}
                  />
                  <label htmlFor="editIsDefault" className="text-sm text-gray-700">
                    Set as default template for this document type
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-500">Code</span>
                    <p className="font-mono font-medium">{tpl.code}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Document Type</span>
                    <p className="font-medium">
                      {DOCUMENT_TYPES.find((d) => d.value === tpl.documentType)?.label ?? tpl.documentType}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Sort Order</span>
                    <p className="font-medium">{tpl.sortOrder}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">System Template</span>
                    <p className="font-medium">{tpl.isSystem ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Default</span>
                    <p className="font-medium">{tpl.isDefault ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Industry</span>
                    <div className="mt-0.5"><IndustryBadge industryCode={tpl.industryCode} /></div>
                  </div>
                  <div>
                    <span className="text-gray-500">Created</span>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {formatDate(tpl.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Updated</span>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {formatDate(tpl.updatedAt)}
                    </p>
                  </div>
                </div>
                {tpl.description && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-500">Description</span>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">{tpl.description}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── HTML Template Tab ─── */}
      {activeTab === 'HTML Template' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="h-5 w-5" />
              HTML Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <textarea
                className="w-full h-[500px] font-mono text-sm p-4 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                value={editHtmlTemplate}
                onChange={(e) => setEditHtmlTemplate(e.target.value)}
                placeholder="Enter HTML template..."
                spellCheck={false}
              />
            ) : (
              <pre className="w-full max-h-[500px] overflow-auto font-mono text-sm p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">
                {tpl.htmlTemplate || 'No HTML template defined'}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── CSS Styles Tab ─── */}
      {activeTab === 'CSS Styles' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Paintbrush className="h-5 w-5" />
              CSS Styles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <textarea
                className="w-full h-[400px] font-mono text-sm p-4 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                value={editCssStyles}
                onChange={(e) => setEditCssStyles(e.target.value)}
                placeholder="Enter CSS styles..."
                spellCheck={false}
              />
            ) : (
              <pre className="w-full max-h-[400px] overflow-auto font-mono text-sm p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">
                {tpl.cssStyles || 'No CSS styles defined'}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Settings Tab ─── */}
      {activeTab === 'Settings' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Default Settings (JSON)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <textarea
                className="w-full h-[300px] font-mono text-sm p-4 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                value={editSettings}
                onChange={(e) => setEditSettings(e.target.value)}
                placeholder='{"pageSize": "A4", "orientation": "portrait"}'
                spellCheck={false}
              />
            ) : (
              <pre className="w-full max-h-[300px] overflow-auto font-mono text-sm p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">
                {JSON.stringify(tpl.defaultSettings ?? {}, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Fields Tab ─── */}
      {activeTab === 'Fields' && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <List className="h-5 w-5" />
              Available Fields ({editing ? editFields.length : (tpl.availableFields?.length ?? 0)})
            </CardTitle>
            {editing && (
              <Button size="sm" onClick={addField}>
                <Plus className="h-4 w-4" />
                Add Field
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editing ? (
              editFields.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  <List className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  No fields added yet. Click &quot;Add Field&quot; to begin.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 pr-2 font-medium">Key</th>
                        <th className="pb-2 pr-2 font-medium">Label</th>
                        <th className="pb-2 pr-2 font-medium">Group</th>
                        <th className="pb-2 font-medium w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {editFields.map((f, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 pr-2">
                            <Input
                              placeholder="field_key"
                              value={f.key}
                              onChange={(e) => updateField(i, 'key', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              placeholder="Field Label"
                              value={f.label}
                              onChange={(e) => updateField(i, 'label', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              placeholder="General"
                              value={f.group}
                              onChange={(e) => updateField(i, 'group', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700"
                              onClick={() => removeField(i)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : tpl.availableFields && tpl.availableFields.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 pr-4 font-medium">Key</th>
                      <th className="pb-2 pr-4 font-medium">Label</th>
                      <th className="pb-2 font-medium">Group</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tpl.availableFields.map((f) => (
                      <tr key={f.key} className="border-b last:border-0">
                        <td className="py-2.5 pr-4 font-mono text-xs">{f.key}</td>
                        <td className="py-2.5 pr-4">{f.label}</td>
                        <td className="py-2.5">
                          <Badge variant="outline" className="text-[10px]">
                            {f.group}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                No available fields defined for this template
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Preview Tab ─── */}
      {activeTab === 'Preview' && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Template Preview
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPreview}
              loading={previewLoading}
            >
              Refresh Preview
            </Button>
          </CardHeader>
          <CardContent>
            {previewLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : previewHtml ? (
              <div className="border rounded-md overflow-hidden bg-white">
                <iframe
                  ref={iframeRef}
                  srcDoc={previewHtml}
                  className="w-full min-h-[600px] border-0"
                  title="Template Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <div className="text-center py-16 text-sm text-gray-400">
                <Eye className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                Click &quot;Refresh Preview&quot; to load the template preview
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
