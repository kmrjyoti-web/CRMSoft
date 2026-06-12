'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function EmailConfigDevHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      {/* Model */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="database" size={14} className="text-blue-600" />
          </span>
          EmailAccount &mdash; Model
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model EmailAccount {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, userId &rarr; User</p>
          <p className="ml-4 text-gray-500">provider: GMAIL | OUTLOOK | IMAP_SMTP | ORGANIZATION_SMTP</p>
          <p className="ml-4 text-gray-500">emailAddress, displayName?, label?</p>
          <p className="ml-4 text-gray-500">accessToken?, refreshToken?, tokenExpiresAt?</p>
          <p className="ml-4 text-gray-500">imapHost?, imapPort?, smtpHost?, smtpPort?</p>
          <p className="ml-4 text-gray-500">status: ACTIVE | DISCONNECTED | ERROR | TOKEN_EXPIRED | SYNCING</p>
          <p className="ml-4 text-gray-500">lastSyncAt?, syncEnabled, isDefault, dailySendLimit</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
      </section>

      {/* API */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="globe" size={14} className="text-green-600" />
          </span>
          API Endpoints
        </h3>
        <div className="space-y-1.5">
          {[
            { method: 'GET', path: '/api/v1/email-accounts', desc: 'List all connected accounts for current user' },
            { method: 'GET', path: '/api/v1/email-accounts/:id', desc: 'Account detail' },
            { method: 'POST', path: '/api/v1/email-accounts/connect', desc: 'Connect new account (provider, email, SMTP fields)' },
            { method: 'POST', path: '/api/v1/email-accounts/:id/disconnect', desc: 'Disconnect account (sets status = DISCONNECTED)' },
            { method: 'POST', path: '/api/v1/email-accounts/:id/sync', desc: 'Trigger manual inbox sync' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : 'success'}>
                {ep.method}
              </Badge>
              <Code>{ep.path}</Code>
              <span className="text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Frontend */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100">
            <Icon name="layers" size={14} className="text-cyan-600" />
          </span>
          Frontend Architecture
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="text-gray-500">app/(main)/settings/email/page.tsx</p>
          <p className="ml-4 text-blue-700">&rarr; EmailConfigList.tsx (TableFull, tableKey=&quot;email-accounts&quot;)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; useEntityPanel &rarr; EmailConfigForm (sidebar)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Sync/Disconnect row actions</p>
          <p className="ml-4 text-blue-700">&rarr; EmailConfigForm.tsx</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Provider selector + dynamic SMTP fields</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>emailConfigService</Code> (getAll, getById, connect, disconnect, sync)</p>
          <p className="text-gray-500">Hooks: <Code>useEmailAccounts</Code>, <Code>useConnectEmail</Code>, <Code>useDisconnectEmail</Code>, <Code>useSyncEmail</Code></p>
        </div>
      </section>

      {/* Key Patterns */}
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
            <span>OAuth tokens (accessToken, refreshToken) are stored encrypted in the database</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Backend uses CQRS: <Code>ConnectAccountCommand</Code>, <Code>SyncInboxCommand</Code>, <Code>DisconnectCommand</Code></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>IMAP/SMTP fields only shown when provider is <Code>IMAP_SMTP</Code> or <Code>ORGANIZATION_SMTP</Code></span>
          </li>
        </ul>
      </section>
    </div>
  );
}
