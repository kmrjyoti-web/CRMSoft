'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Badge, Button } from '@/components/ui';
import { useDocumentsList } from '../hooks/useDocuments';
import { formatFileSize, getCategoryColor, getCategoryLabel } from '../utils/document-helpers';
import type { DocumentListItem } from '../types/documents.types';

const TEMPLATE_CATEGORIES = ['PROPOSAL', 'CONTRACT', 'QUOTATION', 'INVOICE'];

export function DocumentTemplateList() {
  const router = useRouter();
  const { data, isLoading } = useDocumentsList();

  const templates = useMemo(() => {
    const docs = (() => {
      const d = data?.data;
      if (Array.isArray(d)) return d as DocumentListItem[];
      const nested = d as unknown as { data?: DocumentListItem[] };
      return nested?.data ?? [];
    })();
    return docs.filter((d) => TEMPLATE_CATEGORIES.includes(d.category));
  }, [data]);

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading templates...</div>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Document Templates</h3>
      {templates.length === 0 ? (
        <p className="text-sm text-gray-500">No templates found. Upload documents with Proposal, Contract, Quotation, or Invoice category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-2">
                <Icon name="file-text" size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.originalName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getCategoryColor(doc.category)}>
                      {getCategoryLabel(doc.category)}
                    </Badge>
                    <span className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</span>
                  </div>
                  {doc.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{doc.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/documents/${doc.id}`)}
                >
                  <Icon name="eye" size={12} className="mr-1" />
                  View
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/documents/editor/${doc.id}`)}
                >
                  <Icon name="copy" size={12} className="mr-1" />
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
