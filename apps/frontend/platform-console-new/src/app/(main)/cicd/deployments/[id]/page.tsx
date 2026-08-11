'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Rocket, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';

type Deployment = {
  id: string;
  environment: string;
  version: string;
  status: string;
  gitBranch: string;
  gitCommitHash: string;
  deployedBy: string;
  durationSeconds: number | null;
  startedAt: string;
  completedAt: string | null;
  errorMessage: string | null;
  rollbackVersion: string | null;
};

const ENV_COLORS: Record<string, string> = {
  PRODUCTION: 'bg-red-900/50 text-red-400 border-red-800',
  STAGING: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  DEVELOPMENT: 'bg-gray-900/50 text-gray-400 border-gray-800',
};

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: 'bg-green-900/50 text-green-400 border-green-800',
  FAILED: 'bg-red-900/50 text-red-400 border-red-800',
  DEPLOYING: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  ROLLED_BACK: 'bg-orange-900/50 text-orange-400 border-orange-800',
};

export default function DeploymentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.cicd.getDeployment(id) as Deployment;
      setDeployment(data);
    } catch {
      setDeployment(null);
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
      await api.cicd.completeDeployment(id, { status: 'SUCCESS' });
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

  if (!deployment) {
    return (
      <div className="text-center py-12">
        <Rocket className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
        <p className="text-sm text-[#8b949e]">Deployment not found</p>
        <Link href="/cicd/deployments" className="text-xs text-[#58a6ff] hover:underline mt-2 inline-block">
          Back to Deployments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/cicd/deployments" className="flex items-center gap-1.5 text-xs text-[#58a6ff] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Deployments
      </Link>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#c9d1d9] font-mono">{deployment.version}</h2>
            <p className="text-xs text-[#8b949e] mt-1">Deployment #{deployment.id.slice(0, 8)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${ENV_COLORS[deployment.environment] ?? ENV_COLORS.DEVELOPMENT}`}>
              {deployment.environment}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_COLORS[deployment.status] ?? STATUS_COLORS.DEPLOYING}`}>
              {deployment.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-[#8b949e]">Branch</p>
            <p className="text-[#c9d1d9] mt-0.5">{deployment.gitBranch}</p>
          </div>
          <div>
            <p className="text-xs text-[#8b949e]">Commit</p>
            <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-[#c9d1d9]">{deployment.gitCommitHash}</code>
          </div>
          <div>
            <p className="text-xs text-[#8b949e]">Deployed By</p>
            <p className="text-[#c9d1d9] mt-0.5">{deployment.deployedBy}</p>
          </div>
          <div>
            <p className="text-xs text-[#8b949e]">Duration</p>
            <p className="text-[#c9d1d9] mt-0.5">
              {deployment.durationSeconds != null
                ? `${Math.floor(deployment.durationSeconds / 60)}m ${deployment.durationSeconds % 60}s`
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#8b949e]">Started</p>
            <p className="text-[#c9d1d9] mt-0.5">
              {new Date(deployment.startedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#8b949e]">Completed</p>
            <p className="text-[#c9d1d9] mt-0.5">
              {deployment.completedAt
                ? new Date(deployment.completedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                : '—'}
            </p>
          </div>
        </div>

        {deployment.errorMessage && (
          <div className="mt-4 bg-red-900/20 border border-red-800 rounded-md p-4">
            <p className="text-xs text-red-400 font-semibold mb-1">Error</p>
            <pre className="text-sm text-red-300 whitespace-pre-wrap font-mono">{deployment.errorMessage}</pre>
          </div>
        )}

        {deployment.rollbackVersion && (
          <div className="mt-4 bg-orange-900/20 border border-orange-800 rounded-md p-3">
            <p className="text-xs text-orange-400">Rolled back to version: <span className="font-mono font-semibold">{deployment.rollbackVersion}</span></p>
          </div>
        )}

        {deployment.status === 'DEPLOYING' && (
          <div className="mt-4">
            <button
              onClick={handleComplete}
              disabled={completing}
              className="flex items-center gap-1.5 px-4 py-2 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {completing ? 'Completing...' : 'Mark as Complete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
