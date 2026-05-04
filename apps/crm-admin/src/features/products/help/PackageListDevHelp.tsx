'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function PackageListDevHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="database" size={14} className="text-blue-600" />
          </span>
          Prisma Model
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model Package {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, name, code, description?, type?</p>
          <p className="ml-4 text-gray-500">isActive Boolean @default(true)</p>
          <p className="ml-4 text-gray-500">@@unique([tenantId, name]), @@unique([tenantId, code])</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="globe" size={14} className="text-green-600" />
          </span>
          API Endpoints
        </h3>
        <div className="space-y-1.5">
          {[
            { method: 'POST', path: '/api/v1/packages', desc: 'Create package' },
            { method: 'GET', path: '/api/v1/packages', desc: 'List (search/pagination)' },
            { method: 'GET', path: '/api/v1/packages/:id', desc: 'Get by ID' },
            { method: 'PUT', path: '/api/v1/packages/:id', desc: 'Update' },
            { method: 'DELETE', path: '/api/v1/packages/:id', desc: 'Deactivate' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'DELETE' ? 'danger' : 'warning'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
            <Icon name="layers" size={14} className="text-purple-600" />
          </span>
          Frontend Architecture
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="text-gray-500">app/(main)/products/packages/page.tsx</p>
          <p className="ml-4 text-blue-700">└── PackageList.tsx</p>
          <p className="ml-8 text-gray-500">├── TableFull (tableKey=&quot;packages&quot;)</p>
          <p className="ml-8 text-gray-500">├── useEntityPanel → PackageForm</p>
          <p className="ml-8 text-gray-500">└── useDeletePackage</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>packageService</Code> in products.service.ts</p>
          <p className="text-gray-500">Query key: <Code>[&quot;packages&quot;, params]</Code></p>
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <Icon name="alert-triangle" size={14} className="text-amber-600" />
          </span>
          Key Patterns
        </h3>
        <ul className="space-y-1.5 text-xs">
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>New module — follows exact Brands controller pattern (direct Prisma)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>No link tables (unlike Brand/Manufacturer) — standalone entity</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
