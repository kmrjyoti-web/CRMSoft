'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import toast from 'react-hot-toast';

import { Input, Button, Icon, SelectInput, Switch, Fieldset } from '@/components/ui';

import { useSidePanelStore } from '@/stores/side-panel.store';

import { useConnectEmail, useTestEmailConnection, useOAuthInitiate } from '../hooks/useEmailConfig';

import { useCredentials } from '../hooks/useIntegrations';

// ── Props ────────────────────────────────────────────────

interface EmailConfigFormProps {
  emailAccountId?: string;
  mode?: 'page' | 'panel';
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Schema ───────────────────────────────────────────────

const emailConnectSchema = z.object({
  provider: z.enum(['GMAIL', 'OUTLOOK', 'IMAP_SMTP', 'ORGANIZATION_SMTP']),
  emailAddress: z.string().email('Valid email required'),
  displayName: z.string().optional(),
  label: z.string().optional(),

  // IMAP fields
  imapHost: z.string().optional(),
  imapPort: z.coerce.number().optional(),
  imapSecure: z.boolean().optional(),

  // SMTP fields
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().optional(),
  smtpSecure: z.boolean().optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
});

type EmailConnectFormData = z.infer<typeof emailConnectSchema>;

// ── Provider options ─────────────────────────────────────

const PROVIDER_OPTIONS = [
  { label: 'Gmail', value: 'GMAIL' },
  { label: 'Outlook', value: 'OUTLOOK' },
  { label: 'IMAP / SMTP', value: 'IMAP_SMTP' },
  { label: 'Organization SMTP', value: 'ORGANIZATION_SMTP' },
];

// ── Component ────────────────────────────────────────────

export function EmailConfigForm({
  emailAccountId,
  mode = 'panel',
  panelId,
  onSuccess,
  onCancel,
}: EmailConfigFormProps) {
  const connectMutation = useConnectEmail();
  const testMutation = useTestEmailConnection();
  const oauthInitiateMutation = useOAuthInitiate();
  const [oauthConnecting, setOauthConnecting] = useState(false);

  // Check if OAuth credentials are configured for the tenant
  const { data: credentialsResponse } = useCredentials();
  const configuredProviders = useMemo(() => {
    const raw = (credentialsResponse as any)?.data ?? credentialsResponse ?? [];
    const items = Array.isArray(raw) ? raw : [];
    return items
      .filter((c: any) => c.status === 'ACTIVE')
      .map((c: any) => c.provider as string);
  }, [credentialsResponse]);

  const formId = `sp-form-email-${emailAccountId ?? 'new'}`;

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EmailConnectFormData>({
    resolver: zodResolver(emailConnectSchema) as any,
    defaultValues: {
      provider: 'GMAIL',
      emailAddress: '',
      displayName: '',
      label: '',
      imapHost: '',
      imapPort: 993,
      imapSecure: true,
      smtpHost: '',
      smtpPort: 587,
      smtpSecure: true,
      smtpUsername: '',
      smtpPassword: '',
    },
  });

  const provider = watch('provider');
  const isSmtp = provider === 'IMAP_SMTP' || provider === 'ORGANIZATION_SMTP';
  const isOAuth = provider === 'GMAIL' || provider === 'OUTLOOK';

  // Sync submitting state to panel footer
  const setFooterDisabled = useSidePanelStore((s) => s.setFooterDisabled);
  useEffect(() => {
    if (mode === 'panel') setFooterDisabled?.(isSubmitting);
  }, [isSubmitting, mode, setFooterDisabled]);

  // ── OAuth Connect handler ──────────────────────────────

  const handleOAuthConnect = useCallback(async () => {
    const vals = getValues();
    if (!vals.emailAddress) {
      toast.error('Please enter your email address first');
      return;
    }

    try {
      setOauthConnecting(true);
      const result = await oauthInitiateMutation.mutateAsync({
        provider: provider as 'GMAIL' | 'OUTLOOK',
      });

      const authUrl = result.data?.authUrl;
      if (!authUrl) {
        toast.error('Failed to generate OAuth URL. Please check server configuration.');
        return;
      }

      // Open OAuth consent screen in a popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        authUrl,
        `${provider}_oauth`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`,
      );

      if (!popup) {
        // Popup blocked — fall back to redirect
        window.location.href = authUrl;
        return;
      }

      // Listen for the OAuth callback message from the popup
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'oauth-callback' && event.data?.provider === provider) {
          window.removeEventListener('message', handleMessage);
          setOauthConnecting(false);
          if (event.data.success) {
            toast.success(`${provider === 'GMAIL' ? 'Gmail' : 'Outlook'} account connected`);
            onSuccess?.();
          } else {
            toast.error(event.data.error || 'OAuth connection failed');
          }
        }
      };
      window.addEventListener('message', handleMessage);

      // Also poll for popup close (in case user closes without completing)
      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval);
          setOauthConnecting(false);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
    } catch {
      toast.error('Failed to initiate OAuth connection');
      setOauthConnecting(false);
    }
  }, [getValues, oauthInitiateMutation, provider, onSuccess]);

  // ── SMTP form submit ───────────────────────────────────

  const onSubmit = useCallback(
    async (data: EmailConnectFormData) => {
      try {
        const payload: Record<string, unknown> = {
          provider: data.provider,
          emailAddress: data.emailAddress,
        };
        if (data.displayName) payload.displayName = data.displayName;
        if (data.label) payload.label = data.label;

        if (isSmtp) {
          if (data.imapHost) payload.imapHost = data.imapHost;
          if (data.imapPort) payload.imapPort = data.imapPort;
          payload.imapSecure = data.imapSecure;
          if (data.smtpHost) payload.smtpHost = data.smtpHost;
          if (data.smtpPort) payload.smtpPort = data.smtpPort;
          payload.smtpSecure = data.smtpSecure;
          if (data.smtpUsername) payload.smtpUsername = data.smtpUsername;
          if (data.smtpPassword) payload.smtpPassword = data.smtpPassword;
        }

        await connectMutation.mutateAsync(payload as any);
        toast.success('Email account connected');
        onSuccess?.();
      } catch {
        toast.error('Failed to connect email account');
      }
    },
    [connectMutation, isSmtp, onSuccess],
  );

  const handleTestConnection = useCallback(async () => {
    const vals = getValues();
    if (!vals.smtpHost || !vals.smtpUsername || !vals.smtpPassword) {
      toast.error('Please fill SMTP host, username and password first');
      return;
    }
    try {
      const result = await testMutation.mutateAsync({
        smtpHost: vals.smtpHost,
        smtpPort: vals.smtpPort ?? 587,
        smtpSecure: vals.smtpSecure ?? true,
        smtpUsername: vals.smtpUsername,
        smtpPassword: vals.smtpPassword,
        imapHost: vals.imapHost || undefined,
        imapPort: vals.imapPort || undefined,
        imapSecure: vals.imapSecure,
      });
      const data = result.data;
      if (data.smtp) {
        toast.success(`SMTP connected${data.imap ? ' — IMAP connected' : ''}`);
      } else {
        toast.error('SMTP connection failed');
      }
    } catch {
      toast.error('Connection test failed');
    }
  }, [getValues, testMutation]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit) as any}
      className="space-y-6 p-4"
    >
      <Fieldset title="Account">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="provider"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Provider"
                leftIcon={<Icon name="mail" size={16} />}
                options={PROVIDER_OPTIONS}
                value={field.value}
                onChange={(val) => field.onChange(val)}
              />
            )}
          />

          <Controller
            name="emailAddress"
            control={control}
            render={({ field }) => (
              <Input
                label="Email Address"
                leftIcon={<Icon name="at-sign" size={16} />}
                placeholder="user@example.com"
                value={field.value}
                onChange={(val: string) => field.onChange(val)}
                error={errors.emailAddress?.message}
              />
            )}
          />

          <Controller
            name="displayName"
            control={control}
            render={({ field }) => (
              <Input
                label="Display Name"
                leftIcon={<Icon name="user" size={16} />}
                placeholder="John Doe"
                value={field.value ?? ''}
                onChange={(val: string) => field.onChange(val)}
              />
            )}
          />

          <Controller
            name="label"
            control={control}
            render={({ field }) => (
              <Input
                label="Label"
                leftIcon={<Icon name="tag" size={16} />}
                placeholder="Work, Sales, Support..."
                value={field.value ?? ''}
                onChange={(val: string) => field.onChange(val)}
              />
            )}
          />
        </div>
      </Fieldset>

      {/* ── OAuth Connect (Gmail / Outlook) ─────────────── */}
      {isOAuth && (
        <Fieldset title={`Connect with ${provider === 'GMAIL' ? 'Google' : 'Microsoft'}`}>
          <div className="space-y-4">
            {!configuredProviders.includes(provider) && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <Icon name="alert-triangle" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {provider === 'GMAIL' ? 'Google' : 'Microsoft'} OAuth credentials not configured
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    An admin must first add {provider === 'GMAIL' ? 'Google' : 'Microsoft'} API credentials in{' '}
                    <a href="/settings/integrations" className="underline font-medium">Settings &gt; Integrations</a>{' '}
                    before OAuth sign-in can work.
                  </p>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600">
              {provider === 'GMAIL'
                ? 'Click below to sign in with your Google account and grant permission to send and read emails.'
                : 'Click below to sign in with your Microsoft account and grant permission to send and read emails.'}
            </p>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: provider === 'GMAIL' ? '#EA4335' : '#0078D4',
                }}
              >
                <Icon name="mail" size={20} color="#fff" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {provider === 'GMAIL' ? 'Google Gmail' : 'Microsoft Outlook'}
                </p>
                <p className="text-xs text-gray-500">
                  OAuth 2.0 — Secure authorization without sharing your password
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={handleOAuthConnect}
                disabled={oauthConnecting || !configuredProviders.includes(provider)}
                loading={oauthConnecting}
              >
                <Icon name="external-link" size={14} />
                {oauthConnecting ? 'Connecting...' : `Sign in with ${provider === 'GMAIL' ? 'Google' : 'Microsoft'}`}
              </Button>
            </div>

            <p className="text-xs text-gray-400">
              <Icon name="shield" size={12} className="inline mr-1" />
              Your credentials are never stored. We use OAuth tokens that can be revoked at any time from your {provider === 'GMAIL' ? 'Google' : 'Microsoft'} account settings.
            </p>
          </div>
        </Fieldset>
      )}

      {/* ── IMAP/SMTP Configuration ─────────────────────── */}
      {isSmtp && (
        <>
          <Fieldset title="IMAP Settings">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Controller
                name="imapHost"
                control={control}
                render={({ field }) => (
                  <Input
                    label="IMAP Host"
                    leftIcon={<Icon name="server" size={16} />}
                    placeholder="imap.example.com"
                    value={field.value ?? ''}
                    onChange={(val: string) => field.onChange(val)}
                  />
                )}
              />
              <Controller
                name="imapPort"
                control={control}
                render={({ field }) => (
                  <Input
                    label="IMAP Port"
                    leftIcon={<Icon name="hash" size={16} />}
                    placeholder="993"
                    value={String(field.value ?? '')}
                    onChange={(val: string) => field.onChange(Number(val) || 0)}
                  />
                )}
              />
              <Controller
                name="imapSecure"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={field.value ?? true}
                      onChange={(val) => field.onChange(val)}
                    />
                    <span className="text-sm text-gray-700">SSL/TLS</span>
                  </div>
                )}
              />
            </div>
          </Fieldset>

          <Fieldset title="SMTP Settings">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Controller
                name="smtpHost"
                control={control}
                render={({ field }) => (
                  <Input
                    label="SMTP Host"
                    leftIcon={<Icon name="server" size={16} />}
                    placeholder="smtp.example.com"
                    value={field.value ?? ''}
                    onChange={(val: string) => field.onChange(val)}
                  />
                )}
              />
              <Controller
                name="smtpPort"
                control={control}
                render={({ field }) => (
                  <Input
                    label="SMTP Port"
                    leftIcon={<Icon name="hash" size={16} />}
                    placeholder="587"
                    value={String(field.value ?? '')}
                    onChange={(val: string) => field.onChange(Number(val) || 0)}
                  />
                )}
              />
              <Controller
                name="smtpSecure"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={field.value ?? true}
                      onChange={(val) => field.onChange(val)}
                    />
                    <span className="text-sm text-gray-700">SSL/TLS</span>
                  </div>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
              <Controller
                name="smtpUsername"
                control={control}
                render={({ field }) => (
                  <Input
                    label="SMTP Username"
                    leftIcon={<Icon name="user" size={16} />}
                    placeholder="user@example.com"
                    value={field.value ?? ''}
                    onChange={(val: string) => field.onChange(val)}
                  />
                )}
              />
              <Controller
                name="smtpPassword"
                control={control}
                render={({ field }) => (
                  <Input
                    label="SMTP Password"
                    leftIcon={<Icon name="key" size={16} />}
                    type="password"
                    value={field.value ?? ''}
                    onChange={(val: string) => field.onChange(val)}
                  />
                )}
              />
            </div>
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testMutation.isPending}
              >
                <Icon name="zap" size={14} />
                {testMutation.isPending ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
          </Fieldset>
        </>
      )}

      {/* Submit for page mode only — panel uses footer buttons */}
      {/* For OAuth providers, the connect button above handles it */}
      {mode === 'page' && !isOAuth && (
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            <Icon name="link" size={14} />
            Connect Account
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
