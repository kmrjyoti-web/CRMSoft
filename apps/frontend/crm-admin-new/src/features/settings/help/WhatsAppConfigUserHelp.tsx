'use client';

import { Icon } from '@/components/ui';

export function WhatsAppConfigUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="message-circle" size={14} className="text-green-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The WhatsApp Configuration screen lets you connect your WhatsApp
          Business Account (WABA) to the CRM. Once connected, you can send
          and receive WhatsApp messages, templates, and media directly from
          the CRM conversation view.
        </p>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="activity" size={14} className="text-blue-600" />
          </span>
          Setup Workflow
        </h3>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>Go to the <strong>Meta Developer Portal</strong> and create a WhatsApp Business app</li>
          <li>Copy your <strong>WABA ID</strong>, <strong>Phone Number ID</strong>, and <strong>Permanent Access Token</strong></li>
          <li>Enter these details in the form and click <strong>Setup WhatsApp</strong></li>
          <li>Configure the <strong>Webhook URL</strong> and <strong>Verify Token</strong> shown below the form in your Meta portal</li>
          <li>Once configured, the status will change to <strong>Active</strong></li>
          <li>You can now send messages from the CRM conversation panel</li>
        </ol>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <Icon name="info" size={14} className="text-amber-600" />
          </span>
          Tips
        </h3>
        <div className="space-y-2">
          <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Your <strong>Access Token</strong> is stored encrypted. After saving,
            the token field will be blank &mdash; leave it empty to keep the existing token.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            The <strong>Verify Token</strong> is a secret string you define. Use the
            same value in both the CRM and the Meta webhook configuration.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            Check the <strong>connection status</strong> badge. If it shows
            &ldquo;Error&rdquo; or &ldquo;Disconnected&rdquo;, verify your token
            hasn&apos;t expired in the Meta portal.
          </div>
        </div>
      </section>
    </div>
  );
}
