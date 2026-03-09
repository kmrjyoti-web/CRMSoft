'use client';

import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { Card, Badge, Icon, Button } from '@/components/ui';
import { useModuleDefinitions, useSeedModules } from '../hooks/useVendor';
import { MODULE_CATEGORY_COLORS } from '../utils/vendor-helpers';
import type { ModuleDefinitionItem } from '../types/vendor.types';

export function ModuleRegistry() {
  const { data: modulesResp, isLoading } = useModuleDefinitions();
  const seedMut = useSeedModules();

  const modules: ModuleDefinitionItem[] = Array.isArray(modulesResp?.data) ? modulesResp.data : [];

  // Group modules by category
  const grouped = useMemo(() => {
    const map = new Map<string, ModuleDefinitionItem[]>();
    modules.forEach((mod) => {
      const existing = map.get(mod.category) ?? [];
      existing.push(mod);
      map.set(mod.category, existing);
    });
    // Sort within each category by sortOrder
    map.forEach((mods) => mods.sort((a, b) => a.sortOrder - b.sortOrder));
    return map;
  }, [modules]);

  const handleSeed = async () => {
    if (!confirm('Seed default module definitions? This will add missing modules.')) return;
    try {
      await seedMut.mutateAsync();
      toast.success('Modules seeded successfully');
    } catch {
      toast.error('Failed to seed modules');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module Registry</h1>
          <p className="text-sm text-gray-500 mt-1">
            {modules.length} modules across {grouped.size} categories
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleSeed}
          disabled={seedMut.isPending}
        >
          <Icon name="database" size={16} className="mr-2" />
          {seedMut.isPending ? 'Seeding...' : 'Seed Modules'}
        </Button>
      </div>

      {Array.from(grouped.entries()).map(([category, categoryModules]) => {
        const categoryColor = MODULE_CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-700';

        return (
          <Card key={category} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColor}`}>
                {category}
              </span>
              <span className="text-sm text-gray-400">{categoryModules.length} modules</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryModules.map((mod) => (
                <div
                  key={mod.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    mod.isActive
                      ? 'border-gray-200 bg-white'
                      : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Icon
                      name={(mod.iconName as any) ?? 'package'}
                      size={16}
                      className="text-gray-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {mod.name}
                      </span>
                      {mod.isCore && (
                        <Badge variant="primary" className="text-xs">Core</Badge>
                      )}
                    </div>
                    <code className="text-xs text-gray-400">{mod.code}</code>
                    {mod.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{mod.description}</p>
                    )}
                    {mod.dependsOn.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Icon name="link" size={10} className="text-gray-300" />
                        <span className="text-xs text-gray-400">
                          Depends: {mod.dependsOn.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  {!mod.isActive && (
                    <Badge variant="danger" className="shrink-0 text-xs">Off</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {grouped.size === 0 && (
        <Card className="p-12 text-center">
          <Icon name="package" size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No modules registered yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Click "Seed Modules" to populate default module definitions.
          </p>
        </Card>
      )}
    </div>
  );
}
