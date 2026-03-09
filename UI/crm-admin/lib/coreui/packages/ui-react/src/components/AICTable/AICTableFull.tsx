import React, { useState, useEffect, forwardRef } from 'react';
import {
  Search, Filter, ArrowUpDown, ShieldAlert, ChevronDown, ChevronLeft, ChevronRight,
  Columns, Settings, RefreshCw,
  Table as TableIcon, List, LayoutGrid, Calendar, Map, BarChart3,
  Clock, PieChart, Network, KanbanSquare,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import type {
  AICTableFullViewMode, AICTableFullDensity, AICTableFullProps,
  ColumnDef, KanbanSettings, TreeSettings, CalendarSettings, ChartSettings, BISettings, ValidationRule,
  FilterValues,
} from './types';
import { defaultColumns, defaultBIWidgets } from './constants';

import { TableView } from './views/TableView';
import { ListView } from './views/ListView';
import { CardView } from './views/CardView';
import { CalendarView } from './views/CalendarView';
import { MapView } from './views/MapView';
import { BIView } from './views/BIView';
import { TimelineView } from './views/TimelineView';
import { ChartView } from './views/ChartView';
import { TreeView } from './views/TreeView';
import { KanbanView } from './views/KanbanView';

import { ViewToggleButton } from './toolbar/ViewToggleButton';
import { DensityMenu } from './toolbar/DensityMenu';
import { ColumnSettingsMenu } from './toolbar/ColumnSettingsMenu';

import { FilterSidebar } from './sidebar/FilterSidebar';

import { KanbanSettingsModal } from './modals/KanbanSettingsModal';
import { TreeSettingsModal } from './modals/TreeSettingsModal';
import { ChartSettingsModal } from './modals/ChartSettingsModal';
import { BISettingsModal } from './modals/BISettingsModal';
import { CalendarSettingsModal } from './modals/CalendarSettingsModal';
import { ValidationSettingsModal } from './modals/ValidationSettingsModal';

export const AICTableFull = forwardRef<HTMLDivElement, AICTableFullProps>(function AICTableFull(
  {
    data,
    title = 'Contacts',
    className = '',
    defaultViewMode = 'table',
    defaultDensity = 'comfortable',
    columns: columnsProp,
    onRowEdit,
    onRowDelete,
    onRowCopy,
    onRowArchive,
    onCreate,
    filterConfig,
    onFilterChange,
    onFilterClear,
    activeFilters,
    selectedIds,
    onSelectionChange,
    headerActions,
    kanbanCategoryOptions,
    defaultCalendarSettings,
  },
  ref,
) {
  const [viewMode, setViewMode] = useState<AICTableFullViewMode>(defaultViewMode);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [density, setDensity] = useState<AICTableFullDensity>(defaultDensity);
  const [densityMenuOpen, setDensityMenuOpen] = useState(false);

  const [kanbanSettings, setKanbanSettings] = useState<KanbanSettings | null>(null);
  const [isKanbanModalOpen, setIsKanbanModalOpen] = useState(false);
  const [treeSettings, setTreeSettings] = useState<TreeSettings | null>(null);
  const [isTreeModalOpen, setIsTreeModalOpen] = useState(false);
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings | null>(defaultCalendarSettings ?? null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [chartSettings, setChartSettings] = useState<ChartSettings | null>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [biSettings, setBiSettings] = useState<BISettings | null>(null);
  const [isBiModalOpen, setIsBiModalOpen] = useState(false);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [columns, setColumns] = useState<ColumnDef[]>(columnsProp || defaultColumns);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [fillBlankRows, setFillBlankRows] = useState(false);
  const [paginationMode, setPaginationMode] = useState<'infinite' | 'paginated'>('paginated');
  const [globalSearch, setGlobalSearch] = useState('');
  const [filterValues, setFilterValues] = useState<FilterValues>(activeFilters ?? {});

  // Sync local draft when parent clears/resets activeFilters
  useEffect(() => {
    if (activeFilters) {
      setFilterValues(activeFilters);
    }
  }, [activeFilters]);

  // Auto-open kanban settings when switching to kanban mode with no config
  useEffect(() => {
    if (viewMode === 'kanban' && !kanbanSettings) {
      setIsKanbanModalOpen(true);
    }
  }, [viewMode, kanbanSettings]);

  // Auto-open tree settings when switching to tree mode with no config
  useEffect(() => {
    if (viewMode === 'tree' && !treeSettings) {
      setIsTreeModalOpen(true);
    }
  }, [viewMode, treeSettings]);

  // Auto-open calendar settings when switching to calendar mode with no config
  useEffect(() => {
    if (viewMode === 'calendar' && !calendarSettings) {
      setIsCalendarModalOpen(true);
    }
  }, [viewMode, calendarSettings]);

  const filteredData = globalSearch
    ? data.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(globalSearch.toLowerCase()),
        ),
      )
    : data;

  const renderView = () => {
    switch (viewMode) {
      case 'table':
        return (
          <TableView
            data={filteredData}
            density={density}
            validationRules={validationRules}
            showOnlyErrors={showOnlyErrors}
            columns={columns}
            setColumns={setColumns}
            fillBlankRows={fillBlankRows}
            paginationMode={paginationMode}
            onRowEdit={onRowEdit}
            onRowDelete={onRowDelete}
            onRowCopy={onRowCopy}
            onRowArchive={onRowArchive}
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
          />
        );
      case 'list':
        return <ListView data={filteredData} />;
      case 'card':
        return <CardView data={filteredData} />;
      case 'calendar':
        return <CalendarView data={filteredData} settings={calendarSettings} columns={columns} onRowEdit={onRowEdit} />;
      case 'map':
        return <MapView data={filteredData} />;
      case 'bi':
        return <BIView data={filteredData} settings={biSettings} />;
      case 'timeline':
        return <TimelineView data={filteredData} />;
      case 'chart':
        return <ChartView data={filteredData} settings={chartSettings} />;
      case 'tree':
        return <TreeView data={filteredData} settings={treeSettings} columns={columns} />;
      case 'kanban':
        return <KanbanView data={filteredData} settings={kanbanSettings} onCreate={onCreate} categoryOptions={kanbanCategoryOptions} title={title} />;
      default:
        return <TableView data={filteredData} density={density} validationRules={validationRules} showOnlyErrors={showOnlyErrors} columns={columns} />;
    }
  };

  return (
    <div ref={ref} className={`flex flex-col h-full bg-white text-gray-800 font-sans ${className}`}>
      {/* Toolbar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm z-40 relative">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <div className="h-5 w-px bg-gray-300" />
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Global Search..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center px-2.5 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            title="Filter"
          >
            <Filter size={14} />
          </button>

          <button
            className="flex items-center px-2.5 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            title="Sort"
          >
            <ArrowUpDown size={14} />
          </button>

          <button
            onClick={() => setIsValidationModalOpen(true)}
            className={`flex items-center px-2.5 py-1.5 text-sm font-medium rounded-md border ${validationRules.length > 0 ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'}`}
            title="Validate Data"
          >
            <ShieldAlert size={14} className={validationRules.length > 0 ? 'mr-1.5' : ''} />
            {validationRules.length > 0 && <span>({validationRules.length})</span>}
          </button>

          {validationRules.length > 0 && (
            <label className="flex items-center space-x-1.5 text-sm text-gray-700 ml-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyErrors}
                onChange={(e) => setShowOnlyErrors(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className="whitespace-nowrap">Errors Only</span>
            </label>
          )}

          <div className="h-5 w-px bg-gray-300 mx-1" />

          {/* View Mode Toggles */}
          <div className="flex items-center space-x-0.5 bg-gray-100 p-0.5 rounded-md border border-gray-200">
            <ViewToggleButton icon={<TableIcon size={14} />} mode="table" currentMode={viewMode} setMode={setViewMode} title="Table View" />
            <ViewToggleButton icon={<List size={14} />} mode="list" currentMode={viewMode} setMode={setViewMode} title="List View" />
            <ViewToggleButton icon={<LayoutGrid size={14} />} mode="card" currentMode={viewMode} setMode={setViewMode} title="Card View" />
            <ViewToggleButton icon={<Calendar size={14} />} mode="calendar" currentMode={viewMode} setMode={setViewMode} title="Calendar View" />
            <ViewToggleButton icon={<Map size={14} />} mode="map" currentMode={viewMode} setMode={setViewMode} title="Map View" />
            <ViewToggleButton icon={<BarChart3 size={14} />} mode="bi" currentMode={viewMode} setMode={setViewMode} title="BI Dashboard" />
            <ViewToggleButton icon={<Clock size={14} />} mode="timeline" currentMode={viewMode} setMode={setViewMode} title="Timeline View" />
            <ViewToggleButton icon={<PieChart size={14} />} mode="chart" currentMode={viewMode} setMode={setViewMode} title="Chart View" />
            <ViewToggleButton icon={<Network size={14} />} mode="tree" currentMode={viewMode} setMode={setViewMode} title="Tree View" />
            <ViewToggleButton
              icon={<KanbanSquare size={14} />}
              mode="kanban"
              currentMode={viewMode}
              setMode={(m) => {
                if (m === 'kanban' && viewMode === 'kanban') {
                  // Already on kanban — re-open settings
                  setIsKanbanModalOpen(true);
                } else {
                  setViewMode(m);
                  // useEffect handles auto-open when no settings yet
                }
              }}
              title="Kanban View"
            />
          </div>

          {viewMode === 'table' && (
            <div className="relative ml-1">
              <button
                onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md border border-gray-300 flex items-center"
                title="Show/Hide Columns"
              >
                <Columns size={14} />
              </button>
              {isColumnMenuOpen && (
                <ColumnSettingsMenu columns={columns} setColumns={setColumns} onClose={() => setIsColumnMenuOpen(false)} />
              )}
            </div>
          )}

          {viewMode === 'calendar' && (
            <button onClick={() => setIsCalendarModalOpen(true)} className="ml-1 p-1.5 text-gray-500 hover:bg-gray-100 rounded-md border border-gray-300 flex items-center" title="Calendar Settings">
              <Settings size={14} />
            </button>
          )}
          {viewMode === 'chart' && (
            <button onClick={() => setIsChartModalOpen(true)} className="ml-1 p-1.5 text-gray-500 hover:bg-gray-100 rounded-md border border-gray-300 flex items-center" title="Chart Settings">
              <Settings size={14} />
            </button>
          )}
          {viewMode === 'bi' && (
            <button onClick={() => setIsBiModalOpen(true)} className="ml-1 p-1.5 text-gray-500 hover:bg-gray-100 rounded-md border border-gray-300 flex items-center" title="BI Settings">
              <Settings size={14} />
            </button>
          )}
          {viewMode === 'kanban' && (
            <button onClick={() => setIsKanbanModalOpen(true)} className="ml-1 p-1.5 text-gray-500 hover:bg-gray-100 rounded-md border border-gray-300 flex items-center" title="Kanban Settings">
              <Settings size={14} />
            </button>
          )}
          {viewMode === 'tree' && (
            <button onClick={() => setIsTreeModalOpen(true)} className="ml-1 p-1.5 text-gray-500 hover:bg-gray-100 rounded-md border border-gray-300 flex items-center" title="Tree Settings">
              <Settings size={14} />
            </button>
          )}

          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md ml-1">
            <RefreshCw size={14} />
          </button>

          <DensityMenu
            density={density}
            setDensity={setDensity}
            paginationMode={paginationMode}
            setPaginationMode={setPaginationMode}
            fillBlankRows={fillBlankRows}
            setFillBlankRows={setFillBlankRows}
            isOpen={densityMenuOpen}
            setIsOpen={setDensityMenuOpen}
          />

          <div className="h-5 w-px bg-gray-300 mx-1" />

          <div className="flex rounded-md shadow-sm">
            <button onClick={onCreate} className="px-3 py-1.5 text-sm font-medium text-white bg-[#f26b3a] border border-transparent rounded-l-md hover:bg-[#e05a29] whitespace-nowrap">
              Create {title?.replace(/s$/, '') || 'Record'}
            </button>
            <button className="px-2 py-1.5 text-white bg-[#f26b3a] border-l border-[#d95322] rounded-r-md hover:bg-[#e05a29]">
              <ChevronDown size={14} />
            </button>
          </div>
          {headerActions}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden bg-gray-100">
        <FilterSidebar
          isOpen={sidebarOpen}
          filterConfig={filterConfig}
          values={filterValues}
          onChange={(vals) => setFilterValues(vals)}
          onApply={(vals) => {
            setFilterValues(vals);
            onFilterChange?.(vals);
          }}
          onClear={() => {
            setFilterValues({});
            onFilterClear?.();
          }}
          onCreate={onCreate}
          title={`Filter ${title} by`}
        />

        <div className="flex-1 overflow-hidden bg-white m-4 border border-gray-200 rounded-md shadow-sm flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                <div className="flex-1 min-h-0 overflow-auto">{renderView()}</div>
              </motion.div>
            </AnimatePresence>
          </div>

          {viewMode !== 'table' && (
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
              <div>Total Records <span className="font-semibold text-gray-900">{filteredData.length}</span></div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
                  <span className="font-medium text-gray-900">1 to {filteredData.length}</span>
                  <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modals */}
      <KanbanSettingsModal
        isOpen={isKanbanModalOpen}
        onClose={() => { setIsKanbanModalOpen(false); if (!kanbanSettings) setViewMode(defaultViewMode); }}
        onSave={(settings) => { setKanbanSettings(settings); setIsKanbanModalOpen(false); setViewMode('kanban'); }}
        data={data}
        categoryOptions={kanbanCategoryOptions}
      />
      <TreeSettingsModal
        isOpen={isTreeModalOpen}
        onClose={() => { setIsTreeModalOpen(false); if (!treeSettings) setViewMode(defaultViewMode); }}
        onSave={(settings) => { setTreeSettings(settings); setIsTreeModalOpen(false); setViewMode('tree'); }}
        data={data}
        columns={columns}
      />
      <CalendarSettingsModal
        isOpen={isCalendarModalOpen}
        onClose={() => { setIsCalendarModalOpen(false); if (!calendarSettings) setViewMode(defaultViewMode); }}
        onSave={(settings) => { setCalendarSettings(settings); setIsCalendarModalOpen(false); setViewMode('calendar'); }}
        data={data}
        columns={columns}
      />
      <ChartSettingsModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        onSave={(settings) => { setChartSettings(settings); setIsChartModalOpen(false); setViewMode('chart'); }}
        data={data}
      />
      <BISettingsModal
        isOpen={isBiModalOpen}
        onClose={() => setIsBiModalOpen(false)}
        onSave={(widget) => {
          setBiSettings(prev => {
            const existingWidgets = prev?.widgets?.length ? prev.widgets : defaultBIWidgets;
            return { widgets: [...existingWidgets, widget] };
          });
          setIsBiModalOpen(false);
          setViewMode('bi');
        }}
        data={data}
      />
      <ValidationSettingsModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        rules={validationRules}
        onSave={(rules) => { setValidationRules(rules); setIsValidationModalOpen(false); }}
        data={data}
      />
    </div>
  );
});
