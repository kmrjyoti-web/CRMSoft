import React, { useState } from 'react';
import { ShieldAlert, Plus, Trash2 } from 'lucide-react';
import type { ValidationRule } from '../types';

export function ValidationSettingsModal({
  isOpen,
  onClose,
  rules,
  onSave,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  rules: ValidationRule[];
  onSave: (rules: ValidationRule[]) => void;
  data: any[];
}) {
  const [localRules, setLocalRules] = useState<ValidationRule[]>(rules);
  const [selectedField, setSelectedField] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const allFields = Array.from(new Set(data.flatMap(item => Object.keys(item)))).filter(f => f !== 'id' && f !== '_errors');

  const getFieldType = (field: string): 'string' | 'number' | 'date' | 'email' | 'phone' => {
    const f = field.toLowerCase();
    if (f.includes('email')) return 'email';
    if (f.includes('phone') || f.includes('mobile')) return 'phone';
    if (f.includes('date')) return 'date';
    if (f.includes('value') || f.includes('amount') || f.includes('time')) return 'number';
    return 'string';
  };

  const getConditionsForType = (type: string) => {
    switch (type) {
      case 'string': return ['required', 'minLength', 'maxLength', 'startsWith', 'endsWith', 'notEqual', 'regex'];
      case 'number': return ['required', 'min', 'max'];
      case 'date': return ['required', 'minDate', 'maxDate'];
      case 'email': return ['required', 'validEmail', 'endsWith'];
      case 'phone': return ['required', 'minLength', 'maxLength', 'startsWith'];
      default: return ['required'];
    }
  };

  const currentType = selectedField ? getFieldType(selectedField) : 'string';
  const availableConditions = getConditionsForType(currentType);

  const handleAddRule = () => {
    if (!selectedField || !selectedCondition) return;
    if (selectedCondition !== 'required' && selectedCondition !== 'validEmail' && !value) return;

    const newRule: ValidationRule = {
      id: crypto.randomUUID(),
      field: selectedField,
      type: currentType,
      condition: selectedCondition,
      value: value,
    };

    setLocalRules([...localRules, newRule]);
    setSelectedField('');
    setSelectedCondition('');
    setValue('');
  };

  const handleRemoveRule = (id: string) => {
    setLocalRules(localRules.filter(r => r.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-w-full flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShieldAlert size={20} className="mr-2 text-red-500" />
            Data Validation Rules
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Rule</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Field</label>
                <select
                  value={selectedField}
                  onChange={e => { setSelectedField(e.target.value); setSelectedCondition(''); setValue(''); }}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">AICSelect Field...</option>
                  {allFields.map(f => (
                    <option key={f} value={f}>{f.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Condition</label>
                <select
                  value={selectedCondition}
                  onChange={e => setSelectedCondition(e.target.value)}
                  disabled={!selectedField}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">AICSelect Condition...</option>
                  {availableConditions.map(c => (
                    <option key={c} value={c}>{c.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Value</label>
                <input
                  type={currentType === 'number' ? 'number' : currentType === 'date' ? 'date' : 'text'}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  disabled={!selectedCondition || selectedCondition === 'required' || selectedCondition === 'validEmail'}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Value..."
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddRule}
                disabled={!selectedField || !selectedCondition || (selectedCondition !== 'required' && selectedCondition !== 'validEmail' && !value)}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={14} className="mr-1" /> Add Rule
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Active Rules ({localRules.length})</h3>
            {localRules.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-6 bg-white rounded-md border border-dashed border-gray-300">
                No validation rules defined.
              </div>
            ) : (
              <div className="space-y-2">
                {localRules.map(rule => (
                  <div key={rule.id} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100">
                        {rule.field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="text-sm text-gray-600">
                        {rule.condition.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      {rule.condition !== 'required' && rule.condition !== 'validEmail' && (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">
                          {rule.value}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveRule(rule.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2 bg-white rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave(localRules)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Apply Rules</button>
        </div>
      </div>
    </div>
  );
}
