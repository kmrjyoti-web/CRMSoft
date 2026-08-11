'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

const RELEASE_TYPES = ['MAJOR', 'MINOR', 'PATCH'];

export default function NewReleasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verticals, setVerticals] = useState<string[]>([]);
  const [form, setForm] = useState({
    version: '',
    verticalType: '',
    releaseType: 'MINOR',
    releaseNotes: '',
    gitTag: '',
    gitCommitHash: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadVerticals() {
      try {
        const data = await api.versions.verticals() as any;
        const items = Array.isArray(data) ? data : data.items ?? [];
        setVerticals(items.map((v: any) => v.verticalType ?? v.code ?? v));
      } catch {
        setVerticals([]);
      }
    }
    loadVerticals();
  }, []);

  function handleChange(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.version.trim() || !form.releaseType) {
      setError('Version and release type are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.versions.create({
        version: form.version,
        verticalType: form.verticalType || undefined,
        releaseType: form.releaseType,
        releaseNotes: form.releaseNotes || undefined,
        gitTag: form.gitTag || undefined,
        gitCommitHash: form.gitCommitHash || undefined,
      });
      router.push('/versions');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create release.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/versions"
        className="flex items-center gap-1 text-sm text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to versions
      </Link>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <h2 className="text-base font-semibold text-[#c9d1d9] mb-4">Create New Release</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Version *</label>
              <input
                type="text"
                value={form.version}
                onChange={(e) => handleChange('version', e.target.value)}
                placeholder="1.0.0"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Vertical Type</label>
              <select
                value={form.verticalType}
                onChange={(e) => handleChange('verticalType', e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
              >
                <option value="">Platform (all)</option>
                {verticals.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Release Type *</label>
              <select
                value={form.releaseType}
                onChange={(e) => handleChange('releaseType', e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
              >
                {RELEASE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Git Tag</label>
              <input
                type="text"
                value={form.gitTag}
                onChange={(e) => handleChange('gitTag', e.target.value)}
                placeholder="v1.0.0"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#8b949e] mb-1">Git Commit Hash</label>
            <input
              type="text"
              value={form.gitCommitHash}
              onChange={(e) => handleChange('gitCommitHash', e.target.value)}
              placeholder="abc123def456"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8b949e] mb-1">Release Notes</label>
            <textarea
              value={form.releaseNotes}
              onChange={(e) => handleChange('releaseNotes', e.target.value)}
              placeholder="Describe what changed in this release..."
              rows={4}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] px-3 py-2 resize-none focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Release'}
            </button>
            <Link
              href="/versions"
              className="px-4 py-2 text-xs border border-[#30363d] text-[#8b949e] rounded-md hover:text-[#c9d1d9] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
