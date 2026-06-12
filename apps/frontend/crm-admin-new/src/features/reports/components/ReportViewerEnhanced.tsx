'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button, DatePicker, SelectInput, Badge, Icon } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import {
  useReportDefinition,
  useGenerateReport,
  useExportReport,
  useCreateBookmark,
} from '../hooks/useReports';
import { ReportMetricCard } from './ReportMetricCard';
import { ReportChartRenderer } from './ReportChartRenderer';
import { ReportTableRenderer } from './ReportTableRenderer';
import { getDateRange } from '@/features/dashboard/utils/date-range';
import { getCategoryLabel, getCategoryColor, formatMetricValue, getChangeColor } from '../utils/report-helpers';
import type { ReportData, ExportFormat, TemplateLayout, TemplateSection } from '../types/report.types';

// ── Constants ────────────────────────────────────────────────────────

const GROUP_BY_OPTIONS = [
  { label: 'None', value: '' },
  { label: 'User', value: 'user' },
  { label: 'Month', value: 'month' },
  { label: 'Source', value: 'source' },
  { label: 'Industry', value: 'industry' },
  { label: 'City', value: 'city' },
  { label: 'Product', value: 'product' },
];

const DATE_PRESET_OPTIONS = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'Custom', value: 'custom' },
];

// ── Props ────────────────────────────────────────────────────────────

interface ReportViewerEnhancedProps {
  reportCode: string;
  templateLayout?: TemplateLayout;
}

// ── Component ────────────────────────────────────────────────────────

