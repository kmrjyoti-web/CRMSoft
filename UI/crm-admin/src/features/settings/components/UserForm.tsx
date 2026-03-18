"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button, Icon, Input, MobileInput, SelectInput, Switch, Fieldset } from "@/components/ui";
import { FormErrors } from "@/components/common/FormErrors";
import { FormSubmitOverlay } from "@/components/common/FormSubmitOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { useSidePanelStore } from "@/stores/side-panel.store";

import { useRolesList } from "../hooks/useRoles";
import { useUserDetail, useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { useDepartmentsList } from "../hooks/useDepartments";
import { useDesignationsList } from "../hooks/useDesignations";

// ── Validation Schema ────────────────────────────────────

const userSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  firstName: z.string().min(2, "First name is required (min 2 characters)"),
  lastName: z.string().min(2, "Last name is required (min 2 characters)"),
  phone: z.string().optional(),
  userType: z.string().min(1, "User type is required"),
  roleId: z.string().min(1, "Role is required"),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  isActive: z.boolean().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

const USER_TYPE_OPTIONS = [
  { label: "Admin", value: "ADMIN" },
  { label: "Employee", value: "EMPLOYEE" },
];

// ── Props ────────────────────────────────────────────────

interface UserFormProps {
  userId?: string;
  mode?: "page" | "panel";
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Component ────────────────────────────────────────────

export function UserForm({ userId, mode = "page", panelId, onSuccess, onCancel }: UserFormProps) {
  const router = useRouter();
  const isEdit = !!userId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const { data: userData, isLoading: isLoadingUser } = useUserDetail(userId ?? "");
  const { data: rolesData } = useRolesList();
  const { data: deptsData } = useDepartmentsList({ limit: 500 });
  const { data: desigsData } = useDesignationsList({ limit: 500 });
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  // Build dropdown options
  const roleOptions = useMemo(() => {
    const raw = rolesData?.data;
    const roles = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
    return roles.map((r: any) => ({ label: r.displayName, value: r.id }));
  }, [rolesData]);

  const departmentOptions = useMemo(() => {
    const list = deptsData?.data ?? [];
    const items = Array.isArray(list) ? list : (list as any)?.data ?? [];
    return items.map((d: any) => ({ label: d.displayName || d.name, value: d.id }));
  }, [deptsData]);

  const designationOptions = useMemo(() => {
    const list = desigsData?.data ?? [];
    const items = Array.isArray(list) ? list : (list as any)?.data ?? [];
    return items.map((d: any) => ({ label: d.name, value: d.id }));
  }, [desigsData]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      userType: "EMPLOYEE",
      roleId: "",
      departmentId: "",
      designationId: "",
      isActive: true,
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !userData?.data) return;
    const raw = userData.data;
    const u = (raw as any)?.email ? raw : (raw as any)?.data ?? raw;
    reset({
      email: u.email,
      password: undefined,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone ?? "",
      userType: u.userType,
      roleId: u.roleId,
      departmentId: u.departmentId ?? "",
      designationId: u.designationId ?? "",
      isActive: u.status === "ACTIVE",
    });
  }, [isEdit, userData, reset]);

  // Sync isSubmitting → panel footer button
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
            const formId = `sp-form-user-${userId ?? "new"}`;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, userId, updatePanelConfig]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (isEdit && userId) {
        await updateMutation.mutateAsync({
          id: userId,
          data: {
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone || undefined,
            roleId: values.roleId,
            departmentId: values.departmentId || undefined,
            designationId: values.designationId || undefined,
            status: values.isActive ? "ACTIVE" : "INACTIVE",
          },
        });
        toast.success("User updated");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push("/settings/users");
        }
      } else {
        await createMutation.mutateAsync({
          email: values.email,
          password: values.password!,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || undefined,
          userType: values.userType as "ADMIN" | "EMPLOYEE",
          roleId: values.roleId,
          departmentId: values.departmentId || undefined,
          designationId: values.designationId || undefined,
        });
        toast.success("User created");
        if (mode === "panel" && onSuccess) {
          onSuccess();
        } else {
          router.push("/settings/users");
        }
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} user`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingUser) return <LoadingSpinner fullPage />;

  const isPanel = mode === "panel";

  return (
    <div className={isPanel ? "p-4" : "p-6 max-w-3xl mx-auto"} style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader
          title={isEdit ? "Edit User" : "New User"}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          }
        />
      )}

      <form
        id={isPanel ? `sp-form-user-${userId ?? "new"}` : undefined}
        onSubmit={(handleSubmit as any)(onSubmit)}
        noValidate
        className={`${isPanel ? "mt-2" : "mt-4"} space-y-6`}
      >
        <FormErrors errors={errors} />

        {/* User Information */}
        <Fieldset label="User Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input
                  label="First Name"
                  required
                  leftIcon={<Icon name="user" size={16} />}
                  placeholder="First name"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.firstName}
                  errorMessage={errors.firstName?.message}
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Last Name"
                  required
                  leftIcon={<Icon name="user" size={16} />}
                  placeholder="Last name"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.lastName}
                  errorMessage={errors.lastName?.message}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  label="Email"
                  required
                  type="email"
                  leftIcon={<Icon name="mail" size={16} />}
                  placeholder="Email address"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isEdit}
                  error={!!errors.email}
                  errorMessage={errors.email?.message}
                />
              )}
            />
            {!isEdit && (
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Password"
                    required
                    type="password"
                    leftIcon={<Icon name="lock" size={16} />}
                    placeholder="Min 8 characters"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    error={!!errors.password}
                    errorMessage={errors.password?.message}
                  />
                )}
              />
            )}
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <MobileInput
                  label="Phone"
                  defaultCountry="IN"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
          </div>
        </Fieldset>

        {/* Department, Designation & Role */}
        <Fieldset label="Department, Designation & Role">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Department"
                  options={departmentOptions}
                  value={field.value || null}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                  placeholder="Select department..."
                  leftIcon={<Icon name="building-2" size={16} />}
                  searchable
                  clearable
                />
              )}
            />
            <Controller
              name="designationId"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Designation"
                  options={designationOptions}
                  value={field.value || null}
                  onChange={(v) => field.onChange(String(v ?? ""))}
                  placeholder="Select designation..."
                  leftIcon={<Icon name="briefcase" size={16} />}
                  searchable
                  clearable
                />
              )}
            />
            <Controller
              name="roleId"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Role"
                  options={roleOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  leftIcon={<Icon name="shield" size={16} />}
                  searchable
                  error={!!errors.roleId}
                  errorMessage={errors.roleId?.message}
                />
              )}
            />
            <Controller
              name="userType"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="User Type"
                  options={USER_TYPE_OPTIONS}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  leftIcon={<Icon name="users" size={16} />}
                  error={!!errors.userType}
                  errorMessage={errors.userType?.message}
                />
              )}
            />
            {isEdit && (
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    label="Active"
                    checked={field.value ?? true}
                    onChange={(v) => field.onChange(v)}
                  />
                )}
              />
            )}
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
              {isSubmitting
                ? isEdit ? "Updating..." : "Saving..."
                : isEdit ? "Update" : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
