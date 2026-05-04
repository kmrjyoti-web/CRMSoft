'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  ChevronLeft, Lock, Settings, X, Check, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

type VerticalEntry = {
  verticalCode: string;
  verticalName: string;
  description: string | null;
  sortOrder: number;
  isEnabled: boolean;
  minPlanCode: string | null;
  terminology: Record<string, string> | null;
  extraFields: unknown[] | null;
  defaultModules: string[] | null;
  leadStages: string[] | null;
};

const PLAN_OPTIONS = ['', 'WL_STARTER', 'WL_PROFESSIONAL', 'WL_ENTERPRISE'];

function TerminologyEditor({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  const entries = Object.entries(value);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  const remove = (k: string) => {
    const next = { ...value };
    delete next[k];
    onChange(next);
  };

  const add = () => {
    if (!newKey.trim() || !newVal.trim()) return;
    onChange({ ...value, [newKey.trim()]: newVal.trim() });
    setNewKey('');
    setNewVal('');
  };

  return (
    <div className="space-y-1.5">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-2">
          <span className="font-mono text-xs text-[#58a6ff] w-24 shrink-0">{k}</span>
          <span className="text-console-muted text-xs">→</span>
          <span className="text-xs text-console-text flex-1">{v}</span>
          <button onClick={() => remove(k)} className="text-console-muted hover:text-[#f85149]">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Original term"
          className="text-xs bg-[#0d1117] border border-console-border rounded px-2 py-1 text-console-text focus:outline-none focus:border-[#58a6ff] w-28"
        />
        <span className="text-console-muted text-xs">→</span>
        <input
          value={newVal}
          onChange={(e) => setNewVal(e.target.value)}
          placeholder="Partner term"
          className="text-xs bg-[#0d1117] border border-console-border rounded px-2 py-1 text-console-text focus:outline-none focus:border-[#58a6ff] flex-1"
        />
        <button
          onClick={add}
          className="text-xs bg-[#30363d] hover:bg-[#444c56] text-console-text px-2 py-1 rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function TagListEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput('');
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {value.map((item, i) => (
          <span key={i} className="flex items-center gap-1 bg-[#30363d] text-console-text text-xs px-1.5 py-0.5 rounded">
            {item}
            <button onClick={() => remove(i)} className="text-console-muted hover:text-[#f85149] ml-0.5">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="text-xs bg-[#0d1117] border border-console-border rounded px-2 py-1 text-console-text focus:outline-none focus:border-[#58a6ff] flex-1"
        />
        <button
          onClick={add}
          className="text-xs bg-[#30363d] hover:bg-[#444c56] text-console-text px-2 py-1 rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function ConfigDrawer({
  vertical,
  partnerCode,
  onClose,
  onSaved,
}: {
  vertical: VerticalEntry;
  partnerCode: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [minPlan, setMinPlan] = useState(vertical.minPlanCode ?? '');
  const [terminology, setTerminology] = useState<Record<string, string>>(vertical.terminology ?? {});
  const [leadStages, setLeadStages] = useState<string[]>(vertical.leadStages ?? []);
  const [defaultModules, setDefaultModules] = useState<string[]>(vertical.defaultModules ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await api.pcConfig.updatePartnerVerticalConfig(partnerCode, vertical.verticalCode, {
        minPlanCode: minPlan || null,
        terminology,
        leadStages,
        defaultModules,
      });
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[480px] bg-[#0d1117] border-l border-console-border h-full overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-console-border">
          <div>
            <p className="text-sm font-semibold text-console-text">{vertical.verticalName}</p>
            <p className="text-xs text-console-muted font-mono">{vertical.verticalCode}</p>
          </div>
          <button onClick={onClose} className="text-console-muted hover:text-console-text">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-5">
          {/* Minimum plan */}
          <div>
            <label className="block text-xs font-medium text-console-muted mb-1.5">Minimum Plan Required</label>
            <select
              value={minPlan}
              onChange={(e) => setMinPlan(e.target.value)}
              className="w-full text-xs bg-[#161b22] border border-console-border rounded px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="">No restriction (any plan)</option>
              {PLAN_OPTIONS.filter(Boolean).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Terminology overrides */}
          <div>
            <label className="block text-xs font-medium text-console-muted mb-1.5">
              Terminology Overrides
              <span className="ml-1 text-console-muted/60 font-normal">(e.g. Lead → Patient Enquiry)</span>
            </label>
            <div className="bg-[#161b22] border border-console-border rounded p-3">
              <TerminologyEditor value={terminology} onChange={setTerminology} />
            </div>
          </div>

          {/* Lead stages */}
          <div>
            <label className="block text-xs font-medium text-console-muted mb-1.5">Lead Stages</label>
            <div className="bg-[#161b22] border border-console-border rounded p-3">
              <TagListEditor
                value={leadStages}
                onChange={setLeadStages}
                placeholder="e.g. Enquiry, Sample Sent, Order..."
              />
            </div>
          </div>

          {/* Default modules */}
          <div>
            <label className="block text-xs font-medium text-console-muted mb-1.5">Default Modules</label>
            <div className="bg-[#161b22] border border-console-border rounded p-3">
              <TagListEditor
                value={defaultModules}
                onChange={setDefaultModules}
                placeholder="e.g. contacts, leads, inventory..."
              />
            </div>
          </div>

          {error && <p className="text-xs text-[#f85149]">{error}</p>}
        </div>

        <div className="border-t border-console-border px-5 py-4 flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white px-4 py-1.5 rounded-md transition-colors"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Save Config
          </button>
          <button onClick={onClose} className="text-xs text-console-muted hover:text-console-text px-3 py-1.5">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function VerticalCard({
  entry,
  partnerCode,
  onToggle,
  onConfigSaved,
}: {
  entry: VerticalEntry;
  partnerCode: string;
  onToggle: (code: string, enabled: boolean) => Promise<void>;
  onConfigSaved: () => void;
}) {
  const [toggling, setToggling] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggle(entry.verticalCode, !entry.isEnabled);
    } finally {
      setToggling(false);
    }
  };

  const hasConfig = !!(
    entry.terminology && Object.keys(entry.terminology).length > 0 ||
    entry.leadStages?.length ||
    entry.defaultModules?.length
  );

  return (
    <>
      <div className="flex items-center justify-between p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-console-text">{entry.verticalName}</span>
            <span className="font-mono text-xs text-console-muted bg-[#30363d] px-1.5 py-0.5 rounded">{entry.verticalCode}</span>
            {entry.minPlanCode && (
              <span className="flex items-center gap-0.5 text-xs text-[#e3b341]">
                <Lock className="w-3 h-3" />{entry.minPlanCode}
              </span>
            )}
          </div>
          {entry.isEnabled && hasConfig && (
            <div className="flex items-center gap-3 mt-1 text-xs text-console-muted">
              {entry.terminology && Object.keys(entry.terminology).length > 0 && (
                <span>Custom terms: {Object.keys(entry.terminology).length}</span>
              )}
              {entry.leadStages?.length ? <span>Stages: {entry.leadStages.length}</span> : null}
              {entry.defaultModules?.length ? <span>Modules: {entry.defaultModules.length}</span> : null}
            </div>
          )}
          {!entry.isEnabled && (
            <p className="text-xs text-console-muted/60 mt-0.5">Not enabled for this partner</p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4 shrink-0">
          {entry.isEnabled && (
            <button
              onClick={() => setShowConfig(true)}
              className="flex items-center gap-1 text-xs text-console-muted hover:text-console-text bg-[#30363d] hover:bg-[#444c56] px-2 py-1 rounded transition-colors"
            >
              <Settings className="w-3 h-3" /> Configure
            </button>
          )}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-60 ${
              entry.isEnabled ? 'bg-[#238636]' : 'bg-[#30363d]'
            }`}
            title={entry.isEnabled ? 'Disable' : 'Enable'}
          >
            {toggling ? (
              <Loader2 className="w-3 h-3 text-white animate-spin mx-auto" />
            ) : (
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  entry.isEnabled ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {showConfig && (
        <ConfigDrawer
          vertical={entry}
          partnerCode={partnerCode}
          onClose={() => setShowConfig(false)}
          onSaved={onConfigSaved}
        />
      )}
    </>
  );
}

export default function PartnerVerticalsPage() {
  const params = useParams();
  const partnerCode = params.partnerCode as string;

  const [verticals, setVerticals] = useState<VerticalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.pcConfig.partnerVerticals(partnerCode) as VerticalEntry[];
      setVerticals(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load verticals');
    } finally {
      setLoading(false);
    }
  }, [partnerCode]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (verticalCode: string, enable: boolean) => {
    if (enable) {
      await api.pcConfig.enablePartnerVertical(partnerCode, verticalCode, {});
    } else {
      await api.pcConfig.disablePartnerVertical(partnerCode, verticalCode);
    }
    setVerticals((prev) =>
      prev.map((v) => v.verticalCode === verticalCode ? { ...v, isEnabled: enable } : v),
    );
  };

  const enabledCount = verticals.filter((v) => v.isEnabled).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/governance/partners"
          className="flex items-center gap-1 text-xs text-console-muted hover:text-console-text transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Partners
        </Link>
        <span className="text-console-muted/40">›</span>
        <span className="font-mono text-xs bg-[#30363d] text-[#58a6ff] px-1.5 py-0.5 rounded">{partnerCode}</span>
        <span className="text-xs text-console-muted">Vertical Assignment</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-console-text">Vertical Assignment</h2>
          <p className="text-xs text-console-muted mt-0.5">
            Control which verticals this partner can deploy. Toggle to enable/disable.
          </p>
        </div>
        {!loading && (
          <div className="text-xs text-console-muted bg-[#30363d] px-2 py-1 rounded">
            {enabledCount} / {verticals.length} enabled
          </div>
        )}
      </div>

      {error && (
        <div className="bg-[#2d1616] border border-[#f85149]/40 rounded-lg p-3 text-xs text-[#f85149]">{error}</div>
      )}

      {loading ? (
        <div className="space-y-px">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-console-sidebar border border-console-border rounded-lg animate-pulse mb-1" />
          ))}
        </div>
      ) : verticals.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <p className="text-sm text-console-muted">No verticals found on the platform.</p>
        </div>
      ) : (
        <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden divide-y divide-console-border">
          {verticals.map((entry) => (
            <VerticalCard
              key={entry.verticalCode}
              entry={entry}
              partnerCode={partnerCode}
              onToggle={handleToggle}
              onConfigSaved={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}
