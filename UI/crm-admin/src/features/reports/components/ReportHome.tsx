'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Badge, SelectInput, Icon } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useReportDefinitions, useExportHistory } from '../hooks/useReports';
import { ReportTemplateList } from './ReportTemplateList';
import { ReportBookmarkList } from './ReportBookmarkList';
import { ReportScheduleList } from './ReportScheduleList';
import { ReportScheduleForm } from './ReportScheduleForm';
import { getCategoryLabel, getCategoryColor, getCategoryIcon } from '../utils/report-helpers';
import { formatDate } from '@/lib/format-date';
import type { ReportDefinition, ExportHistoryItem, ReportCategory } from '../types/report.types';

// ── Constants ────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' },
  { label: 'Sales', value: 'SALES' },
  { label: 'Lead', value: 'LEAD' },
  { label: 'Contact & Org', value: 'CONTACT_ORG' },
  { label: 'Activity', value: 'ACTIVITY' },
  { label: 'Demo', value: 'DEMO' },
  { label: 'Quotation', value: 'QUOTATION' },
  { label: 'Tour Plan', value: 'TOUR_PLAN' },
  { label: 'Team', value: 'TEAM' },
  { label: 'Communication', value: 'COMMUNICATION' },
  { label: 'Executive', value: 'EXECUTIVE' },
  { label: 'Custom', value: 'CUSTOM' },
];

const TABS = [
  { key: 'catalog', label: 'All Reports', icon: 'bar-chart' },
  { key: 'templates', label: 'My Templates', icon: 'layout' },
  { key: 'bookmarks', label: 'Bookmarks', icon: 'bookmark' },
  { key: 'schedules', label: 'Schedules', icon: 'calendar' },
  { key: 'history', label: 'Export History', icon: 'download' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ── Component ────────────────────────────────────────────────────────

export function ReportHome() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('catalog');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const { data: defsData, isLoading } = useReportDefinitions(
    selectedCategory || undefined,
  );
  const { data: exportsData } = useExportHistory({ limit: 20 });

  const definitions: ReportDefinition[] = defsData?.data ?? [];
  const exports: ExportHistoryItem[] = exportsData?.data ?? [];

  // Group definitions by category
  const groupedDefs = definitions.reduce<Record<string, ReportDefinition[]>>(
    (acc, def) => {
      const cat = def.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(def);
      return acc;
    },
    {},
  );

  const handleRowClick = useCallback(
    (code: string) => {
      router.push(`/reports/${code}`);
    },
    [router],
  );

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Browse, generate, and manage MIS reports"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowScheduleForm(true)}
            >
              <Icon name="calendar" size={16} className="mr-1" />
              Schedule Report
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push('/reports/designer')}
            >
              <Icon name="layout" size={16} className="mr-1" />
              Design Template
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon name={tab.icon as any} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'catalog' && (
        <div>
          {/* Category filter */}
          <div className="mb-4" style={{ maxWidth: 300 }}>
            <SelectInput
              label="Category"
              options={CATEGORY_OPTIONS}
              value={selectedCategory}
              onChange={(v) => setSelectedCategory(String(v ?? ''))}
            />
          </div>

          {/* Report cards by category */}
          {Object.entries(groupedDefs).map(([category, defs]) => (
            <div key={category} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Icon name={getCategoryIcon(category) as any} size={18} className="text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">
                  {getCategoryLabel(category)}
                </h3>
                <Badge variant={getCategoryColor(category) as any} className="text-xs">
                  {defs.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {defs.map((def) => (
                  <div
                    key={def.id}
                    onClick={() => handleRowClick(def.code)}
                    className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                        {def.name}
                      </h4>
                      <Icon name="chevron-right" size={16} className="text-gray-300 group-hover:text-blue-500" />
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {def.description}
                    </p>
                    <div className="flex items-center gap-2">
                      {def.supportsDrillDown && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                          Drill-down
                        </span>
                      )}
                      {def.supportsPeriodComparison && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                          Comparison
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'templates' && <ReportTemplateList />}

      {activeTab === 'bookmarks' && <ReportBookmarkList />}

      {activeTab === 'schedules' && <ReportScheduleList />}

      {activeTab === 'history' && (
        <div>
          {exports.length === 0 ? (
            <EmptyState
              icon="download"
              title="No exports"
              description="Export a report to see it in history."
            />
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-600 text-xs uppercase">
                      Report
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-600 text-xs uppercase">
                      Format
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-600 text-xs uppercase">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-600 text-xs uppercase">
                      Records
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-600 text-xs uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exports.map((exp) => (
                    <tr key={exp.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-700">
                        {exp.reportName ?? exp.reportCode}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline">{exp.format}</Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge
                          variant={
                            exp.status === 'COMPLETED'
                              ? 'success'
                              : exp.status === 'FAILED'
                              ? 'danger'
                              : ('warning' as any)
                          }
                        >
                          {exp.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {exp.recordCount ?? '\u2014'}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {formatDate(exp.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Schedule form modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <ReportScheduleForm onClose={() => setShowScheduleForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
