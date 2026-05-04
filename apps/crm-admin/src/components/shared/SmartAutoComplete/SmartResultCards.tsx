'use client';
import { getDisplayName } from './columns';

interface Props {
  entityType: string;
  results: any[];
  highlightIndex: number;
  onSelect: (item: any) => void;
  onHover: (i: number) => void;
}

export function SmartResultCards({ entityType, results, highlightIndex, onSelect, onHover }: Props) {
  if (!results.length) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
        No results found
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 10 }}>
      {results.map((item, i) => {
        const name = getDisplayName(item, entityType);
        return (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            onMouseEnter={() => onHover(i)}
            style={{
              padding: 10,
              borderRadius: 8,
              border: `1.5px solid ${i === highlightIndex ? '#2563eb' : '#e5e7eb'}`,
              cursor: 'pointer',
              background: i === highlightIndex ? '#eff6ff' : 'white',
              transition: 'all 0.1s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#1d4ed8',
                  flexShrink: 0,
                }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#111827',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#6b7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.email || item.code || item.city || ''}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: '#6b7280', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {item.phone && <span>📱 {item.phone}</span>}
              {item.gstin && <span>🏢 {item.gstin.slice(0, 15)}</span>}
              {item.currentBalance != null && (
                <span>₹{Number(item.currentBalance).toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
