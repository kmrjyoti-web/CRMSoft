import React, { useState } from 'react';
import {
  MoreHorizontal, Edit2, Trash2, Copy, Archive, Settings,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  ArrowLeftToLine, ArrowRightToLine, Pin, Check,
} from 'lucide-react';
import type { ColumnDef, ValidationRule, AICTableFullDensity } from '../types';
import { validateRecord } from '../utils/validation';

export interface TableViewProps {
  data: any[];
  density?: AICTableFullDensity;
  validationRules?: ValidationRule[];
  showOnlyErrors?: boolean;
  columns?: ColumnDef[];
  setColumns?: React.Dispatch<React.SetStateAction<ColumnDef[]>>;
  fillBlankRows?: boolean;
  paginationMode?: 'infinite' | 'paginated';
  onRowEdit?: (row: any) => void;
  onRowDelete?: (row: any) => void;
  onRowCopy?: (row: any) => void;
  onRowArchive?: (row: any) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
}

export function TableView({
  data,
  density = 'comfortable',
  validationRules = [],
  showOnlyErrors = false,
  columns = [],
  setColumns,
  fillBlankRows = false,
  paginationMode = 'infinite',
  onRowEdit,
  onRowDelete,
  onRowCopy,
  onRowArchive,
  selectedIds,
  onSelectionChange,
}: TableViewProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openColMenuId, setOpenColMenuId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; rowId: number } | null>(null);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [visibleRowsCount, setVisibleRowsCount] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleMenu = (id: number, e: React.MouseEvent) => {
    setOpenMenuId(prev => (prev === id ? null : id));
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent, rowId: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, rowId });
    setOpenMenuId(null);
  };

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest) {
        if (!target.closest('.column-header-menu') && !target.closest('.column-header-cell')) {
          setOpenColMenuId(null);
        }
        if (!target.closest('.row-context-menu') && !target.closest('.row-action-button')) {
          setOpenMenuId(null);
          setContextMenu(null);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!tableContainerRef.current) return;

    const calculateRows = () => {
      if (!tableContainerRef.current) return;
      const containerHeight = tableContainerRef.current.clientHeight;
      let rowHeight = 45;
      if (density === 'compact') rowHeight = 25;
      if (density === 'cozy') rowHeight = 37;

      const tbody = tableContainerRef.current.querySelector('tbody');
      if (tbody && tbody.children.length > 0) {
        const firstRow = tbody.children[0] as HTMLTableRowElement;
        if (firstRow && firstRow.clientHeight > 0) {
          rowHeight = firstRow.clientHeight;
        }
      }

      const headerHeight = tableContainerRef.current.querySelector('thead')?.clientHeight || rowHeight;
      const footerHeight = paginationMode === 'paginated' ? 40 : 0;
      const availableHeight = containerHeight - headerHeight - footerHeight;
      const count = Math.floor(availableHeight / rowHeight);
      setVisibleRowsCount(count > 0 ? count : 1);
    };

    setTimeout(calculateRows, 0);
    const observer = new ResizeObserver(calculateRows);
    observer.observe(tableContainerRef.current);
    return () => observer.disconnect();
  }, [density, fillBlankRows, data.length, paginationMode]);

  const handleEdit = (row: any, e: React.MouseEvent) => {
    e.stopPropagation();
    onRowEdit?.(row);
    setOpenMenuId(null);
    setContextMenu(null);
  };

  const handleDelete = (row: any, e: React.MouseEvent) => {
    e.stopPropagation();
    onRowDelete?.(row);
    setOpenMenuId(null);
    setContextMenu(null);
  };

  const handleCopy = (row: any, e: React.MouseEvent) => {
    e.stopPropagation();
    onRowCopy?.(row);
    setOpenMenuId(null);
    setContextMenu(null);
  };

  const handleArchive = (row: any, e: React.MouseEvent) => {
    e.stopPropagation();
    onRowArchive?.(row);
    setOpenMenuId(null);
    setContextMenu(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, row: any) => {
    const tbody = e.currentTarget.parentElement;
    if (!tbody) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextRow = tbody.children[index + 1] as HTMLElement;
      if (nextRow && nextRow.hasAttribute('tabIndex')) {
        nextRow.focus();
      } else if (paginationMode === 'paginated' && currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
        setTimeout(() => {
          const newTbody = tableContainerRef.current?.querySelector('tbody');
          if (newTbody && newTbody.children[0]) {
            (newTbody.children[0] as HTMLElement).focus();
          }
        }, 0);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevRow = tbody.children[index - 1] as HTMLElement;
      if (prevRow && prevRow.hasAttribute('tabIndex')) {
        prevRow.focus();
      } else if (paginationMode === 'paginated' && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
        setTimeout(() => {
          const newTbody = tableContainerRef.current?.querySelector('tbody');
          if (newTbody && newTbody.children.length > 0) {
            const rows = Array.from(newTbody.children);
            const lastDataRow = rows.reverse().find(r => r.hasAttribute('tabIndex')) as HTMLElement;
            if (lastDataRow) lastDataRow.focus();
          }
        }, 0);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setOpenMenuId(openMenuId === row.id ? null : row.id);
    } else if (e.key === 'Escape') {
      setOpenMenuId(null);
      setContextMenu(null);
    }
  };

  const getPadding = () => {
    switch (density) {
      case 'compact': return 'px-2 py-1 text-xs';
      case 'cozy': return 'px-3 py-2 text-sm';
      case 'comfortable': default: return 'px-4 py-3 text-sm';
    }
  };

  const cellPadding = getPadding();

  const dataWithErrors = data.map(row => ({
    ...row,
    _errors: validateRecord(row, validationRules),
  }));

  let displayData = showOnlyErrors
    ? dataWithErrors.filter(row => Object.keys(row._errors).length > 0)
    : dataWithErrors;

  if (sortConfig) {
    displayData = [...displayData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const pageSize = visibleRowsCount > 0 ? visibleRowsCount : 20;
  const totalPages = Math.ceil(displayData.length / pageSize);

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedData = paginationMode === 'paginated'
    ? displayData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : displayData;

  const emptyRowsCount = fillBlankRows ? Math.max(0, visibleRowsCount - paginatedData.length) : 0;
  const emptyRows = Array.from({ length: emptyRowsCount });

  const handleColumnMenu = (e: React.MouseEvent, colId: string) => {
    setOpenColMenuId(prev => (prev === colId ? null : colId));
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
    setOpenColMenuId(null);
  };

  const handlePin = (colId: string, direction: 'left' | 'right' | null) => {
    if (setColumns) {
      setColumns(prev => {
        const newCols = [...prev];
        const idx = newCols.findIndex(c => c.id === colId);
        if (idx !== -1) {
          newCols[idx] = { ...newCols[idx], pinned: direction };
          const left = newCols.filter(c => c.pinned === 'left');
          const right = newCols.filter(c => c.pinned === 'right');
          const unpinned = newCols.filter(c => !c.pinned);
          return [...left, ...unpinned, ...right];
        }
        return newCols;
      });
    }
    setOpenColMenuId(null);
  };

  const handleMove = (colId: string, direction: 'left' | 'right') => {
    if (setColumns) {
      setColumns(prev => {
        const newCols = [...prev];
        const idx = newCols.findIndex(c => c.id === colId);
        if (idx !== -1) {
          if (direction === 'left' && idx > 0) {
            [newCols[idx - 1], newCols[idx]] = [newCols[idx], newCols[idx - 1]];
          } else if (direction === 'right' && idx < newCols.length - 1) {
            [newCols[idx], newCols[idx + 1]] = [newCols[idx + 1], newCols[idx]];
          }
        }
        return newCols;
      });
    }
    setOpenColMenuId(null);
  };

  const renderCell = (value: any, errors?: string[], isLink = false) => {
    const hasError = errors && errors.length > 0;
    const cellClass = `${cellPadding} whitespace-nowrap border-b border-r border-gray-200 ${hasError ? 'bg-red-50 border-l-2 border-l-red-500' : ''}`;
    const textClass = hasError
      ? 'text-red-700 font-medium group-hover:font-bold group-hover:text-red-900 transition-all duration-200'
      : isLink
        ? 'font-medium text-blue-600 hover:underline group-hover:font-bold group-hover:text-blue-800 transition-all duration-200'
        : 'text-gray-500 group-hover:font-medium group-hover:text-gray-900 transition-all duration-200';

    return (
      <td className={cellClass}>
        <div className="relative group flex items-center h-full w-full">
          <span className={textClass}>{value || '-'}</span>
          {hasError && (
            <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-20 w-max max-w-xs bg-red-600 text-white text-xs rounded p-2 shadow-lg">
              {errors.map((err, i) => <div key={i}>{err}</div>)}
            </div>
          )}
        </div>
      </td>
    );
  };

  const renderActionMenu = (row: any) => (
    <div className="row-context-menu absolute right-8 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-30 py-1">
      <button onClick={(e) => handleEdit(row, e)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
        <Edit2 size={14} className="mr-2" /> Edit
      </button>
      <button onClick={(e) => handleCopy(row, e)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
        <Copy size={14} className="mr-2" /> Copy
      </button>
      <button onClick={(e) => handleArchive(row, e)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
        <Archive size={14} className="mr-2" /> Archive
      </button>
      <div className="border-t border-gray-100 my-1" />
      <button onClick={(e) => handleDelete(row, e)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
        <Trash2 size={14} className="mr-2" /> Delete
      </button>
    </div>
  );

  return (
    <div ref={tableContainerRef} className="w-full h-full overflow-auto">
      <table className="min-w-full border-separate border-spacing-0 border-t border-l border-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-30 shadow-sm">
          <tr>
            <th scope="col" className={`${cellPadding} text-left font-medium text-gray-500 uppercase tracking-wider w-10 border-b border-r border-gray-200`}>
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={!!selectedIds && selectedIds.size > 0 && paginatedData.every(r => selectedIds.has(String(r.id)))}
                onChange={() => {
                  if (!onSelectionChange) return;
                  const allVisible = paginatedData.map(r => String(r.id));
                  const allSelected = selectedIds && allVisible.every(id => selectedIds.has(id));
                  if (allSelected) {
                    const next = new Set(selectedIds);
                    allVisible.forEach(id => next.delete(id));
                    onSelectionChange(next);
                  } else {
                    const next = new Set(selectedIds || new Set<string>());
                    allVisible.forEach(id => next.add(id));
                    onSelectionChange(next);
                  }
                }}
              />
            </th>
            {columns.filter(c => c.visible).map(col => (
              <th
                key={col.id}
                scope="col"
                className={`column-header-cell ${cellPadding} text-left font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 cursor-pointer hover:bg-gray-200 relative group transition-colors`}
                onClick={(e) => handleColumnMenu(e, col.id)}
              >
                <div className="flex items-center justify-between">
                  <span>{col.label}</span>
                  {sortConfig?.key === col.id && (
                    <span className="ml-1 text-gray-400">
                      {sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    </span>
                  )}
                </div>
                {openColMenuId === col.id && (
                  <div className="column-header-menu absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1 font-normal normal-case tracking-normal text-sm text-gray-700">
                    <button onClick={() => handleSort(col.id, 'asc')} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between">
                      <div className="flex items-center"><ArrowUp size={14} className="mr-2 text-gray-400" /> Asc</div>
                      {sortConfig?.key === col.id && sortConfig.direction === 'asc' && <Check size={14} className="text-blue-600" />}
                    </button>
                    <button onClick={() => handleSort(col.id, 'desc')} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between">
                      <div className="flex items-center"><ArrowDown size={14} className="mr-2 text-gray-400" /> Desc</div>
                      {sortConfig?.key === col.id && sortConfig.direction === 'desc' && <Check size={14} className="text-blue-600" />}
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => handlePin(col.id, 'left')} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between">
                      <div className="flex items-center"><ArrowLeftToLine size={14} className="mr-2 text-gray-400" /> Pin to left</div>
                      {col.pinned === 'left' && <Check size={14} className="text-blue-600" />}
                    </button>
                    <button onClick={() => handlePin(col.id, 'right')} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between">
                      <div className="flex items-center"><ArrowRightToLine size={14} className="mr-2 text-gray-400" /> Pin to right</div>
                      {col.pinned === 'right' && <Check size={14} className="text-blue-600" />}
                    </button>
                    {col.pinned && (
                      <button onClick={() => handlePin(col.id, null)} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-gray-500">
                        <Pin size={14} className="mr-2 text-gray-400" /> Unpin
                      </button>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => handleMove(col.id, 'left')} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center">
                      <ArrowLeft size={14} className="mr-2 text-gray-400" /> Move to Left
                    </button>
                    <button onClick={() => handleMove(col.id, 'right')} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center">
                      <ArrowRight size={14} className="mr-2 text-gray-400" /> Move to Right
                    </button>
                  </div>
                )}
              </th>
            ))}
            <th scope="col" className={`${cellPadding} text-right font-medium text-gray-500 uppercase tracking-wider w-10 border-b border-r border-gray-200`}>
              <Settings size={14} className="inline-block cursor-pointer" />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {paginatedData.map((row, index) => {
            const isRowSelected = !!selectedIds && selectedIds.has(String(row.id));
            const hasAnySelection = !!selectedIds && selectedIds.size > 0;
            return (
            <tr
              key={row.id}
              className={`group cursor-pointer relative transition-shadow duration-200 outline-none ${isRowSelected ? 'bg-blue-50 hover:bg-blue-100 z-10' : 'hover:bg-gray-50 focus-within:bg-gray-50 hover:z-10 hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)] focus-within:z-10 focus-within:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)] focus:bg-blue-50'}`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button, input, a, select, textarea, [role="menu"], [role="menuitem"], .row-action-button')) return;
                onRowEdit?.(row);
              }}
              onContextMenu={(e) => handleContextMenu(e, row.id)}
              onKeyDown={(e) => handleKeyDown(e, index, row)}
              tabIndex={0}
            >
              <td className={`${cellPadding} whitespace-nowrap border-b border-r border-gray-200`}>
                <input
                  type="checkbox"
                  className={`rounded border-gray-300 transition-opacity ${isRowSelected || hasAnySelection ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'}`}
                  checked={isRowSelected}
                  onChange={() => {
                    if (!onSelectionChange) return;
                    const next = new Set(selectedIds || new Set<string>());
                    const id = String(row.id);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    onSelectionChange(next);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              {columns.filter(c => c.visible).map(col => {
                let val = row[col.id];
                if (col.id === 'quotationValue' || col.id === 'invoiceValue') {
                  val = val ? `$${val.toLocaleString()}` : '';
                }
                return <React.Fragment key={col.id}>{renderCell(val, row._errors?.[col.id], col.id === 'contactName')}</React.Fragment>;
              })}
              <td className={`${cellPadding} whitespace-nowrap text-right font-medium relative border-b border-r border-gray-200 w-24`}>
                <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                  <button onClick={(e) => handleEdit(row, e)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={(e) => handleDelete(row, e)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full" title="Delete">
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={(e) => toggleMenu(row.id, e)}
                    className="row-action-button p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full"
                    title="More actions"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                {openMenuId === row.id && renderActionMenu(row)}
              </td>
            </tr>
          );
          })}
          {emptyRows.map((_, index) => (
            <tr key={`empty-${index}`} className="border border-gray-200">
              <td className={`${cellPadding} border-b border-r border-gray-200`}>&nbsp;</td>
              {columns.filter(c => c.visible).map(col => (
                <td key={`empty-${col.id}`} className={`${cellPadding} border-b border-r border-gray-200`}>&nbsp;</td>
              ))}
              <td className={`${cellPadding} border-b border-r border-gray-200 w-24`}>&nbsp;</td>
            </tr>
          ))}
          {paginatedData.length === 0 && !fillBlankRows && (
            <tr>
              <td colSpan={columns.filter(c => c.visible).length + 2} className="px-6 py-8 text-center text-sm text-gray-500">
                No records found matching the criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {paginationMode === 'paginated' && totalPages > 1 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, displayData.length)} of {displayData.length} entries
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          className="row-context-menu fixed bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1 w-48"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={(e) => handleEdit(displayData.find(r => r.id === contextMenu.rowId), e)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <Edit2 size={14} className="mr-2" /> Edit
          </button>
          <button onClick={(e) => handleCopy(displayData.find(r => r.id === contextMenu.rowId), e)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <Copy size={14} className="mr-2" /> Copy
          </button>
          <button onClick={(e) => handleArchive(displayData.find(r => r.id === contextMenu.rowId), e)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <Archive size={14} className="mr-2" /> Archive
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button onClick={(e) => handleDelete(displayData.find(r => r.id === contextMenu.rowId), e)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
            <Trash2 size={14} className="mr-2" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
