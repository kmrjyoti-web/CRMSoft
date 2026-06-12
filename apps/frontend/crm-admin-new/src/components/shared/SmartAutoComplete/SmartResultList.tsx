'use client';
import { getDisplayName } from './columns';

interface Props {
  entityType: string;
  results: any[];
  highlightIndex: number;
  onSelect: (item: any) => void;
  onHover: (i: number) => void;
}

export function SmartResultList({ entityType, results, highlightIndex, onSelect, onHover }: Props) {
  if (!results.length) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
        No results found
      </div>
    );
  }
  return (
    <div>
      {results.map((item, i) => {
        const name = getDisplayName(item, entityType);
        return (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            onMouseEnter={() => onHover(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              cursor: 'pointer',
              borderBottom: '1px solid #f3f4f6',
              background: i === highlightIndex ? '#eff6ff' : undefined,
              transition: 'background 0.1s',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                color: '#1d4ed8',
                flexShrink: 0,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <span
              style={{
                fontWeight: 600,
                fontSize: 12,
                color: '#111827',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
            <span
              style={{
                fontSize: 11,
                color: '#6b7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 140,
              }}
            >
              {item.email || item.phone || item.code || ''}
            </span>
            {item.city && (
              <span
                style={{
                  fontSize: 11,
                  color: '#9ca3af',
                  borderLeft: '1px solid #e5e7eb',
                  paddingLeft: 8,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.city}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
