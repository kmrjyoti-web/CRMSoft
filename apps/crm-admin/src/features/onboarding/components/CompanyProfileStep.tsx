"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Input, Button, Typography, Icon } from "@/components/ui";

import { onboardingService } from "../services/onboarding.service";
import type { CompanyProfileData } from "../types/onboarding.types";

const profileSchema = z.object({
  companyLegalName: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  supportEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  gstin: z.string().optional(),
  pan: z.string().optional(),
});

interface CompanyProfileStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function CompanyProfileStep({ onComplete, onSkip }: CompanyProfileStepProps) {
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyProfileData>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      companyLegalName: "",
      industry: "",
      website: "",
      supportEmail: "",
      gstin: "",
      pan: "",
    },
  });

  const onSubmit = async (data: CompanyProfileData) => {
    setSaving(true);
    try {
      await onboardingService.updateProfile(data);
      toast.success("Company profile saved");
      onComplete();
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div
          className="mx-auto mb-3 flex items-center justify-center"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-lg, 12px)",
            background: "var(--color-primary-light, rgba(59,130,246,0.1))",
          }}
        >
          <Icon name="building" size={24} />
        </div>
        <Typography variant="heading" level={4}>
          Company Profile
        </Typography>
        <Typography variant="text" color="muted" size="14px">
          Tell us about your company (you can update this later)
        </Typography>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} noValidate>
        <div className="space-y-4">
          <Controller
            name="companyLegalName"
            control={control}
            render={({ field }) => (
              <Input
                label="Legal Company Name"
                placeholder="e.g. Acme Corporation Pvt. Ltd."
                value={field.value ?? ""}
                onChange={field.onChange}
                leftIcon={<Icon name="building" size={16} />}
              />
            )}
          />

          <Controller
            name="industry"
            control={control}
            render={({ field }) => (
              <Input
                label="Industry"
                placeholder="e.g. Technology, Healthcare, Finance"
                value={field.value ?? ""}
                onChange={field.onChange}
                leftIcon={<Icon name="briefcase" size={16} />}
              />
            )}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Controller
              name="website"
              control={control}
              render={({ field }) => (
                <Input
                  label="Website"
                  placeholder="https://yourcompany.com"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  leftIcon={<Icon name="globe" size={16} />}
                />
              )}
            />

            <Controller
              name="supportEmail"
              control={control}
              render={({ field }) => (
                <Input
                  label="Support Email"
                  placeholder="support@yourcompany.com"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={!!errors.supportEmail}
                  errorMessage={errors.supportEmail?.message}
                  leftIcon={<Icon name="mail" size={16} />}
                />
              )}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Controller
              name="gstin"
              control={control}
              render={({ field }) => (
                <Input
                  label="GSTIN"
                  placeholder="22AAAAA0000A1Z5"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  leftIcon={<Icon name="file-text" size={16} />}
                />
              )}
            />

            <Controller
              name="pan"
              control={control}
              render={({ field }) => (
                <Input
                  label="PAN"
                  placeholder="AAAAA0000A"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  leftIcon={<Icon name="credit-card" size={16} />}
                />
              )}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
          <Button type="submit" variant="primary" loading={saving} disabled={saving}>
            Save & Continue
            <Icon name="arrow-right" size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
}
