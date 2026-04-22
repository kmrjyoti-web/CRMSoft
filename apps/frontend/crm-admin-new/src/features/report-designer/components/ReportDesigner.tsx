'use client';

import { useEffect } from 'react';
import { useDesignerStore } from '../stores/designer.store';
import { useTemplateDetail } from '../../document-templates/hooks/useDocumentTemplates';
import { DesignerToolbar } from './DesignerToolbar';
import { ToolboxPanel } from './panels/ToolboxPanel';
import { DesignerCanvas } from './canvas/DesignerCanvas';
import { PropertiesPanel } from './panels/PropertiesPanel';
import { ReportTreePanel } from './panels/ReportTreePanel';
import { AiPanel } from './panels/AiPanel';
import { Icon } from '@/components/ui';
import type { CanvasDesign } from '../types/report-designer.types';

interface ReportDesignerProps {
  templateId: string;
}

export function ReportDesigner({ templateId }: ReportDesignerProps) {
  const { data: templateRes, isLoading } = useTemplateDetail(templateId);
  const template = templateRes?.data;
  const { loadTemplate } = useDesignerStore();

  useEffect(() => {
    if (template) {
      const canvasJson = (template as any).canvasJson as CanvasDesign | null;
      loadTemplate(template.id, template.name, template.documentType, canvasJson);
    }
  }, [template, loadTemplate]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6b7280' }}>
        <Icon name="loader" size={24} /> Loading designer...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Toolbar */}
      <DesignerToolbar />

      {/* Main area: Toolbox | Canvas | Properties */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ToolboxPanel />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <DesignerCanvas />
          <ReportTreePanel />
        </div>

        <PropertiesPanel />
      </div>

      {/* AI floating panel */}
      <AiPanel />
    </div>
  );
}
