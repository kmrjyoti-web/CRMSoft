'use client';

import { useCallback, useEffect } from 'react';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import toast from 'react-hot-toast';

import { Input, Button, Icon, SelectInput, Switch, Fieldset } from '@/components/ui';

import { useSidePanelStore } from '@/stores/side-panel.store';

import { useCronJob, useUpdateCronJob } from '../hooks/useCronConfig';

// ── Props ────────────────────────────────────────────────

interface CronJobEditFormProps {
  cronJobCode?: string;
  mode?: 'page' | 'panel';
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Schema ───────────────────────────────────────────────

const cronJobSchema = z.object({
  cronExpression: z.string().min(1, 'Cron expression is required'),
  cronDescription: z.string().optional(),
  timezone: z.string().optional(),
  timeoutSeconds: z.coerce.number().min(10).max(7200).optional(),
  maxRetries: z.coerce.number().min(0).max(5).optional(),
  retryDelaySeconds: z.coerce.number().min(10).max(3600).optional(),
  allowConcurrent: z.boolean().optional(),
  alertOnFailure: z.boolean().optional(),
  alertOnTimeout: z.boolean().optional(),
  alertAfterConsecutiveFailures: z.coerce.number().min(1).max(10).optional(),
  alertChannel: z.enum(['EMAIL', 'IN_APP', 'BOTH']).optional(),
});

type CronJobFormData = z.infer<typeof cronJobSchema>;

// ── Alert channel options ────────────────────────────────

const ALERT_CHANNEL_OPTIONS = [
  { label: 'Email', value: 'EMAIL' },
  { label: 'In-App', value: 'IN_APP' },
  { label: 'Both', value: 'BOTH' },
];

// ── Component ────────────────────────────────────────────

export function CronJobEditForm({
  cronJobCode,
  mode = 'panel',
  panelId,
  onSuccess,
  onCancel,
}: CronJobEditFormProps) {
  const { data: jobData } = useCronJob(cronJobCode ?? '');
  const job = (jobData as any)?.data ?? jobData;

  const updateMutation = useUpdateCronJob();

  const formId = `sp-form-cron-${cronJobCode ?? 'new'}`;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CronJobFormData>({
    resolver: zodResolver(cronJobSchema) as any,
    defaultValues: {
      cronExpression: '',
      cronDescription: '',
      timezone: 'Asia/Kolkata',
      timeoutSeconds: 300,
      maxRetries: 0,
      retryDelaySeconds: 60,
      allowConcurrent: false,
      alertOnFailure: true,
      alertOnTimeout: true,
      alertAfterConsecutiveFailures: 3,
      alertChannel: 'BOTH',
    },
  });

  // Pre-fill when job loads
  useEffect(() => {
    if (job) {
      reset({
        cronExpression: job.cronExpression ?? '',
        cronDescription: job.cronDescription ?? '',
        timezone: job.timezone ?? 'Asia/Kolkata',
        timeoutSeconds: job.timeoutSeconds ?? 300,
        maxRetries: job.maxRetries ?? 0,
        retryDelaySeconds: job.retryDelaySeconds ?? 60,
        allowConcurrent: job.allowConcurrent ?? false,
        alertOnFailure: job.alertOnFailure ?? true,
        alertOnTimeout: job.alertOnTimeout ?? true,
        alertAfterConsecutiveFailures: job.alertAfterConsecutiveFailures ?? 3,
        alertChannel: job.alertChannel ?? 'BOTH',
      });
    }
  }, [job, reset]);

  // Sync submitting state to panel footer
  const setFooterDisabled = useSidePanelStore((s) => s.setFooterDisabled);
  useEffect(() => {
    if (mode === 'panel') setFooterDisabled?.(isSubmitting);
  }, [isSubmitting, mode, setFooterDisabled]);

  const onSubmit = useCallback(
    async (data: CronJobFormData) => {
      if (!cronJobCode) return;
      try {
        await updateMutation.mutateAsync({ jobCode: cronJobCode, data });
        toast.success('Cron job updated');
        onSuccess?.();
      } catch {
        toast.error('Failed to update cron job');
      }
    },
    [cronJobCode, updateMutation, onSuccess],
  );

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit) as any}
      className="space-y-6 p-4"
    >
      {/* Job Info (read-only) */}
      {job && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-900">{job.jobName}</p>
          <p className="text-xs text-gray-500">
            {job.jobCode} &middot; {job.moduleName} &middot; {job.scope}
          </p>
        </div>
      )}

      <Fieldset title="Schedule">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="cronExpression"
            control={control}
            render={({ field }) => (
              <Input
                label="Cron Expression"
                leftIcon={<Icon name="clock" size={16} />}
                placeholder="0 */5 * * *"
                value={field.value}
                onChange={(val: string) => field.onChange(val)}
                error={errors.cronExpression?.message}
              />
            )}
          />

          <Controller
            name="cronDescription"
            control={control}
            render={({ field }) => (
              <Input
                label="Description"
                leftIcon={<Icon name="file-text" size={16} />}
                placeholder="Every 5 minutes"
                value={field.value ?? ''}
                onChange={(val: string) => field.onChange(val)}
              />
            )}
          />

          <Controller
            name="timezone"
            control={control}
            render={({ field }) => (
              <Input
                label="Timezone"
                leftIcon={<Icon name="globe" size={16} />}
                value={field.value ?? 'Asia/Kolkata'}
                onChange={(val: string) => field.onChange(val)}
              />
            )}
          />
        </div>
      </Fieldset>

      <Fieldset title="Execution Control">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Controller
            name="timeoutSeconds"
            control={control}
            render={({ field }) => (
              <Input
                label="Timeout (seconds)"
                leftIcon={<Icon name="timer" size={16} />}
                placeholder="300"
                value={String(field.value ?? '')}
                onChange={(val: string) => field.onChange(Number(val) || 0)}
                error={errors.timeoutSeconds?.message}
              />
            )}
          />

          <Controller
            name="maxRetries"
            control={control}
            render={({ field }) => (
              <Input
                label="Max Retries"
                leftIcon={<Icon name="repeat" size={16} />}
                placeholder="0"
                value={String(field.value ?? '')}
                onChange={(val: string) => field.onChange(Number(val) || 0)}
                error={errors.maxRetries?.message}
              />
            )}
          />

          <Controller
            name="retryDelaySeconds"
            control={control}
            render={({ field }) => (
              <Input
                label="Retry Delay (sec)"
                leftIcon={<Icon name="clock" size={16} />}
                placeholder="60"
                value={String(field.value ?? '')}
                onChange={(val: string) => field.onChange(Number(val) || 0)}
                error={errors.retryDelaySeconds?.message}
              />
            )}
          />
        </div>

        <div className="mt-4">
          <Controller
            name="allowConcurrent"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.value ?? false}
                  onChange={(val) => field.onChange(val)}
                />
                <span className="text-sm text-gray-700">Allow concurrent runs</span>
              </div>
            )}
          />
        </div>
      </Fieldset>

      <Fieldset title="Alerting">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <Controller
              name="alertOnFailure"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={field.value ?? true}
                    onChange={(val) => field.onChange(val)}
                  />
                  <span className="text-sm text-gray-700">Alert on failure</span>
                </div>
              )}
            />
            <Controller
              name="alertOnTimeout"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={field.value ?? true}
                    onChange={(val) => field.onChange(val)}
                  />
                  <span className="text-sm text-gray-700">Alert on timeout</span>
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="alertAfterConsecutiveFailures"
              control={control}
              render={({ field }) => (
                <Input
                  label="Alert after N failures"
                  leftIcon={<Icon name="alert-triangle" size={16} />}
                  placeholder="3"
                  value={String(field.value ?? '')}
                  onChange={(val: string) => field.onChange(Number(val) || 0)}
                />
              )}
            />

            <Controller
              name="alertChannel"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Alert Channel"
                  leftIcon={<Icon name="bell" size={16} />}
                  options={ALERT_CHANNEL_OPTIONS}
                  value={field.value ?? 'BOTH'}
                  onChange={(val) => field.onChange(val)}
                />
              )}
            />
          </div>
        </div>
      </Fieldset>

      {/* Submit for page mode */}
      {mode === 'page' && (
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            <Icon name="save" size={14} />
            Save Changes
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
