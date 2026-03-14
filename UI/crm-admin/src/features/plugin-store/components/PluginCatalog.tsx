"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button, Badge, Icon, Input, SelectInput, Modal } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  usePluginCatalog,
  useInstallPlugin,
} from "../hooks/usePluginStore";
import type {
  PluginCatalogItem,
  PluginCredentialField,
} from "../types/plugin-store.types";
import { CATEGORY_CONFIG } from "../types/plugin-store.types";

// ── Category options (from CATEGORY_CONFIG) ─────────────────────────

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "" },
  ...Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
    label: cfg.label,
    value: key,
  })),
];

// ── Credential field sub-component ──────────────────────────────────

function CredentialFieldInput({
  field,
  value,
  onChange,
}: {
  field: PluginCredentialField;
  value: string;
  onChange: (v: string) => void;
}) {
  const iconName =
    field.type === "password" ? "lock" : field.type === "url" ? "link" : "key";
  return (
    <Input
      label={field.label + (field.required ? " *" : "")}
      value={value}
      onChange={onChange}
      type={field.type === "password" ? "password" : "text"}
      leftIcon={<Icon name={iconName} size={16} />}
    />
  );
}

// ── Install Modal ───────────────────────────────────────────────────

function InstallModal({
  plugin,
  open,
  onClose,
  onInstall,
}: {
  plugin: PluginCatalogItem | null;
  open: boolean;
  onClose: () => void;
  onInstall: (code: string, credentials: Record<string, string>) => Promise<void>;
}) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fields = plugin?.credentialFields ?? [];

  const isValid = fields
    .filter((f) => f.required)
    .every((f) => credentials[f.key]?.trim());

  const handleInstall = async () => {
    if (!plugin) return;
    setLoading(true);
    try {
      await onInstall(plugin.code, credentials);
      setCredentials({});
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const updateCredential = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Install — ${plugin?.name ?? ""}`}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleInstall}
            disabled={!isValid || loading}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="download" size={14} />
              {loading ? "Installing…" : "Install"}
            </span>
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {plugin && (
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
              {plugin.description}
            </p>
            {plugin.author && (
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9ca3af" }}>
                by {plugin.author} — v{plugin.version}
              </p>
            )}
          </div>
        )}

        {fields.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
              Credentials Required
            </div>
            {fields.map((field) => (
              <CredentialFieldInput
                key={field.key}
                field={field}
                value={credentials[field.key] ?? ""}
                onChange={(v) => updateCredential(field.key, v)}
              />
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
            No credentials required. Click Install to proceed.
          </p>
        )}
      </div>
    </Modal>
  );
}

// ── Plugin Card ─────────────────────────────────────────────────────

function PluginCard({
  plugin,
  onInstall,
  onViewDetail,
}: {
  plugin: PluginCatalogItem;
  onInstall: (plugin: PluginCatalogItem) => void;
  onViewDetail: (code: string) => void;
}) {
  const catCfg = CATEGORY_CONFIG[plugin.category] ?? {
    label: plugin.category,
    icon: "zap",
    color: "#6b7280",
  };

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
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onClick={() => onViewDetail(plugin.code)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#93c5fd";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(59,130,246,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e5e7eb";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: `${catCfg.color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name={catCfg.icon} size={22} color={catCfg.color} />
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
            {plugin.name}
          </div>
          {plugin.author && (
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
              by {plugin.author}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {plugin.isPremium && (
            <Badge variant="warning">
              <Icon name="crown" size={11} />
            </Badge>
          )}
          {plugin.isInstalled ? (
            <Badge variant="success">Installed</Badge>
          ) : (
            <Badge variant="outline">v{plugin.version}</Badge>
          )}
        </div>
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
        {plugin.description}
      </p>

      {/* Category + hooks */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Badge variant="secondary" style={{ background: `${catCfg.color}15`, color: catCfg.color }}>
          {catCfg.label}
        </Badge>
        {plugin.requiresCredentials && (
          <Badge variant="warning">
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Icon name="key" size={11} />
              Credentials
            </span>
          </Badge>
        )}
        {plugin.hookPoints && plugin.hookPoints.length > 0 && (
          <Badge variant="outline">
            {plugin.hookPoints.length} hook{plugin.hookPoints.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
        {plugin.isInstalled ? (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onViewDetail(plugin.code); }}
            style={{ flex: 1 }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="settings" size={14} />
              Configure
            </span>
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onInstall(plugin); }}
            style={{ flex: 1 }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="download" size={14} />
              Install
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function PluginCatalog() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [selectedPlugin, setSelectedPlugin] = useState<PluginCatalogItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = usePluginCatalog({
    search: search || undefined,
    category: category || undefined,
  });

  const installMutation = useInstallPlugin();

  const plugins = useMemo<PluginCatalogItem[]>(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const handleInstallClick = (plugin: PluginCatalogItem) => {
    setSelectedPlugin(plugin);
    setModalOpen(true);
  };

  const handleViewDetail = (code: string) => {
    router.push(`/plugins/${code}`);
  };

  const handleInstall = async (code: string, credentials: Record<string, string>) => {
    try {
      await installMutation.mutateAsync({
        code,
        dto: {
          credentials: Object.keys(credentials).length ? credentials : undefined,
        },
      });
      toast.success("Plugin installed successfully");
    } catch {
      toast.error("Failed to install plugin");
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Toolbar */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <Input
              label="Search plugins"
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

        {/* Empty */}
        {!isLoading && plugins.length === 0 && (
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
              <Icon name="zap" size={48} color="#9ca3af" />
            </div>
            <p style={{ margin: 0, fontSize: 15 }}>No plugins found</p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && plugins.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {plugins.map((plugin) => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                onInstall={handleInstallClick}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
        )}
      </div>

      <InstallModal
        plugin={selectedPlugin}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onInstall={handleInstall}
      />
    </>
  );
}
