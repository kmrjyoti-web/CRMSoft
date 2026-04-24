'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  IndianRupee,
  Code,
  Hash,
  Upload,
  Menu,
  Shield,
  Clock,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useModule } from '@/hooks/use-modules';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

// ── mock version history ────────────────────────────────────────────
interface VersionEntry {
  version: string;
  releaseDate: string;
  changelog: string;
}

const mockVersionHistory: VersionEntry[] = [
  { version: '1.3.0', releaseDate: '2026-03-05', changelog: 'Added bulk operations support, improved search performance, new dashboard widgets.' },
  { version: '1.2.1', releaseDate: '2026-02-18', changelog: 'Bug fix: corrected date formatting in reports. Fixed pagination for large datasets.' },
  { version: '1.2.0', releaseDate: '2026-02-01', changelog: 'New analytics dashboard, export to Excel, email notification triggers.' },
  { version: '1.1.0', releaseDate: '2026-01-15', changelog: 'Added workflow automation, custom field support, improved API rate limits.' },
  { version: '1.0.0', releaseDate: '2025-12-01', changelog: 'Initial release with core CRUD operations, basic reporting, and API access.' },
];

const mockMenuItems = [
  { name: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' },
  { name: 'List View', icon: 'list', route: '/list' },
  { name: 'Analytics', icon: 'bar-chart', route: '/analytics' },
  { name: 'Settings', icon: 'settings', route: '/settings' },
];

const mockPermissions = [
  { code: 'MODULE_READ', label: 'View module data', included: true },
  { code: 'MODULE_CREATE', label: 'Create new records', included: true },
  { code: 'MODULE_UPDATE', label: 'Edit existing records', included: true },
  { code: 'MODULE_DELETE', label: 'Delete records', included: true },
  { code: 'MODULE_EXPORT', label: 'Export data', included: true },
  { code: 'MODULE_ADMIN', label: 'Module administration', included: false },
];

// ── component ───────────────────────────────────────────────────────
export default function ModuleBuilderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: res, isLoading } = useModule(params.id);
  const mod = res?.data;

  if (isLoading) return <LoadingSpinner />;
  if (!mod) return <div className="text-center py-16 text-gray-500">Module not found</div>;

  const monthlyRevenue = (Number(mod.priceMonthly ?? mod.basePrice ?? 0)) * (mod._count?.tenantModules ?? 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{mod.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{mod.category}</Badge>
              <Badge variant="secondary">v{mod.version}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/module-builder/${params.id}/pages`)}>
            <FileText className="h-4 w-4" />
            Manage Pages
          </Button>
          <Button onClick={() => toast.info('Publish flow coming soon')}>
            <Upload className="h-4 w-4" />
            Publish New Version
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Subscribers', value: formatNumber(mod._count?.tenantModules ?? 0), icon: Users, color: 'text-blue-600' },
          { label: 'Monthly Revenue', value: formatCurrency(monthlyRevenue), icon: IndianRupee, color: 'text-green-600' },
          { label: 'Version', value: `v${mod.version}`, icon: Code, color: 'text-purple-600' },
          { label: 'Features', value: String(mod.features?.length ?? 0), icon: Hash, color: 'text-orange-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockVersionHistory.map((v, i) => (
              <div
                key={v.version}
                className={`flex gap-4 ${i < mockVersionHistory.length - 1 ? 'pb-4 border-b' : ''}`}
              >
                <div className="flex-shrink-0">
                  <Badge variant={i === 0 ? 'default' : 'secondary'}>v{v.version}</Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{v.changelog}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(v.releaseDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Menu configuration + Permissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Menu Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Menu className="h-5 w-5 text-gray-400" />
              Menu Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mockMenuItems.length === 0 ? (
              <p className="text-sm text-gray-400">No menu items configured</p>
            ) : (
              <ul className="space-y-2">
                {mockMenuItems.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                  >
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{item.route}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-400" />
              Required Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mockPermissions.length === 0 ? (
              <p className="text-sm text-gray-400">No permissions configured</p>
            ) : (
              <ul className="space-y-2">
                {mockPermissions.map((perm) => (
                  <li
                    key={perm.code}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">{perm.label}</span>
                      <p className="text-xs text-gray-400 font-mono">{perm.code}</p>
                    </div>
                    <Badge variant={perm.included ? 'success' : 'secondary'}>
                      {perm.included ? 'Included' : 'Optional'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
