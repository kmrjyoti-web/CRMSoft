"use client";

import { useState, useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";

import { Icon, Input, SelectInput, Button, Badge } from "@/components/ui";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";

import {
  useEmails,
  useEmailAccounts,
  useToggleStar,
} from "../hooks/useEmail";

import { EmailItem } from "./EmailItem";

import type {
  EmailFilters,
  EmailDirection,
  EmailStatus,
  Email,
} from "../types/email.types";

// ── Filter options ────────────────────────────────────────

const DIRECTION_OPTIONS = [
  { label: "All", value: "" },
  { label: "Inbound", value: "INBOUND" },
  { label: "Outbound", value: "OUTBOUND" },
];

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Queued", value: "QUEUED" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Sent", value: "SENT" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Opened", value: "OPENED" },
  { label: "Bounced", value: "BOUNCED" },
  { label: "Failed", value: "FAILED" },
];

// ── Component ─────────────────────────────────────────────

export function EmailList() {
  const router = useRouter();

  // ── Filter state ──
  const [direction, setDirection] = useState<EmailDirection | "">("");
  const [status, setStatus] = useState<EmailStatus | "">("");
  const [accountId, setAccountId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  // ── Build filters ──
  const filters = useMemo<EmailFilters>(() => {
    const f: EmailFilters = { page, limit };
    if (direction) f.direction = direction;
    if (status) f.status = status;
    if (accountId) f.accountId = accountId;
    if (search.trim()) f.search = search.trim();
    return f;
  }, [direction, status, accountId, search, page]);

  // ── Data hooks ──
  const { data: emailsData, isLoading } = useEmails(filters);
  const { data: accountsData } = useEmailAccounts();
  const toggleStarMutation = useToggleStar();

  // ── Derived data ──
  const emails = useMemo<Email[]>(() => {
    const raw = emailsData?.data;
    if (Array.isArray(raw)) return raw;
    const nested = raw as unknown as { data?: Email[] };
    return nested?.data ?? [];
  }, [emailsData]);

  const totalCount = useMemo(() => {
    const raw = emailsData?.data;
    const nested = raw as unknown as { meta?: { total?: number } };
    return nested?.meta?.total ?? emails.length;
  }, [emailsData, emails.length]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const accounts = useMemo(() => {
    const raw = accountsData?.data;
    return Array.isArray(raw) ? raw : [];
  }, [accountsData]);

  const accountOptions = useMemo(
    () => [
      { label: "All Accounts", value: "" },
      ...accounts.map((a) => ({
        label: a.displayName ?? a.emailAddress,
        value: a.id,
      })),
    ],
    [accounts],
  );

  // ── Handlers ──
  const handleSelect = useCallback(
    (id: string) => {
      router.push(`/email/${id}`);
    },
    [router],
  );

  const handleToggleStar = useCallback(
    (id: string) => {
      toggleStarMutation.mutate(id);
    },
    [toggleStarMutation],
  );

  // ── Render ──
  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="mail" size={24} color="#6366f1" />
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1e293b" }}>Email</h1>
          <Badge variant="secondary">{totalCount}</Badge>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" onClick={() => router.push("/email/analytics")}>
            <Icon name="bar-chart-2" size={16} />
            Analytics
          </Button>
          <Button variant="primary" onClick={() => router.push("/email/compose")}>
            <Icon name="plus" size={16} />
            Compose
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "1 1 200px", maxWidth: 280 }}>
          <Input
            label="Search"
            leftIcon={<Icon name="search" size={16} />}
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search emails..."
          />
        </div>
        <div style={{ width: 160 }}>
          <SelectInput
            label="Direction"
            leftIcon={<Icon name="arrow-right-left" size={16} />}
            options={DIRECTION_OPTIONS}
            value={direction}
            onChange={(v) => {
              setDirection(v as EmailDirection | "");
              setPage(1);
            }}
          />
        </div>
        <div style={{ width: 160 }}>
          <SelectInput
            label="Status"
            leftIcon={<Icon name="circle" size={16} />}
            options={STATUS_OPTIONS}
            value={status}
            onChange={(v) => {
              setStatus(v as EmailStatus | "");
              setPage(1);
            }}
          />
        </div>
        <div style={{ width: 200 }}>
          <SelectInput
            label="Account"
            leftIcon={<Icon name="at-sign" size={16} />}
            options={accountOptions}
            value={accountId}
            onChange={(v) => {
              setAccountId(v as string);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Email List */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
            <LoadingSpinner />
          </div>
        ) : emails.length === 0 ? (
          <div style={{ padding: 48 }}>
            <EmptyState
              icon="mail"
              title="No emails found"
              description="Try adjusting your filters or compose a new email."
              action={{
                label: "Compose Email",
                onClick: () => router.push("/email/compose"),
              }}
            />
          </div>
        ) : (
          <>
            {emails.map((email) => (
              <EmailItem
                key={email.id}
                email={email}
                onSelect={handleSelect}
                onToggleStar={handleToggleStar}
              />
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 16,
          }}
        >
          <Button
            variant="ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <Icon name="chevron-left" size={16} />
            Previous
          </Button>
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <Icon name="chevron-right" size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
