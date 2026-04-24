import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import type { BIWidget, BISettings } from '../types';
import { defaultBIWidgets } from '../constants';

const BI_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function BIWidgetRenderer({ widget, data }: { widget: BIWidget; data: any[] }) {
  const { type, title, rows, columns, xAxis, chartType, values, aggregation } = widget;

  const calculateValue = (items: any[]) => {
    if (aggregation === 'count') return items.length;
    const sum = items.reduce((acc, curr) => acc + (Number(curr[values]) || 0), 0);
    if (aggregation === 'average') return items.length ? sum / items.length : 0;
    return sum;
  };

  const formatValue = (val: number) => {
    if (aggregation === 'count') return val.toLocaleString();
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  if (type === 'card') {
    const val = calculateValue(data);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
        <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
        <p className="text-3xl font-semibold text-gray-900">{formatValue(val)}</p>
      </div>
    );
  }

  if (type === 'chart') {
    const xField = xAxis || 'industry';
    const groupedData = data.reduce((acc, curr) => {
      const key = String(curr[xField] || 'Unknown');
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {} as Record<string, any[]>);

    const chartData = Object.keys(groupedData).map(key => ({
      name: key,
      value: calculateValue(groupedData[key]),
    }));

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 col-span-1 lg:col-span-2">
        <h3 className="text-sm font-medium text-gray-500 mb-4">{title}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <RechartsPieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BI_COLORS[index % BI_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatValue(Number(value))} />
                <Legend />
              </RechartsPieChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                <Tooltip formatter={(value: any) => formatValue(Number(value))} cursor={{ fill: '#f3f4f6' }} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                <Tooltip formatter={(value: any) => formatValue(Number(value))} cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === 'pivot') {
    const rowField = rows?.[0] || 'industry';
    const colField = columns?.[0] || '';
    const rowKeys = Array.from(new Set(data.map(d => String(d[rowField] || 'Unknown'))));
    const colKeys = colField ? Array.from(new Set(data.map(d => String(d[colField] || 'Unknown')))) : ['Total'];

    const pivotData: Record<string, Record<string, any[]>> = {};
    rowKeys.forEach(r => {
      pivotData[r] = {};
      colKeys.forEach(c => {
        pivotData[r][c] = [];
      });
    });

    data.forEach(d => {
      const rKey = String(d[rowField] || 'Unknown');
      const cKey = colField ? String(d[colField] || 'Unknown') : 'Total';
      if (pivotData[rKey] && pivotData[rKey][cKey]) {
        pivotData[rKey][cKey].push(d);
      }
    });

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden col-span-1 md:col-span-2 lg:col-span-3">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  {rowField.replace(/([A-Z])/g, ' $1').trim()} {colField ? `\\ ${colField.replace(/([A-Z])/g, ' $1').trim()}` : ''}
                </th>
                {colKeys.map(c => (
                  <th key={c} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rowKeys.map(r => (
                <tr key={r} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                    {r}
                  </td>
                  {colKeys.map(c => {
                    const cellData = pivotData[r][c];
                    const val = cellData.length > 0 ? calculateValue(cellData) : null;
                    return (
                      <td key={c} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {val !== null ? formatValue(val) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}

export function BIView({ data, settings }: { data: any[]; settings: BISettings | null }) {
  const widgets = settings?.widgets?.length ? settings.widgets : defaultBIWidgets;

  return (
    <div className="p-6 h-full overflow-auto bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map(w => <BIWidgetRenderer key={w.id} widget={w} data={data} />)}
      </div>
    </div>
  );
}
