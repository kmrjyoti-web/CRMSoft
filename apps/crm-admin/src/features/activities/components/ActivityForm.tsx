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
  DatePicker,
  NumberInput,
  Fieldset,
  TextareaInput,
} from "@/components/ui";
import { LookupSelect } from "@/components/common/LookupSelect";
import { useSidePanelStore } from "@/stores/side-panel.store";

import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useActivityDetail,
  useCreateActivity,
  useUpdateActivity,
} from "../hooks/useActivities";

// -- Validation Schema -------------------------------------------------------

const activitySchema = z.object({
  type: z.string().min(1, "Type is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  duration: z.number().nullable().optional(),
  scheduledAt: z.string().optional(),
  endTime: z.string().optional(),
  locationName: z.string().optional(),
  leadId: z.string().optional(),
  contactId: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

// -- Props -------------------------------------------------------------------

interface ActivityFormProps {
  activityId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// -- Component ---------------------------------------------------------------

export function ActivityForm({ activityId, mode = "page", panelId, onSuccess, onCancel }: ActivityFormProps) {
  const router = useRouter();
  const isEdit = !!activityId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const { data: activityData, isLoading: isLoadingActivity } =
    useActivityDetail(activityId ?? "");
  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: "",
      subject: "",
      description: "",
      duration: null,
      scheduledAt: "",
      endTime: "",
      locationName: "",
      leadId: "",
      contactId: "",
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !activityData?.data) return;
    const a = activityData.data;
    reset({
      type: a.type,
      subject: a.subject,
      description: a.description ?? "",
      duration: a.duration ?? null,
      scheduledAt: a.scheduledAt ?? "",
      endTime: a.endTime ?? "",
      locationName: a.locationName ?? "",
      leadId: a.leadId ?? "",
      contactId: a.contactId ?? "",
    });
  }, [isEdit, activityData, reset]);

  const isPanel = mode === "panel";

  // Sync panel footer buttons with form submitting state
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
            const formId = `sp-form-activity-${activityId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, activityId, updatePanelConfig]);

  const onSubmit = async (values: ActivityFormValues) => {
    try {
      if (isEdit && activityId) {
        await updateMutation.mutateAsync({
          id: activityId,
          data: {
            type: values.type as
              | "CALL"
              | "EMAIL"
              | "MEETING"
              | "NOTE"
              | "WHATSAPP"
              | "SMS"
              | "VISIT",
            subject: values.subject,
            description: values.description || undefined,
            duration: values.duration ?? undefined,
            scheduledAt: values.scheduledAt || undefined,
            endTime: values.endTime || undefined,
            locationName: values.locationName || undefined,
          },
        });
        toast.success("Activity updated");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push(`/activities/${activityId}`);
        }
      } else {
        await createMutation.mutateAsync({
          type: values.type as
            | "CALL"
            | "EMAIL"
            | "MEETING"
            | "NOTE"
            | "WHATSAPP"
            | "SMS"
            | "VISIT",
          subject: values.subject,
          description: values.description || undefined,
          duration: values.duration ?? undefined,
          scheduledAt: values.scheduledAt || undefined,
          endTime: values.endTime || undefined,
          locationName: values.locationName || undefined,
          leadId: values.leadId || undefined,
          contactId: values.contactId || undefined,
        });
        toast.success("Activity created");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push("/activities");
        }
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} activity`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingActivity) return <LoadingSpinner fullPage />;

  return (
    <div className={isPanel ? "p-4" : "p-6"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Activity" : "New Activity"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          }
        />
      )}

      <FormErrors errors={errors} />

      <form
        id={isPanel ? `sp-form-activity-${activityId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-4 max-w-3xl space-y-6"
      >
        {/* Activity Information */}
        <Fieldset label="Activity Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <LookupSelect
                  masterCode="ACTIVITY_TYPE"
                  label="Type"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.type}
                  errorMessage={errors.type?.message}
                />
              )}
            />
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Activity subject"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.subject}
                    errorMessage={errors.subject?.message}
                  />
                </div>
              )}
            />
          </div>
          <div className="mt-4">
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextareaInput
                  label="Description"
                  rows={3}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* Schedule */}
        <Fieldset label="Schedule">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Controller
              name="scheduledAt"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Scheduled At"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="End Time"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Duration (mins)"
                  value={field.value ?? null}
                  onChange={field.onChange}
                  min={0}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* Location */}
        <Fieldset label="Location">
          <Controller
            name="locationName"
            control={control}
            render={({ field }) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Location Name
                </label>
                <Input
                  placeholder="Location name"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </div>
            )}
          />
        </Fieldset>

        {/* Association */}
        <Fieldset label="Association">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
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
