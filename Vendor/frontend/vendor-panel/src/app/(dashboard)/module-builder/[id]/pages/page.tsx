'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  GripVertical,
  Plus,
  Eye,
  Trash2,
  Search,
  RefreshCw,
  Menu as MenuIcon,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import {
  useModulePages,
  useUnassignedPages,
  useAssignPage,
  useUnassignPage,
  useReorderModulePages,
  useSyncMenus,
} from '@/hooks/use-page-registry';
import { useModule } from '@/hooks/use-modules';
import { useDebounce } from '@/hooks/use-debounce';
import { extractList } from '@/lib/utils';
import { toast } from 'sonner';
import type { PageRegistryItem } from '@/types/page-registry';

const TYPE_COLORS: Record<string, string> = {
  LIST: 'bg-blue-100 text-blue-800',
  CREATE: 'bg-green-100 text-green-800',
  DETAIL: 'bg-purple-100 text-purple-800',
  EDIT: 'bg-yellow-100 text-yellow-800',
  DASHBOARD: 'bg-indigo-100 text-indigo-800',
  SETTINGS: 'bg-gray-100 text-gray-800',
  REPORT: 'bg-orange-100 text-orange-800',
  WIZARD: 'bg-pink-100 text-pink-800',
};

export default function ModuleMenuBuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: moduleRes, isLoading: loadingModuleDef } = useModule(params.id);
  const mod = moduleRes?.data;
  const moduleCode = mod?.code || '';
  const [search, setSearch] = useState('');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: modulePagesRes, isLoading: loadingModule } = useModulePages(moduleCode);
  const { data: unassignedRes, isLoading: loadingUnassigned } = useUnassignedPages({
    search: debouncedSearch || undefined,
    limit: 100,
  });

  const assignMut = useAssignPage();
  const unassignMut = useUnassignPage();
  const reorderMut = useReorderModulePages();
  const syncMut = useSyncMenus();

  const modulePages: PageRegistryItem[] = modulePagesRes?.data || [];
  const unassignedPages: PageRegistryItem[] = extractList(unassignedRes);

  const selectedPage = [...modulePages, ...unassignedPages].find((p) => p.id === selectedPageId);

  const handleAssign = (pageId: string) => {
    const pg = unassignedPages.find((p) => p.id === pageId);
    assignMut.mutate(
      {
        id: pageId,
        data: {
          moduleCode,
          friendlyName: pg?.friendlyName || undefined,
          showInMenu: pg ? !pg.hasParams : true,
        },
      },
      { onSuccess: () => toast.success('Page added to module') },
    );
  };

  const handleUnassign = (pageId: string) => {
    unassignMut.mutate(pageId, {
      onSuccess: () => toast.success('Page removed from module'),
    });
  };

  const handleSyncMenus = () => {
    syncMut.mutate(moduleCode, {
      onSuccess: (result) => {
        const d = result?.data;
        toast.success(`Synced ${d?.synced ?? 0} menu entries across ${d?.tenants ?? 0} tenants`);
      },
    });
  };

  // Simple drag reorder handlers
  const handleDragStart = (idx: number) => setDraggedIdx(idx);

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
  };

  const handleDrop = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      return;
    }

    const items = [...modulePages];
    const [moved] = items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, moved);
    setDraggedIdx(null);

    // Save new order
    reorderMut.mutate(
      { moduleCode, orderedIds: items.map((p) => p.id) },
      { onSuccess: () => toast.success('Order saved') },
    );
  };

  const routeDisplay = (pg: PageRegistryItem) => {
    const r = pg.routePath;
    return r.includes(':') ? r.split(':').slice(1).join(':') : r;
  };

  const previewUrl = selectedPage
    ? (selectedPage.portal === 'crm' ? 'http://localhost:3005' : 'http://localhost:3006') +
      routeDisplay(selectedPage).replace(/:(\w+)/g, 'demo')
    : '';

  if (loadingModule || loadingModuleDef || !moduleCode) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Module Menu Builder</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="info">{moduleCode}</Badge>
              <span className="text-sm text-gray-500">{modulePages.length} pages assigned</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSyncMenus}
            disabled={syncMut.isPending}
          >
            <RefreshCw className={`h-4 w-4 ${syncMut.isPending ? 'animate-spin' : ''}`} />
            {syncMut.isPending ? 'Syncing...' : 'Sync to Menu Table'}
          </Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Available Pages */}
        <Card className="max-h-[600px] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              Available Pages
              <Badge variant="secondary" className="ml-auto">{unassignedPages.length}</Badge>
            </CardTitle>
            <Input
              leftIcon={<Search className="h-4 w-4" />}
              placeholder="Search unassigned pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-1.5 pt-0">
            {loadingUnassigned ? (
              <div className="py-8 text-center text-gray-400">Loading...</div>
            ) : unassignedPages.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                {debouncedSearch ? 'No matching pages' : 'All pages are assigned'}
              </div>
            ) : (
              unassignedPages.map((pg) => (
                <div
                  key={pg.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedPageId === pg.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedPageId(pg.id)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {pg.friendlyName || routeDisplay(pg)}
                    </p>
                    <p className="text-xs text-gray-400 font-mono truncate">{routeDisplay(pg)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    {pg.pageType && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${TYPE_COLORS[pg.pageType] || 'bg-gray-100 text-gray-800'}`}>
                        {pg.pageType}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); handleAssign(pg.id); }}
                      disabled={assignMut.isPending}
                      title="Add to module"
                    >
                      <Plus className="h-4 w-4 text-green-600" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right: Module Pages (draggable) */}
        <Card className="max-h-[600px] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MenuIcon className="h-4 w-4 text-gray-400" />
              Module Pages
              <Badge variant="info" className="ml-auto">{modulePages.length}</Badge>
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">Drag to reorder. Click to preview.</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-1.5 pt-0">
            {modulePages.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                No pages assigned yet. Add pages from the left panel.
              </div>
            ) : (
              modulePages.map((pg, idx) => (
                <div
                  key={pg.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={() => setDraggedIdx(null)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border hover:shadow-sm transition-all cursor-grab active:cursor-grabbing ${
                    draggedIdx === idx ? 'opacity-50 scale-95' : ''
                  } ${selectedPageId === pg.id ? 'ring-2 ring-primary bg-primary/5' : 'bg-white'}`}
                  onClick={() => setSelectedPageId(pg.id)}
                >
                  <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {pg.friendlyName || routeDisplay(pg)}
                      </p>
                      {pg.pageType && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold flex-shrink-0 ${TYPE_COLORS[pg.pageType] || 'bg-gray-100 text-gray-800'}`}>
                          {pg.pageType}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400 font-mono truncate">{routeDisplay(pg)}</span>
                      <span className="text-[10px] text-gray-400">
                        {pg.featuresCovered?.length || 0} features
                      </span>
                      <span className="text-[10px]">
                        {pg.showInMenu && !pg.hasParams ? (
                          <span className="text-green-600">Menu: Yes</span>
                        ) : (
                          <span className="text-gray-300">Menu: No</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!pg.hasParams && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = (pg.portal === 'crm' ? 'http://localhost:3005' : 'http://localhost:3006') +
                            routeDisplay(pg);
                          window.open(url, '_blank');
                        }}
                        title="Preview in new tab"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-600"
                      onClick={(e) => { e.stopPropagation(); handleUnassign(pg.id); }}
                      disabled={unassignMut.isPending}
                      title="Remove from module"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel */}
      {selectedPage && !selectedPage.hasParams && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-400" />
              Preview: {selectedPage.friendlyName || routeDisplay(selectedPage)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              src={previewUrl}
              className="w-full h-96 border rounded-lg"
              title={`Preview: ${selectedPage.friendlyName || selectedPage.routePath}`}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
