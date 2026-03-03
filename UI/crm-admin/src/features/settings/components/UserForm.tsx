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

import { useRolesList } from "../hooks/useRoles";
import { useUserDetail, useCreateUser, useUpdateUser } from "../hooks/useUsers";

// ── Validation Schema ────────────────────────────────────

const userSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  firstName: z.string().min(2, "First name is required (min 2 characters)"),
  lastName: z.string().min(2, "Last name is required (min 2 characters)"),
  phone: z.string().optional(),
  userType: z.string().min(1, "User type is required"),
  roleId: z.string().min(1, "Role is required"),
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
}

// ── Component ────────────────────────────────────────────

export function UserForm({ userId }: UserFormProps) {
  const router = useRouter();
  const isEdit = !!userId;

  const { data: userData, isLoading: isLoadingUser } = useUserDetail(
    userId ?? "",
  );
  const { data: rolesData } = useRolesList();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const roleOptions = useMemo(() => {
    const roles = rolesData?.data ?? [];
    return roles.map((r) => ({ label: r.displayName, value: r.id }));
  }, [rolesData]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      userType: "EMPLOYEE",
      roleId: "",
      isActive: true,
    },
  });

  // Pre-populate in edit mode
  useEffect(() => {
    if (!isEdit || !userData?.data) return;
    const u = userData.data;
    reset({
      email: u.email,
      password: undefined,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone ?? "",
      userType: u.userType,
      roleId: u.roleId,
      isActive: u.status === "ACTIVE",
    });
  }, [isEdit, userData, reset]);

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
            status: values.isActive ? "ACTIVE" : "INACTIVE",
          },
        });
        toast.success("User updated");
        router.push("/settings/users");
      } else {
        await createMutation.mutateAsync({
          email: values.email,
          password: values.password!,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || undefined,
          userType: values.userType as "ADMIN" | "EMPLOYEE",
          roleId: values.roleId,
        });
        toast.success("User created");
        router.push("/settings/users");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || `Failed to ${isEdit ? "update" : "create"} user`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingUser) return <LoadingSpinner fullPage />;

  return (
    <div className="p-6" style={{ position: "relative" }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      <PageHeader
        title={isEdit ? "Edit User" : "New User"}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <Icon name="arrow-left" size={16} /> Back
          </Button>
        }
      />

      <FormErrors errors={errors} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-4 max-w-3xl space-y-6"
      >
        {/* User Information */}
        <Fieldset label="User Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="First Name"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.firstName}
                    errorMessage={errors.firstName?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Last Name"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.lastName}
                    errorMessage={errors.lastName?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isEdit}
                    error={!!errors.email}
                    errorMessage={errors.email?.message}
                    leftIcon={<Icon name="mail" size={18} />}
                  />
                </div>
              )}
            />
            {!isEdit && (
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={!!errors.password}
                      errorMessage={errors.password?.message}
                      leftIcon={<Icon name="lock" size={18} />}
                    />
                  </div>
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

        {/* Role & Access */}
        <Fieldset label="Role & Access">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="userType"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="User Type"
                  options={USER_TYPE_OPTIONS}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  error={!!errors.userType}
                  errorMessage={errors.userType?.message}
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
                  error={!!errors.roleId}
                  errorMessage={errors.roleId?.message}
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

        {/* Submit */}
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
      </form>
    </div>
  );
}
