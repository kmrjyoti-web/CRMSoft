"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import {
  Button,
  Input,
  SelectInput,
  DatePicker,
  NumberInput,
  Fieldset,
  Icon,
  TagsInput,
} from "@/components/ui";
import { useSidePanelStore } from "@/stores/side-panel.store";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useTaskDetail,
  useCreateTask,
  useUpdateTask,
} from "../hooks/useTasks";
import { useUsersList } from "@/features/settings/hooks/useUsers";

// -- Validation Schema -------------------------------------------------------

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.string().optional(),
  priority: z.string().optional(),
  assignedToId: z.string().optional(),
  leadId: z.string().optional(),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  estimatedMinutes: z.number().nullable().optional(),
  activityType: z.string().optional(),
  reminderMinutesBefore: z.number().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

// -- Static options -----------------------------------------------------------

const TASK_TYPE_OPTIONS = [
  { value: "GENERAL", label: "General" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "CALL_BACK", label: "Call Back" },
  { value: "MEETING", label: "Meeting" },
  { value: "DEMO", label: "Demo" },
  { value: "APPROVAL", label: "Approval" },
  { value: "REVIEW", label: "Review" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
  { value: "CRITICAL", label: "Critical" },
];

const ACTIVITY_TYPE_OPTIONS = [
  { value: "CALL", label: "Call" },
  { value: "EMAIL", label: "Email" },
  { value: "MEETING", label: "Meeting" },
  { value: "NOTE", label: "Note" },
  { value: "VISIT", label: "Visit" },
];

const REMINDER_OPTIONS = [
  { value: "", label: "No Reminder" },
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
  { value: "1440", label: "1 day before" },
];

// -- Props -------------------------------------------------------------------

interface TaskFormProps {
  taskId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// -- Component ---------------------------------------------------------------

export function TaskForm({ taskId, mode = "page", panelId, onSuccess, onCancel }: TaskFormProps) {
  const router = useRouter();
  const isEdit = !!taskId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const { data: taskData, isLoading: isLoadingTask } = useTaskDetail(taskId ?? "");
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  // Fetch users for assignee dropdown
  const { data: usersResponse } = useUsersList({ limit: 200 });
  const users = (usersResponse as any)?.data ?? (usersResponse as any) ?? [];
  const userOptions = Array.isArray(users)
    ? users.map((u: any) => ({
        value: u.id,
        label: `${u.firstName} ${u.lastName}`.trim(),
      }))
    : [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      type: "GENERAL",
      priority: "MEDIUM",
      assignedToId: "",
      leadId: "",
      dueDate: "",
      startDate: "",
      estimatedMinutes: null,
      activityType: "",
      reminderMinutesBefore: null,
      tags: [],
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !taskData?.data) return;
    const t = taskData.data;
    reset({
      title: t.title,
      description: t.description ?? "",
      type: t.type ?? "GENERAL",
      priority: t.priority ?? "MEDIUM",
      assignedToId: t.assignedTo?.id ?? "",
      leadId: t.entityType === "LEAD" ? t.entityId ?? "" : "",
      dueDate: t.dueDate ?? "",
      startDate: t.startDate ?? "",
      estimatedMinutes: t.estimatedMinutes ?? null,
      activityType: "",
      reminderMinutesBefore: null,
      tags: t.tags ?? [],
    });
  }, [isEdit, taskData, reset]);

  const isPanel = mode === "panel";

  // Sync panel footer buttons with form submitting state
  useEffect(() => {
    if (!panelId) return;
    updatePanelConfig(panelId, {
      footerButtons: [
        {
          id: "cancel",
          label: "Cancel",
          showAs: "text" as const,
          variant: "secondary" as const,
          disabled: isSubmitting,
          onClick: () => onCancel?.(),
        },
        {
          id: "save",
          label: isSubmitting
            ? isEdit ? "Updating..." : "Saving..."
            : isEdit ? "Save Changes" : "Save",
          icon: "check",
          showAs: "both" as const,
          variant: "primary" as const,
          loading: isSubmitting,
          disabled: isSubmitting,
          onClick: () => {
            const formId = `sp-form-task-${taskId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, taskId, updatePanelConfig, onCancel]);

  const onSubmit = async (values: TaskFormValues) => {
    try {
      if (isEdit && taskId) {
        await updateMutation.mutateAsync({
          id: taskId,
          data: {
            title: values.title,
            description: values.description || undefined,
            priority: (values.priority as any) || undefined,
            dueDate: values.dueDate || undefined,
            startDate: values.startDate || undefined,
            tags: values.tags,
            estimatedMinutes: values.estimatedMinutes ?? undefined,
          },
        });
        if (isPanel && onSuccess) {
          onSuccess();
        } else {
          router.push("/tasks");
        }
      } else {
        await createMutation.mutateAsync({
          title: values.title,
          description: values.description || undefined,
          type: (values.type as any) || undefined,
          priority: (values.priority as any) || undefined,
          assignedToId: values.assignedToId || undefined,
          dueDate: values.dueDate || undefined,
          startDate: values.startDate || undefined,
          estimatedMinutes: values.estimatedMinutes ?? undefined,
          activityType: values.activityType || undefined,
          reminderMinutesBefore: values.reminderMinutesBefore ?? undefined,
          leadId: values.leadId || undefined,
          tags: values.tags,
        });
        if (isPanel && onSuccess) {
          onSuccess();
        } else {
          router.push("/tasks");
        }
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} task`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingTask) return <LoadingSpinner fullPage />;

  return (
    <div className={isPanel ? "p-4" : "p-6"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Task" : "New Task"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          }
        />
      )}

      <FormErrors errors={errors} />

      <form
        id={isPanel ? `sp-form-task-${taskId ?? "new"}` : undefined}
        onSubmit={(handleSubmit as any)(onSubmit)}
        noValidate
        className="mt-4 max-w-3xl space-y-6"
      >
        {/* Task Information */}
        <Fieldset label="Task Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  label="Title"
                  leftIcon={<Icon name="edit-3" size={16} />}
                  placeholder="Task title"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.title}
                  errorMessage={errors.title?.message}
                />
              )}
            />
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Type"
                  leftIcon={<Icon name="tag" size={16} />}
                  options={TASK_TYPE_OPTIONS}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="mt-4">
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  rows={3}
                  placeholder="Task description"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* Assignment & Priority */}
        <Fieldset label="Assignment & Priority">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Priority"
                  leftIcon={<Icon name="alert-triangle" size={16} />}
                  options={PRIORITY_OPTIONS}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="assignedToId"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Assigned To"
                  leftIcon={<Icon name="user" size={16} />}
                  options={userOptions}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Select user"
                />
              )}
            />
          </div>
        </Fieldset>

        {/* Lead Association (optional) */}
        {!isEdit && (
          <Fieldset label="Lead Association">
            <Controller
              name="leadId"
              control={control}
              render={({ field }) => (
                <Input
                  label="Lead ID"
                  leftIcon={<Icon name="trending-up" size={16} />}
                  placeholder="Lead ID (optional)"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </Fieldset>
        )}

        {/* Schedule */}
        <Fieldset label="Schedule">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Due Date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Start Date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="estimatedMinutes"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Est. Minutes"
                  value={field.value ?? null}
                  onChange={field.onChange}
                  min={0}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* Activity & Reminder (create mode only) */}
        {!isEdit && (
          <Fieldset label="Activity & Reminder">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="activityType"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    label="Activity Type"
                    leftIcon={<Icon name="activity" size={16} />}
                    options={ACTIVITY_TYPE_OPTIONS}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Auto-create activity"
                  />
                )}
              />
              <Controller
                name="reminderMinutesBefore"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    label="Reminder"
                    leftIcon={<Icon name="bell" size={16} />}
                    options={REMINDER_OPTIONS}
                    value={field.value != null ? String(field.value) : ""}
                    onChange={(v: any) => field.onChange(v ? Number(v) : null)}
                    placeholder="No reminder"
                  />
                )}
              />
            </div>
          </Fieldset>
        )}

        {/* Tags */}
        <Fieldset label="Tags">
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagsInput
                label="Tags"
                value={field.value ?? []}
                onChange={field.onChange}
              />
            )}
          />
        </Fieldset>

        {/* Submit (page mode only) */}
        {!isPanel && (
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update" : "Save"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
