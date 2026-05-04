'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { Input, Button, Icon, ColorPicker } from '@/components/ui';
import { useCreateFolder, useUpdateFolder } from '../hooks/useFolders';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface FolderFormProps {
  folderId?: string;
  initialData?: any;
  onClose?: () => void;
}

export function FolderForm({ folderId, initialData, onClose }: FolderFormProps) {
  const isEdit = !!folderId;
  const createMut = useCreateFolder();
  const updateMut = useUpdateFolder();

  const { handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name ?? '',
        description: initialData.description ?? '',
        parentId: initialData.parentId ?? undefined,
        color: initialData.color ?? '#3B82F6',
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data: FormValues) => {
    if (isEdit) {
      updateMut.mutate(
        { id: folderId, data },
        {
          onSuccess: () => { toast.success('Folder updated'); onClose?.(); },
          onError: () => toast.error('Failed to update folder'),
        },
      );
    } else {
      createMut.mutate(data, {
        onSuccess: () => { toast.success('Folder created'); onClose?.(); },
        onError: () => toast.error('Failed to create folder'),
      });
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit) as any} className="space-y-4 p-4">
      <Input
        label="Folder Name"
        leftIcon={<Icon name="folder" size={16} />}
        value={watch('name')}
        onChange={(v) => setValue('name', v)}
      />
      <Input
        label="Description"
        leftIcon={<Icon name="align-left" size={16} />}
        value={watch('description') ?? ''}
        onChange={(v) => setValue('description', v)}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <ColorPicker
          value={watch('color') ?? '#3B82F6'}
          onChange={(v) => setValue('color', v)}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" size="sm" disabled={isPending}>
          {isPending ? 'Saving...' : isEdit ? 'Update Folder' : 'Create Folder'}
        </Button>
        {onClose && (
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
