'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { getChartColor, CHART_COLORS } from '../utils/report-helpers';
import type { ChartData, ChartType } from '../types/report.types';

interface ReportChartRendererProps {
  chart: ChartData;
  overrideType?: ChartType;
  height?: number;
}

export function ReportChartRenderer({
  chart,
  overrideType,
  height = 320,
}: ReportChartRendererProps) {
  const chartType = overrideType ?? chart.type;

  const data = useMemo(() => {
    return chart.labels.map((label, i) => {
      const point: Record<string, unknown> = { name: label };
      chart.datasets.forEach((ds) => {
        point[ds.label] = ds.data[i] ?? 0;
      });
      return point;
    });
  }, [chart]);

  const renderChart = () => {
    switch (chartType) {
      case 'BAR':
      case 'STACKED_BAR':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {chart.datasets.map((ds, i) => (
              <Bar
                key={ds.label}
                dataKey={ds.label}
                fill={ds.color ?? getChartColor(i)}
                stackId={chartType === 'STACKED_BAR' ? 'stack' : undefined}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'LINE':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {chart.datasets.map((ds, i) => (
              <Line
                key={ds.label}
                type="monotone"
                dataKey={ds.label}
                stroke={ds.color ?? getChartColor(i)}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        );

      case 'AREA':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {chart.datasets.map((ds, i) => (
              <Area
                key={ds.label}
                type="monotone"
                dataKey={ds.label}
                stroke={ds.color ?? getChartColor(i)}
                fill={ds.color ?? getChartColor(i)}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );

      case 'PIE':
      case 'DONUT': {
        const pieData = chart.labels.map((label, i) => ({
          name: label,
          value: chart.datasets[0]?.data[i] ?? 0,
        }));
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={chartType === 'DONUT' ? 60 : 0}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      }

      case 'FUNNEL': {
        const funnelData = chart.labels.map((label, i) => ({
          name: label,
          value: chart.datasets[0]?.data[i] ?? 0,
        }));
        const maxVal = Math.max(...funnelData.map((d) => d.value), 1);
        return (
          <div className="flex flex-col gap-2 px-4 py-2">
            {funnelData.map((item, i) => {
              const width = Math.max((item.value / maxVal) * 100, 20);
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="rounded py-2 px-3 text-white text-sm font-medium text-center"
                    style={{
                      width: `${width}%`,
                      backgroundColor: getChartColor(i),
                      minWidth: 80,
                    }}
                  >
                    {item.name}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {item.value.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }

      case 'HEATMAP':
      case 'TABLE':
      default:
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="p-2 text-left font-semibold text-gray-600">Label</th>
                  {chart.datasets.map((ds) => (
                    <th key={ds.label} className="p-2 text-right font-semibold text-gray-600">
                      {ds.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.labels.map((label, i) => (
                  <tr key={label} className="border-b border-gray-100">
                    <td className="p-2 text-gray-700">{label}</td>
                    {chart.datasets.map((ds) => (
                      <td key={ds.label} className="p-2 text-right text-gray-700">
                        {(ds.data[i] ?? 0).toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{chart.title}</h4>
      {chartType === 'FUNNEL' || chartType === 'HEATMAP' || chartType === 'TABLE' ? (
        renderChart()
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {renderChart() as any}
        </ResponsiveContainer>
      )}
    </div>
  );
}
