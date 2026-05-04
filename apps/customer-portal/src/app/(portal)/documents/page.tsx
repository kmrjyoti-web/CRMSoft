'use client';

import { useState } from 'react';
import { FolderOpen, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePortalDocuments } from '@/hooks/usePortal';
import { formatDate } from '@/lib/utils';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FILE_TYPE_COLORS: Record<string, BadgeVariant> = {
  pdf: 'danger',
  xlsx: 'success',
  xls: 'success',
  docx: 'default',
  doc: 'default',
  png: 'secondary',
  jpg: 'secondary',
};

type BadgeVariant = 'danger' | 'success' | 'default' | 'secondary' | 'warning' | 'muted' | 'outline';

function getFileExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

export default function DocumentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePortalDocuments(page);

  const documents = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No documents available</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {documents.map((doc) => {
                  const ext = getFileExt(doc.name);
                  const badgeVariant = FILE_TYPE_COLORS[ext] ?? 'muted';

                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(doc.uploadedAt)} · {formatFileSize(doc.size)}
                        </p>
                      </div>
                      <Badge variant={badgeVariant} className="shrink-0 uppercase">
                        {ext || doc.type}
                      </Badge>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  );
                })}
              </div>

              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {meta.page} of {meta.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === meta.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
