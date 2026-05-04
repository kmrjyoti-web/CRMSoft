'use client';

import { Icon, Badge } from '@/components/ui';
import { useDesignerStore } from '../../stores/designer.store';
import { BAND_DEFINITIONS, CONTROL_DEFINITIONS } from '../../constants/control-definitions';

export function ReportTreePanel() {
  const { design, selectedElementId, selectedBandType, selectElement, selectBand, toggleBandCollapse } = useDesignerStore();

  return (
    <div style={{ borderTop: '1px solid #e5e7eb', background: '#fafbfc', maxHeight: 200, overflowY: 'auto' }}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid #e5e7eb', fontSize: 11, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name="layers" size={13} /> Report Structure
      </div>
      <div style={{ padding: 4 }}>
        {design.bands.map((band) => {
          const bandDef = BAND_DEFINITIONS.find(b => b.type === band.type);
          if (!bandDef) return null;
          const isSelected = selectedBandType === band.type && !selectedElementId;

          return (
            <div key={band.type}>
              <div
                onClick={() => { selectBand(band.type); selectElement(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 8px',
                  borderRadius: 3,
                  cursor: 'pointer',
                  background: isSelected ? '#eff6ff' : 'transparent',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); toggleBandCollapse(band.type); }}
                >
                  <Icon name={band.collapsed ? 'chevron-right' : 'chevron-down'} size={12} />
                </span>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: bandDef.color, flexShrink: 0 }} />
                <span>{bandDef.label}</span>
                <Badge variant="secondary">{band.elements.length}</Badge>
              </div>

              {!band.collapsed && band.elements.map((el) => {
                const controlDef = CONTROL_DEFINITIONS.find(c => c.type === el.type);
                const isElSelected = selectedElementId === el.id;
                const displayName = el.properties.text || el.properties.dataField || el.type;

                return (
                  <div
                    key={el.id}
                    onClick={(e) => { e.stopPropagation(); selectElement(el.id); selectBand(null); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '3px 8px 3px 28px',
                      borderRadius: 3,
                      cursor: 'pointer',
                      background: isElSelected ? '#dbeafe' : 'transparent',
                      fontSize: 10,
                    }}
                  >
                    <Icon name={(controlDef?.icon ?? 'circle') as any} size={11} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayName}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
