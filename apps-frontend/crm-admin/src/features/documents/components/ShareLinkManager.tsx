'use client';

import { useCallback } from 'react';
import { Icon, Badge, Button } from '@/components/ui';
import { useDocumentShareLinks, useRevokeShareLink } from '../hooks/useShareLinks';
import { useEntityPanel } from '@/hooks/useEntityPanel';
import { useConfirmDialog } from '@/components/common/useConfirmDialog';
import { ShareLinkForm } from './ShareLinkForm';
import toast from 'react-hot-toast';

interface ShareLinkManagerProps {
  documentId: string;
}

export function ShareLinkManager({ documentId }: ShareLinkManagerProps) {
  const { data } = useDocumentShareLinks(documentId);
  const revokeMut = useRevokeShareLink();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();

  const { handleCreate: openCreateLink } = useEntityPanel({
    entityKey: 'share-link',
    entityLabel: 'Share Link',
    FormComponent: (props: any) => <ShareLinkForm documentId={documentId} {...props} />,
    idProp: 'linkId',
    displayField: 'token',
  });

  const links = (() => {
    const d = data?.data;
    if (Array.isArray(d)) return d;
    const nested = d as unknown as { data?: any[] };
    return nested?.data ?? [];
  })();

  const handleCopy = useCallback((token: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  }, []);

  const handleRevoke = useCallback(async (linkId: string) => {
    const ok = await confirm({
      title: 'Revoke Share Link',
      message: 'This link will no longer work. Continue?',
      type: 'danger',
      confirmText: 'Revoke',
    });
    if (!ok) return;
    try {
      await revokeMut.mutateAsync(linkId);
      toast.success('Share link revoked');
    } catch {
      toast.error('Failed to revoke link');
    }
  }, [confirm, revokeMut]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Share Links</h3>
        <Button variant="outline" size="sm" onClick={() => openCreateLink()}>
          <Icon name="link" size={14} className="mr-1" />
          Create Link
        </Button>
      </div>

      {links.length === 0 ? (
        <p className="text-sm text-gray-500">No share links created yet.</p>
      ) : (
        <div className="space-y-2">
          {links.map((link: any) => (
            <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <Icon name="link" size={14} className="text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={link.isActive ? 'success' : 'default'}>
                      {link.isActive ? 'Active' : 'Revoked'}
                    </Badge>
                    <Badge variant="outline">{link.access}</Badge>
                    {link.maxViews && (
                      <span className="text-xs text-gray-500">
                        {link.viewCount}/{link.maxViews} views
                      </span>
                    )}
                  </div>
                  {link.expiresAt && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Expires: {new Date(link.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {link.isActive && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(link.token)}>
                      <Icon name="copy" size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRevoke(link.id)}>
                      <Icon name="x" size={14} className="text-red-500" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialogPortal />
    </div>
  );
}
