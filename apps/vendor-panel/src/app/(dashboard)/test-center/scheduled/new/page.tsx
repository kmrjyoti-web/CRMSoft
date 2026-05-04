'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateScheduledTest } from '@/hooks/use-scheduled-tests';

const TEST_TYPES = ['UNIT', 'FUNCTIONAL', 'SMOKE', 'INTEGRATION', 'ARCHITECTURE', 'PENETRATION'];
const CRON_PRESETS = [
  { label: 'Every day at 2am', value: '0 2 * * *' },
  { label: 'Every Sunday at midnight', value: '0 0 * * 0' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Every Monday & Thursday at 1am', value: '0 1 * * 1,4' },
];

export default function NewScheduledTestPage() {
  const router = useRouter();
  const createMutation = useCreateScheduledTest();

  const [form, setForm] = useState({
    name: '',
    description: '',
    cronExpression: '0 2 * * *',
    targetModules: '',
    testTypes: ['UNIT', 'FUNCTIONAL', 'SMOKE'] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      name: form.name,
      description: form.description || undefined,
      cronExpression: form.cronExpression,
      targetModules: form.targetModules ? form.targetModules.split(',').map(m => m.trim()).filter(Boolean) : [],
      testTypes: form.testTypes,
      dbSourceType: 'BACKUP_RESTORE',
    });
    router.push('/test-center/scheduled');
  };

  const toggleTestType = (type: string) => {
    setForm(f => ({
      ...f,
      testTypes: f.testTypes.includes(type)
        ? f.testTypes.filter(t => t !== type)
        : [...f.testTypes, type],
    }));
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Create Scheduled Test
          </h1>
          <p className="text-sm text-gray-500">Tests always run on backup DB — never on live data</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Nightly Invoicing Check"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cron Expression *</label>
              <Input
                value={form.cronExpression}
                onChange={e => setForm(f => ({ ...f, cronExpression: e.target.value }))}
                placeholder="0 2 * * *"
                required
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {CRON_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
                    onClick={() => setForm(f => ({ ...f, cronExpression: preset.value }))}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Modules <span className="text-gray-400 font-normal">(comma-separated, blank = all)</span>
              </label>
              <Input
                value={form.targetModules}
                onChange={e => setForm(f => ({ ...f, targetModules: e.target.value }))}
                placeholder="invoicing, payments, stock, accounts"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Types *</label>
              <div className="flex flex-wrap gap-2">
                {TEST_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`text-sm px-3 py-1.5 rounded border font-medium transition-colors ${
                      form.testTypes.includes(type)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                    }`}
                    onClick={() => toggleTestType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <strong>Database Safety:</strong> This schedule will always use a backup copy of the database.
              Make sure you have a validated backup available before the first run.
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createMutation.isPending || form.testTypes.length === 0}>
                {createMutation.isPending ? 'Creating...' : 'Create Schedule'}
              </Button>
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
