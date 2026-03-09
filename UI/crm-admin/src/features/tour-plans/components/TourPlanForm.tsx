"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, DatePicker, NumberInput, Fieldset } from "@/components/ui";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";

import { useSidePanelStore } from "@/stores/side-panel.store";

import {
  useTourPlanDetail,
  useCreateTourPlan,
  useUpdateTourPlan,
} from "../hooks/useTourPlans";

// -- Validation Schema ----------------------------------------------------

const visitSchema = z.object({
  leadId: z.string().optional(),
  contactId: z.string().optional(),
  sortOrder: z.number().min(1),
  scheduledTime: z.string().optional(),
  notes: z.string().optional(),
});

const tourPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  planDate: z.string().min(1, "Plan date is required"),
  startLocation: z.string().optional(),
  endLocation: z.string().optional(),
  leadId: z.string().min(1, "Lead is required"),
  salesPersonId: z.string().optional(),
  visits: z.array(visitSchema).optional(),
});

type TourPlanFormValues = z.infer<typeof tourPlanSchema>;

// -- Props ----------------------------------------------------------------

interface TourPlanFormProps {
  tourPlanId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// -- Component ------------------------------------------------------------

export function TourPlanForm({ tourPlanId, mode = "page", panelId, onSuccess, onCancel }: TourPlanFormProps) {
  const router = useRouter();
  const isEdit = !!tourPlanId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const { data: tourPlanData, isLoading: isLoadingDetail } = useTourPlanDetail(
    tourPlanId ?? "",
  );
  const createMutation = useCreateTourPlan();
  const updateMutation = useUpdateTourPlan();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TourPlanFormValues>({
    resolver: zodResolver(tourPlanSchema),
    defaultValues: {
      title: "",
      description: "",
      planDate: "",
      startLocation: "",
      endLocation: "",
      leadId: "",
      salesPersonId: "",
      visits: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "visits",
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !tourPlanData?.data) return;
    const tp = tourPlanData.data;
    reset({
      title: tp.title,
      description: tp.description ?? "",
      planDate: tp.planDate,
      startLocation: tp.startLocation ?? "",
      endLocation: tp.endLocation ?? "",
      leadId: tp.leadId,
      salesPersonId: tp.salesPersonId ?? "",
      visits:
        tp.visits?.map((v) => ({
          leadId: v.leadId ?? "",
          contactId: v.contactId ?? "",
          sortOrder: v.sortOrder,
          scheduledTime: v.scheduledTime ?? "",
          notes: v.notes ?? "",
        })) ?? [],
    });
  }, [isEdit, tourPlanData, reset]);

  // Sync isSubmitting → panel footer button (loading / disabled / label)
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
          label: isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Save Changes" : "Save",
          icon: "check",
          showAs: "both",
          variant: "primary",
          loading: isSubmitting,
          disabled: isSubmitting,
          onClick: () => {
            const formId = `sp-form-tourplan-${tourPlanId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, tourPlanId, updatePanelConfig]);

  // -- Submit handler -----------------------------------------------------

  const onSubmit = async (values: TourPlanFormValues) => {
    try {
      if (isEdit && tourPlanId) {
        await updateMutation.mutateAsync({
          id: tourPlanId,
          data: {
            title: values.title,
            description: values.description || undefined,
            planDate: values.planDate,
            startLocation: values.startLocation || undefined,
            endLocation: values.endLocation || undefined,
          },
        });
        toast.success("Tour plan updated");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push(`/tour-plans/${tourPlanId}`);
        }
      } else {
        const visits = values.visits?.map((v) => ({
          leadId: v.leadId || undefined,
          contactId: v.contactId || undefined,
          sortOrder: v.sortOrder,
          scheduledTime: v.scheduledTime || undefined,
          notes: v.notes || undefined,
        }));

        await createMutation.mutateAsync({
          title: values.title,
          description: values.description || undefined,
          planDate: values.planDate,
          startLocation: values.startLocation || undefined,
          endLocation: values.endLocation || undefined,
          leadId: values.leadId,
          salesPersonId: values.salesPersonId || undefined,
          visits: visits && visits.length > 0 ? visits : undefined,
        });
        toast.success("Tour plan created");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push("/tour-plans");
        }
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} tour plan`;
      toast.error(message);
    }
  };

  // -- Loading state ------------------------------------------------------

  if (isEdit && isLoadingDetail) return <LoadingSpinner fullPage />;

  // -- Render -------------------------------------------------------------

  const isPanel = mode === "panel";

  return (
    <div className={isPanel ? "p-4" : "p-6"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit Tour Plan" : "New Tour Plan"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          }
        />
      )}

      <FormErrors errors={errors} />

      <form
        id={isPanel ? `sp-form-tourplan-${tourPlanId ?? "new"}` : undefined}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={`${isPanel ? "mt-2" : "mt-4"} max-w-3xl space-y-6`}
      >
        {/* Tour Plan Information */}
        <Fieldset label="Tour Plan Information">
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
                    placeholder="Tour plan title"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.title}
                    errorMessage={errors.title?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="planDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Plan Date"
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
            <Controller
              name="leadId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lead ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Lead ID"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.leadId}
                    errorMessage={errors.leadId?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="salesPersonId"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Sales Person ID
                  </label>
                  <Input
                    placeholder="Sales Person ID"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>

          {/* Description */}
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
                  placeholder="Description"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </div>
            )}
          />
        </Fieldset>

        {/* Route */}
        <Fieldset label="Route">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="startLocation"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Start Location
                  </label>
                  <Input
                    placeholder="Start location"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="endLocation"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    End Location
                  </label>
                  <Input
                    placeholder="End location"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>
        </Fieldset>

        {/* Visits */}
        <Fieldset label="Visits">
          {fields.length > 0 && (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-end gap-3 rounded-lg border border-gray-100 p-3"
                >
                  <Controller
                    name={`visits.${index}.sortOrder`}
                    control={control}
                    render={({ field: f }) => (
                      <NumberInput
                        label="Order"
                        min={1}
                        value={f.value}
                        onChange={(v) => f.onChange(v)}
                      />
                    )}
                  />
                  <Controller
                    name={`visits.${index}.leadId`}
                    control={control}
                    render={({ field: f }) => (
                      <div className="flex-1">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Lead ID
                        </label>
                        <Input
                          placeholder="Lead ID"
                          value={f.value ?? ""}
                          onChange={f.onChange}
                        />
                      </div>
                    )}
                  />
                  <Controller
                    name={`visits.${index}.scheduledTime`}
                    control={control}
                    render={({ field: f }) => (
                      <DatePicker
                        label="Scheduled Time"
                        value={f.value ?? ""}
                        onChange={(v) => f.onChange(v)}
                      />
                    )}
                  />
                  <Controller
                    name={`visits.${index}.notes`}
                    control={control}
                    render={({ field: f }) => (
                      <div className="flex-1">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Notes
                        </label>
                        <Input
                          placeholder="Notes"
                          value={f.value ?? ""}
                          onChange={f.onChange}
                        />
                      </div>
                    )}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Icon name="trash-2" size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  sortOrder: fields.length + 1,
                  leadId: "",
                  scheduledTime: "",
                  notes: "",
                })
              }
            >
              <Icon name="plus" size={16} className="mr-1" /> Add Visit
            </Button>
          </div>
        </Fieldset>

        {/* Submit — hidden in panel mode (footer handles it) */}
        {!isPanel && (
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              <Icon name="check" size={16} />{" "}
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
