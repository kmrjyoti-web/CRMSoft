'use client';

import { useState } from 'react';
import { Icon, Button } from '@/components/ui';
import { useDocumentActivity } from '../hooks/useDocuments';

const ACTION_ICONS: Record<string, string> = {
  UPLOADED: 'upload',
  DOWNLOADED: 'download',
  VIEWED: 'eye',
  UPDATED: 'edit',
  DELETED: 'trash-2',
  SHARED: 'share-2',
  VERSION_UPLOADED: 'git-commit',
  MOVED: 'move',
};

interface DocumentActivityLogProps {
  documentId: string;
}

export function DocumentActivityLog({ documentId }: DocumentActivityLogProps) {
  const [page, setPage] = useState(1);
  const { data } = useDocumentActivity(documentId, page);

  const activities = (() => {
    const d = data?.data;
    if (Array.isArray(d)) return d;
    const nested = d as unknown as { data?: any[] };
    return nested?.data ?? [];
  })();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity Log</h3>

      {activities.length === 0 ? (
        <p className="text-sm text-gray-500">No activity recorded yet.</p>
      ) : (
        <>
          <div className="space-y-2">
            {activities.map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Icon name={ACTION_ICONS[a.action] ?? 'activity'} size={14} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{a.user?.firstName} {a.user?.lastName}</span>
                    {' '}
                    <span className="text-gray-500">{a.action.toLowerCase().replace(/_/g, ' ')}</span>
                  </p>
                  {a.details && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {JSON.stringify(a.details)}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <Icon name="chevron-left" size={14} />
            </Button>
            <span className="text-xs text-gray-500">Page {page}</span>
            <Button variant="ghost" size="sm" disabled={activities.length < 20} onClick={() => setPage((p) => p + 1)}>
              <Icon name="chevron-right" size={14} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
