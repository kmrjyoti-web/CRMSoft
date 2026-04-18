'use client';

import { useCallback, useEffect, useMemo } from 'react';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import toast from 'react-hot-toast';

import { Input, Button, Icon, SelectInput, Switch, Fieldset } from '@/components/ui';

import { useSidePanelStore } from '@/stores/side-panel.store';

import { useUpsertCredential, useCredentialSchemas } from '../hooks/useIntegrations';

import type { CredentialProvider } from '../types/integrations.types';

// ── Props ────────────────────────────────────────────────

interface IntegrationCredentialFormProps {
  credentialId?: string;
  editData?: Record<string, any>;
  mode?: 'page' | 'panel';
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Schema ───────────────────────────────────────────────

const credentialSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  instanceName: z.string().optional(),
  description: z.string().optional(),
  isPrimary: z.boolean().optional(),
  dailyUsageLimit: z.coerce.number().optional(),
  linkedAccountEmail: z.string().optional(),
  webhookUrl: z.string().optional(),
  // Dynamic credential fields stored as key-value
  credentials: z.record(z.string(), z.unknown()).optional(),
});

type CredentialFormData = z.infer<typeof credentialSchema>;

// ── Provider Categories ──────────────────────────────────

const PROVIDER_CATEGORIES: Record<string, { label: string; providers: { value: CredentialProvider; label: string }[] }> = {
  email: {
    label: 'Email',
    providers: [
      { value: 'GMAIL', label: 'Gmail (Google)' },
      { value: 'OUTLOOK', label: 'Outlook (Microsoft)' },
      { value: 'SMTP', label: 'SMTP' },
      { value: 'SENDGRID', label: 'SendGrid' },
      { value: 'MAILGUN', label: 'Mailgun' },
    ],
  },
  messaging: {
    label: 'Messaging',
    providers: [
      { value: 'WHATSAPP_BUSINESS', label: 'WhatsApp Business' },
    ],
  },
  payment: {
    label: 'Payment',
    providers: [
      { value: 'RAZORPAY', label: 'Razorpay' },
      { value: 'STRIPE', label: 'Stripe' },
    ],
  },
  storage: {
    label: 'Storage',
    providers: [
      { value: 'AWS_S3', label: 'AWS S3' },
      { value: 'MINIO', label: 'MinIO' },
      { value: 'GOOGLE_DRIVE', label: 'Google Drive' },
      { value: 'ONEDRIVE', label: 'OneDrive' },
      { value: 'DROPBOX', label: 'Dropbox' },
    ],
  },
  telephony: {
    label: 'Telephony',
    providers: [
      { value: 'EXOTEL', label: 'Exotel' },
      { value: 'KNOWLARITY', label: 'Knowlarity' },
      { value: 'TWILIO', label: 'Twilio' },
    ],
  },
  ai: {
    label: 'AI Providers',
    providers: [
      { value: 'ANTHROPIC_CLAUDE', label: 'Anthropic Claude' },
      { value: 'OPENAI_GPT', label: 'OpenAI GPT' },
      { value: 'GOOGLE_GEMINI', label: 'Google Gemini' },
      { value: 'GROQ', label: 'Groq' },
    ],
  },
  other: {
    label: 'Other',
    providers: [
      { value: 'GOOGLE_MAPS', label: 'Google Maps' },
      { value: 'FIREBASE', label: 'Firebase' },
      { value: 'CUSTOM', label: 'Custom' },
    ],
  },
};

const ALL_PROVIDERS = Object.values(PROVIDER_CATEGORIES).flatMap((cat) =>
  cat.providers.map((p) => ({ ...p, group: cat.label })),
);

// ── Default credential fields per provider ───────────────

