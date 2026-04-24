'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, GitBranch, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';

type Job = {
  name: string;
  status: string;
};

type Pipeline = {
  id: string;
  pipelineName: string;
  triggerType: string;
  branch: string;
  status: string;
  jobs: Job[];
  startedAt: string;
  completedAt: string | null;
};

type BuildLog = {
  id: string;
  jobName: string;
  output: string;
  exitCode: number;
  duration: number | null;
};

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: 'bg-green-900/50 text-green-400 border-green-800',
  FAILED: 'bg-red-900/50 text-red-400 border-red-800',
  RUNNING: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  PENDING: 'bg-gray-900/50 text-gray-400 border-gray-800',
};

export default function PipelineDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pData, lData] = await Promise.all([
        api.cicd.getPipeline(id) as Promise<Pipeline>,
        api.cicd.pipelineLogs(id) as Promise<any>,
      ]);
      setPipeline(pData);
      setLogs(Array.isArray(lData) ? lData : lData?.items ?? []);
    } catch {
      setPipeline(null);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await api.cicd.completePipeline(id, { status: 'SUCCESS' });
      await fetchData();
    } catch {
      // error
    } finally {
      setCompleting(false);
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

  if (!pipeline) {
    return (
      <div className="text-center py-12">
        <GitBranch className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
        <p className="text-sm text-[#8b949e]">Pipeline not found</p>
        <Link href="/cicd/pipelines" className="text-xs text-[#58a6ff] hover:underline mt-2 inline-block">
          Back to Pipelines
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/cicd/pipelines" className="flex items-center gap-1.5 text-xs text-[#58a6ff] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Pipelines
      </Link>

      {/* Pipeline Info */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#c9d1d9]">{pipeline.pipelineName}</h2>
            <p className="text-xs text-[#8b949e] mt-1">Pipeline #{pipeline.id.slice(0, 8)}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_COLORS[pipeline.status] ?? STATUS_COLORS.PENDING}`}>
            {pipeline.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-[#8b949e]">Branch</p>
            <p className="text-[#c9d1d9] font-mono mt-0.5">{pipeline.branch}</p>
          </div>
          <div>
            <p className="text-xs text-[#8b949e]">Trigger</p>
            <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-[#c9d1d9]">{pipeline.triggerType}</code>
          </div>
          <div>
            <p className="text-xs text-[#8b949e]">Started</p>
            <p className="text-[#c9d1d9] mt-0.5 text-xs">
              {new Date(pipeline.startedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#8b949e]">Completed</p>
            <p className="text-[#c9d1d9] mt-0.5 text-xs">
              {pipeline.completedAt
                ? new Date(pipeline.completedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                : '—'}
            </p>
          </div>
        </div>

        {pipeline.status === 'RUNNING' && (
          <div className="mt-4">
            <button
              onClick={handleComplete}
              disabled={completing}
              className="flex items-center gap-1.5 px-4 py-2 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {completing ? 'Completing...' : 'Complete Pipeline'}
            </button>
          </div>
        )}
      </div>

      {/* Jobs */}
      {pipeline.jobs && pipeline.jobs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Jobs</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {pipeline.jobs.map((job, i) => (
              <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 flex items-center gap-2">
                {job.status === 'SUCCESS' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : job.status === 'FAILED' ? (
                  <XCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-sm text-[#c9d1d9]">{job.name}</span>
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded border ${STATUS_COLORS[job.status] ?? STATUS_COLORS.PENDING}`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Build Logs */}
      <div>
        <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Build Logs</h3>
        {logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#c9d1d9] font-medium">{log.jobName}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${
                      log.exitCode === 0
                        ? 'bg-green-900/50 text-green-400 border-green-800'
                        : 'bg-red-900/50 text-red-400 border-red-800'
                    }`}>
                      exit {log.exitCode}
                    </span>
                  </div>
                  {log.duration != null && (
                    <span className="text-xs text-[#8b949e]">{log.duration}s</span>
                  )}
                </div>
                <pre className="bg-[#0d1117] px-4 py-3 text-xs text-[#c9d1d9] font-mono whitespace-pre-wrap overflow-y-auto" style={{ maxHeight: 300 }}>
                  {log.output}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
            <GitBranch className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
            <p className="text-sm text-[#8b949e]">No build logs available</p>
          </div>
        )}
      </div>
    </div>
  );
}
