import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import type { ColumnDef } from '../types';

export function ColumnSettingsMenu({
  columns,
  setColumns,
  onClose,
}: {
  columns: ColumnDef[];
  setColumns: (cols: ColumnDef[]) => void;
  onClose: () => void;
}) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.parentNode as any);
  };

  const handleDragOver = (index: number) => {
    if (draggedIdx === null || draggedIdx === index) return;
    const newCols = [...columns];
    const draggedCol = newCols[draggedIdx];
    newCols.splice(draggedIdx, 1);
    newCols.splice(index, 0, draggedCol);
    setDraggedIdx(index);
    setColumns(newCols);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const toggleVisibility = (id: string) => {
    setColumns(columns.map(c => (c.id === id ? { ...c, visible: !c.visible } : c)));
  };

  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div className="absolute right-0 top-10 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-30 flex flex-col max-h-96">
        <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-md">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Show/Hide Columns</h3>
          <p className="text-xs text-gray-400 mt-0.5">Drag to reorder</p>
        </div>
        <div className="overflow-y-auto p-2 space-y-1">
          {columns.map((col, idx) => (
            <div
              key={col.id}
              className={`flex items-center justify-between p-2 rounded-md hover:bg-gray-50 ${draggedIdx === idx ? 'opacity-50 bg-gray-100' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => { e.preventDefault(); handleDragOver(idx); }}
              onDragEnd={handleDragEnd}
            >
              <label className="flex items-center space-x-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => toggleVisibility(col.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{col.label}</span>
              </label>
              <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1">
                <Menu size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
