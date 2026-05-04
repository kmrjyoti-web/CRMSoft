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
import { useAuthStore } from "@/stores/auth.store";

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
  const brandFromUrl = searchParams.get("brand");
  const { setActiveCompany, setAvailableCompanies } = useAuthStore();

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
      const loginData = await authService.login(
        { email: values.email, password: values.password },
      );

      // Store available companies + set active
      const companies = (loginData as any).companies ?? [];
      setAvailableCompanies(companies);

      const activeId = (loginData as any).activeCompanyId;
      const activeCompany = companies.find((c: any) => c.id === activeId) ?? companies[0] ?? null;
      if (activeCompany) setActiveCompany(activeCompany);

      toast.success("Welcome back!");
      router.push("/dashboard");
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
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        margin: "20px 0 16px",
        color: "rgba(148,163,184,0.5)", fontSize: 12,
      }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.10)" }} />
        <span>or</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.10)" }} />
      </div>

      {/* Magic link section */}
      <MagicLinkSection />

      {/* Register link */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", margin: "20px 0 16px" }} />
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

// ── Magic Link Section ───────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

function MagicLinkSection() {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const send = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setResult({ ok: false, message: 'Please enter a valid email address.' });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = await res.json();
      const data = body?.data ?? body;
      if (!res.ok) {
        setResult({ ok: false, message: data?.message ?? 'Request failed. Try again.' });
      } else {
        setResult({ ok: true, message: data?.message ?? 'Check your email!' });
      }
    } catch {
      setResult({ ok: false, message: 'Network error. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          width: '100%', padding: '10px 16px',
          background: 'rgba(201,162,95,0.08)',
          border: '1px solid rgba(201,162,95,0.25)',
          borderRadius: 8, color: '#c9a25f', fontSize: 13,
          fontWeight: 600, cursor: 'pointer', letterSpacing: '0.01em',
          transition: 'background 0.15s',
        }}
        onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,162,95,0.15)'; }}
        onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,162,95,0.08)'; }}
      >
        ✉ Sign in with Magic Link
      </button>
    );
  }

  return (
    <div style={{
      background: 'rgba(201,162,95,0.06)',
      border: '1px solid rgba(201,162,95,0.2)',
      borderRadius: 10, padding: '14px 16px',
    }}>
      <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, margin: '0 0 10px' }}>
        Enter your email — we&apos;ll send a one-time sign-in link valid for 10 minutes.
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
        placeholder="you@company.com"
        style={{
          width: '100%', padding: '9px 12px',
          background: 'rgba(15,23,42,0.7)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 7, color: '#f1f5f9', fontSize: 13,
          outline: 'none', boxSizing: 'border-box', marginBottom: 8,
        }}
        autoFocus
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={send}
          disabled={sending}
          style={{
            flex: 1, padding: '9px 0',
            background: sending ? 'rgba(201,162,95,0.3)' : 'rgba(201,162,95,0.85)',
            border: 'none', borderRadius: 7, color: '#0f172a',
            fontSize: 13, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer',
          }}
        >
          {sending ? 'Sending…' : 'Send Magic Link'}
        </button>
        <button
          onClick={() => { setExpanded(false); setResult(null); setEmail(''); }}
          style={{
            padding: '9px 12px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 7, color: '#94a3b8', fontSize: 12, cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
      {result && (
        <p style={{
          marginTop: 8, fontSize: 12, margin: '8px 0 0',
          color: result.ok ? '#86efac' : '#fca5a5',
        }}>
          {result.ok ? '✓ ' : '✕ '}{result.message}
        </p>
      )}
    </div>
  );
}
