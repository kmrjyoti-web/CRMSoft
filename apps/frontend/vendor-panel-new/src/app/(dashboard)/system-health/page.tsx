'use client';

import { Server, Database, HardDrive, ListTodo, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSystemHealth, useSystemMetrics } from '@/hooks/use-system-health';
import { formatNumber } from '@/lib/utils';
import type { ServiceStatus } from '@/types/system-health';

const STATUS_VARIANT: Record<ServiceStatus, 'success' | 'warning' | 'destructive'> = {
  HEALTHY: 'success',
  DEGRADED: 'warning',
  DOWN: 'destructive',
};

export default function SystemHealthPage() {
  const { data: res, isLoading, refetch } = useSystemHealth();
  const { data: metricsRes } = useSystemMetrics('response_time', 24);

  const health = res?.data;
  const metrics = metricsRes?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-sm text-gray-500">Real-time monitoring of platform services</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Service Status Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : health ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* API */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2"><Server className="h-4 w-4" />API</span>
                <Badge variant={STATUS_VARIANT[health.api.status]}>{health.api.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Uptime</span>
                <span className="font-medium">{health.api.uptime.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Response Time</span>
                <span className="font-medium">{health.api.responseTimeMs}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Requests/min</span>
                <span className="font-medium">{formatNumber(health.api.requestsPerMin)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Database */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2"><Database className="h-4 w-4" />Database</span>
                <Badge variant={STATUS_VARIANT[health.database.status]}>{health.database.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Connection Pool</span>
                <span className="font-medium">{health.database.connectionPool}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Query Time</span>
                <span className="font-medium">{health.database.queryTimeMs}ms</span>
              </div>
            </CardContent>
          </Card>

          {/* Redis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2"><HardDrive className="h-4 w-4" />Redis</span>
                <Badge variant={STATUS_VARIANT[health.redis.status]}>{health.redis.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Memory Used</span>
                <span className="font-medium">{health.redis.memoryUsedMb} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Connected Clients</span>
                <span className="font-medium">{health.redis.connectedClients}</span>
              </div>
            </CardContent>
          </Card>

          {/* Queue */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2"><ListTodo className="h-4 w-4" />Queue</span>
                <Badge variant={STATUS_VARIANT[health.queue.status]}>{health.queue.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Pending</span>
                <span className="font-medium">{formatNumber(health.queue.pending)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active</span>
                <span className="font-medium">{formatNumber(health.queue.active)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Failed</span>
                <span className="font-medium text-red-600">{formatNumber(health.queue.failed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Completed</span>
                <span className="font-medium text-green-600">{formatNumber(health.queue.completed)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">Unable to load system health data</div>
      )}

      {/* Response Time Trend */}
      {metrics && metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Response Time Trend (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {metrics.map((point, i) => {
                const maxVal = Math.max(...metrics.map((m) => m.value), 1);
                const heightPercent = (point.value / maxVal) * 100;
                const barColor = point.value > 500 ? 'bg-red-400' : point.value > 200 ? 'bg-yellow-400' : 'bg-green-400';
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-end"
                    title={`${new Date(point.timestamp).toLocaleTimeString()}: ${point.value}ms`}
                  >
                    <div
                      className={`w-full rounded-t ${barColor} min-h-[2px]`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>24h ago</span>
              <span>Now</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
