'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button, Input, SelectInput, Icon } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useReportDefinitions, useCreateTemplate, useUpdateTemplate, useReportTemplate } from '../hooks/useReports';
import { ReportDesignerToolbox } from './ReportDesignerToolbox';
import { ReportDesignerSection } from './ReportDesignerSection';
import { ReportSectionConfig } from './ReportSectionConfig';
import { ReportPreviewRenderer } from './ReportPreviewRenderer';
import { DataFieldPicker } from './DataFieldPicker';
import { DataSourceConfig } from './DataSourceConfig';
import { generateSectionId } from '../utils/report-helpers';
import type { DataField } from '../utils/report-fields';
import type {
  TemplateSection, SectionType, TemplateLayout, TemplateDataSource,
  HeadingSection, TextSection, DividerSection, SpacerSection,
  KpiRowSection, ChartSection, TableSection, ComparisonSection,
  DataFieldSection, FormulaSection, ImageSection, GroupHeaderSection, SummaryRowSection,
} from '../types/report.types';

// ── Default section factories ────────────────────────────────────────

function createSection(type: SectionType, extra?: Partial<TemplateSection>): TemplateSection {
  const id = generateSectionId();
  const base = { id, ...extra };
  switch (type) {
    case 'heading':
      return { ...base, type: 'heading', level: 1, text: 'Report Title' } as HeadingSection;
    case 'text':
      return { ...base, type: 'text', content: '' } as TextSection;
    case 'divider':
      return { ...base, type: 'divider' } as DividerSection;
    case 'spacer':
      return { ...base, type: 'spacer', height: 24 } as SpacerSection;
    case 'kpi-row':
      return { ...base, type: 'kpi-row', columns: 4 } as KpiRowSection;
    case 'chart':
      return { ...base, type: 'chart', chartIndex: 0, height: 320 } as ChartSection;
    case 'table':
      return { ...base, type: 'table', tableIndex: 0, pageSize: 25 } as TableSection;
    case 'comparison':
      return { ...base, type: 'comparison' } as ComparisonSection;
    case 'data-field':
      return { ...base, type: 'data-field', entityKey: '', fieldKey: '' } as DataFieldSection;
    case 'formula':
      return { ...base, type: 'formula', label: 'Calculated Field', expression: '' } as FormulaSection;
    case 'image':
      return { ...base, type: 'image', src: '', align: 'left' } as ImageSection;
    case 'group-header':
      return { ...base, type: 'group-header', entityKey: '', groupByField: '' } as GroupHeaderSection;
    case 'summary-row':
      return { ...base, type: 'summary-row', fields: [] } as SummaryRowSection;
    default:
      return { ...base, type: 'divider' } as DividerSection;
  }
}

// ── Left panel tabs ──────────────────────────────────────────────────

type LeftTab = 'fields' | 'components' | 'data-source';

// ── Props ────────────────────────────────────────────────────────────

interface ReportDesignerProps {
  templateId?: string;
}

// ── Component ────────────────────────────────────────────────────────

