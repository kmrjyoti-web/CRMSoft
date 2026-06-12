'use client';

import { useState, useMemo } from 'react';
import { formatINR } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import type { ReportTable, ColumnDef } from '../types/report.types';

interface ReportTableRendererProps {
  table: ReportTable;
  visibleColumns?: string[];
  pageSize?: number;
}

function formatCell(col: ColumnDef, value: unknown): string {
  if (value == null) return '\u2014';
  switch (col.format) {
    case 'currency':
      return formatINR(Number(value));
    case 'date':
      return formatDate(String(value));
    case 'percent':
      return `${Number(value).toFixed(1)}%`;
    case 'number':
      return Number(value).toLocaleString('en-IN');
    default:
      return String(value);
  }
}

export function ReportTableRenderer({
  table,
  visibleColumns,
  pageSize = 25,
}: ReportTableRendererProps) {
  const [page, setPage] = useState(1);

  const columns = useMemo(() => {
    if (!visibleColumns?.length) return table.columns;
    return table.columns.filter((c) => visibleColumns.includes(c.key));
  }, [table.columns, visibleColumns]);

  const totalPages = Math.ceil(table.rows.length / pageSize);
  const pagedRows = useMemo(
    () => table.rows.slice((page - 1) * pageSize, page * pageSize),
    [table.rows, page, pageSize],
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">{table.title}</h4>
        <span className="text-xs text-gray-500">{table.rows.length} rows</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2.5 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide"
                  style={{
                    textAlign: col.format === 'currency' || col.format === 'number' || col.format === 'percent' ? 'right' : 'left',
                    width: col.width ? `${col.width}px` : undefined,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-2.5 text-gray-700"
                    style={{
                      textAlign: col.format === 'currency' || col.format === 'number' || col.format === 'percent' ? 'right' : 'left',
                    }}
                  >
                    {formatCell(col, row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
