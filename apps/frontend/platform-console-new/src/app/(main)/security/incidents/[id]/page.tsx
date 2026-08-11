'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { api } from '@/lib/api';

type Incident = {
  id: string;
  title: string;
  severity: string;
  status: string;
  affectedService: string;
  description: string;
  startedAt: string;
  resolvedAt: string | null;
  rootCause: string | null;
  resolution: string | null;
  postmortem: string | null;
};

const SEVERITY_COLORS: Record<string, string> = {
  P1: 'bg-red-900/50 text-red-500 border-red-800',
  P2: 'bg-orange-900/50 text-orange-500 border-orange-800',
  P3: 'bg-yellow-900/50 text-yellow-500 border-yellow-800',
  P4: 'bg-gray-900/50 text-gray-400 border-gray-800',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-900/50 text-red-400 border-red-800',
  INVESTIGATING: 'bg-orange-900/50 text-orange-400 border-orange-800',
  MITIGATED: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  RESOLVED: 'bg-green-900/50 text-green-400 border-green-800',
};

const STATUSES = ['OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED'];

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [rootCause, setRootCause] = useState('');
  const [resolution, setResolution] = useState('');
  const [postmortem, setPostmortem] = useState('');
  const [saving, setSaving] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.security.getIncident(id) as Incident;
      setIncident(data);
      setRootCause(data.rootCause ?? '');
      setResolution(data.resolution ?? '');
      setPostmortem(data.postmortem ?? '');
    } catch {
      setIncident(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (status: string) => {
    setSaving('status');
    try {
      await api.security.updateIncident(id, { status });
      await fetchData();
    } catch {
      // error
    } finally {
      setSaving('');
    }
  };

  const handleSaveRootCause = async () => {
    setSaving('rootCause');
    try {
      await api.security.updateIncident(id, { rootCause });
      await fetchData();
    } catch {
      // error
    } finally {
      setSaving('');
    }
  };

  const handleSaveResolution = async () => {
    setSaving('resolution');
    try {
      await api.security.updateIncident(id, { resolution });
      await fetchData();
    } catch {
      // error
    } finally {
      setSaving('');
    }
  };

  const handleSavePostmortem = async () => {
    setSaving('postmortem');
    try {
      await api.security.addPostmortem(id, postmortem);
      await fetchData();
    } catch {
      // error
    } finally {
      setSaving('');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-[#161b22] border border-[#30363d] rounded animate-pulse" />
        <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <Shield className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
        <p className="text-sm text-[#8b949e]">Incident not found</p>
        <Link href="/security/incidents" className="text-xs text-[#58a6ff] hover:underline mt-2 inline-block">
          Back to Incidents
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/security/incidents" className="flex items-center gap-1.5 text-xs text-[#58a6ff] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Incidents
      </Link>

      {/* Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#c9d1d9]">{incident.title}</h2>
            <p className="text-xs text-[#8b949e] mt-1">{incident.affectedService}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${SEVERITY_COLORS[incident.severity] ?? SEVERITY_COLORS.P4}`}>
              {incident.severity}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_COLORS[incident.status] ?? STATUS_COLORS.OPEN}`}>
              {incident.status}
            </span>
          </div>
        </div>

        <p className="text-sm text-[#c9d1d9] mb-4">{incident.description}</p>

        <div className="flex items-center gap-6 text-xs text-[#8b949e]">
          <span>Started: {new Date(incident.startedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
          {incident.resolvedAt && (
            <span>Resolved: {new Date(incident.resolvedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
          )}
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Update Status</h3>
        <div className="flex items-center gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={saving === 'status' || incident.status === s}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                incident.status === s
                  ? 'bg-[#58a6ff]/20 text-[#58a6ff] border-[#58a6ff]/50'
                  : 'bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:bg-[#30363d]'
              } disabled:opacity-50`}
            >
              {s}
            </button>
          ))}
          {saving === 'status' && <span className="text-xs text-[#8b949e]">Updating...</span>}
        </div>
      </div>

      {/* Root Cause */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Root Cause</h3>
        <textarea
          value={rootCause}
          onChange={(e) => setRootCause(e.target.value)}
          rows={3}
          className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none resize-y mb-2"
          placeholder="Describe the root cause..."
        />
        <button
          onClick={handleSaveRootCause}
          disabled={saving === 'rootCause'}
          className="px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50"
        >
          {saving === 'rootCause' ? 'Saving...' : 'Save Root Cause'}
        </button>
      </div>

      {/* Resolution */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Resolution</h3>
        <textarea
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          rows={3}
          className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none resize-y mb-2"
          placeholder="Describe how the issue was resolved..."
        />
        <button
          onClick={handleSaveResolution}
          disabled={saving === 'resolution'}
          className="px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50"
        >
          {saving === 'resolution' ? 'Saving...' : 'Save Resolution'}
        </button>
      </div>

      {/* Postmortem */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Postmortem</h3>
        {incident.postmortem ? (
          <pre className="bg-[#0d1117] border border-[#30363d] rounded-md p-4 text-sm text-[#c9d1d9] whitespace-pre-wrap font-mono mb-4 max-h-96 overflow-y-auto">
            {incident.postmortem}
          </pre>
        ) : null}
        <textarea
          value={postmortem}
          onChange={(e) => setPostmortem(e.target.value)}
          rows={5}
          className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-sm focus:border-[#58a6ff] focus:outline-none resize-y mb-2"
          placeholder="Write a postmortem analysis..."
        />
        <button
          onClick={handleSavePostmortem}
          disabled={saving === 'postmortem'}
          className="px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50"
        >
          {saving === 'postmortem' ? 'Saving...' : 'Save Postmortem'}
        </button>
      </div>
    </div>
  );
}