export function ReportDesigner({ templateId }: ReportDesignerProps) {
  const router = useRouter();
  const isEdit = !!templateId;

  // Data
  const { data: templateData } = useReportTemplate(templateId ?? '');
  const { data: defsData } = useReportDefinitions();
  const createMut = useCreateTemplate();
  const updateMut = useUpdateTemplate();

  const template = templateData?.data;
  const definitions = defsData?.data ?? [];

  // State
  const [name, setName] = useState(template?.name ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [reportCode, setReportCode] = useState(template?.reportDef?.code ?? '');
  const [leftTab, setLeftTab] = useState<LeftTab>('fields');
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>(
    (template?.layout as TemplateLayout)?.dataSource?.entityKey,
  );
  const [dataSource, setDataSource] = useState<TemplateDataSource>(
    () => (template?.layout as TemplateLayout)?.dataSource ?? { entityKey: 'leads' },
  );
  const [sections, setSections] = useState<TemplateSection[]>(
    () => (template?.layout as TemplateLayout)?.sections ?? [],
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [canvasMode, setCanvasMode] = useState<'design' | 'preview'>('design');

  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null;

  // Report code options
  const reportOptions = [
    { label: 'Custom (No linked report)', value: '' },
    ...definitions.map((d) => ({ label: `${d.name} (${d.code})`, value: d.code })),
  ];

  // ── Section handlers ───────────────────────────────────────────────

  const handleAddSection = useCallback((type: SectionType) => {
    const section = createSection(type);
    setSections((prev) => [...prev, section]);
    setSelectedSectionId(section.id);
  }, []);

  const handleDeleteSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (selectedSectionId === id) setSelectedSectionId(null);
  }, [selectedSectionId]);

  const handleMoveUp = useCallback((id: string) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((id: string) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const handleUpdateSection = useCallback((updated: TemplateSection) => {
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);

  // ── Data field handlers ────────────────────────────────────────────

  const handleAddField = useCallback((entityKey: string, field: DataField) => {
    const id = generateSectionId();
    const section: DataFieldSection = {
      id,
      type: 'data-field',
      entityKey,
      fieldKey: field.key,
      label: field.label,
      aggregation: field.aggregations?.[0],
    };
    setSections((prev) => [...prev, section]);
    setSelectedSectionId(id);
  }, []);

  const handleAddTable = useCallback((entityKey: string, fields: DataField[]) => {
    const id = generateSectionId();
    const section: TableSection = {
      id,
      type: 'table',
      entityKey,
      selectedFields: fields.map((f) => f.key),
      pageSize: 25,
    };
    setSections((prev) => [...prev, section]);
    setSelectedSectionId(id);
  }, []);

  const handleAddChart = useCallback(
    (entityKey: string, measureField: DataField, dimensionField: DataField) => {
      const id = generateSectionId();
      const section: ChartSection = {
        id,
        type: 'chart',
        entityKey,
        measureField: measureField.key,
        measureAggregation: measureField.aggregations?.[0] ?? 'SUM',
        dimensionField: dimensionField.key,
        overrideChartType: 'BAR',
        height: 320,
      };
      setSections((prev) => [...prev, section]);
      setSelectedSectionId(id);
    },
    [],
  );

  // ── Save handler ───────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }

    const layout: TemplateLayout = { sections, dataSource };

    try {
      if (isEdit && templateId) {
        await updateMut.mutateAsync({
          id: templateId,
          payload: { name, description, layout },
        });
        toast.success('Template updated');
      } else {
        await createMut.mutateAsync({
          name,
          description,
          reportCode: reportCode || undefined,
          layout,
        });
        toast.success('Template created');
        router.push('/reports');
      }
    } catch {
      toast.error('Failed to save template');
    }
  }, [name, description, reportCode, sections, dataSource, isEdit, templateId, createMut, updateMut, router]);

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/reports')} className="p-1.5 rounded hover:bg-gray-100">
            <Icon name="arrow-left" size={18} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-800">
              {isEdit ? 'Edit Report Template' : 'Report Designer'}
            </h1>
            <p className="text-[11px] text-gray-500">Design your report layout with data fields and visualizations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-xs text-gray-500">{sections.length} sections</span>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs text-gray-500">{dataSource.entityKey}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/reports')}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={createMut.isPending || updateMut.isPending}
          >
            <Icon name="save" size={14} className="mr-1" />
            {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      {/* Template metadata bar */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-4">
        <div className="flex-1">
          <Input
            label="Template Name"
            value={name}
            onChange={setName}
            leftIcon={<Icon name="file-text" size={14} />}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Description"
            value={description}
            onChange={setDescription}
            leftIcon={<Icon name="align-left" size={14} />}
          />
        </div>
        <div className="w-72">
          <SelectInput
            label="Linked Report"
            options={reportOptions}
            value={reportCode}
            onChange={(v) => setReportCode(String(v ?? ''))}
          />
        </div>
      </div>

      {/* Main designer area */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel — Tabs: Data Fields / Components / Data Source */}
        <div className="w-72 border-r border-gray-200 bg-white flex flex-col">
          {/* Tab headers */}
          <div className="flex border-b border-gray-200">
            {([
              { key: 'fields', label: 'Data Fields', icon: 'database' },
              { key: 'components', label: 'Components', icon: 'layout' },
              { key: 'data-source', label: 'Config', icon: 'settings' },
            ] as { key: LeftTab; label: string; icon: string }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setLeftTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium border-b-2 transition-colors ${
                  leftTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon name={tab.icon as any} size={13} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {leftTab === 'fields' && (
              <DataFieldPicker
                selectedEntity={selectedEntity ?? dataSource.entityKey}
                onSelectEntity={(key) => {
                  setSelectedEntity(key);
                  setDataSource((ds) => ({ ...ds, entityKey: key }));
                }}
                onAddField={handleAddField}
                onAddTable={handleAddTable}
                onAddChart={handleAddChart}
              />
            )}

            {leftTab === 'components' && (
              <ReportDesignerToolbox onAddSection={handleAddSection} />
            )}

            {leftTab === 'data-source' && (
              <div className="overflow-y-auto h-full p-4">
                <DataSourceConfig
                  dataSource={dataSource}
                  onChange={setDataSource}
                />
              </div>
            )}
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-100 to-gray-50">
          {/* Canvas ruler bar */}
          <div className="sticky top-0 z-10 px-6 py-1.5 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Design / Preview toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setCanvasMode('design')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    canvasMode === 'design'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon name="edit" size={12} />
                  Design
                </button>
                <button
                  onClick={() => setCanvasMode('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    canvasMode === 'preview'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon name="eye" size={12} />
                  Preview
                </button>
              </div>
            </div>
            {canvasMode === 'design' && (
              <div className="flex items-center gap-2">
                <button onClick={() => handleAddSection('heading')} className="text-[11px] text-blue-500 hover:text-blue-700">+ Heading</button>
                <button onClick={() => handleAddSection('table')} className="text-[11px] text-blue-500 hover:text-blue-700">+ Table</button>
                <button onClick={() => handleAddSection('chart')} className="text-[11px] text-blue-500 hover:text-blue-700">+ Chart</button>
              </div>
            )}
            {canvasMode === 'preview' && (
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Icon name="info" size={12} />
                Sample data preview
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {/* Report paper */}
              <div className={`bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] ${
                canvasMode === 'preview' ? 'shadow-md' : ''
              }`}>
                {sections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Icon name="layout" size={28} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">Empty Report</p>
                    <p className="text-gray-400 text-sm mb-4">
                      Add data fields from the left panel or click components to build your layout
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleAddSection('heading');
                          handleAddSection('kpi-row');
                          handleAddSection('chart');
                          handleAddSection('table');
                        }}
                      >
                        <Icon name="zap" size={14} className="mr-1" />
                        Quick Start Template
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLeftTab('fields')}
                      >
                        <Icon name="database" size={14} className="mr-1" />
                        Browse Data Fields
                      </Button>
                    </div>
                  </div>
                ) : canvasMode === 'preview' ? (
                  <div className="p-6">
                    <ReportPreviewRenderer sections={sections} dataSource={dataSource} />
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {sections.map((section, idx) => (
                      <ReportDesignerSection
                        key={section.id}
                        section={section}
                        isSelected={selectedSectionId === section.id}
                        onSelect={() => setSelectedSectionId(section.id)}
                        onDelete={() => handleDeleteSection(section.id)}
                        onMoveUp={() => handleMoveUp(section.id)}
                        onMoveDown={() => handleMoveDown(section.id)}
                        isFirst={idx === 0}
                        isLast={idx === sections.length - 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Config panel */}
        {selectedSection && (
          <ReportSectionConfig
            section={selectedSection}
            chartCount={5}
            tableCount={5}
            onUpdate={handleUpdateSection}
            onClose={() => setSelectedSectionId(null)}
          />
        )}
      </div>
    </div>
  );
}
