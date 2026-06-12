'use client';

import { useRouter } from 'next/navigation';
import { Icon, Button, Badge } from '@/components/ui';
import { useDesignerStore } from '../stores/designer.store';
import { useSaveDesign } from '../hooks/useReportDesigner';
import { usePreviewTemplate } from '../../document-templates/hooks/useDocumentTemplates';

export function DesignerToolbar() {
  const router = useRouter();
  const {
    templateName, documentType, templateId, isDirty, design,
    zoom, setZoom, showGrid, toggleGrid, snapToGrid, toggleSnap,
    undo, redo, history, historyIndex,
  } = useDesignerStore();

  const saveMutation = useSaveDesign();
  const previewMutation = usePreviewTemplate();

  const handleSave = () => {
    if (!templateId) return;
    saveMutation.mutate({ templateId, design });
  };

  const handlePreview = () => {
    if (!templateId) return;
    previewMutation.mutate(
      { templateId, documentType, documentId: 'sample' },
      {
        onSuccess: (res: any) => {
          const html = typeof res?.data === 'string' ? res.data : (res?.data as any)?.html ?? '';
          if (html) {
            const win = window.open('', '_blank');
            if (win) { win.document.write(html); win.document.close(); }
          }
        },
      },
    );
  };

  return (
    <div style={{
      height: 48,
      borderBottom: '1px solid #e5e7eb',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
    }}>
      {/* Left: Back + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings/templates')}>
          <Icon name="arrow-left" size={16} />
        </Button>
        <div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{templateName || 'Report Designer'}</span>
          {documentType && (
            <Badge variant="primary" style={{ marginLeft: 8 }}>
              {documentType.replace(/_/g, ' ')}
            </Badge>
          )}
          {isDirty && <span style={{ color: '#f59e0b', marginLeft: 6, fontSize: 11 }}>Unsaved</span>}
        </div>
      </div>

      {/* Center: Canvas controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0} title="Undo">
          <Icon name="rotate-ccw" size={14} />
        </Button>
        <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo">
          <Icon name="refresh-cw" size={14} />
        </Button>

        <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 4px' }} />

        <Button variant="ghost" size="sm" onClick={() => setZoom(zoom - 10)} title="Zoom out">
          <Icon name="minus" size={14} />
        </Button>
        <span style={{ fontSize: 12, fontWeight: 600, minWidth: 40, textAlign: 'center' }}>{zoom}%</span>
        <Button variant="ghost" size="sm" onClick={() => setZoom(zoom + 10)} title="Zoom in">
          <Icon name="plus" size={14} />
        </Button>

        <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 4px' }} />

        <Button variant={showGrid ? 'primary' : 'ghost'} size="sm" onClick={toggleGrid} title="Grid">
          <Icon name="grid-3x3" size={14} />
        </Button>
        <Button variant={snapToGrid ? 'primary' : 'ghost'} size="sm" onClick={toggleSnap} title="Snap">
          <Icon name="maximize" size={14} />
        </Button>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button variant="outline" size="sm" onClick={handlePreview} disabled={previewMutation.isPending}>
          <Icon name="eye" size={14} /> Preview
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={saveMutation.isPending || !isDirty}
        >
          <Icon name="save" size={14} /> {saveMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
