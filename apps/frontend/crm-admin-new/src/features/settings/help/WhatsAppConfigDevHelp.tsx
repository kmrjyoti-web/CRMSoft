'use client';

import { Icon, Badge } from '@/components/ui';

function Code({ children }: { children: string }) {
  return <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">{children}</code>;
}

export function WhatsAppConfigDevHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      {/* Model */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="database" size={14} className="text-green-600" />
          </span>
          WhatsAppBusinessAccount &mdash; Model
        </h3>
        <div className="rounded-lg border border-gray-100 bg-slate-50 p-3 font-mono text-xs space-y-0.5">
          <p className="font-semibold text-gray-700">model WhatsAppBusinessAccount {'{'}</p>
          <p className="ml-4 text-gray-500">id, tenantId, wabaId (unique), phoneNumberId (unique)</p>
          <p className="ml-4 text-gray-500">phoneNumber, displayName, accessToken, webhookVerifyToken</p>
          <p className="ml-4 text-gray-500">apiVersion: &quot;v21.0&quot;</p>
          <p className="ml-4 text-gray-500">connectionStatus: ACTIVE | DISCONNECTED | ERROR | PENDING_VERIFICATION</p>
          <p className="ml-4 text-gray-500">autoReplyEnabled, businessHoursEnabled, welcomeMessageEnabled</p>
          <p className="ml-4 text-gray-500">totalConversations, totalMessagesSent, totalMessagesReceived</p>
          <p className="text-gray-700">{'}'}</p>
        </div>
      </section>

      {/* API */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="globe" size={14} className="text-blue-600" />
          </span>
          API Endpoints
        </h3>
        <div className="space-y-1.5">
          {[
            { method: 'POST', path: '/api/v1/whatsapp/waba/setup', desc: 'Setup new WABA (wabaId, phoneNumberId, accessToken, etc.)' },
            { method: 'PUT', path: '/api/v1/whatsapp/waba/:id', desc: 'Update WABA (displayName, accessToken, settings)' },
            { method: 'GET', path: '/api/v1/whatsapp/waba/:id', desc: 'Get WABA detail with stats' },
          ].map((ep) => (
            <div key={ep.path + ep.method} className="flex items-start gap-2 text-xs">
              <Badge variant={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : 'warning'}>
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
          <p className="text-gray-500">app/(main)/settings/whatsapp/page.tsx</p>
          <p className="ml-4 text-blue-700">&rarr; WhatsAppConfig.tsx (single-page config form)</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Setup mode: 6-field form</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Edit mode: update displayName + accessToken</p>
          <p className="ml-8 text-gray-500">&boxur;&horbar; Webhook info section (URL + verify token)</p>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-gray-500">Service: <Code>whatsappConfigService</Code> (setup, update, getConfig)</p>
          <p className="text-gray-500">Hooks: <Code>useWABAConfig</Code>, <Code>useSetupWABA</Code>, <Code>useUpdateWABA</Code></p>
          <p className="text-gray-500">Types: <Code>WABAConfig</Code>, <Code>WABASetupPayload</Code>, <Code>WABAUpdatePayload</Code></p>
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
            <span>Access token is stored encrypted &mdash; not returned in GET response. Update sends new token only if provided.</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Backend uses CQRS &mdash; <Code>SetupWabaCommand</Code> and <Code>UpdateWabaCommand</Code> via <Code>CommandBus</Code></span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="info" size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Webhook endpoint: <Code>POST /api/v1/whatsapp/webhook</Code> &mdash; receives Meta webhook events</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
