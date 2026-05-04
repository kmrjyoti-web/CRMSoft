'use client';

import { Icon, Button, Input, SelectInput, ColorPicker } from '@/components/ui';
import { useDesignerStore } from '../../stores/designer.store';
import { BAND_DEFINITIONS, DATA_FIELDS } from '../../constants/control-definitions';

const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Roboto', label: 'Roboto' },
];

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const FORMAT_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'currency', label: 'Currency (INR)' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'text', label: 'Text' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY' },
];

export function PropertiesPanel() {
  const { selectedBandType, design, updateBandHeight } = useDesignerStore();

  const selectedElement = useDesignerStore.getState().getSelectedElement();
  const selectedBand = useDesignerStore.getState().getSelectedBand();

  if (selectedElement) {
    return <ElementProperties element={selectedElement} />;
  }

  if (selectedBand && selectedBandType) {
    const bandDef = BAND_DEFINITIONS.find(b => b.type === selectedBandType);
    return (
      <div style={{ width: 280, borderLeft: '1px solid #e5e7eb', background: '#fafbfc', overflow: 'auto' }}>
        <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
          <h6 style={{ fontSize: 13, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: bandDef?.color ?? '#999' }} />
            {bandDef?.label ?? 'Band'}
          </h6>
        </div>
        <div style={{ padding: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Height (px)</label>
          <Input
            label=""
            value={String(selectedBand.height)}
            onChange={(v) => updateBandHeight(selectedBandType, Number(v) || 40)}
          />
          <div style={{ marginTop: 8, fontSize: 11, color: '#6b7280' }}>
            Elements: {selectedBand.elements.length}
          </div>
        </div>
      </div>
    );
  }

  // No selection — show paper settings
  return (
    <div style={{ width: 280, borderLeft: '1px solid #e5e7eb', background: '#fafbfc', overflow: 'auto' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
        <h6 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
          <Icon name="file-text" size={14} /> Paper Settings
        </h6>
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SelectInput
          label="Paper Size"
          value={design.paper.size}
          options={[
            { value: 'A4', label: 'A4' },
            { value: 'LETTER', label: 'Letter' },
            { value: 'LEGAL', label: 'Legal' },
          ]}
          onChange={(v) => useDesignerStore.getState().setPaper({ size: v as any })}
        />
        <SelectInput
          label="Orientation"
          value={design.paper.orientation}
          options={[
            { value: 'portrait', label: 'Portrait' },
            { value: 'landscape', label: 'Landscape' },
          ]}
          onChange={(v) => useDesignerStore.getState().setPaper({ orientation: v as any })}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Input label="Top (mm)" value={String(design.paper.margins.top)} onChange={(v) => useDesignerStore.getState().setPaper({ margins: { ...design.paper.margins, top: Number(v) || 0 } })} />
          <Input label="Bottom (mm)" value={String(design.paper.margins.bottom)} onChange={(v) => useDesignerStore.getState().setPaper({ margins: { ...design.paper.margins, bottom: Number(v) || 0 } })} />
          <Input label="Left (mm)" value={String(design.paper.margins.left)} onChange={(v) => useDesignerStore.getState().setPaper({ margins: { ...design.paper.margins, left: Number(v) || 0 } })} />
          <Input label="Right (mm)" value={String(design.paper.margins.right)} onChange={(v) => useDesignerStore.getState().setPaper({ margins: { ...design.paper.margins, right: Number(v) || 0 } })} />
        </div>
      </div>
    </div>
  );
}

// ── Element Properties ──
function ElementProperties({ element }: { element: any }) {
  const { updateElement, removeElement } = useDesignerStore();
  const pos = element.position;
  const props = element.properties;

  function updateProp(key: string, value: any) {
    updateElement(element.id, {
      properties: { ...props, [key]: value },
    });
  }

  function updatePos(key: string, value: number) {
    updateElement(element.id, {
      position: { ...pos, [key]: value },
    });
  }

  const dataFieldOptions = DATA_FIELDS.map(f => ({ value: f.path, label: `${f.group} > ${f.label}` }));

  return (
    <div style={{ width: 280, borderLeft: '1px solid #e5e7eb', background: '#fafbfc', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h6 style={{ fontSize: 13, fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>
          {element.type} Properties
        </h6>
        <Button variant="ghost" size="sm" onClick={() => removeElement(element.id)}>
          <Icon name="trash" size={14} />
        </Button>
      </div>

      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
        {/* Position */}
        <Section title="Position">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <Input label="X" value={String(Math.round(pos.x))} onChange={(v) => updatePos('x', Number(v) || 0)} />
            <Input label="Y" value={String(Math.round(pos.y))} onChange={(v) => updatePos('y', Number(v) || 0)} />
            <Input label="Width" value={String(Math.round(pos.width))} onChange={(v) => updatePos('width', Math.max(10, Number(v) || 10))} />
            <Input label="Height" value={String(Math.round(pos.height))} onChange={(v) => updatePos('height', Math.max(5, Number(v) || 5))} />
          </div>
        </Section>

        {/* Text / Content */}
        {['text', 'label'].includes(element.type) && (
          <Section title="Content">
            <Input label="Text" value={props.text ?? ''} onChange={(v) => updateProp('text', v)} />
            <div style={{ marginTop: 6 }}>
              <SelectInput
                label="Data Binding"
                value={props.dataField ?? ''}
                options={[{ value: '', label: '— None —' }, ...dataFieldOptions]}
                onChange={(v) => updateProp('dataField', v || undefined)}
              />
            </div>
          </Section>
        )}

        {/* Image */}
        {element.type === 'image' && (
          <Section title="Image">
            <Input label="Image URL" value={props.src ?? ''} onChange={(v) => updateProp('src', v)} />
            <div style={{ marginTop: 6 }}>
              <SelectInput
                label="Image Field"
                value={props.imageField ?? ''}
                options={[{ value: '', label: '— None —' }, ...dataFieldOptions.filter(f => f.value.includes('logo') || f.value.includes('image') || f.value.includes('signature'))]}
                onChange={(v) => updateProp('imageField', v || undefined)}
              />
            </div>
          </Section>
        )}

        {/* Formula */}
        {element.type === 'formula' && (
          <Section title="Formula">
            <Input label="Expression" value={props.formulaExpression ?? ''} onChange={(v) => updateProp('formulaExpression', v)} />
            <div style={{ marginTop: 6 }}>
              <SelectInput
                label="Output Format"
                value={props.outputFormat ?? ''}
                options={FORMAT_OPTIONS}
                onChange={(v) => updateProp('outputFormat', v || undefined)}
              />
            </div>
          </Section>
        )}

        {/* Date */}
        {element.type === 'date' && (
          <Section title="Date">
            <SelectInput
              label="Format"
              value={props.format ?? 'DD/MM/YYYY'}
              options={DATE_FORMAT_OPTIONS}
              onChange={(v) => updateProp('format', v)}
            />
            <div style={{ marginTop: 6 }}>
              <SelectInput
                label="Data Binding"
                value={props.dataField ?? ''}
                options={[{ value: '', label: '— None —' }, ...dataFieldOptions.filter(f => f.value.includes('date') || f.value.includes('Date'))]}
                onChange={(v) => updateProp('dataField', v || undefined)}
              />
            </div>
          </Section>
        )}

        {/* Table */}
        {element.type === 'table' && (
          <Section title="Table">
            <Input label="Data Source" value={props.dataSource ?? 'items'} onChange={(v) => updateProp('dataSource', v)} />
            <div style={{ marginTop: 6, fontSize: 11, color: '#6b7280' }}>
              Columns: {(props.columns ?? []).length}
            </div>
          </Section>
        )}

        {/* QR / Barcode */}
        {(element.type === 'qrcode' || element.type === 'barcode') && (
          <Section title="Data">
            <SelectInput
              label="Data Field"
              value={props.dataField ?? ''}
              options={[{ value: '', label: '— None —' }, ...dataFieldOptions]}
              onChange={(v) => updateProp('dataField', v || undefined)}
            />
          </Section>
        )}

        {/* Appearance */}
        <Section title="Appearance">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <Input label="Font Size" value={String(props.fontSize ?? 12)} onChange={(v) => updateProp('fontSize', Number(v) || 12)} />
            <SelectInput label="Align" value={props.textAlign ?? 'left'} options={ALIGN_OPTIONS} onChange={(v) => updateProp('textAlign', v)} />
          </div>
          <div style={{ marginTop: 6 }}>
            <SelectInput
              label="Font Family"
              value={props.fontFamily ?? 'Arial'}
              options={FONT_OPTIONS}
              onChange={(v) => updateProp('fontFamily', v)}
            />
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" checked={props.fontWeight === 'bold'} onChange={(e) => updateProp('fontWeight', e.target.checked ? 'bold' : 'normal')} /> <strong>B</strong>
            </label>
            <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" checked={props.fontStyle === 'italic'} onChange={(e) => updateProp('fontStyle', e.target.checked ? 'italic' : 'normal')} /> <em>I</em>
            </label>
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Text Color</label>
            <ColorPicker value={props.color ?? '#333333'} onChange={(v: string) => updateProp('color', v)} />
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Background</label>
            <ColorPicker value={props.backgroundColor ?? ''} onChange={(v: string) => updateProp('backgroundColor', v || undefined)} />
          </div>
        </Section>

        {/* Border */}
        <Section title="Border">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <Input label="Width" value={String(props.borderWidth ?? 0)} onChange={(v) => updateProp('borderWidth', Number(v) || 0)} />
            <Input label="Radius" value={String(props.borderRadius ?? 0)} onChange={(v) => updateProp('borderRadius', Number(v) || 0)} />
          </div>
          <div style={{ marginTop: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Border Color</label>
            <ColorPicker value={props.borderColor ?? '#000000'} onChange={(v: string) => updateProp('borderColor', v)} />
          </div>
        </Section>
      </div>
    </div>
  );
}

// ── Section wrapper ──
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.5px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}
