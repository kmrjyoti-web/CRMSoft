'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCreateTestPlan } from '@/hooks/use-test-plans';

const LAYERS = ['UI', 'API', 'DB', 'ARCH', 'INTEGRATION'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const COMMON_MODULES = ['leads', 'contacts', 'organizations', 'invoicing', 'payments', 'orders', 'stock', 'accounts', 'quotations', 'activities'];

interface ItemDraft {
  moduleName: string;
  componentName: string;
  functionality: string;
  layer: string;
  priority: string;
}

const emptyItem = (): ItemDraft => ({
  moduleName: '',
  componentName: '',
  functionality: '',
  layer: 'UI',
  priority: 'MEDIUM',
});

export default function NewTestPlanPage() {
  const router = useRouter();
  const createPlan = useCreateTestPlan();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [targetModules, setTargetModules] = useState<string[]>([]);
  const [customModule, setCustomModule] = useState('');
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()]);

  const toggleModule = (mod: string) => {
    setTargetModules(prev =>
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod],
    );
  };

  const addCustomModule = () => {
    const m = customModule.trim().toLowerCase();
    if (m && !targetModules.includes(m)) {
      setTargetModules(prev => [...prev, m]);
    }
    setCustomModule('');
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);

  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof ItemDraft, value: string) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    const validItems = items.filter(i => i.moduleName && i.componentName && i.functionality);
    try {
      const plan = await createPlan.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        version: version.trim() || undefined,
        targetModules,
        items: validItems,
      });
      toast.success('Test plan created');
      router.push(`/test-center/test-plans/${plan.id}`);
    } catch {
      toast.error('Failed to create test plan');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">New Test Plan</h1>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle>Plan Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Plan Name *</label>
              <Input
                placeholder="e.g. Release 2.1 QA Checklist"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Version</label>
              <Input placeholder="e.g. v2.1.0" value={version} onChange={e => setVersion(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the scope and purpose of this test plan..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modules */}
      <Card>
        <CardHeader><CardTitle>Target Modules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {COMMON_MODULES.map(mod => (
              <button
                key={mod}
                onClick={() => toggleModule(mod)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  targetModules.includes(mod)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add custom module..."
              value={customModule}
              onChange={e => setCustomModule(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomModule()}
              className="max-w-xs"
            />
            <Button variant="outline" size="sm" onClick={addCustomModule}>Add</Button>
          </div>
          {targetModules.filter(m => !COMMON_MODULES.includes(m)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {targetModules.filter(m => !COMMON_MODULES.includes(m)).map(mod => (
                <span key={mod} className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  {mod} <button onClick={() => toggleModule(mod)} className="ml-1 text-purple-500 hover:text-purple-800">×</button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Checklist Items ({items.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">Item #{i + 1}</span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Module *</label>
                  <Input
                    placeholder="leads, invoicing, contacts..."
                    value={item.moduleName}
                    onChange={e => updateItem(i, 'moduleName', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Component *</label>
                  <Input
                    placeholder="LeadListPage, InvoiceForm..."
                    value={item.componentName}
                    onChange={e => updateItem(i, 'componentName', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">What to Test *</label>
                <Input
                  placeholder="e.g. Filter by status should show correct results"
                  value={item.functionality}
                  onChange={e => updateItem(i, 'functionality', e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Layer</label>
                  <select
                    className="border border-gray-200 rounded-md px-2 py-1.5 text-sm bg-white"
                    value={item.layer}
                    onChange={e => updateItem(i, 'layer', e.target.value)}
                  >
                    {LAYERS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Priority</label>
                  <select
                    className="border border-gray-200 rounded-md px-2 py-1.5 text-sm bg-white"
                    value={item.priority}
                    onChange={e => updateItem(i, 'priority', e.target.value)}
                  >
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end pb-8">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={createPlan.isPending}>
          {createPlan.isPending ? 'Creating...' : 'Create Test Plan'}
        </Button>
      </div>
    </div>
  );
}
