'use client';

import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Card, Badge, Icon, Button, SelectInput } from '@/components/ui';
import {
  useModuleDefinitions,
  usePlanModuleAccess,
  useUpdatePlanModuleAccess,
} from '../hooks/useVendor';
import { MODULE_ACCESS_OPTIONS, MODULE_CATEGORY_COLORS } from '../utils/vendor-helpers';
import type { ModuleDefinitionItem, PlanModuleAccessItem } from '../types/vendor.types';

interface ModuleAccessEditorProps {
  planId: string;
}

interface AccessRow {
  moduleCode: string;
  moduleName: string;
  category: string;
  isCore: boolean;
  accessLevel: string;
}

export function ModuleAccessEditor({ planId }: ModuleAccessEditorProps) {
  const { data: modulesResp, isLoading: modulesLoading } = useModuleDefinitions();
  const { data: accessResp, isLoading: accessLoading } = usePlanModuleAccess(planId);
  const updateMut = useUpdatePlanModuleAccess();

  const [accessMap, setAccessMap] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const modules: ModuleDefinitionItem[] = Array.isArray(modulesResp?.data) ? modulesResp.data : [];
  const planAccess: PlanModuleAccessItem[] = Array.isArray(accessResp?.data) ? accessResp.data : [];

  // Initialize access map from fetched data
  useEffect(() => {
    const map: Record<string, string> = {};
    modules.forEach((mod) => {
      const existing = planAccess.find((a) => a.moduleCode === mod.code);
      map[mod.code] = existing?.accessLevel ?? 'MOD_DISABLED';
    });
    setAccessMap(map);
    setIsDirty(false);
  }, [modules, planAccess]);

  const rows: AccessRow[] = useMemo(() => {
    return modules
      .sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.sortOrder - b.sortOrder;
      })
      .map((mod) => ({
        moduleCode: mod.code,
        moduleName: mod.name,
        category: mod.category,
        isCore: mod.isCore,
        accessLevel: accessMap[mod.code] ?? 'MOD_DISABLED',
      }));
  }, [modules, accessMap]);

  const handleAccessChange = (moduleCode: string, accessLevel: string) => {
    setAccessMap((prev) => ({ ...prev, [moduleCode]: accessLevel }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    const modulesToSave = Object.entries(accessMap).map(([moduleCode, accessLevel]) => ({
      moduleCode,
      accessLevel,
    }));

    try {
      await updateMut.mutateAsync({ planId, modules: modulesToSave });
      toast.success('Module access updated');
      setIsDirty(false);
    } catch {
      toast.error('Failed to update module access');
    }
  };

  const isLoading = modulesLoading || accessLoading;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-gray-100 rounded" />
        ))}
      </div>
    );
  }

  // Group by category for visual separation
  let currentCategory = '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Module Access</h3>
          <p className="text-sm text-gray-500">
            Configure module access levels for this plan
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!isDirty || updateMut.isPending}
        >
          <Icon name="save" size={16} className="mr-2" />
          {updateMut.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Module</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 w-48">Access Level</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const showCategoryHeader = row.category !== currentCategory;
              currentCategory = row.category;
              const categoryColor =
                MODULE_CATEGORY_COLORS[row.category] ?? 'bg-gray-100 text-gray-700';

              return (
                <tr
                  key={row.moduleCode}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    showCategoryHeader ? 'border-t-2 border-t-gray-200' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{row.moduleName}</span>
                      {row.isCore && (
                        <Badge variant="primary" className="text-xs">Core</Badge>
                      )}
                    </div>
                    <code className="text-xs text-gray-400">{row.moduleCode}</code>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
                      {row.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <SelectInput
                      label=""
                      options={MODULE_ACCESS_OPTIONS}
                      value={row.accessLevel}
                      onChange={(v) => handleAccessChange(row.moduleCode, String(v ?? 'MOD_DISABLED'))}
                    />
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="py-12 text-center text-gray-400">
                  No modules available. Seed modules first in Module Registry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
