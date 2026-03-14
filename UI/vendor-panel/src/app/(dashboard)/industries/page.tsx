'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Factory,
  Sprout,
  Search,
  ChevronRight,
  Users,
  Layers,
  Building2,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Utensils,
  Briefcase,
  Landmark,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { useIndustries, useSeedIndustries } from '@/hooks/use-industries';
import { extractList } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { IndustryType } from '@/lib/api/industries';

// ─── Icon mapping for industry types ───
const INDUSTRY_ICONS: Record<string, React.ElementType> = {
  Factory,
  Building2,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Utensils,
  Briefcase,
  Landmark,
  Truck,
  Layers,
};

function getIndustryIcon(icon?: string): React.ElementType {
  if (icon && INDUSTRY_ICONS[icon]) return INDUSTRY_ICONS[icon];
  return Factory;
}

// ─── Color theme mapping ───
const THEME_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
};

function getTheme(color?: string) {
  return THEME_COLORS[color ?? ''] ?? THEME_COLORS.blue;
}

// ─── Category badge variant ───
const CATEGORY_VARIANT: Record<string, 'default' | 'info' | 'warning' | 'success' | 'secondary'> = {
  MANUFACTURING: 'info',
  SERVICES: 'success',
  RETAIL: 'warning',
  TECHNOLOGY: 'default',
  HEALTHCARE: 'info',
  EDUCATION: 'secondary',
  FINANCE: 'success',
};

export default function IndustriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: res, isLoading } = useIndustries();
  const seedMut = useSeedIndustries();

  const allIndustries: IndustryType[] = extractList(res);

  // Filter by search
  const industries = search
    ? allIndustries.filter(
        (ind) =>
          ind.typeName.toLowerCase().includes(search.toLowerCase()) ||
          ind.typeCode.toLowerCase().includes(search.toLowerCase()) ||
          ind.industryCategory.toLowerCase().includes(search.toLowerCase()),
      )
    : allIndustries;

  const handleSeed = async () => {
    try {
      const result = await seedMut.mutateAsync();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const seeded = (result as any)?.data?.seeded ?? (result as any)?.seeded ?? 0;
      toast.success(`Seeded ${seeded} industry types`);
    } catch {
      toast.error('Failed to seed industry types');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Industry Types</h1>
          <p className="text-sm text-gray-500">
            Manage industry configurations and terminology mappings
          </p>
        </div>
        <Button onClick={handleSeed} loading={seedMut.isPending} variant="outline">
          <Sprout className="h-4 w-4" />
          Seed Defaults
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search industries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {allIndustries.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Layers className="h-4 w-4" />
            {industries.length} of {allIndustries.length} types
          </div>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : industries.length === 0 ? (
        <EmptyState
          icon={Factory}
          title="No industry types"
          description={
            search
              ? 'No industries match your search. Try a different term.'
              : 'Seed default industry types to get started.'
          }
          actionLabel={search ? undefined : 'Seed Defaults'}
          onAction={search ? undefined : handleSeed}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {industries.map((ind) => {
            const theme = getTheme(ind.colorTheme);
            const IconComp = getIndustryIcon(ind.icon);

            return (
              <Card
                key={ind.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5',
                  !ind.isActive && 'opacity-60',
                )}
                onClick={() => router.push(`/industries/${ind.typeCode}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'h-12 w-12 rounded-lg flex items-center justify-center shrink-0',
                        theme.bg,
                      )}
                    >
                      <IconComp className={cn('h-6 w-6', theme.text)} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {ind.typeName}
                        </h3>
                        {ind.isDefault && (
                          <Badge variant="info" className="text-[10px] shrink-0">
                            Default
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={CATEGORY_VARIANT[ind.industryCategory] ?? 'secondary'}
                          className="text-[10px]"
                        >
                          {ind.industryCategory}
                        </Badge>
                        <span className="text-xs text-gray-400 font-mono">
                          {ind.typeCode}
                        </span>
                      </div>

                      {ind.description && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {ind.description}
                        </p>
                      )}

                      {/* Footer stats */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {ind._count?.tenants ?? 0} tenants
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {ind.defaultModules?.length ?? 0} modules
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant={ind.isActive ? 'success' : 'secondary'}
                            className="text-[10px]"
                          >
                            {ind.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-gray-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