const PROVIDER_FIELDS: Record<string, { key: string; label: string; type: string; required: boolean }[]> = {
  GMAIL: [
    { key: 'clientId', label: 'Client ID', type: 'text', required: true },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
  ],
  OUTLOOK: [
    { key: 'clientId', label: 'Client ID', type: 'text', required: true },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
    { key: 'tenantId', label: 'Tenant ID', type: 'text', required: false },
  ],
  SMTP: [
    { key: 'host', label: 'SMTP Host', type: 'text', required: true },
    { key: 'port', label: 'Port', type: 'number', required: true },
    { key: 'username', label: 'Username', type: 'text', required: true },
    { key: 'password', label: 'Password', type: 'password', required: true },
  ],
  SENDGRID: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true },
  ],
  MAILGUN: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true },
    { key: 'domain', label: 'Domain', type: 'text', required: true },
  ],
  WHATSAPP_BUSINESS: [
    { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
    { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true },
    { key: 'businessAccountId', label: 'Business Account ID', type: 'text', required: true },
    { key: 'webhookVerifyToken', label: 'Webhook Verify Token', type: 'text', required: false },
  ],
  RAZORPAY: [
    { key: 'keyId', label: 'Key ID', type: 'text', required: true },
    { key: 'keySecret', label: 'Key Secret', type: 'password', required: true },
  ],
  STRIPE: [
    { key: 'publishableKey', label: 'Publishable Key', type: 'text', required: true },
    { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
    { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: false },
  ],
  AWS_S3: [
    { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
    { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
    { key: 'region', label: 'Region', type: 'text', required: true },
    { key: 'bucket', label: 'Bucket', type: 'text', required: true },
  ],
  MINIO: [
    { key: 'endpoint', label: 'Endpoint', type: 'text', required: true },
    { key: 'accessKey', label: 'Access Key', type: 'text', required: true },
    { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
    { key: 'bucket', label: 'Bucket', type: 'text', required: true },
  ],
  GOOGLE_DRIVE: [
    { key: 'clientId', label: 'Client ID', type: 'text', required: true },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
  ],
  ONEDRIVE: [
    { key: 'clientId', label: 'Client ID', type: 'text', required: true },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
  ],
  DROPBOX: [
    { key: 'appKey', label: 'App Key', type: 'text', required: true },
    { key: 'appSecret', label: 'App Secret', type: 'password', required: true },
  ],
  EXOTEL: [
    { key: 'apiKey', label: 'API Key', type: 'text', required: true },
    { key: 'apiToken', label: 'API Token', type: 'password', required: true },
    { key: 'subdomain', label: 'Subdomain', type: 'text', required: true },
  ],
  KNOWLARITY: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true },
    { key: 'authorizationToken', label: 'Authorization Token', type: 'password', required: true },
  ],
  TWILIO: [
    { key: 'accountSid', label: 'Account SID', type: 'text', required: true },
    { key: 'authToken', label: 'Auth Token', type: 'password', required: true },
    { key: 'phoneNumber', label: 'Phone Number', type: 'text', required: false },
  ],
  GOOGLE_MAPS: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true },
  ],
  FIREBASE: [
    { key: 'projectId', label: 'Project ID', type: 'text', required: true },
    { key: 'privateKey', label: 'Private Key', type: 'password', required: true },
    { key: 'clientEmail', label: 'Client Email', type: 'email', required: true },
  ],
  ANTHROPIC_CLAUDE: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true },
  ],
  OPENAI_GPT: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true },
    { key: 'organizationId', label: 'Organization ID', type: 'text', required: false },
  ],
  GOOGLE_GEMINI: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true },
  ],
  GROQ: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true },
  ],
  CUSTOM: [
    { key: 'key1', label: 'Key 1', type: 'text', required: false },
    { key: 'value1', label: 'Value 1', type: 'password', required: false },
    { key: 'key2', label: 'Key 2', type: 'text', required: false },
    { key: 'value2', label: 'Value 2', type: 'password', required: false },
  ],
};

// ── Provider icon mapping ────────────────────────────────

const PROVIDER_ICON: Record<string, string> = {
  GMAIL: 'mail', OUTLOOK: 'mail', SMTP: 'server', SENDGRID: 'send', MAILGUN: 'send',
  WHATSAPP_BUSINESS: 'message-circle',
  RAZORPAY: 'credit-card', STRIPE: 'credit-card',
  AWS_S3: 'hard-drive', MINIO: 'hard-drive', GOOGLE_DRIVE: 'hard-drive', ONEDRIVE: 'hard-drive', DROPBOX: 'hard-drive',
  EXOTEL: 'phone', KNOWLARITY: 'phone', TWILIO: 'phone',
  GOOGLE_MAPS: 'map-pin', FIREBASE: 'flame', CUSTOM: 'settings',
  ANTHROPIC_CLAUDE: 'cpu', OPENAI_GPT: 'cpu', GOOGLE_GEMINI: 'cpu', GROQ: 'zap',
};

// ── Component ────────────────────────────────────────────

