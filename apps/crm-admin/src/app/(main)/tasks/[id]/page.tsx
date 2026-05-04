'use client';

import { TaskForm } from '@/features/tasks/components/TaskForm';

export default function Page({ params }: { params: { id: string } }) {
  return <TaskForm taskId={params.id} />;
}
