'use client';

import { useState } from 'react';
import { Icon, Button, Badge } from '@/components/ui';
import { useAiDesignReport, useAiGenerateFormula, useAiFromImage, useCreateFormula } from '../../hooks/useReportDesigner';
import { useDesignerStore } from '../../stores/designer.store';
import type { CanvasDesign } from '../../types/report-designer.types';

type AiMode = 'design' | 'formula' | 'image';

export function AiPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AiMode>('design');

  if (!isOpen) {
    return (
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          <Icon name="sparkles" size={16} /> AI Assistant
        </Button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 50,
      width: 400, maxHeight: 500,
      background: '#fff', borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      border: '1px solid #e5e7eb',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h6 style={{ margin: 0, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="sparkles" size={16} /> AI Report Assistant
        </h6>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          <Icon name="x" size={16} />
        </Button>
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
        {[
          { key: 'design' as AiMode, label: 'Design Report', icon: 'layout' },
          { key: 'formula' as AiMode, label: 'Add Formula', icon: 'percent' },
          { key: 'image' as AiMode, label: 'From Image', icon: 'image' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setMode(tab.key)}
            style={{
              flex: 1, padding: '8px 4px', border: 'none',
              borderBottom: mode === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
              background: 'transparent', cursor: 'pointer',
              fontSize: 11, fontWeight: mode === tab.key ? 600 : 400,
              color: mode === tab.key ? '#3b82f6' : '#6b7280',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            <Icon name={tab.icon as any} size={12} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {mode === 'design' && <DesignMode />}
        {mode === 'formula' && <FormulaMode />}
        {mode === 'image' && <ImageMode />}
      </div>
    </div>
  );
}

// ── Mode 1: Design Report ──
function DesignMode() {
  const [description, setDescription] = useState('');
  const designMutation = useAiDesignReport();
  const { setDesign, documentType } = useDesignerStore();

  const handleGenerate = () => {
    if (!description.trim()) return;
    designMutation.mutate(
      { description, documentType },
      {
        onSuccess: (res: any) => {
          const design = res?.data as CanvasDesign;
          if (design) setDesign(design);
        },
      },
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
        Describe the report layout you want. AI will generate a complete canvas design.
      </p>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g., Create a professional GST invoice with company logo on top left, invoice details on right, items table in center, totals on bottom right, bank details and signature at footer"
        style={{ width: '100%', minHeight: 100, padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, resize: 'vertical' }}
      />
      <Button
        variant="primary"
        onClick={handleGenerate}
        disabled={designMutation.isPending || !description.trim()}
      >
        {designMutation.isPending ? (
          <><Icon name="loader" size={14} /> Generating...</>
        ) : (
          <><Icon name="sparkles" size={14} /> Generate Design</>
        )}
      </Button>
      {designMutation.isSuccess && (
        <Badge variant="success">Design applied to canvas!</Badge>
      )}
    </div>
  );
}

// ── Mode 2: Formula ──
function FormulaMode() {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<any>(null);
  const formulaMutation = useAiGenerateFormula();
  const createFormula = useCreateFormula();

  const handleGenerate = () => {
    if (!description.trim()) return;
    formulaMutation.mutate(
      { description },
      {
        onSuccess: (res: any) => {
          setResult(res?.data);
        },
      },
    );
  };

  const handleSave = () => {
    if (!result) return;
    createFormula.mutate({
      name: result.name,
      category: result.category,
      expression: result.expression,
      description: result.description,
      requiredFields: result.requiredFields,
      outputType: 'number',
      outputFormat: 'currency',
    });
  };

  const handleCopy = () => {
    if (result?.expression) {
      navigator.clipboard.writeText(result.expression);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
        Describe the calculation. AI will generate a formula expression.
      </p>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g., Calculate CGST as half of total GST rate applied on taxable amount"
        style={{ width: '100%', minHeight: 80, padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, resize: 'vertical' }}
      />
      <Button
        variant="primary"
        onClick={handleGenerate}
        disabled={formulaMutation.isPending || !description.trim()}
      >
        {formulaMutation.isPending ? (
          <><Icon name="loader" size={14} /> Generating...</>
        ) : (
          <><Icon name="percent" size={14} /> Generate Formula</>
        )}
      </Button>

      {result && (
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{result.name}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#7c3aed', background: '#faf5ff', padding: 6, borderRadius: 4, marginBottom: 8 }}>
            {result.expression}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>{result.description}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" size="sm" onClick={handleSave}>
              <Icon name="save" size={12} /> Save to Library
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Icon name="copy" size={12} /> Copy Expression
            </Button>
          </div>
          {createFormula.isSuccess && (
            <div style={{ marginTop: 8 }}>
              <Badge variant="success">Saved! Drag from Formula Library to canvas.</Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Mode 3: From Image ──
function ImageMode() {
  const [imageDescription, setImageDescription] = useState('');
  const imageMutation = useAiFromImage();
  const { setDesign, documentType } = useDesignerStore();

  const handleGenerate = () => {
    if (!imageDescription.trim()) return;
    imageMutation.mutate(
      { imageDescription, documentType },
      {
        onSuccess: (res: any) => {
          const data = res?.data;
          if (data?.design) setDesign(data.design as CanvasDesign);
        },
      },
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
        Describe or paste a photo of an existing report. AI will recreate the layout.
      </p>
      <textarea
        value={imageDescription}
        onChange={(e) => setImageDescription(e.target.value)}
        placeholder="Describe the report layout from the image: e.g., Company logo top-left, 'TAX INVOICE' badge top-right, customer and billing details below, items table with HSN/SAC codes, totals section on right..."
        style={{ width: '100%', minHeight: 100, padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, resize: 'vertical' }}
      />
      <Button
        variant="primary"
        onClick={handleGenerate}
        disabled={imageMutation.isPending || !imageDescription.trim()}
      >
        {imageMutation.isPending ? (
          <><Icon name="loader" size={14} /> Analyzing...</>
        ) : (
          <><Icon name="image" size={14} /> Generate from Description</>
        )}
      </Button>
      {imageMutation.isSuccess && (
        <Badge variant="success">Layout generated and applied!</Badge>
      )}
    </div>
  );
}
