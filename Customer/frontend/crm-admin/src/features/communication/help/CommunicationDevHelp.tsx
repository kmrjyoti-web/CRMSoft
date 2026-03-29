'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function CommunicationDevHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="database" size={14} className="text-blue-600" />
          </span>
          Prisma Models (key fields)
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model EmailTemplate {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, name, subject, body (HTML)</p>
          <p className="ml-4 text-gray-500">category: SALES | MARKETING | SUPPORT | NOTIFICATION | OTHER</p>
          <p className="ml-4 text-gray-500">isShared Boolean, createdById &rarr; User</p>
          <p className="ml-4 text-gray-500">createdAt, updatedAt, deletedAt?</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
        <div className="mt-3 rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model EmailSignature {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, name, body (HTML)</p>
          <p className="ml-4 text-gray-500">isDefault Boolean, createdById &rarr; User</p>
          <p className="ml-4 text-gray-500">createdAt, updatedAt</p>
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
        <p className="mb-2 text-xs font-medium text-gray-700">Email Templates</p>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/email-templates', desc: 'List (paginated, filter by category, search)' },
            { method: 'GET', path: '/email-templates/:id', desc: 'Detail with full body HTML' },
            { method: 'POST', path: '/email-templates', desc: 'Create (name, subject, body, category, isShared)' },
            { method: 'PUT', path: '/email-templates/:id', desc: 'Update (all fields optional)' },
            { method: 'DELETE', path: '/email-templates/:id', desc: 'Delete template' },
            { method: 'POST', path: '/email-templates/:id/preview', desc: 'Preview with merge-field substitution' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'PUT' ? 'warning' : 'danger'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
        <p className="mb-2 mt-4 text-xs font-medium text-gray-700">Email Signatures</p>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/email-signatures', desc: 'List all signatures' },
            { method: 'POST', path: '/email-signatures', desc: 'Create (name, body, isDefault)' },
            { method: 'PUT', path: '/email-signatures/:id', desc: 'Update signature' },
            { method: 'DELETE', path: '/email-signatures/:id', desc: 'Delete signature' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'PUT' ? 'warning' : 'danger'}>
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
          <p className="text-gray-500">app/(main)/communication/templates/page.tsx</p>
          <p className="ml-4 text-blue-700">&rarr; TemplateList.tsx</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; PageHeader + category filter buttons + search</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Table with Name, Category (Badge), Subject, Shared, Created, Actions</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Pagination (page/limit from meta)</p>
          <p className="text-gray-500 mt-2">app/(main)/communication/templates/[id]/page.tsx</p>
          <p className="ml-4 text-blue-700">&rarr; TemplateDetail.tsx (view/edit form)</p>
          <p className="text-gray-500 mt-2">app/(main)/communication/signatures/page.tsx</p>
          <p className="ml-4 text-blue-700">&rarr; SignatureList.tsx</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>emailTemplatesService</Code> + <Code>emailSignaturesService</Code> in communication.service.ts</p>
          <p className="text-gray-500">Query keys: <Code>[&quot;email-templates&quot;, params]</Code>, <Code>[&quot;email-signatures&quot;]</Code></p>
          <p className="text-gray-500">Hooks: <Code>useTemplatesList</Code>, <Code>useTemplateDetail</Code>, <Code>useCreateTemplate</Code>, <Code>useUpdateTemplate</Code>, <Code>useDeleteTemplate</Code></p>
          <p className="text-gray-500">Signature hooks: <Code>useSignaturesList</Code>, <Code>useCreateSignature</Code>, <Code>useUpdateSignature</Code>, <Code>useDeleteSignature</Code></p>
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
            <Icon name="alert-triangle" size={14} className="text-red-600" />
          </span>
          Key Patterns
        </h3>
        <ul className="space-y-2 text-xs">
          <li className="flex items-start gap-2">
            <Icon name="alert-triangle" size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <span>Category is an enum: <Code>SALES | MARKETING | SUPPORT | NOTIFICATION | OTHER</Code> &mdash; badge variant mapped in <Code>CATEGORY_BADGE_VARIANT</Code></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Template preview uses <Code>POST /email-templates/:id/preview</Code> with optional merge data payload</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Response pattern: <Code>data.data</Code> for list items, <Code>data.meta</Code> for pagination (page, totalPages, total, hasNext, hasPrevious)</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Templates support <strong>merge fields</strong> in subject and body &mdash; variables like <Code>{'{{contactName}}'}</Code> are replaced at send/preview time</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Delete uses <Code>useConfirmDialog</Code> for confirmation before calling <Code>DELETE /email-templates/:id</Code></span>
          </li>
        </ul>
      </section>
    </div>
  );
}
