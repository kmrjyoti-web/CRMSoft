'use client';

import { Icon } from '@/components/ui';

export function EmailConfigUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="mail" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Email Configuration screen lets you connect email accounts to the CRM.
          Connected accounts can send and receive emails directly from contact and
          lead views. You can connect Gmail, Outlook, or custom IMAP/SMTP servers.
        </p>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="activity" size={14} className="text-green-600" />
          </span>
          Typical Workflow
        </h3>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>Click <strong>+ Create</strong> to connect a new email account</li>
          <li>Select the <strong>Provider</strong> (Gmail, Outlook, or IMAP/SMTP)</li>
          <li>Enter your <strong>Email Address</strong> and <strong>Display Name</strong></li>
          <li>For IMAP/SMTP, provide <strong>server details</strong> (host, port, credentials)</li>
          <li>Click <strong>Connect Account</strong> to save</li>
          <li>Use <strong>Sync Now</strong> to manually trigger inbox synchronization</li>
          <li>Use <strong>Disconnect</strong> to remove an account from the CRM</li>
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
            Each user can connect <strong>multiple email accounts</strong>. Set one as
            <strong> default</strong> for outgoing emails from the CRM.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <strong>Gmail/Outlook</strong> accounts use OAuth tokens. If the status shows
            &ldquo;Token Expired&rdquo;, reconnect the account to refresh the token.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            The <strong>daily send limit</strong> (default 500) helps prevent your account
            from being flagged as spam. Adjust in account settings if needed.
          </div>
        </div>
      </section>
    </div>
  );
}
