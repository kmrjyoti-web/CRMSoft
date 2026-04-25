'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

export default function NewVerticalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    nameHi: '',
    schemasConfig: '{}',
  });
  const [error, setError] = useState('');

  function handleChange(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim() || !form.nameHi.trim()) {
      setError('Code, name, and Hindi name are required.');
      return;
    }

    let schemasConfig: Record<string, unknown> | undefined;
    try {
      const parsed = JSON.parse(form.schemasConfig);
      schemasConfig = typeof parsed === 'object' && parsed !== null ? parsed : undefined;
    } catch {
      setError('Invalid JSON for schemas config.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.verticals.register({
        code: form.code.toUpperCase(),
        name: form.name,
        nameHi: form.nameHi,
        schemasConfig,
      });
      router.push('/verticals');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to register vertical.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/verticals"
        className="flex items-center gap-1 text-sm text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to verticals
      </Link>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <h2 className="text-base font-semibold text-[#c9d1d9] mb-4">Register Vertical</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Code * (uppercase)</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="PHARMA"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] px-3 py-2 focus:outline-none focus:border-[#58a6ff] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Pharmaceutical"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#8b949e] mb-1">Hindi Name *</label>
            <input
              type="text"
              value={form.nameHi}
              onChange={(e) => handleChange('nameHi', e.target.value)}
              placeholder="e.g. \u092B\u093E\u0930\u094D\u092E\u093E\u0938\u094D\u092F\u0942\u091F\u093F\u0915\u0932"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] px-3 py-2 focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8b949e] mb-1">Schemas Config (JSON)</label>
            <textarea
              value={form.schemasConfig}
              onChange={(e) => handleChange('schemasConfig', e.target.value)}
              rows={5}
              placeholder='{"contactFields": [], "productFields": []}'
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#c9d1d9] placeholder-[#8b949e] px-3 py-2 font-mono resize-none focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Registering...' : 'Register Vertical'}
            </button>
            <Link
              href="/verticals"
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
