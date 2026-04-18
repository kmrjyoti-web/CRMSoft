'use client';

import { useState } from 'react';
import { Layers, Plus, CheckCircle2, XCircle, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select } from '@/components/ui/select';
import { useVerticals } from '@/hooks/use-verticals';
import { extractList } from '@/lib/utils';
import type { Vertical } from '@/lib/api/verticals';

export default function VerticalsPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [builtFilter, setBuiltFilter] = useState<string>('all');
  const { data: res, isLoading, isError } = useVerticals();

  const allVerticals: Vertical[] = extractList(res);

  const verticals = allVerticals.filter((v) => {
    if (activeFilter === 'active' && !v.isActive) return false;
    if (activeFilter === 'inactive' && v.isActive) return false;
    if (builtFilter === 'built' && !v.isBuilt) return false;
    if (builtFilter === 'unbuilt' && v.isBuilt) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6" />
            Vertical Registry
          </h1>
          <p className="text-sm text-gray-500">
            Canonical registry of verticals and their module mappings
          </p>
        </div>
        <Button disabled title="Available after vertical loader sprint" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Vertical
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
        <Select value={builtFilter} onChange={(e) => setBuiltFilter(e.target.value)}>
          <option value="all">All Build Status</option>
          <option value="built">Built (shipped)</option>
          <option value="unbuilt">Unbuilt</option>
        </Select>
      </div>

      {/* Error state */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Failed to load verticals. Please try again.
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-3">
            <Skeleton className="h-4 w-48" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 border-t">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && verticals.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No verticals found</p>
          <p className="text-sm">The registry is empty or no verticals match the current filters.</p>
        </div>
      )}

      {/* AICTable — verticals list */}
      {!isLoading && verticals.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600 border-b">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Table Prefix</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium">Built</th>
                <th className="px-4 py-3 font-medium">Modules</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {verticals.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{v.code}</code>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-gray-500">{v.tablePrefix}</code>
                  </td>
                  <td className="px-4 py-3">
                    {v.isActive ? (
                      <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-400">
                        <XCircle className="w-3 h-3 mr-1" /> Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {v.isBuilt ? (
                      <Badge variant="default" className="bg-blue-100 text-blue-700 border-blue-200">
                        <Wrench className="w-3 h-3 mr-1" /> Built
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-400">Unbuilt</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">{v.modules.length} modules</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
