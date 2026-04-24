import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import type { ChartSettings } from '../types';

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function ChartView({ data, settings }: { data: any[]; settings: ChartSettings | null }) {
  const xAxis = settings?.xAxis || 'contactOwner';
  const yAxis = settings?.yAxis || 'quotationValue';
  const aggregation = settings?.aggregation || 'sum';
  const chartType = settings?.chartType || 'bar';

  const groupedData = data.reduce((acc, curr) => {
    const key = String(curr[xAxis] || 'Unknown');
    if (!acc[key]) {
      acc[key] = { name: key, value: 0, count: 0 };
    }
    const val = Number(curr[yAxis]) || 0;
    if (aggregation === 'sum' || aggregation === 'average') {
      acc[key].value += val;
    }
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number; count: number }>);

  const chartData = Object.values(groupedData).map((item: any) => ({
    name: item.name,
    value: aggregation === 'average' ? (item.value / item.count) : (aggregation === 'count' ? item.count : item.value),
  }));

  return (
    <div className="p-6 h-full flex flex-col bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {aggregation.charAt(0).toUpperCase() + aggregation.slice(1)} of {yAxis.replace(/([A-Z])/g, ' $1').trim()} by {xAxis.replace(/([A-Z])/g, ' $1').trim()}
        </h2>
      </div>
      <div className="flex-1 min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
              <Bar dataKey="value" fill="#f26b3a" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          ) : chartType === 'pie' ? (
            <RechartsPieChart>
              <Pie data={chartData} cx="50%" cy="50%" outerRadius={150} dataKey="value" label>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Legend />
            </RechartsPieChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
              <Line type="monotone" dataKey="value" stroke="#f26b3a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
