'use client';

import { useState, useCallback, useEffect } from 'react';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import toast from 'react-hot-toast';

import { Input, Button, Icon, Badge } from '@/components/ui';

import { HelpButton } from '@/components/common/HelpButton';

import { useWABAConfig, useSetupWABA, useUpdateWABA } from '../hooks/useWhatsAppConfig';
import { WhatsAppConfigUserHelp } from '../help/WhatsAppConfigUserHelp';
import { WhatsAppConfigDevHelp } from '../help/WhatsAppConfigDevHelp';

import type { WABAConfig } from '../types/whatsapp-config.types';

// ── Schema ───────────────────────────────────────────────

const wabaSchema = z.object({
  wabaId: z.string().min(1, 'WABA ID is required'),
  phoneNumberId: z.string().min(1, 'Phone Number ID is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  displayName: z.string().min(1, 'Display name is required'),
  accessToken: z.string().min(1, 'Access token is required'),
  webhookVerifyToken: z.string().min(1, 'Verify token is required'),
});

type WABAFormData = z.infer<typeof wabaSchema>;

// ── Status colors ────────────────────────────────────────

const STATUS_COLORS: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
  ACTIVE: 'success',
  DISCONNECTED: 'danger',
  ERROR: 'danger',
  PENDING_VERIFICATION: 'warning',
};

// ── Component ────────────────────────────────────────────

export function WhatsAppConfig() {
  const [configId, setConfigId] = useState<string>('');

  const { data: configData, isLoading } = useWABAConfig(configId);
  const config = (configData?.data ?? configData) as WABAConfig | undefined;

  const setupMutation = useSetupWABA();
  const updateMutation = useUpdateWABA();

  const isEditMode = !!config?.id;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WABAFormData>({
    resolver: zodResolver(wabaSchema) as any,
    defaultValues: {
      wabaId: '',
      phoneNumberId: '',
      phoneNumber: '',
      displayName: '',
      accessToken: '',
      webhookVerifyToken: '',
    },
  });

  // Pre-fill form when config loads
  useEffect(() => {
    if (config) {
      reset({
        wabaId: config.wabaId ?? '',
        phoneNumberId: config.phoneNumberId ?? '',
        phoneNumber: config.phoneNumber ?? '',
        displayName: config.displayName ?? '',
        accessToken: '',
        webhookVerifyToken: config.webhookVerifyToken ?? '',
      });
    }
  }, [config, reset]);

  const onSubmit = useCallback(
    async (data: WABAFormData) => {
      try {
        if (isEditMode && config?.id) {
          await updateMutation.mutateAsync({
            id: config.id,
            data: {
              displayName: data.displayName,
              accessToken: data.accessToken || undefined,
            },
          });
          toast.success('WhatsApp configuration updated');
        } else {
          const result = await setupMutation.mutateAsync(data);
          const created = (result as any)?.data ?? result;
          if (created?.id) setConfigId(created.id);
          toast.success('WhatsApp configuration created');
        }
      } catch {
        toast.error('Failed to save WhatsApp configuration');
      }
    },
    [isEditMode, config, setupMutation, updateMutation],
  );

  if (isLoading && configId) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Icon name="loader" size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            WhatsApp Business API
          </h1>
          <p className="text-sm text-gray-500">
            Configure your WhatsApp Business Account (WABA) for messaging
          </p>
        </div>
        <HelpButton
          panelId="whatsapp-config-help"
          title="WhatsApp Config — Help"
          userContent={<WhatsAppConfigUserHelp />}
          devContent={<WhatsAppConfigDevHelp />}
        />
      </div>

      {/* Status Banner */}
      {isEditMode && config && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="message-circle" size={20} className="text-green-600" />
            <div>
              <p className="font-medium text-gray-900">{config.displayName}</p>
              <p className="text-sm text-gray-500">{config.phoneNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={STATUS_COLORS[config.connectionStatus] ?? 'default'}>
              {config.connectionStatus.replace(/_/g, ' ')}
            </Badge>
            <div className="text-xs text-gray-400 text-right">
              <div>Sent: {config.totalMessagesSent}</div>
              <div>Received: {config.totalMessagesReceived}</div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          <Icon name="settings" size={18} className="inline mr-2 text-gray-500" />
          {isEditMode ? 'Update Configuration' : 'Setup WABA'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit) as any} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="wabaId"
              control={control}
              render={({ field }) => (
                <Input
                  label="WABA ID"
                  leftIcon={<Icon name="hash" size={16} />}
                  value={field.value}
                  onChange={(val: string) => field.onChange(val)}
                  error={errors.wabaId?.message}
                  disabled={isEditMode}
                />
              )}
            />

            <Controller
              name="phoneNumberId"
              control={control}
              render={({ field }) => (
                <Input
                  label="Phone Number ID"
                  leftIcon={<Icon name="hash" size={16} />}
                  value={field.value}
                  onChange={(val: string) => field.onChange(val)}
                  error={errors.phoneNumberId?.message}
                  disabled={isEditMode}
                />
              )}
            />

            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <Input
                  label="Business Phone Number"
                  leftIcon={<Icon name="phone" size={16} />}
                  placeholder="+919876543210"
                  value={field.value}
                  onChange={(val: string) => field.onChange(val)}
                  error={errors.phoneNumber?.message}
                  disabled={isEditMode}
                />
              )}
            />

            <Controller
              name="displayName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Display Name"
                  leftIcon={<Icon name="building" size={16} />}
                  placeholder="My Business"
                  value={field.value}
                  onChange={(val: string) => field.onChange(val)}
                  error={errors.displayName?.message}
                />
              )}
            />

            <Controller
              name="accessToken"
              control={control}
              render={({ field }) => (
                <Input
                  label={isEditMode ? 'New Access Token' : 'Access Token'}
                  leftIcon={<Icon name="key" size={16} />}
                  type="password"
                  placeholder={isEditMode ? 'Leave blank to keep current' : 'Permanent access token'}
                  value={field.value}
                  onChange={(val: string) => field.onChange(val)}
                  error={errors.accessToken?.message}
                />
              )}
            />

            <Controller
              name="webhookVerifyToken"
              control={control}
              render={({ field }) => (
                <Input
                  label="Webhook Verify Token"
                  leftIcon={<Icon name="shield" size={16} />}
                  placeholder="A secret string for webhook verification"
                  value={field.value}
                  onChange={(val: string) => field.onChange(val)}
                  error={errors.webhookVerifyToken?.message}
                  disabled={isEditMode}
                />
              )}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={setupMutation.isPending || updateMutation.isPending}
            >
              <Icon name="save" size={14} />
              {isEditMode ? 'Update Configuration' : 'Setup WhatsApp'}
            </Button>
          </div>
        </form>
      </div>

      {/* Go to WhatsApp Module */}
      {isEditMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-900">WhatsApp Module</p>
            <p className="text-sm text-blue-700">
              Manage templates, conversations, broadcasts, chatbot, and more.
            </p>
          </div>
          <a
            href="/whatsapp"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to WhatsApp Module
            <Icon name="arrow-right" size={14} />
          </a>
        </div>
      )}

      {/* Webhook Info */}
      {isEditMode && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            <Icon name="link" size={18} className="inline mr-2 text-gray-500" />
            Webhook Configuration
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Configure these URLs in your Meta Developer Portal:
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Webhook URL
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-mono text-gray-700">
                {`${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/whatsapp/webhook`}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Verify Token
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-mono text-gray-700">
                {config?.webhookVerifyToken ?? '—'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
