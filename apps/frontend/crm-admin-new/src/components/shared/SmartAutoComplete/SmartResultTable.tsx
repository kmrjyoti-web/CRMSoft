'use client';
import { getDefaultColumns, formatCellValue, getDisplayName } from './columns';
import type { TableColumn } from './types';

interface Props {
  entityType: string;
  results: any[];
  highlightIndex: number;
  onSelect: (item: any) => void;
  onHover: (i: number) => void;
  columns?: TableColumn[];
  query?: string;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text || '—'}</>;
  const idx = String(text).toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  const s = String(text);
  return (
    <>
      {s.slice(0, idx)}
      <mark style={{ background: '#fef08a', padding: 0, borderRadius: 2 }}>
        {s.slice(idx, idx + query.length)}
      </mark>
      {s.slice(idx + query.length)}
    </>
  );
}

export function SmartResultTable({ entityType, results, highlightIndex, onSelect, onHover, columns, query = '' }: Props) {
  const cols = columns || getDefaultColumns(entityType);
  if (!results.length) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
        No results found
      </div>
    );
  }
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ background: '#f9fafb', position: 'sticky', top: 0, zIndex: 1 }}>
          {cols.map((col) => (
            <th
              key={col.key}
              style={{
                padding: '7px 10px',
                textAlign: 'left',
                fontSize: 10,
                fontWeight: 700,
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #f0f0f0',
                whiteSpace: 'nowrap',
                width: col.width,
              }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {results.map((item, i) => (
          <tr
            key={item.id}
            onClick={() => onSelect(item)}
            onMouseEnter={() => onHover(i)}
            style={{
              borderBottom: '1px solid #f9fafb',
              cursor: 'pointer',
              background: i === highlightIndex ? '#eff6ff' : undefined,
              transition: 'background 0.1s',
            }}
          >
            {cols.map((col) => {
              const raw =
                col.key === 'name' && entityType === 'CONTACT'
                  ? getDisplayName(item, entityType)
                  : item[col.key];
              return (
                <td
                  key={col.key}
                  style={{
                    padding: '8px 10px',
                    color: '#374151',
                    verticalAlign: 'middle',
                    maxWidth: 180,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: col.key === 'name' ? 600 : 400,
                  }}
                >
                  <Highlight text={formatCellValue(raw, col)} query={query} />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
