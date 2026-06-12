"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/ui";

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
      <div className="text-center py-8" style={{ color: "rgba(148,163,184,0.85)" }}>
        No plans available at the moment.
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
    /* Scrollable container — max 2 rows visible, then scroll */
    <div
      style={{
        maxHeight: 360,
        overflowY: plans.length > 4 ? "auto" : "visible",
        paddingRight: plans.length > 4 ? 4 : 0,
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.2) transparent",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        {plans.map((plan, index) => {
          const isSelected = selectedPlanId === plan.id;
          const isPopular = plans.length >= 2 && index === 1;

          return (
            <div
              key={plan.id}
              onClick={() => onSelect(plan.id)}
              style={{
                position: "relative",
                borderRadius: 12,
                padding: "18px 16px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: isSelected
                  ? "rgba(30, 95, 116, 0.45)"
                  : "rgba(255, 255, 255, 0.06)",
                border: isSelected
                  ? "2px solid rgba(94, 234, 212, 0.75)"
                  : "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: isSelected
                  ? "0 0 0 3px rgba(94, 234, 212, 0.12), 0 4px 20px rgba(30,95,116,0.3)"
                  : "none",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Popular badge */}
              {isPopular && (
                <div
                  style={{
                    position: "absolute",
                    top: -11,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #1e5f74, #5eead4)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    padding: "3px 10px",
                    borderRadius: 99,
                    whiteSpace: "nowrap",
                  }}
                >
                  POPULAR
                </div>
              )}

              {/* Selected check */}
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    color: "#5eead4",
                  }}
                >
                  <Icon name="check-circle" size={16} />
                </div>
              )}

              {/* Plan name */}
              <div style={{ marginBottom: 6 }}>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: isSelected ? "#f1f5f9" : "rgba(226,232,240,0.9)",
                  lineHeight: 1.2,
                }}>
                  {plan.name}
                </div>
                {plan.description && (
                  <div style={{
                    fontSize: 11,
                    color: "rgba(148,163,184,0.8)",
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}>
                    {plan.description}
                  </div>
                )}
              </div>

              {/* Price */}
              <div style={{ marginBottom: 10 }}>
                <span style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: isSelected ? "#5eead4" : "#f1f5f9",
                  letterSpacing: "-0.02em",
                }}>
                  {formatPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span style={{ fontSize: 11, color: "rgba(148,163,184,0.7)", marginLeft: 4 }}>
                    /{plan.billingCycle || "month"}
                  </span>
                )}
              </div>

              {/* Users limit */}
              {plan.maxUsers && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  color: "rgba(148,163,184,0.85)",
                }}>
                  <Icon name="users" size={12} />
                  <span>Up to {plan.maxUsers} users</span>
                </div>
              )}

              {/* Select button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSelect(plan.id); }}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "7px 0",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: isSelected
                    ? "linear-gradient(135deg, #1e5f74, #2a7a94)"
                    : "rgba(255,255,255,0.08)",
                  border: isSelected
                    ? "1px solid rgba(94,234,212,0.4)"
                    : "1px solid rgba(255,255,255,0.18)",
                  color: isSelected ? "#fff" : "rgba(226,232,240,0.85)",
                }}
              >
                {isSelected ? "✓ Selected" : "Select Plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
