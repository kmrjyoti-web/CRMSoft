"use client";

import { useEffect, useState } from "react";

import { Typography, Button, Icon, Badge } from "@/components/ui";

import { registrationService } from "../services/registration.service";
import type { PlanOption } from "../types/registration.types";

interface PlanSelectorProps {
  selectedPlanId?: string;
  onSelect: (planId: string) => void;
}

export function PlanSelector({ selectedPlanId, onSelect }: PlanSelectorProps) {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registrationService
      .getPlans()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setPlans(list);
        // Auto-select first plan if none selected
        if (!selectedPlanId && list.length > 0) {
          onSelect(list[0].id);
        }
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <Typography variant="text" color="muted">
          No plans available at the moment.
        </Typography>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`,
        gap: "16px",
      }}
    >
      {plans.map((plan, index) => {
        const isSelected = selectedPlanId === plan.id;
        const isMiddle = plans.length === 3 && index === 1;

        return (
          <div
            key={plan.id}
            onClick={() => onSelect(plan.id)}
            style={{
              border: isSelected
                ? "2px solid var(--color-primary)"
                : "1px solid var(--border-color, #e2e8f0)",
              borderRadius: "var(--radius-lg, 12px)",
              padding: "24px 20px",
              cursor: "pointer",
              background: isSelected
                ? "var(--color-primary-light, rgba(59,130,246,0.05))"
                : "var(--surface-bg, #fff)",
              transition: "all 0.2s ease",
              position: "relative",
            }}
          >
            {isMiddle && (
              <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)" }}>
                <Badge variant="primary">Popular</Badge>
              </div>
            )}

            <div className="text-center mb-4">
              <Typography variant="heading" level={5} className="mb-1">
                {plan.name}
              </Typography>
              {plan.description && (
                <Typography variant="text" color="muted" size="13px">
                  {plan.description}
                </Typography>
              )}
            </div>

            <div className="text-center mb-4">
              <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
              {plan.price > 0 && (
                <Typography variant="text" color="muted" size="13px">
                  /{plan.billingCycle || "month"}
                </Typography>
              )}
            </div>

            {plan.maxUsers && (
              <div className="flex items-center gap-2 mb-2 text-sm">
                <Icon name="users" size={14} />
                <span>Up to {plan.maxUsers} users</span>
              </div>
            )}

            <div className="mt-4">
              <Button
                variant={isSelected ? "primary" : "outline"}
                fullWidth
                size="sm"
                type="button"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onSelect(plan.id);
                }}
              >
                {isSelected ? "Selected" : "Select Plan"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
