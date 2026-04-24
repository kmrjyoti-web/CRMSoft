"use client";

import { useState } from "react";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";


import { Input, Button, Icon } from "@/components/ui";

import api from "@/services/api-client";

// ── Validation ───────────────────────────────────────────

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

// ── Component ────────────────────────────────────────────

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    try {
      await api.post("/api/v1/auth/forgot-password", {
        email: values.email,
      });
      setSubmitted(true);
      toast.success("Password reset email sent");
    } catch {
      toast.error("Failed to send reset email. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto mb-4 text-[var(--color-success)]">
          <Icon name="check-circle" size={48} />
        </div>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          Check your email
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          We&apos;ve sent password reset instructions to your email address.
        </p>
        <Link
          href="/login"
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          Back to Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        Forgot Password
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        Enter your email and we&apos;ll send you reset instructions.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <label className="st-label">Email</label>
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
              />
            )}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Send Reset Link
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link
          href="/login"
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          Back to Sign in
        </Link>
      </div>
    </>
  );
}
