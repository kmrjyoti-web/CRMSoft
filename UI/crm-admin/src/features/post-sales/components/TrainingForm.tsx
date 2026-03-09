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
} from "@/components/ui";

import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  useTrainingDetail,
  useCreateTraining,
  useUpdateTraining,
} from "../hooks/usePostSales";

// -- Validation Schema -------------------------------------------------------

const trainingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  topics: z.string().optional(),
  mode: z.string().min(1, "Mode is required"),
  leadId: z.string().optional(),
  contactId: z.string().optional(),
  organizationId: z.string().optional(),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.string().optional(),
  trainerName: z.string().optional(),
  trainerContact: z.string().optional(),
  location: z.string().optional(),
  meetingLink: z.string().optional(),
  maxAttendees: z.number().nullable().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

type TrainingFormValues = z.infer<typeof trainingSchema>;

// -- Props -------------------------------------------------------------------

interface TrainingFormProps {
  trainingId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// -- Component ---------------------------------------------------------------

export function TrainingForm({ trainingId, mode = "page", panelId, onSuccess, onCancel }: TrainingFormProps) {
  const router = useRouter();
  const isEdit = !!trainingId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);
  const isPanel = mode === "panel";

  const { data: trainingData, isLoading: isLoadingTraining } =
    useTrainingDetail(trainingId ?? "");
  const createMutation = useCreateTraining();
  const updateMutation = useUpdateTraining();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      title: "",
      description: "",
      topics: "",
      mode: "",
      leadId: "",
      contactId: "",
      organizationId: "",
      scheduledDate: "",
      startTime: "",
      endTime: "",
      duration: "",
      trainerName: "",
      trainerContact: "",
      location: "",
      meetingLink: "",
      maxAttendees: null,
      notes: "",
      internalNotes: "",
    },
  });

  const watchMode = watch("mode");

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !trainingData?.data) return;
    const t = trainingData.data;
    reset({
      title: t.title,
      description: t.description ?? "",
      topics: t.topics ?? "",
      mode: t.mode,
      leadId: t.leadId ?? "",
      contactId: t.contactId ?? "",
      organizationId: t.organizationId ?? "",
      scheduledDate: t.scheduledDate ?? "",
      startTime: t.startTime ?? "",
      endTime: t.endTime ?? "",
      duration: t.duration ?? "",
      trainerName: t.trainerName ?? "",
      trainerContact: t.trainerContact ?? "",
      location: t.location ?? "",
      meetingLink: t.meetingLink ?? "",
      maxAttendees: t.maxAttendees ?? null,
      notes: t.notes ?? "",
      internalNotes: t.internalNotes ?? "",
    });
  }, [isEdit, trainingData, reset]);

  // Sync panel footer buttons
  useEffect(() => {
    if (!panelId) return;
    updatePanelConfig(panelId, {
      footerButtons: [
        {
          id: "cancel",
          label: "Cancel",
          showAs: "text",
          variant: "secondary",
          disabled: isSubmitting,
          onClick: () => {},
        },
        {
          id: "save",
          label: isSubmitting
            ? isEdit
              ? "Updating..."
              : "Saving..."
            : isEdit
              ? "Save Changes"
              : "Save",
          icon: "check",
          showAs: "both",
          variant: "primary",
          loading: isSubmitting,
          disabled: isSubmitting,
          onClick: () => {
            const formId = `sp-form-training-${trainingId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, trainingId, updatePanelConfig]);

  const onSubmit = async (values: TrainingFormValues) => {
    try {
      if (isEdit && trainingId) {
        await updateMutation.mutateAsync({
          id: trainingId,
          data: {
            title: values.title,
            description: values.description || undefined,
            topics: values.topics || undefined,
            mode: values.mode as "ONSITE" | "REMOTE" | "HYBRID",
            scheduledDate: values.scheduledDate,
            startTime: values.startTime || undefined,
            endTime: values.endTime || undefined,
            duration: values.duration || undefined,
            trainerName: values.trainerName || undefined,
            trainerContact: values.trainerContact || undefined,
            location: values.location || undefined,
            meetingLink: values.meetingLink || undefined,
            maxAttendees: values.maxAttendees ?? undefined,
            notes: values.notes || undefined,
            internalNotes: values.internalNotes || undefined,
          },
        });
        toast.success("Training updated");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push(`/post-sales/trainings/${trainingId}`);
        }
      } else {
        await createMutation.mutateAsync({
          title: values.title,
          description: values.description || undefined,
          topics: values.topics || undefined,
          mode: values.mode as "ONSITE" | "REMOTE" | "HYBRID",
          leadId: values.leadId || undefined,
          contactId: values.contactId || undefined,
          organizationId: values.organizationId || undefined,
          scheduledDate: values.scheduledDate,
          startTime: values.startTime || undefined,
          endTime: values.endTime || undefined,
          duration: values.duration || undefined,
          trainerName: values.trainerName || undefined,
          trainerContact: values.trainerContact || undefined,
          location: values.location || undefined,
          meetingLink: values.meetingLink || undefined,
          maxAttendees: values.maxAttendees ?? undefined,
          notes: values.notes || undefined,
          internalNotes: values.internalNotes || undefined,
        });
        toast.success("Training created");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push("/post-sales/trainings");
        }
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} training`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingTraining) return <LoadingSpinner fullPage />;

  return (
    <div className={isPanel ? "p-4" : "p-6"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Training" : "New Training"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          }
        />
      )}

      <FormErrors errors={errors} />

      <form
        id={isPanel ? `sp-form-training-${trainingId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-4 max-w-3xl space-y-6"
      >
        {/* Training Information */}
        <Fieldset label="Training Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Training title"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.title}
                    errorMessage={errors.title?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="mode"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Mode *"
                  options={[
                    { label: "Onsite", value: "ONSITE" },
                    { label: "Remote", value: "REMOTE" },
                    { label: "Hybrid", value: "HYBRID" },
                  ]}
                  value={field.value}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                  error={!!errors.mode}
                  errorMessage={errors.mode?.message}
                />
              )}
            />
            <Controller
              name="scheduledDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Scheduled Date *"
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <Input
                    placeholder="e.g. 09:00"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <Input
                    placeholder="e.g. 17:00"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Duration
                  </label>
                  <Input
                    placeholder="e.g. 2 hours"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="leadId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lead ID
                  </label>
                  <Input
                    placeholder="Lead ID"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="contactId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Contact ID
                  </label>
                  <Input
                    placeholder="Contact ID"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="organizationId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Organization ID
                  </label>
                  <Input
                    placeholder="Organization ID"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>

          {/* Full-width fields */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  rows={3}
                  placeholder="Training description"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </div>
            )}
          />
          <Controller
            name="topics"
            control={control}
            render={({ field }) => (
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Topics
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  rows={3}
                  placeholder="Topics to be covered"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </div>
            )}
          />
        </Fieldset>

        {/* Trainer & Venue */}
        <Fieldset label="Trainer & Venue">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="trainerName"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Trainer Name
                  </label>
                  <Input
                    placeholder="Trainer name"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="trainerContact"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Trainer Contact
                  </label>
                  <Input
                    placeholder="Phone or email"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            {(watchMode === "ONSITE" || watchMode === "HYBRID") && (
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <Input
                      placeholder="Training location"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </div>
                )}
              />
            )}
            {(watchMode === "REMOTE" || watchMode === "HYBRID") && (
              <Controller
                name="meetingLink"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Meeting Link
                    </label>
                    <Input
                      placeholder="https://..."
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </div>
                )}
              />
            )}
            <Controller
              name="maxAttendees"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Max Attendees"
                  value={field.value ?? null}
                  onChange={field.onChange}
                  min={0}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* Notes */}
        <Fieldset label="Notes" toggleable defaultCollapsed>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  rows={3}
                  placeholder="General notes"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </div>
            )}
          />
          <Controller
            name="internalNotes"
            control={control}
            render={({ field }) => (
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Internal Notes
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  rows={3}
                  placeholder="Internal notes (not visible to client)"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </div>
            )}
          />
        </Fieldset>

        {/* Submit */}
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