export function ReportViewerEnhanced({ reportCode, templateLayout }: ReportViewerEnhancedProps) {
  const router = useRouter();

  // State
  const initialRange = useMemo(() => getDateRange('30d'), []);
  const [datePreset, setDatePreset] = useState('30d');
  const [dateFrom, setDateFrom] = useState(initialRange.dateFrom);
  const [dateTo, setDateTo] = useState(initialRange.dateTo);
  const [groupBy, setGroupBy] = useState('');
  const [comparePrevious, setComparePrevious] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Hooks
  const { data: defData, isLoading: defLoading } = useReportDefinition(reportCode);
  const generateMut = useGenerateReport();
  const exportMut = useExportReport();
  const bookmarkMut = useCreateBookmark();
  const definition = defData?.data;

  // Date preset handler
  const handlePresetChange = useCallback((preset: string | number | boolean | null) => {
    const p = String(preset ?? 'custom');
    setDatePreset(p);
    if (p !== 'custom') {
      const range = getDateRange(p);
      setDateFrom(range.dateFrom);
      setDateTo(range.dateTo);
    }
  }, []);

  // Generate
  const handleGenerate = useCallback(async () => {
    try {
      const result = await generateMut.mutateAsync({
        code: reportCode,
        params: {
          dateFrom,
          dateTo,
          groupBy: groupBy || undefined,
          comparePrevious,
        },
      });
      setReportData(result.data);
      toast.success('Report generated');
    } catch {
      toast.error('Failed to generate report');
    }
  }, [reportCode, dateFrom, dateTo, groupBy, comparePrevious, generateMut]);

  // Export
  const handleExport = useCallback(async (format: ExportFormat) => {
    try {
      await exportMut.mutateAsync({
        code: reportCode,
        params: { dateFrom, dateTo, groupBy: groupBy || undefined, format },
      });
      toast.success(`Export started (${format})`);
    } catch {
      toast.error('Export failed');
    }
  }, [reportCode, dateFrom, dateTo, groupBy, exportMut]);

  // Bookmark
  const handleBookmark = useCallback(async () => {
    try {
      await bookmarkMut.mutateAsync({
        reportCode,
        name: `${definition?.name ?? reportCode} - ${new Date().toLocaleDateString()}`,
        filters: { dateFrom, dateTo, groupBy },
      });
      toast.success('Bookmark saved');
    } catch {
      toast.error('Failed to save bookmark');
    }
  }, [reportCode, definition, dateFrom, dateTo, groupBy, bookmarkMut]);

  // Template-based section rendering
  const renderWithTemplate = (data: ReportData, layout: TemplateLayout) => {
    return layout.sections.map((section: TemplateSection) => {
      switch (section.type) {
        case 'heading': {
          const Tag = `h${section.level}` as keyof JSX.IntrinsicElements;
          const sizes = { 1: 'text-2xl font-bold', 2: 'text-xl font-semibold', 3: 'text-lg font-semibold' };
          return (
            <Tag key={section.id} className={`${sizes[section.level]} text-gray-800`} style={{ textAlign: section.align as any }}>
              {section.text}
            </Tag>
          );
        }
        case 'text':
          return <p key={section.id} className="text-gray-600">{section.content}</p>;
        case 'divider':
          return <hr key={section.id} className="border-gray-200" />;
        case 'spacer':
          return <div key={section.id} style={{ height: section.height }} />;
        case 'kpi-row': {
          const metrics = section.metricKeys?.length
            ? data.summary.filter((m) => section.metricKeys!.includes(m.key))
            : data.summary;
          const cols = section.columns ?? 4;
          return (
            <div key={section.id} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {metrics.map((m) => <ReportMetricCard key={m.key} metric={m} />)}
            </div>
          );
        }
        case 'chart': {
          const chart = data.charts[section.chartIndex ?? 0];
          if (!chart) return null;
          return (
            <ReportChartRenderer
              key={section.id}
              chart={chart}
              overrideType={section.overrideChartType}
              height={section.height}
            />
          );
        }
        case 'table': {
          const table = data.tables[section.tableIndex ?? 0];
          if (!table) return null;
          return (
            <ReportTableRenderer
              key={section.id}
              table={table}
              visibleColumns={section.visibleColumns}
              pageSize={section.pageSize}
            />
          );
        }
        case 'comparison': {
          if (!data.comparison) return null;
          const metrics = section.metricKeys?.length
            ? data.comparison.metrics.filter((m) => section.metricKeys!.includes(m.key))
            : data.comparison.metrics;
          return (
            <div key={section.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Period Comparison</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((m) => (
                  <div key={m.key} className="text-center">
                    <p className="text-xs text-gray-500">{m.label}</p>
                    <p className="text-lg font-bold">{formatMetricValue(m)}</p>
                    {m.changePercent != null && (
                      <p className={`text-sm ${getChangeColor(m.changeDirection)}`}>
                        {m.changePercent > 0 ? '+' : ''}{m.changePercent.toFixed(1)}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        default:
          return null;
      }
    });
  };

  // Default rendering (no template)
  const renderDefault = (data: ReportData) => (
    <div className="space-y-6">
      {/* Summary metrics */}
      {data.summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.summary.map((m) => <ReportMetricCard key={m.key} metric={m} />)}
        </div>
      )}

      {/* Charts */}
      {data.charts.length > 0 && (
        <div className={`grid gap-4 ${data.charts.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {data.charts.map((chart, i) => (
            <ReportChartRenderer key={i} chart={chart} />
          ))}
        </div>
      )}

      {/* Comparison */}
      {data.comparison && data.comparison.metrics.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Period Comparison</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.comparison.metrics.map((m) => (
              <div key={m.key} className="text-center">
                <p className="text-xs text-gray-500">{m.label}</p>
                <p className="text-lg font-bold">{formatMetricValue(m)}</p>
                {m.changePercent != null && (
                  <p className={`text-sm ${getChangeColor(m.changeDirection)}`}>
                    {m.changePercent > 0 ? '+' : ''}{m.changePercent.toFixed(1)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tables */}
      {data.tables.map((table, i) => (
        <ReportTableRenderer key={i} table={table} />
      ))}
    </div>
  );

  if (defLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title={definition?.name ?? 'Report'}
        subtitle={definition?.description}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={handleBookmark} disabled={bookmarkMut.isPending}>
              <Icon name="bookmark" size={16} className="mr-1" />
              Save
            </Button>
            {(['PDF', 'XLSX', 'CSV'] as ExportFormat[]).map((fmt) => (
              <Button
                key={fmt}
                size="sm"
                variant="outline"
                disabled={!reportData || exportMut.isPending}
                onClick={() => handleExport(fmt)}
              >
                {fmt}
              </Button>
            ))}
          </div>
        }
      />

      {/* Category badge */}
      {definition && (
        <div className="mb-4">
          <Badge variant={getCategoryColor(definition.category) as any}>
            {getCategoryLabel(definition.category)}
          </Badge>
          {definition.supportsDrillDown && (
            <Badge variant="outline" className="ml-2">Drill-Down</Badge>
          )}
          {definition.supportsPeriodComparison && (
            <Badge variant="outline" className="ml-2">Comparison</Badge>
          )}
        </div>
      )}

      {/* Filter bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <SelectInput
            label="Period"
            options={DATE_PRESET_OPTIONS}
            value={datePreset}
            onChange={handlePresetChange}
          />
          <DatePicker
            label="From"
            value={dateFrom}
            onChange={setDateFrom}
          />
          <DatePicker
            label="To"
            value={dateTo}
            onChange={setDateTo}
          />
          <SelectInput
            label="Group By"
            options={GROUP_BY_OPTIONS}
            value={groupBy}
            onChange={(v) => setGroupBy(String(v ?? ''))}
          />
          {definition?.supportsPeriodComparison && (
            <label className="flex items-center gap-2 text-sm pb-2">
              <input
                type="checkbox"
                checked={comparePrevious}
                onChange={(e) => setComparePrevious(e.target.checked)}
                className="rounded"
              />
              Compare Previous
            </label>
          )}
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={generateMut.isPending}
          >
            {generateMut.isPending ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {/* Results */}
      {generateMut.isPending ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : !reportData ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8">
          <EmptyState
            icon="bar-chart"
            title="Generate a report"
            description="Select a date range and click Generate to view results."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Generated at info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Generated: {new Date(reportData.generatedAt).toLocaleString()}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`/reports/designer?code=${reportCode}`)}
            >
              <Icon name="layout" size={14} className="mr-1" />
              Design Template
            </Button>
          </div>

          {/* Render with template or default */}
          {templateLayout
            ? renderWithTemplate(reportData, templateLayout)
            : renderDefault(reportData)}
        </div>
      )}
    </div>
  );
}
