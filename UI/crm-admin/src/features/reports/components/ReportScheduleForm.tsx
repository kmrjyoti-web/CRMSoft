'use client';

import { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Input, SelectInput, NumberInput, Button, Icon } from '@/components/ui';
import { TagsInput } from '@/components/ui';
import { useReportDefinitions, useCreateSchedule } from '../hooks/useReports';
import { FREQUENCY_OPTIONS, DAY_OF_WEEK_OPTIONS, FORMAT_OPTIONS } from '../utils/report-helpers';
import type { CreateSchedulePayload } from '../types/report.types';

interface ReportScheduleFormProps {
  onClose: () => void;
  defaultReportCode?: string;
}

export function ReportScheduleForm({ onClose, defaultReportCode }: ReportScheduleFormProps) {
  const { data: defsData } = useReportDefinitions();
  const createMut = useCreateSchedule();
  const definitions = defsData?.data ?? [];

  const reportOptions = definitions.map((d) => ({
    label: d.name,
    value: d.code,
  }));

  const { control, handleSubmit, watch, formState: { errors } } = useForm<CreateSchedulePayload>({
    defaultValues: {
      name: '',
      reportCode: defaultReportCode ?? '',
      frequency: 'WEEKLY',
      format: 'PDF',
      recipientEmails: [],
      timeOfDay: '08:00',
    },
  });

  const frequency = watch('frequency');

  const onSubmit = useCallback(async (data: CreateSchedulePayload) => {
    try {
      await createMut.mutateAsync(data);
      toast.success('Schedule created');
      onClose();
    } catch {
      toast.error('Failed to create schedule');
    }
  }, [createMut, onClose]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">New Scheduled Report</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <Icon name="x" size={18} />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit) as any} className="space-y-4">
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Name is required' }}
          render={({ field }) => (
            <Input
              label="Schedule Name"
              value={field.value}
              onChange={field.onChange}
              leftIcon={<Icon name="file-text" size={16} />}
            />
          )}
        />

        <Controller
          name="reportCode"
          control={control}
          rules={{ required: 'Report is required' }}
          render={({ field }) => (
            <SelectInput
              label="Report"
              options={reportOptions}
              value={field.value}
              onChange={(v) => field.onChange(String(v ?? ''))}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Frequency"
                options={FREQUENCY_OPTIONS}
                value={field.value}
                onChange={(v) => field.onChange(String(v ?? 'WEEKLY'))}
              />
            )}
          />

          <Controller
            name="format"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Format"
                options={FORMAT_OPTIONS}
                value={field.value}
                onChange={(v) => field.onChange(String(v ?? 'PDF'))}
              />
            )}
          />
        </div>

        {frequency === 'WEEKLY' && (
          <Controller
            name="dayOfWeek"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Day of Week"
                options={DAY_OF_WEEK_OPTIONS}
                value={field.value ?? 1}
                onChange={(v) => field.onChange(Number(v))}
              />
            )}
          />
        )}

        {(frequency === 'MONTHLY' || frequency === 'QUARTERLY' || frequency === 'YEARLY') && (
          <Controller
            name="dayOfMonth"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Day of Month"
                value={field.value ?? 1}
                onChange={field.onChange}
              />
            )}
          />
        )}

        <Controller
          name="timeOfDay"
          control={control}
          render={({ field }) => (
            <Input
              label="Time of Day (HH:MM)"
              value={field.value ?? '08:00'}
              onChange={field.onChange}
              leftIcon={<Icon name="clock" size={16} />}
            />
          )}
        />

        <Controller
          name="recipientEmails"
          control={control}
          rules={{ required: 'At least one email is required' }}
          render={({ field }) => (
            <TagsInput
              label="Recipient Emails"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={createMut.isPending}>
            {createMut.isPending ? 'Creating...' : 'Create Schedule'}
          </Button>
        </div>
      </form>
    </div>
  );
}
