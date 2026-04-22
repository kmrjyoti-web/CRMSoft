'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

const SERVICES = ['API', 'POSTGRES', 'REDIS', 'R2_STORAGE', 'BULLMQ', 'CRM_PORTAL', 'MARKETHUB'];
const SEVERITIES = ['P1', 'P2', 'P3', 'P4'];

export default function NewIncidentPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', severity: 'P3', description: '', affectedService: 'API' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.security.createIncident(form);
      router.push('/security/incidents');
    } catch (err: any) {
      setError(err.message || 'Failed to create incident');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/security/incidents" className="flex items-center gap-1.5 text-xs text-[#58a6ff] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Incidents
      </Link>

      <div>
        <h2 className="text-base font-semibold text-[#c9d1d9]">Report New Incident</h2>
        <p className="text-xs text-[#8b949e] mt-0.5">Create a new security incident report</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-md px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-xs text-[#8b949e] mb-1.5">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
            placeholder="Brief incident title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8b949e] mb-1.5">Severity</label>
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#8b949e] mb-1.5">Affected Service</label>
            <select
              value={form.affectedService}
              onChange={(e) => setForm({ ...form, affectedService: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none"
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#8b949e] mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
            className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none resize-y"
            placeholder="Describe what happened, impact, and initial observations..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/security/incidents"
            className="px-4 py-2 text-xs bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Incident'}
          </button>
        </div>
      </form>
    </div>
  );
}
