import { useState, useMemo } from 'react';
import { Search, Plus, HelpCircle } from 'lucide-react';
import type { TreeSettings, ColumnDef } from '../types';

export function TreeSettingsModal({
  isOpen,
  onClose,
  onSave,
  data,
  columns,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: TreeSettings) => void;
  data: any[];
  columns?: ColumnDef[];
}) {
  const [name, setName] = useState('Tree View Name');
  const [searchTerm, setSearchTerm] = useState('');

  // Build label map from columns for friendly display names
  const labelMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (columns) {
      columns.forEach(c => { map[c.id] = c.label; });
    }
    return map;
  }, [columns]);

  const getLabel = (fieldId: string) =>
    labelMap[fieldId] || fieldId.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  // Derive fields from columns (preferred) or data keys (fallback)
  const allFields = useMemo(() => {
    if (columns && columns.length > 0) {
      return columns.map(c => c.id).filter(f => f !== 'id');
    }
    return Array.from(new Set(data.flatMap(item => Object.keys(item)))).filter(f => f !== 'id');
  }, [columns, data]);

  // First field is the mandatory primary display field
  const primaryField = allFields[0] || 'name';

  const [availableLevels, setAvailableLevels] = useState<string[]>(allFields);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  const [availableFields, setAvailableFields] = useState<string[]>(allFields.filter(f => f !== primaryField));
  const [selectedFields, setSelectedFields] = useState<string[]>([primaryField]);

  const handleMoveToSelectedLevel = (field: string) => {
    setAvailableLevels(prev => prev.filter(f => f !== field));
    setSelectedLevels(prev => [...prev, field]);
  };

  const handleMoveToAvailableLevel = (field: string) => {
    setSelectedLevels(prev => prev.filter(f => f !== field));
    setAvailableLevels(prev => [...prev, field].sort((a, b) => allFields.indexOf(a) - allFields.indexOf(b)));
  };

  const handleMoveToSelectedField = (field: string) => {
    setAvailableFields(prev => prev.filter(f => f !== field));
    setSelectedFields(prev => [...prev, field]);
  };

  const handleMoveToAvailableField = (field: string) => {
    if (field === primaryField) return;
    setSelectedFields(prev => prev.filter(f => f !== field));
    setAvailableFields(prev => [...prev, field].sort((a, b) => allFields.indexOf(a) - allFields.indexOf(b)));
  };

  const filteredAvailableLevels = availableLevels.filter(f =>
    getLabel(f).toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredAvailableFields = availableFields.filter(f =>
    getLabel(f).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [activeTab, setActiveTab] = useState<'levels' | 'fields'>('levels');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-[700px] max-w-full flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Tree View - Settings</h2>
          <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
            <HelpCircle size={16} className="mr-1" /> Help
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center mb-6">
            <label className="w-40 text-sm text-gray-600 text-right pr-4">Tree View Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('levels')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'levels' ? 'border-[#d95322] text-[#d95322]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Grouping Levels
              </button>
              <button
                onClick={() => setActiveTab('fields')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'fields' ? 'border-[#d95322] text-[#d95322]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Display Fields
              </button>
            </nav>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="text-sm text-gray-600 mb-1 block">Available</label>
              <div className="border border-gray-300 rounded-md h-64 flex flex-col">
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-7 pr-2 py-1 text-sm border-none focus:outline-none"
                      placeholder="Search fields..."
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1">
                  {(activeTab === 'levels' ? filteredAvailableLevels : filteredAvailableFields).map(field => (
                    <div
                      key={field}
                      onClick={() => activeTab === 'levels' ? handleMoveToSelectedLevel(field) : handleMoveToSelectedField(field)}
                      className="px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded flex justify-between items-center group"
                    >
                      {getLabel(field)}
                      <Plus size={14} className="opacity-0 group-hover:opacity-100 text-blue-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600 mb-1 block">Selected {activeTab === 'levels' ? '(Order matters)' : ''}</label>
              <div className="border border-gray-300 rounded-md h-64 p-2 overflow-y-auto">
                {(activeTab === 'levels' ? selectedLevels : selectedFields).map((field, idx) => (
                  <div
                    key={field}
                    onClick={() => {
                      if (activeTab === 'levels') handleMoveToAvailableLevel(field);
                      else handleMoveToAvailableField(field);
                    }}
                    className={`px-2 py-1.5 text-sm text-gray-700 rounded flex justify-between items-center group ${activeTab === 'fields' && field === primaryField ? '' : 'hover:bg-gray-100 cursor-pointer'}`}
                  >
                    <div className="flex items-center">
                      {activeTab === 'levels' && <span className="text-gray-400 mr-2 text-xs">{idx + 1}.</span>}
                      <span>
                        {getLabel(field)}
                        {activeTab === 'fields' && field === primaryField && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </div>
                    {!(activeTab === 'fields' && field === primaryField) && <span className="opacity-0 group-hover:opacity-100 text-red-500 text-xs">Remove</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2 bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave({ name, levels: selectedLevels, selectedFields })} className="px-4 py-2 text-sm font-medium text-white bg-[#d95322] rounded-md hover:bg-[#c24a1e]">Save</button>
        </div>
      </div>
    </div>
  );
}
