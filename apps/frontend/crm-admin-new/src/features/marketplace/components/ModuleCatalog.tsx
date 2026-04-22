"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button, Badge, Icon, Input, SelectInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useMarketplaceModules,
  useInstallModule,
} from "../hooks/useMarketplace";
import type { MarketplaceModule } from "../types/marketplace.types";

// ── Category options ──────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "" },
  { label: "CRM", value: "CRM" },
  { label: "Analytics", value: "ANALYTICS" },
  { label: "Communication", value: "COMMUNICATION" },
  { label: "Finance", value: "FINANCE" },
  { label: "HR", value: "HR" },
  { label: "Inventory", value: "INVENTORY" },
  { label: "Marketing", value: "MARKETING" },
  { label: "Other", value: "OTHER" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(module: MarketplaceModule): string {
  if (module.pricingModel === "FREE") return "Free";
  const symbol = module.currency === "INR" ? "₹" : "$";
  const suffix =
    module.pricingModel === "MONTHLY"
      ? "/mo"
      : module.pricingModel === "YEARLY"
        ? "/yr"
        : "";
  return `${symbol}${module.price}${suffix}`;
}

function pricingVariant(
  model: MarketplaceModule["pricingModel"],
): "success" | "primary" | "secondary" {
  if (model === "FREE") return "success";
  if (model === "ONE_TIME") return "primary";
  return "secondary";
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <Icon
            key={i}
            name="star"
            size={14}
            color={filled ? "#f59e0b" : "#d1d5db"}
          />
        );
      })}
      <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 4 }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ── Module Card ───────────────────────────────────────────────────────────────

function ModuleCard({
  module,
  onInstall,
  installing,
}: {
  module: MarketplaceModule;
  onInstall: (id: string) => void;
  installing: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 20,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="package" size={24} color="#6366f1" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 15,
              color: "#111827",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {module.name}
          </div>
          {module.vendorName && (
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
              by {module.vendorName}
            </div>
          )}
        </div>
        <Badge variant={pricingVariant(module.pricingModel)}>
          {formatPrice(module)}
        </Badge>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 13,
          color: "#6b7280",
          lineHeight: 1.5,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {module.shortDescription ?? module.description}
      </p>

      {/* Stats row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {module.avgRating !== undefined && module.avgRating > 0 && (
          <StarRating rating={module.avgRating} />
        )}
        {module.installCount !== undefined && (
          <span
            style={{
              fontSize: 12,
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Icon name="download" size={12} />
            {module.installCount.toLocaleString()} installs
          </span>
        )}
        {module.reviewCount !== undefined && module.reviewCount > 0 && (
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            ({module.reviewCount} reviews)
          </span>
        )}
      </div>

      {/* Category + version */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Badge variant="outline">{module.category}</Badge>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>v{module.version}</span>
        {module.trialDays && (
          <Badge variant="secondary">{module.trialDays}d trial</Badge>
        )}
      </div>

      {/* Install button */}
      <Button
        variant="primary"
        size="sm"
        disabled={installing || module.status !== "PUBLISHED"}
        onClick={() => onInstall(module.id)}
        style={{ marginTop: "auto", width: "100%" }}
      >
        {installing ? (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="loader" size={14} />
            Installing…
          </span>
        ) : (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="download" size={14} />
            Install
          </span>
        )}
      </Button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ModuleCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [installingId, setInstallingId] = useState<string | null>(null);

  const { data, isLoading } = useMarketplaceModules({
    search: search || undefined,
    category: category || undefined,
  });

  const installMutation = useInstallModule();

  const modules = useMemo<MarketplaceModule[]>(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const handleInstall = async (id: string) => {
    setInstallingId(id);
    try {
      await installMutation.mutateAsync(id);
      toast.success("Module installed successfully");
    } catch {
      toast.error("Failed to install module");
    } finally {
      setInstallingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Input
            label="Search modules"
            value={search}
            onChange={setSearch}
            leftIcon={<Icon name="search" size={16} />}
          />
        </div>
        <div style={{ width: 220 }}>
          <SelectInput
            label="Category"
            value={category}
            onChange={(v) => setCategory(v as string)}
            options={CATEGORY_OPTIONS}
            leftIcon={<Icon name="filter" size={16} />}
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <LoadingSpinner />
        </div>
      )}

      {/* Grid */}
      {!isLoading && modules.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: 64,
            color: "#9ca3af",
            background: "#f9fafb",
            borderRadius: 12,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <Icon name="package" size={48} color="#9ca3af" />
          </div>
          <p style={{ margin: 0, fontSize: 15 }}>No modules found</p>
        </div>
      )}

      {!isLoading && modules.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onInstall={handleInstall}
              installing={installingId === module.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
