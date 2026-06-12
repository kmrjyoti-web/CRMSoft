import { useState, useMemo } from 'react';
import { ChevronRight as ChevronRightIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { TreeSettings, ColumnDef } from '../types';

function TreeNodeComponent({
  data,
  levels,
  levelIndex,
  path,
  expandedNodes,
  toggleNode,
  selectedFields,
  getLabel,
  isRoot = false,
}: {
  data: any[];
  levels: string[];
  levelIndex: number;
  path: string;
  expandedNodes: Record<string, boolean>;
  toggleNode: (path: string) => void;
  selectedFields: string[];
  getLabel: (fieldId: string) => string;
  isRoot?: boolean;
}) {
  const isLeafLevel = levelIndex >= levels.length;

  if (isLeafLevel) {
    return (
      <div className="divide-y divide-gray-100 border-t border-gray-200 bg-white">
        {data.map((contact: any) => (
          <div key={contact.id} className="p-3 pl-10 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                {String(contact[selectedFields[0]] || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{contact[selectedFields[0]] || '-'}</p>
                <p className="text-xs text-gray-500">
                  {selectedFields.slice(1).map((f: string) => `${contact[f] || '-'}`).join(' \u2022 ')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const levelField = levels[levelIndex];
  const grouped = data.reduce((acc: any, curr: any) => {
    const key = String(curr[levelField] || 'Unknown');
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {});

  return (
    <div className={isRoot ? 'space-y-2' : 'p-2 space-y-2 bg-gray-50/50'}>
      {Object.entries(grouped).map(([key, items]) => {
        const currentPath = `${path}|${key}`;
        const isExpanded = expandedNodes[currentPath];
        const count = (items as any[]).length;

        return (
          <div key={currentPath} className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggleNode(currentPath)}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-2">
                <ChevronRightIcon
                  size={18}
                  className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
                <span className="font-medium text-gray-900">
                  {key} <span className="text-xs text-gray-400 font-normal ml-2">({getLabel(levelField)})</span>
                </span>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                {count} {count === 1 ? 'Item' : 'Items'}
              </span>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200"
                >
                  <TreeNodeComponent
                    data={items as any[]}
                    levels={levels}
                    levelIndex={levelIndex + 1}
                    path={currentPath}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    selectedFields={selectedFields}
                    getLabel={getLabel}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function TreeView({
  data,
  settings,
  columns,
}: {
  data: any[];
  settings: TreeSettings | null;
  columns?: ColumnDef[];
}) {
  // Build label lookup from columns
  const getLabel = useMemo(() => {
    const labelMap: Record<string, string> = {};
    if (columns) {
      columns.forEach(c => { labelMap[c.id] = c.label; });
    }
    return (fieldId: string) =>
      labelMap[fieldId] || fieldId.replace(/([A-Z])/g, ' $1').trim();
  }, [columns]);

  // Use settings if available, otherwise empty (modal will auto-open)
  const levels = settings?.levels?.length ? settings.levels : [];
  const selectedFields = settings?.selectedFields?.length
    ? settings.selectedFields
    : columns?.length ? [columns[0].id] : ['name'];

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (path: string) => {
    setExpandedNodes(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Show prompt when no levels configured
  if (levels.length === 0) {
    return (
      <div className="p-6 h-full overflow-auto bg-white flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">Configure Tree View</p>
          <p className="text-sm">Click the <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 rounded text-xs font-medium">⚙ Settings</span> button to select grouping levels and display fields.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{settings?.name || 'Tree View'}</h2>
        <TreeNodeComponent
          data={data}
          levels={levels}
          levelIndex={0}
          path="root"
          expandedNodes={expandedNodes}
          toggleNode={toggleNode}
          selectedFields={selectedFields}
          getLabel={getLabel}
          isRoot={true}
        />
      </div>
    </div>
  );
}