export function IntegrationCredentialForm({
  credentialId,
  editData,
  mode = 'panel',
  panelId,
  onSuccess,
  onCancel,
}: IntegrationCredentialFormProps) {
  const upsertMutation = useUpsertCredential();

  const formId = `sp-form-credential-${credentialId ?? 'new'}`;

  const isEdit = !!credentialId && !!editData;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CredentialFormData>({
    resolver: zodResolver(credentialSchema) as any,
    defaultValues: {
      provider: editData?.provider ?? '',
      instanceName: editData?.instanceName ?? '',
      description: editData?.description ?? '',
      isPrimary: editData?.isPrimary ?? false,
      dailyUsageLimit: editData?.dailyUsageLimit ?? undefined,
      linkedAccountEmail: editData?.linkedAccountEmail ?? '',
      webhookUrl: editData?.webhookUrl ?? '',
      credentials: editData?.maskedData ?? {},
    },
  });

  const provider = watch('provider');
  const providerFields = useMemo(() => PROVIDER_FIELDS[provider] ?? [], [provider]);

  // Sync submitting state to panel footer
  const setFooterDisabled = useSidePanelStore((s) => s.setFooterDisabled);
  useEffect(() => {
    if (mode === 'panel') setFooterDisabled?.(isSubmitting);
  }, [isSubmitting, mode, setFooterDisabled]);

  // ── Submit ──────────────────────────────────────────────

  const onSubmit = useCallback(
    async (data: CredentialFormData) => {
      try {
        await upsertMutation.mutateAsync({
          provider: data.provider as CredentialProvider,
          instanceName: data.instanceName || undefined,
          credentials: data.credentials ?? {},
          description: data.description || undefined,
          isPrimary: data.isPrimary,
          dailyUsageLimit: data.dailyUsageLimit || undefined,
          linkedAccountEmail: data.linkedAccountEmail || undefined,
          webhookUrl: data.webhookUrl || undefined,
        });
        toast.success(isEdit ? 'Credential updated' : 'Credential saved');
        onSuccess?.();
      } catch {
        toast.error('Failed to save credential');
      }
    },
    [upsertMutation, isEdit, onSuccess],
  );

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit) as any}
      className="space-y-6 p-4"
    >
      <Fieldset title="Provider">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="provider"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Provider"
                leftIcon={<Icon name={(PROVIDER_ICON[field.value] ?? 'plug') as any} size={16} />}
                options={ALL_PROVIDERS.map((p) => ({ label: p.label, value: p.value }))}
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  // Clear credentials when provider changes
                  setValue('credentials', {});
                }}
                disabled={isEdit}
              />
            )}
          />

          <Controller
            name="instanceName"
            control={control}
            render={({ field }) => (
              <Input
                label="Instance Name"
                leftIcon={<Icon name="tag" size={16} />}
                placeholder="e.g. Primary, Backup"
                value={field.value ?? ''}
                onChange={(val: string) => field.onChange(val)}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input
                label="Description"
                leftIcon={<Icon name="file-text" size={16} />}
                placeholder="Optional description"
                value={field.value ?? ''}
                onChange={(val: string) => field.onChange(val)}
              />
            )}
          />

          <Controller
            name="linkedAccountEmail"
            control={control}
            render={({ field }) => (
              <Input
                label="Linked Email"
                leftIcon={<Icon name="at-sign" size={16} />}
                placeholder="admin@company.com"
                value={field.value ?? ''}
                onChange={(val: string) => field.onChange(val)}
              />
            )}
          />
        </div>
      </Fieldset>

      {/* ── Credential Fields (dynamic per provider) ────── */}
      {provider && providerFields.length > 0 && (
        <Fieldset title={`${ALL_PROVIDERS.find((p) => p.value === provider)?.label ?? provider} Credentials`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {providerFields.map((field) => (
              <Controller
                key={field.key}
                name={`credentials.${field.key}` as any}
                control={control}
                render={({ field: f }) => (
                  <Input
                    label={field.label}
                    leftIcon={<Icon name={field.type === 'password' ? 'key' : 'settings'} size={16} />}
                    type={field.type === 'password' ? 'password' : 'text'}
                    placeholder={isEdit ? '••••••••' : `Enter ${field.label.toLowerCase()}`}
                    value={(f.value as string) ?? ''}
                    onChange={(val: string) => f.onChange(val)}
                  />
                )}
              />
            ))}
          </div>
          {isEdit && (
            <p className="text-xs text-gray-400 mt-2">
              <Icon name="info" size={12} className="inline mr-1" />
              Leave fields empty to keep existing values. Only fill fields you want to update.
            </p>
          )}
        </Fieldset>
      )}

      {/* ── Options ─────────────────────────────────────── */}
      <Fieldset title="Options">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="dailyUsageLimit"
            control={control}
            render={({ field }) => (
              <Input
                label="Daily Usage Limit"
                leftIcon={<Icon name="bar-chart-2" size={16} />}
                placeholder="e.g. 1000 (0 = unlimited)"
                value={field.value != null ? String(field.value) : ''}
                onChange={(val: string) => field.onChange(val ? Number(val) : undefined)}
              />
            )}
          />

          <Controller
            name="webhookUrl"
            control={control}
            render={({ field }) => (
              <Input
                label="Webhook URL"
                leftIcon={<Icon name="link" size={16} />}
                placeholder="https://..."
                value={field.value ?? ''}
                onChange={(val: string) => field.onChange(val)}
              />
            )}
          />

          <Controller
            name="isPrimary"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={field.value ?? false}
                  onChange={(val) => field.onChange(val)}
                />
                <span className="text-sm text-gray-700">Mark as Primary</span>
              </div>
            )}
          />
        </div>
      </Fieldset>

      {/* Submit for page mode only — panel uses footer buttons */}
      {mode === 'page' && (
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            <Icon name="save" size={14} />
            {isEdit ? 'Update Credential' : 'Save Credential'}
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
