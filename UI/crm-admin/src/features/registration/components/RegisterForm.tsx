"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Input, Button, Typography, Icon } from "@/components/ui";
import { setAuthCookie } from "@/features/auth/utils/auth-cookies";
import { useAuthStore } from "@/stores/auth.store";

import { registrationService } from "../services/registration.service";
import type { RegisterFormData } from "../types/registration.types";
import { PlanSelector } from "./PlanSelector";

// ── Validation Schema ────────────────────────────────────

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    companyName: z.string().min(1, "Company name is required"),
    slug: z
      .string()
      .min(1, "Company slug is required")
      .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Slug must be lowercase, alphanumeric with hyphens"),
    phone: z.string().optional(),
    planId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ── Step Indicators ──────────────────────────────────────

const STEPS = [
  { label: "Account", icon: "user" as const },
  { label: "Company", icon: "building" as const },
  { label: "Plan", icon: "credit-card" as const },
  { label: "Review", icon: "check-circle" as const },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((step, index) => (
        <div key={step.label} className="flex items-center">
          <div
            className="flex items-center gap-1.5"
            style={{
              padding: "4px 12px",
              borderRadius: "var(--radius-full, 9999px)",
              background:
                index <= currentStep
                  ? "var(--color-primary)"
                  : "rgba(255,255,255,0.1)",
              color: index <= currentStep ? "#fff" : "rgba(255,255,255,0.5)",
              fontSize: "12px",
              fontWeight: index === currentStep ? 600 : 400,
              transition: "all 0.3s ease",
            }}
          >
            <Icon name={step.icon} size={14} />
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              style={{
                width: "24px",
                height: "2px",
                background:
                  index < currentStep
                    ? "var(--color-primary)"
                    : "rgba(255,255,255,0.2)",
                margin: "0 4px",
                transition: "all 0.3s ease",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Form ─────────────────────────────────────────────────

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      slug: "",
      phone: "",
      planId: "",
    },
  });

  const values = watch();

  const autoSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const validateStep = async () => {
    switch (step) {
      case 0:
        return trigger(["firstName", "lastName", "email", "password", "confirmPassword"]);
      case 1: {
        const fieldValid = await trigger(["companyName", "slug"]);
        if (!fieldValid) return false;
        // Check slug availability on the server
        const currentSlug = watch("slug");
        if (!currentSlug) return false;
        setSlugStatus("checking");
        try {
          const result = await registrationService.checkSlug(currentSlug);
          if (!result.available) {
            setSlugStatus("taken");
            return false;
          }
          setSlugStatus("available");
          return true;
        } catch {
          setSlugStatus("idle");
          return true; // Allow to proceed if check fails (server will catch it)
        }
      }
      case 2:
        return true; // Plan selection is optional
      case 3:
        return true;
      default:
        return true;
    }
  };

  const nextStep = async () => {
    const valid = await validateStep();
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (formValues: RegisterFormData) => {
    setServerError(null);
    try {
      const result = await registrationService.register({
        companyName: formValues.companyName,
        slug: formValues.slug,
        email: formValues.email,
        password: formValues.password,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        phone: formValues.phone || undefined,
        planId: formValues.planId || undefined,
      });

      // Auto-login: set token + store
      useAuthStore.getState().setAuth({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user as any,
      });
      setAuthCookie(result.accessToken);

      toast.success("Account created successfully!");
      router.push("/onboarding");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Registration failed. Please try again.";
      setServerError(message);
    }
  };

  return (
    <>
      <Typography variant="heading" level={3} className="mb-1">
        Create Account
      </Typography>
      <Typography variant="text" color="muted" className="mb-4">
        Set up your CRM workspace in minutes
      </Typography>

      <StepIndicator currentStep={step} />

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

      <form onSubmit={handleSubmit(onSubmit as any)} noValidate>
        {/* ── Step 0: Account Details ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    placeholder="First Name"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.firstName}
                    errorMessage={errors.firstName?.message}
                    leftIcon={<Icon name="user" size={18} />}
                    required
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    placeholder="Last Name"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.lastName}
                    errorMessage={errors.lastName?.message}
                    leftIcon={<Icon name="user" size={18} />}
                    required
                  />
                )}
              />
            </div>

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  type="email"
                  placeholder="Work Email"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.email}
                  errorMessage={errors.email?.message}
                  leftIcon={<Icon name="mail" size={18} />}
                  required
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.password}
                  errorMessage={errors.password?.message}
                  leftIcon={<Icon name="lock" size={18} />}
                  required
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.confirmPassword}
                  errorMessage={errors.confirmPassword?.message}
                  leftIcon={<Icon name="lock" size={18} />}
                  required
                />
              )}
            />
          </div>
        )}

        {/* ── Step 1: Company Info ── */}
        {step === 1 && (
          <div className="space-y-4">
            <Controller
              name="companyName"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Company Name"
                  value={field.value}
                  onChange={(val: string) => {
                    field.onChange(val);
                    // Auto-generate slug from company name
                    const generated = autoSlug(val);
                    if (generated) {
                      setValue("slug", generated);
                      setSlugStatus("idle");
                    }
                  }}
                  error={!!errors.companyName}
                  errorMessage={errors.companyName?.message}
                  leftIcon={<Icon name="building" size={18} />}
                  required
                />
              )}
            />

            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    placeholder="company-slug (URL-safe)"
                    value={field.value}
                    onChange={(val: string) => {
                      field.onChange(val);
                      setSlugStatus("idle"); // Reset status when user types
                    }}
                    error={!!errors.slug || slugStatus === "taken"}
                    errorMessage={
                      errors.slug?.message ||
                      (slugStatus === "taken" ? "This company code is already taken" : undefined)
                    }
                    leftIcon={<Icon name="link" size={18} />}
                    required
                  />
                  {slugStatus === "available" && (
                    <div className="flex items-center gap-1 mt-1" style={{ color: "#22c55e", fontSize: "12px" }}>
                      <Icon name="check-circle" size={14} />
                      <span>Company code is available</span>
                    </div>
                  )}
                </div>
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Phone (optional)"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  leftIcon={<Icon name="phone" size={18} />}
                />
              )}
            />
          </div>
        )}

        {/* ── Step 2: Plan Selection ── */}
        {step === 2 && (
          <PlanSelector
            selectedPlanId={values.planId}
            onSelect={(planId) => setValue("planId", planId)}
          />
        )}

        {/* ── Step 3: Review ── */}
        {step === 3 && (
          <div className="space-y-3">
            <div
              style={{
                border: "1px solid var(--border-color, #e2e8f0)",
                borderRadius: "var(--radius-md, 8px)",
                padding: "16px",
              }}
            >
              <Typography variant="text" color="muted" size="12px" className="mb-1">
                Account
              </Typography>
              <div className="text-sm">
                <strong>{values.firstName} {values.lastName}</strong>
              </div>
              <div className="text-sm text-slate-400">{values.email}</div>
            </div>

            <div
              style={{
                border: "1px solid var(--border-color, #e2e8f0)",
                borderRadius: "var(--radius-md, 8px)",
                padding: "16px",
              }}
            >
              <Typography variant="text" color="muted" size="12px" className="mb-1">
                Company
              </Typography>
              <div className="text-sm">
                <strong>{values.companyName}</strong>
              </div>
              <div className="text-sm text-slate-400">
                Slug: {values.slug}
                {values.phone && <span> | Phone: {values.phone}</span>}
              </div>
            </div>

            <Typography variant="text" color="muted" size="12px" className="mt-2">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </Typography>
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div
          className="mt-6"
          style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}
        >
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={prevStep}>
              <Icon name="arrow-left" size={16} />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
              loading={slugStatus === "checking"}
              disabled={slugStatus === "checking"}
            >
              {slugStatus === "checking" ? "Checking..." : "Continue"}
              {slugStatus !== "checking" && <Icon name="arrow-right" size={16} />}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Account
            </Button>
          )}
        </div>
      </form>

      {/* Login link */}
      <p className="text-center text-sm mt-4" style={{ color: "rgba(255,255,255,0.7)" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
