import React, { useState } from 'react';
import type { ChartSettings } from '../types';

export function ChartSettingsModal({
  isOpen,
  onClose,
  onSave,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ChartSettings) => void;
  data: any[];
}) {
  const [xAxis, setXAxis] = useState('industry');
  const [yAxis, setYAxis] = useState('quotationValue');
  const [aggregation, setAggregation] = useState<'sum' | 'count' | 'average'>('sum');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  if (!isOpen) return null;

  const allFields = Array.from(new Set(data.flatMap(item => Object.keys(item)))).filter(f => f !== 'id' && f !== '_errors');
  const numericFields = allFields.filter(f => data.some(item => typeof item[f] === 'number'));
  const categoricalFields = allFields.filter(f => data.some(item => typeof item[f] === 'string'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-w-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Chart Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
            <select value={chartType} onChange={e => setChartType(e.target.value as any)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group By (X-Axis)</label>
            <select value={xAxis} onChange={e => setXAxis(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              {categoricalFields.map(f => <option key={f} value={f}>{f.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Measure (Y-Axis)</label>
            <select value={yAxis} onChange={e => setYAxis(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              {numericFields.map(f => <option key={f} value={f}>{f.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calculate (Aggregation)</label>
            <select value={aggregation} onChange={e => setAggregation(e.target.value as any)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="sum">Sum</option>
              <option value="average">Average</option>
              <option value="count">Count</option>
            </select>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2 bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave({ xAxis, yAxis, aggregation, chartType })} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Apply Settings</button>
        </div>
      </div>
    </div>
  );
}
