"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Input, Button, Checkbox, Typography, Icon } from "@/components/ui";

import { authService } from "@/features/auth/services/auth.service";

// ── Validation Schema ────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  tenantCode: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ── Form ─────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      tenantCode: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await authService.login(
        { email: values.email, password: values.password },
        "admin",
      );
      toast.success("Welcome back!");
      router.push(redirectTo);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Login failed. Please check your credentials.";
      setServerError(message);
    }
  };

  return (
    <>
      <Typography variant="heading" level={3} className="mb-1">
        Sign in
      </Typography>
      <Typography variant="text" color="muted" className="mb-6">
        Enter your credentials to access your account
      </Typography>

      {/* Server error */}
      {serverError && (
        <div
          className="mb-4 flex items-center gap-2 rounded-[var(--radius-md)] bg-red-50 border border-red-200 px-4 py-3"
          role="alert"
        >
          <span className="text-red-500 shrink-0">
            <Icon name="alert-circle" size={16} />
          </span>
          <Typography variant="text" color="danger" size="14px">
            {serverError}
          </Typography>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email */}
        <div className="mb-5">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                type="email"
                placeholder="you@company.com"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.email}
                errorMessage={errors.email?.message}
                leftIcon={<Icon name="mail" size={20} />}
                required
              />
            )}
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                type="password"
                placeholder="Enter your password"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.password}
                errorMessage={errors.password?.message}
                leftIcon={<Icon name="lock" size={20} />}
                required
              />
            )}
          />
        </div>

        {/* Tenant Code */}
        <div className="mb-5">
          <Controller
            name="tenantCode"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="e.g. acme-corp (optional)"
                value={field.value ?? ""}
                onChange={field.onChange}
                leftIcon={<Icon name="building" size={20} />}
              />
            )}
          />
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between mb-6">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value ?? false}
                onChange={field.onChange}
                label="Remember me"
              />
            )}
          />
          <Link
            href="/forgot-password"
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Sign in
        </Button>
      </form>
    </>
  );
}
