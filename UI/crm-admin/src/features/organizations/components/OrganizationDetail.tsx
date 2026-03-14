"use client";

import { useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Button, Icon, Badge } from "@/components/ui";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useConfirmDialog } from "@/components/common/useConfirmDialog";
import { formatDate } from "@/lib/format-date";

import { VerifyButton } from "@/features/entity-verification";

import {
  useOrganizationDetail,
  useDeactivateOrganization,
  useReactivateOrganization,
} from "../hooks/useOrganizations";

// ── Props ────────────────────────────────────────────────

interface OrganizationDetailProps {
  organizationId: string;
}

// ── Component ────────────────────────────────────────────

export function OrganizationDetail({ organizationId }: OrganizationDetailProps) {
  const router = useRouter();
  const { confirm, ConfirmDialogPortal } = useConfirmDialog();

  const { data, isLoading } = useOrganizationDetail(organizationId);
  const deactivateMutation = useDeactivateOrganization();
  const reactivateMutation = useReactivateOrganization();

  const organization = data?.data;

  const handleDeactivate = useCallback(async () => {
    if (!organization) return;
    const ok = await confirm({
      title: "Deactivate Organization",
      message: `Are you sure you want to deactivate ${organization.name}?`,
      type: "warning",
      confirmText: "Deactivate",
    });
    if (!ok) return;
    try {
      await deactivateMutation.mutateAsync(organizationId);
      toast.success("Organization deactivated");
    } catch {
      toast.error("Failed to deactivate organization");
    }
  }, [organization, confirm, deactivateMutation, organizationId]);

  const handleReactivate = useCallback(async () => {
    try {
      await reactivateMutation.mutateAsync(organizationId);
      toast.success("Organization reactivated");
    } catch {
      toast.error("Failed to reactivate organization");
    }
  }, [reactivateMutation, organizationId]);

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!organization) {
    return (
      <div className="p-6">
        <EmptyState
          icon="building"
          title="Organization not found"
          description="The organization you're looking for doesn't exist."
          action={{
            label: "Back to Organizations",
            onClick: () => router.push("/organizations"),
          }}
        />
      </div>
    );
  }

  const address = [
    organization.address,
    organization.city,
    organization.state,
    organization.country,
    organization.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="p-6">
      <PageHeader
        title={organization.name}
        actions={
          <div className="flex gap-2 items-center">
            <VerifyButton
              entityType="ORGANIZATION"
              entityId={organizationId}
              entityName={organization.name}
              entityEmail={organization.email}
              entityPhone={organization.phone}
              initialStatus={organization.entityVerificationStatus ?? "UNVERIFIED"}
            />
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
            <Link href={`/organizations/${organizationId}/edit`}>
              <Button variant="outline">
                <Icon name="edit" size={16} /> Edit
              </Button>
            </Link>
            {organization.isActive ? (
              <Button variant="outline" onClick={handleDeactivate}>
                <Icon name="archive" size={16} /> Deactivate
              </Button>
            ) : (
              <Button variant="primary" onClick={handleReactivate}>
                <Icon name="refresh-cw" size={16} /> Reactivate
              </Button>
            )}
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company details */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Company Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Industry</dt>
                <dd className="text-sm">{organization.industry ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">GST Number</dt>
                <dd className="text-sm">{organization.gstNumber ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Annual Revenue</dt>
                <dd className="text-sm">
                  {organization.annualRevenue != null
                    ? `₹ ${organization.annualRevenue.toLocaleString("en-IN")}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Status</dt>
                <dd>
                  <StatusBadge
                    status={organization.isActive ? "active" : "inactive"}
                  />
                </dd>
              </div>
            </dl>
          </div>

          {/* Contact info */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Contact Information
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Website</dt>
                <dd className="text-sm">{organization.website ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Email</dt>
                <dd className="text-sm">{organization.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Phone</dt>
                <dd className="text-sm">{organization.phone ?? "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Address */}
          {address && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Address
              </h3>
              <p className="text-sm">{address}</p>
            </div>
          )}

          {/* Notes */}
          {organization.notes && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Notes
              </h3>
              <p className="whitespace-pre-wrap text-sm text-gray-600">
                {organization.notes}
              </p>
            </div>
          )}

          {/* Contacts */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Contacts
            </h3>
            {organization.contacts && organization.contacts.length > 0 ? (
              <div className="space-y-2">
                {organization.contacts.map((co) => (
                  <div
                    key={co.id}
                    className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {co.contact.firstName} {co.contact.lastName}
                      </p>
                      {co.designation && (
                        <p className="text-xs text-gray-500">
                          {co.designation}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {co.relationType.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No contacts linked.</p>
            )}
          </div>

          {/* Leads */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Recent Leads
            </h3>
            {organization.leads && organization.leads.length > 0 ? (
              <div className="space-y-2">
                {organization.leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{lead.leadNumber}</p>
                      <p className="text-xs text-gray-500">{lead.status}</p>
                    </div>
                    <Badge variant="secondary">{lead.priority}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No leads found.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity counts */}
          {organization._count && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Contacts</span>
                  <span className="font-medium">
                    {organization._count.contacts}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Leads</span>
                  <span className="font-medium">
                    {organization._count.leads}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Filters / Tags */}
          {organization.filters && organization.filters.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {organization.filters.map((f) => (
                  <Badge key={f.id} variant="outline">
                    {f.lookupValue.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Details
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Created</dt>
                <dd>{formatDate(organization.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated</dt>
                <dd>{formatDate(organization.updatedAt)}</dd>
              </div>
              {organization.createdBy && (
                <div>
                  <dt className="text-xs text-gray-400">Created by</dt>
                  <dd>
                    {organization.createdBy.firstName}{" "}
                    {organization.createdBy.lastName}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      <ConfirmDialogPortal />
    </div>
  );
}
