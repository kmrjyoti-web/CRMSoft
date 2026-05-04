'use client';

import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ENDPOINT_GROUPS = [
  { group: 'Auth', path: '/auth/*' },
  { group: 'Vendor Modules', path: '/vendor/modules' },
  { group: 'Vendor Licenses', path: '/vendor/licenses' },
  { group: 'Vendor Tenants', path: '/vendor/tenants' },
  { group: 'Plans', path: '/admin/plans' },
  { group: 'Offers', path: '/admin/offers' },
  { group: 'Wallet', path: '/admin/wallet/*' },
  { group: 'System Health', path: '/admin/system-health' },
  { group: 'Error Logs', path: '/admin/error-logs' },
  { group: 'Audit Logs', path: '/admin/audit-logs' },
  { group: 'DB Admin', path: '/admin/db' },
];

const API_DOCS_URL = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || ''}/api/docs`;

export default function ApiDocsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Documentation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Interactive API reference powered by Swagger
          </p>
        </div>
        <a href={API_DOCS_URL} target="_blank" rel="noopener noreferrer">
          <Button>
            Open Swagger UI
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        </a>
      </div>

      {/* Embedded Swagger */}
      <Card>
        <CardContent className="p-0">
          <iframe
            src={API_DOCS_URL}
            title="Swagger UI"
            className="w-full border-0 rounded-lg"
            style={{ height: '600px' }}
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.nextElementSibling;
              if (fallback) (fallback as HTMLElement).style.display = 'flex';
            }}
          />
          <div
            className="hidden items-center justify-center h-[200px] text-sm text-muted-foreground"
          >
            Unable to load Swagger UI. Make sure the API server is running and NEXT_PUBLIC_API_URL is set.
          </div>
        </CardContent>
      </Card>

      {/* Quick reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endpoint Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Group</th>
                  <th className="text-left py-2 font-medium text-gray-500">Base Path</th>
                </tr>
              </thead>
              <tbody>
                {ENDPOINT_GROUPS.map((ep) => (
                  <tr key={ep.group} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{ep.group}</td>
                    <td className="py-2">
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{ep.path}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
