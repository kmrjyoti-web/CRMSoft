'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type Scenario = {
  title: string;
  steps: string;
  expectedResult: string;
  priority: string;
};

const MODULE_OPTIONS = ['All', 'customer', 'marketplace', 'core', 'softwarevendor', 'ops', 'plugins', 'platform-console'];
const VERTICAL_OPTIONS = ['All', 'GENERAL', 'SOFTWARE_VENDOR', 'PHARMA', 'TEXTILE', 'FMCG', 'AUTOMOBILE', 'REAL_ESTATE', 'EDUCATION', 'HEALTHCARE'];
const PRIORITY_OPTIONS = ['HIGH', 'MEDIUM', 'LOW'];

const EMPTY_SCENARIO: Scenario = { title: '', steps: '', expectedResult: '', priority: 'MEDIUM' };

export default function NewTestPlanPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [moduleScope, setModuleScope] = useState('All');
  const [verticalScope, setVerticalScope] = useState('All');
  const [scenarios, setScenarios] = useState<Scenario[]>([{ ...EMPTY_SCENARIO }]);
  const [submitting, setSubmitting] = useState(false);

  function updateScenario(index: number, field: keyof Scenario, value: string) {
    setScenarios((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function removeScenario(index: number) {
    setScenarios((prev) => prev.filter((_, i) => i !== index));
  }

  function addScenario() {
    setScenarios((prev) => [...prev, { ...EMPTY_SCENARIO }]);
  }

  async function handleSubmit() {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await api.tests.createPlan({
        name: name.trim(),
        description: description.trim() || undefined,
        moduleScope: moduleScope === 'All' ? undefined : moduleScope,
        verticalScope: verticalScope === 'All' ? undefined : verticalScope,
        scenarios: scenarios.filter((s) => s.title.trim()),
      });
      router.push('/tests/plans');
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Create Test Plan</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">Define a new test plan with scenarios</p>
        </div>
        <Link
          href="/tests/plans"
          className="px-3 py-1.5 text-xs border border-[#30363d] text-[#8b949e] rounded-md hover:text-[#c9d1d9] transition-colors"
        >
          Cancel
        </Link>
      </div>

      {/* Form */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Plan Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Core Module Regression"
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] placeholder-[#8b949e] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-[#8b949e] mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the purpose of this test plan..."
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] placeholder-[#8b949e] rounded-md px-3 py-2 text-sm resize-none focus:border-[#58a6ff] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8b949e] mb-1">Module Scope</label>
            <select
              value={moduleScope}
              onChange={(e) => setModuleScope(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
            >
              {MODULE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#8b949e] mb-1">Vertical Scope</label>
            <select
              value={verticalScope}
              onChange={(e) => setVerticalScope(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
            >
              {VERTICAL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scenarios */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs text-[#8b949e] font-medium">Scenarios</label>
            <button
              onClick={addScenario}
              className="flex items-center gap-1 px-2 py-1 text-xs text-[#58a6ff] hover:bg-white/5 rounded transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Scenario
            </button>
          </div>

          <div className="space-y-3">
            {scenarios.map((scenario, idx) => (
              <div
                key={idx}
                className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8b949e]">Scenario {idx + 1}</span>
                  {scenarios.length > 1 && (
                    <button
                      onClick={() => removeScenario(idx)}
                      className="p-1 rounded hover:bg-red-900/20 text-[#8b949e] hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={scenario.title}
                  onChange={(e) => updateScenario(idx, 'title', e.target.value)}
                  placeholder="Scenario title"
                  className="w-full bg-[#161b22] border border-[#30363d] text-[#c9d1d9] placeholder-[#8b949e] rounded-md px-3 py-1.5 text-xs focus:border-[#58a6ff] focus:outline-none"
                />
                <textarea
                  value={scenario.steps}
                  onChange={(e) => updateScenario(idx, 'steps', e.target.value)}
                  rows={2}
                  placeholder="Steps to execute..."
                  className="w-full bg-[#161b22] border border-[#30363d] text-[#c9d1d9] placeholder-[#8b949e] rounded-md px-3 py-1.5 text-xs resize-none focus:border-[#58a6ff] focus:outline-none"
                />
                <textarea
                  value={scenario.expectedResult}
                  onChange={(e) => updateScenario(idx, 'expectedResult', e.target.value)}
                  rows={2}
                  placeholder="Expected result..."
                  className="w-full bg-[#161b22] border border-[#30363d] text-[#c9d1d9] placeholder-[#8b949e] rounded-md px-3 py-1.5 text-xs resize-none focus:border-[#58a6ff] focus:outline-none"
                />
                <select
                  value={scenario.priority}
                  onChange={(e) => updateScenario(idx, 'priority', e.target.value)}
                  className="bg-[#161b22] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-1.5 text-xs focus:border-[#58a6ff] focus:outline-none"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create Plan
          </button>
          <Link
            href="/tests/plans"
            className="px-4 py-2 text-xs border border-[#30363d] text-[#8b949e] rounded-md hover:text-[#c9d1d9] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
