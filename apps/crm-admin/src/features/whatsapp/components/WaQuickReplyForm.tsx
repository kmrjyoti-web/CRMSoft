'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Input, Icon, TextareaInput } from '@/components/ui';
import { useCreateQuickReply } from '../hooks/useWaQuickReplies';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  shortcut: z.string().min(1, 'Shortcut is required'),
  content: z.string().min(1, 'Content is required'),
});

type FormValues = z.infer<typeof schema>;

interface WaQuickReplyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WaQuickReplyForm({ onSuccess, onCancel }: WaQuickReplyFormProps) {
  const createMut = useCreateQuickReply();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { title: '', shortcut: '', content: '' },
  });

  const onSubmit = (data: FormValues) => {
    createMut.mutate(data as any, {
      onSuccess: () => onSuccess?.(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit) as any} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <Input
        label="Title"
        {...register('title')}
        value={watch('title')}
        onChange={(v) => setValue('title', v)}
        leftIcon={<Icon name="tag" size={16} />}
      />
      {errors.title && <p style={{ color: '#ef4444', fontSize: 12, marginTop: -8 }}>{errors.title.message}</p>}

      <Input
        label="Shortcut (e.g. /greeting)"
        {...register('shortcut')}
        value={watch('shortcut')}
        onChange={(v) => setValue('shortcut', v)}
        leftIcon={<Icon name="zap" size={16} />}
      />
      {errors.shortcut && <p style={{ color: '#ef4444', fontSize: 12, marginTop: -8 }}>{errors.shortcut.message}</p>}

      <div>
        <TextareaInput
          label="Content"
          value={watch('content')}
          onChange={(e) => setValue('content', e.target.value)}
          rows={4}
        />
        {errors.content && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.content.message}</p>}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {onCancel && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" variant="primary" disabled={createMut.isPending}>
          {createMut.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
