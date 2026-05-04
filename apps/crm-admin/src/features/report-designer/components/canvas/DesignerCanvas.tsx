'use client';

import { useRef, useCallback, useState } from 'react';
import { Icon, Button, Badge } from '@/components/ui';
import { useDesignerStore, generateElementId } from '../../stores/designer.store';
import { BAND_DEFINITIONS, CONTROL_DEFINITIONS } from '../../constants/control-definitions';
import type { BandType, ControlType, CanvasElement } from '../../types/report-designer.types';

export function DesignerCanvas() {
  const {
    design, zoom, showGrid, snapToGrid, gridSize,
    selectedElementId, selectElement, selectBand,
    addElement, updateElement, removeElement,
  } = useDesignerStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle drop from toolbox
  const handleDrop = useCallback((e: React.DragEvent, bandType: BandType) => {
    e.preventDefault();
    e.stopPropagation();

    const controlType = e.dataTransfer.getData('control-type') as ControlType;
    const dataField = e.dataTransfer.getData('data-field');
    const formulaId = e.dataTransfer.getData('formula-id');
    const formulaExpression = e.dataTransfer.getData('formula-expression');

    if (!controlType && !dataField && !formulaId) return;

    const bandEl = e.currentTarget as HTMLElement;
    const rect = bandEl.getBoundingClientRect();
    let x = (e.clientX - rect.left) / (zoom / 100);
    let y = (e.clientY - rect.top) / (zoom / 100);

    // Snap to grid
    if (snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    if (dataField) {
      // Dropped a data field — create a bound text element
      const element: CanvasElement = {
        id: generateElementId(),
        type: 'text',
        position: { x, y, width: 200, height: 20 },
        properties: { dataField, fontSize: 11 },
      };
      addElement(bandType, element);
      selectElement(element.id);
      return;
    }

    if (formulaId || formulaExpression) {
      // Dropped a formula — create a formula element
      const element: CanvasElement = {
        id: generateElementId(),
        type: 'formula',
        position: { x, y, width: 100, height: 20 },
        properties: {
          formulaId: formulaId || undefined,
          formulaExpression: formulaExpression || undefined,
          outputFormat: 'currency',
          fontSize: 12,
        },
      };
      addElement(bandType, element);
      selectElement(element.id);
      return;
    }

    // Dropped a control from toolbox
    const controlDef = CONTROL_DEFINITIONS.find(c => c.type === controlType);
    if (!controlDef) return;

    const element: CanvasElement = {
      id: generateElementId(),
      type: controlType,
      position: { x, y, width: controlDef.defaultWidth, height: controlDef.defaultHeight },
      properties: { ...controlDef.defaultProperties },
    };
    addElement(bandType, element);
    selectElement(element.id);
  }, [zoom, snapToGrid, gridSize, addElement, selectElement]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Element mouse down for drag-to-move
  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    selectElement(elementId);
    setDraggingElement(elementId);
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [selectElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingElement) return;

    const bandEl = (e.target as HTMLElement).closest('[data-band]') as HTMLElement;
    if (!bandEl) return;

    const rect = bandEl.getBoundingClientRect();
    let x = (e.clientX - rect.left - dragOffset.x) / (zoom / 100);
    let y = (e.clientY - rect.top - dragOffset.y) / (zoom / 100);

    if (snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    const allElements = useDesignerStore.getState().getAllElements();
    const currentEl = allElements.find(el => el.id === draggingElement);
    if (!currentEl) return;

    updateElement(draggingElement, {
      position: {
        ...currentEl.position,
        x: Math.max(0, x),
        y: Math.max(0, y),
      },
    });
  }, [draggingElement, dragOffset, zoom, snapToGrid, gridSize, updateElement]);

  const handleMouseUp = useCallback(() => {
    setDraggingElement(null);
  }, []);

  // Delete selected
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
      removeElement(selectedElementId);
    }
  }, [selectedElementId, removeElement]);

  const scale = zoom / 100;

  return (
    <div
      ref={canvasRef}
      className="designer-canvas"
      style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#e5e7eb',
        padding: 24,
        minHeight: 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: 595, // A4 at 72dpi
          margin: '0 auto',
          background: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          borderRadius: 2,
          position: 'relative',
        }}
      >
        {design.bands.map((band) => {
          const bandDef = BAND_DEFINITIONS.find(bd => bd.type === band.type);
          if (!bandDef) return null;
          if (band.collapsed) {
            return (
              <div
                key={band.type}
                data-band={band.type}
                style={{
                  height: 24,
                  borderBottom: `2px solid ${bandDef.color}`,
                  background: `${bandDef.color}10`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  cursor: 'pointer',
                  fontSize: 10,
                  color: bandDef.color,
                  fontWeight: 600,
                }}
                onClick={() => useDesignerStore.getState().toggleBandCollapse(band.type)}
              >
                <Icon name="chevron-right" size={12} /> {bandDef.label} (collapsed)
              </div>
            );
          }

          return (
            <div
              key={band.type}
              data-band={band.type}
              style={{
                position: 'relative',
                minHeight: band.height,
                height: band.height,
                borderBottom: `2px solid ${bandDef.color}`,
                background: showGrid
                  ? `repeating-linear-gradient(0deg, transparent, transparent ${gridSize - 1}px, #f0f0f0 ${gridSize - 1}px, #f0f0f0 ${gridSize}px), repeating-linear-gradient(90deg, transparent, transparent ${gridSize - 1}px, #f0f0f0 ${gridSize - 1}px, #f0f0f0 ${gridSize}px)`
                  : 'transparent',
              }}
              onDrop={(e) => handleDrop(e, band.type)}
              onDragOver={handleDragOver}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  selectBand(band.type);
                  selectElement(null);
                }
              }}
            >
              {/* Band label */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  background: `${bandDef.color}15`,
                  borderBottom: `1px dashed ${bandDef.color}40`,
                  padding: '2px 8px',
                  fontSize: 9,
                  color: bandDef.color,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                <span>{bandDef.label}</span>
                <span style={{ opacity: 0.6 }}>{band.height}px</span>
              </div>

              {/* Elements */}
              {band.elements.map((el) => (
                <CanvasElementView
                  key={el.id}
                  el={el}
                  isSelected={selectedElementId === el.id}
                  isDragging={draggingElement === el.id}
                  scale={scale}
                  onMouseDown={handleElementMouseDown}
                  onUpdateElement={updateElement}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Element View ──

function CanvasElementView({
  el,
  isSelected,
  isDragging,
  scale,
  onMouseDown,
  onUpdateElement,
}: {
  el: CanvasElement;
  isSelected: boolean;
  isDragging: boolean;
  scale: number;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: el.position.x,
        top: el.position.y,
        width: el.position.width,
        height: el.position.height,
        border: isSelected ? '2px solid #3b82f6' : '1px dashed #ccc',
        borderRadius: 2,
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: el.properties.backgroundColor || 'transparent',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        fontSize: el.properties.fontSize ?? 12,
        fontWeight: el.properties.fontWeight ?? 'normal',
        fontStyle: el.properties.fontStyle ?? 'normal',
        color: el.properties.color ?? '#333',
        textAlign: (el.properties.textAlign ?? 'left') as React.CSSProperties['textAlign'],
        padding: '0 4px',
        zIndex: isSelected ? 10 : 2,
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
      onMouseDown={(e) => onMouseDown(e, el.id)}
      onDoubleClick={() => {
        // For text elements, could trigger inline editing
      }}
    >
      {renderElementPreview(el)}

      {/* Resize handle */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            right: -4,
            bottom: -4,
            width: 8,
            height: 8,
            background: '#3b82f6',
            borderRadius: 1,
            cursor: 'nwse-resize',
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;
            const startW = el.position.width;
            const startH = el.position.height;

            const onMove = (me: MouseEvent) => {
              const dw = (me.clientX - startX) / scale;
              const dh = (me.clientY - startY) / scale;
              onUpdateElement(el.id, {
                position: {
                  ...el.position,
                  width: Math.max(20, startW + dw),
                  height: Math.max(10, startH + dh),
                },
              });
            };

            const onUp = () => {
              document.removeEventListener('mousemove', onMove);
              document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
          }}
        />
      )}
    </div>
  );
}

// ── Element Preview Rendering ──

function renderElementPreview(el: CanvasElement): React.ReactNode {
  const p = el.properties;

  switch (el.type) {
    case 'text':
    case 'label':
      return <span style={{ width: '100%' }}>{p.dataField ? `{{${p.dataField}}}` : p.text ?? 'Text'}</span>;

    case 'image':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#aaa', fontSize: 10 }}>
          <Icon name="image" size={16} /> {p.imageField ? `{{${p.imageField}}}` : 'Image'}
        </div>
      );

    case 'table':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 10, color: '#64748b' }}>
          <Icon name="grid-3x3" size={14} /> Table: {p.dataSource ?? 'items'} ({(p.columns ?? []).length} cols)
        </div>
      );

    case 'line':
      return <div style={{ width: '100%', borderBottom: `${p.lineWidth ?? 1}px ${p.lineStyle ?? 'solid'} ${p.lineColor ?? '#ddd'}` }} />;

    case 'rectangle':
    case 'shape':
      return <div style={{ width: '100%', height: '100%', borderRadius: p.borderRadius ?? 0, border: `${p.borderWidth ?? 1}px solid ${p.borderColor ?? '#ddd'}`, background: p.backgroundColor ?? 'transparent' }} />;

    case 'formula':
      return <span style={{ width: '100%', fontStyle: 'italic', color: '#8b5cf6' }}>{p.formulaExpression ? `f(${p.formulaExpression})` : 'Formula'}</span>;

    case 'qrcode':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', fontSize: 10 }}>
          <Icon name="grid-3x3" size={18} />
        </div>
      );

    case 'barcode':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', fontSize: 10 }}>
          <Icon name="hash" size={14} /> Barcode
        </div>
      );

    case 'date':
      return <span style={{ width: '100%' }}>{p.dataField ? `{{${p.dataField}}}` : p.format ?? 'DD/MM/YYYY'}</span>;

    case 'serial-no':
      return <span style={{ width: '100%', textAlign: 'center' }}>#</span>;

    case 'page-no':
      return <span style={{ width: '100%', textAlign: 'center', color: '#888' }}>Page N</span>;

    case 'spacer':
      return <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #f0f0f0 5px, #f0f0f0 6px)' }} />;

    case 'signature':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', fontSize: 9, color: '#888' }}>
          <div style={{ borderTop: '1px solid #333', width: '80%', paddingTop: 2, textAlign: 'center' }}>Signature</div>
        </div>
      );

    default:
      return <span>{el.type}</span>;
  }
}
