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
      <div className="mb-6 text-center">
        <h2 style={{
          fontSize: 26,
          fontWeight: 700,
          color: "#f1f5f9",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          marginBottom: 8,
        }}>
          Welcome back
        </h2>
        <p style={{
          fontSize: 14,
          color: "rgba(148, 163, 184, 0.9)",
          lineHeight: 1.5,
        }}>
          Sign in to your account to continue
        </p>
      </div>

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
                size="lg"
                type="email"
                label="Email"
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
                size="lg"
                type="password"
                label="Password"
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
                size="lg"
                type="text"
                label="Company Code"
                placeholder="e.g. acme-corp (optional)"
                value={field.value ?? ""}
                onChange={field.onChange}
                leftIcon={<Icon name="building-2" size={20} />}
              />
            )}
          />
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between mb-6" style={{ marginTop: 2 }}>
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
            style={{ fontSize: 13, color: "#5eead4", textDecoration: "none", fontWeight: 500 }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
          style={{
            background: "linear-gradient(135deg, #1e5f74 0%, #2a7a94 100%)",
            border: "1px solid rgba(94, 234, 212, 0.3)",
            boxShadow: "0 4px 20px rgba(30, 95, 116, 0.4)",
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", margin: "20px 0 16px" }} />

      {/* Register link */}
      <p className="text-center" style={{ fontSize: 13, color: "rgba(148, 163, 184, 0.85)" }}>
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", textDecoration: "none" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#5eead4")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#f1f5f9")}
        >
          Register
        </Link>
      </p>
    </>
  );
}
