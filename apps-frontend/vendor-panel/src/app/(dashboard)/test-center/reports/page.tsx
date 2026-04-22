'use client';

import { useState } from 'react';
import { FileText, ChevronDown, ChevronRight, RefreshCw, Download, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useTestReports, useGenerateReport } from '@/hooks/use-test-errors';
import { useTestPlans } from '@/hooks/use-test-plans';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'destructive'> = {
  COMPLETED: 'success',
  FAILED: 'destructive',
  RUNNING: 'default',
  QUEUED: 'secondary',
  CANCELLED: 'secondary',
};

function ReportCard({ report }: { report: any }) {
  const [expanded, setExpanded] = useState(false);
  const summary = report.summary ?? {};
  const categoryResults = report.categoryResults ?? {};
  const errorSummary = report.errorSummary ?? {};
  const recommendations: string[] = report.recommendations ?? [];

  const categories = Object.entries(categoryResults) as [string, any][];

  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-shrink-0 text-gray-400">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">Run #{report.testRun?.id?.slice(0, 8)}</span>
            {report.testRun?.status && (
              <Badge variant={STATUS_VARIANT[report.testRun.status] ?? 'default'} className="text-xs">
                {report.testRun.status}
              </Badge>
            )}
            <span className="text-xs text-gray-400">
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex gap-4 mt-1 text-xs text-gray-500">
            <span className="text-green-700 font-medium">{summary.passed ?? 0} passed</span>
            <span className="text-red-600 font-medium">{summary.failed ?? 0} failed</span>
            <span>{summary.passRate ?? 0}% pass rate</span>
            {errorSummary.critical > 0 && (
              <span className="text-red-700 font-semibold">{errorSummary.critical} CRITICAL</span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-bold text-gray-900">{summary.passRate ?? 0}%</div>
          <div className="text-xs text-gray-400">{summary.totalTests ?? 0} tests</div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
          {/* Category breakdown */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">By Test Type</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map(([cat, stats]) => (
                  <div key={cat} className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="text-xs font-medium text-gray-600">{cat}</div>
                    <div className="flex gap-2 mt-1 text-xs">
                      <span className="text-green-700">{stats.passed ?? 0}✓</span>
                      <span className="text-red-600">{stats.failed ?? 0}✗</span>
                      <span className="text-gray-400">{stats.total ?? 0} total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recommendations</h4>
              {recommendations.map((rec, i) => (
                <p key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⚠</span>
                  {rec}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function TestReportsPage() {
  const [runId, setRunId] = useState('');
  const { data: reportsRes, isLoading } = useTestReports({ limit: 30 });
  const generateReport = useGenerateReport();

  const reports = reportsRes?.data ?? [];

  const handleGenerate = async () => {
    if (!runId.trim()) {
      toast.error('Enter a Test Run ID');
      return;
    }
    try {
      await generateReport.mutateAsync(runId.trim());
      toast.success('Report generated');
      setRunId('');
    } catch {
      toast.error('Failed to generate report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-teal-600" />
          <div>
            <h1 className="text-2xl font-bold">Test Reports</h1>
            <p className="text-sm text-gray-500">Per-run test analysis with category breakdown and recommendations</p>
          </div>
        </div>
      </div>

      {/* Generate from run ID */}
      <Card>
        <CardHeader><CardTitle className="text-base">Generate Report from Test Run</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 max-w-md">
            <Input
              placeholder="Paste Test Run ID..."
              value={runId}
              onChange={e => setRunId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
            <Button onClick={handleGenerate} disabled={generateReport.isPending}>
              <Zap className="h-4 w-4 mr-1" />
              {generateReport.isPending ? 'Generating...' : 'Generate'}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Run a test first via Automated Tests, then paste the run ID here to generate a full report.
          </p>
        </CardContent>
      </Card>

      {/* Reports list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No reports generated yet</p>
              <p className="text-sm mt-1">Generate a report from any completed test run above.</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report: any) => <ReportCard key={report.id} report={report} />)
        )}
      </div>
    </div>
  );
}
