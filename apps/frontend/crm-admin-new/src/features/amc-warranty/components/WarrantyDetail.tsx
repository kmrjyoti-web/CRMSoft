"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button, Badge, Modal, Input, TableFull, TextareaInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  useWarrantyRecord,
  useExtendWarranty,
  useCreateWarrantyClaim,
} from "../hooks/useAmcWarranty";
import type { WarrantyStatus, WarrantyClaim } from "../types/amc-warranty.types";

const STATUS_COLOR_MAP: Record<string, string> = {
  active: "success",
  expired: "danger",
  extended: "warning",
  claimed: "secondary",
  voided: "outline",
};

const CLAIM_STATUS_VARIANT: Record<string, string> = {
  OPEN: "warning",
  ASSIGNED: "primary",
  IN_PROGRESS: "secondary",
  RESOLVED: "success",
  CLOSED: "default",
  REJECTED: "danger",
};

const CLAIM_COLUMNS = [
  { id: "claimNumber", label: "Claim No", visible: true },
  { id: "issueDescription", label: "Issue", visible: true },
  { id: "claimStatus", label: "Status", visible: true },
  { id: "assignedToName", label: "Assigned To", visible: true },
  { id: "createdAt", label: "Created", visible: true },
];

interface Props {
  warrantyId: string;
}

export function WarrantyDetail({ warrantyId }: Props) {
  const router = useRouter();
  const { data, isLoading } = useWarrantyRecord(warrantyId);
  const extendWarranty = useExtendWarranty();
  const createClaim = useCreateWarrantyClaim();

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [extendMonths, setExtendMonths] = useState("");
  const [claimDescription, setClaimDescription] = useState("");

  const warranty = data?.data;

  const handleExtend = useCallback(async () => {
    if (!extendMonths.trim()) {
      toast.error("Please enter extension duration");
      return;
    }
    try {
      await extendWarranty.mutateAsync({
        id: warrantyId,
        dto: { months: Number(extendMonths) },
      });
      toast.success("Warranty extended successfully");
      setShowExtendModal(false);
      setExtendMonths("");
    } catch {
      toast.error("Failed to extend warranty");
    }
  }, [warrantyId, extendMonths, extendWarranty]);

  const handleCreateClaim = useCallback(async () => {
    if (!claimDescription.trim()) {
      toast.error("Please enter issue description");
      return;
    }
    try {
      await createClaim.mutateAsync({
        warrantyRecordId: warrantyId,
        issueDescription: claimDescription,
      });
      toast.success("Claim created successfully");
      setShowClaimModal(false);
      setClaimDescription("");
    } catch {
      toast.error("Failed to create claim");
    }
  }, [warrantyId, claimDescription, createClaim]);

  const claimsTableData = useMemo(() => {
    const claims: WarrantyClaim[] = warranty?.claims ?? [];
    return claims.map((c) => ({
      id: c.id,
      claimNumber: c.claimNumber,
      issueDescription:
        c.issueDescription.length > 60
          ? `${c.issueDescription.slice(0, 60)}...`
          : c.issueDescription,
      claimStatus: (
        <Badge variant={(CLAIM_STATUS_VARIANT[c.status] as any) ?? "default"}>
          {c.status}
        </Badge>
      ),
      assignedToName: c.assignedToName ?? "—",
      createdAt: new Date(c.createdAt).toLocaleDateString("en-IN"),
    }));
  }, [warranty]);

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!warranty) {
    return (
      <div className="p-6 text-center py-12">
        <p className="text-sm text-gray-500">Warranty not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/post-sales/warranty")}
          className="mt-4"
        >
          Back to Warranties
        </Button>
      </div>
    );
  }

  const tmpl = warranty.template;

  return (
    <div className="p-6">
      <PageHeader
        title={`Warranty ${warranty.warrantyNumber}`}
        subtitle={warranty.productName ?? ""}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
            {warranty.status === "ACTIVE" && tmpl?.extensionAvailable && (
              <Button
                variant="outline"
                onClick={() => setShowExtendModal(true)}
              >
                Extend Warranty
              </Button>
            )}
            {warranty.status === "ACTIVE" && (
              <Button
                variant="primary"
                onClick={() => setShowClaimModal(true)}
              >
                Create Claim
              </Button>
            )}
          </div>
        }
      />

      {/* Status bar */}
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-sm text-gray-500">Status:</span>
        <StatusBadge
          status={warranty.status}
          colorMap={STATUS_COLOR_MAP}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Warranty Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Warranty Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Warranty Number</dt>
                <dd className="text-sm font-medium">{warranty.warrantyNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Customer</dt>
                <dd className="text-sm">{warranty.customerName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Product</dt>
                <dd className="text-sm">{warranty.productName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Claims Used</dt>
                <dd className="text-sm">{warranty.claimsUsed}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Start Date</dt>
                <dd className="text-sm">
                  {new Date(warranty.startDate).toLocaleDateString("en-IN")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">End Date</dt>
                <dd className="text-sm">
                  {new Date(warranty.endDate).toLocaleDateString("en-IN")}
                </dd>
              </div>
              {warranty.extendedUntil && (
                <div>
                  <dt className="text-xs text-gray-400">Extended Until</dt>
                  <dd className="text-sm">
                    {new Date(warranty.extendedUntil).toLocaleDateString(
                      "en-IN",
                    )}
                  </dd>
                </div>
              )}
              {warranty.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-400">Notes</dt>
                  <dd className="text-sm">{warranty.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Template Info */}
          {tmpl && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Template: {tmpl.name}
              </h3>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-gray-400">Coverage Type</dt>
                  <dd className="text-sm">{tmpl.coverageType}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Duration</dt>
                  <dd className="text-sm">
                    {tmpl.durationValue}{" "}
                    {tmpl.durationType.toLowerCase()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Labor Charge</dt>
                  <dd className="text-sm">{tmpl.laborChargeType}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Parts Charge</dt>
                  <dd className="text-sm">{tmpl.partsChargeType}</dd>
                </div>
                {tmpl.responseTimeSlaHours && (
                  <div>
                    <dt className="text-xs text-gray-400">
                      Response SLA
                    </dt>
                    <dd className="text-sm">
                      {tmpl.responseTimeSlaHours} hours
                    </dd>
                  </div>
                )}
                {tmpl.resolutionSlaDays && (
                  <div>
                    <dt className="text-xs text-gray-400">
                      Resolution SLA
                    </dt>
                    <dd className="text-sm">
                      {tmpl.resolutionSlaDays} days
                    </dd>
                  </div>
                )}
              </dl>

              {tmpl.inclusions.length > 0 && (
                <div className="mt-4">
                  <dt className="text-xs text-gray-400 mb-2">Inclusions</dt>
                  <div className="flex flex-wrap gap-1">
                    {tmpl.inclusions.map((item: string) => (
                      <Badge key={item} variant="success">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {tmpl.exclusions.length > 0 && (
                <div className="mt-4">
                  <dt className="text-xs text-gray-400 mb-2">Exclusions</dt>
                  <div className="flex flex-wrap gap-1">
                    {tmpl.exclusions.map((item: string) => (
                      <Badge key={item} variant="danger">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Claims Table */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Claims ({warranty._count?.claims ?? warranty.claims?.length ?? 0})
            </h3>
            <TableFull
              data={claimsTableData as Record<string, unknown>[]}
              title=""
              columns={CLAIM_COLUMNS}
              defaultViewMode="table"
              defaultDensity="compact"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Status
            </h3>
            <StatusBadge
              status={warranty.status}
              colorMap={STATUS_COLOR_MAP}
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Metadata
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Created</dt>
                <dd>
                  {new Date(warranty.createdAt).toLocaleDateString("en-IN")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated</dt>
                <dd>
                  {new Date(warranty.updatedAt).toLocaleDateString("en-IN")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Extend Modal */}
      <Modal
        open={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        title="Extend Warranty"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowExtendModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExtend}
              loading={extendWarranty.isPending}
            >
              Extend
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Extension Duration (months) *
          </label>
          <Input
            label="Months"
            value={extendMonths}
            onChange={(v: string) => setExtendMonths(v)}
          />
        </div>
      </Modal>

      {/* Create Claim Modal */}
      <Modal
        open={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        title="Create Warranty Claim"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowClaimModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateClaim}
              loading={createClaim.isPending}
            >
              Create Claim
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <TextareaInput
            label="Issue Description *"
            value={claimDescription}
            onChange={(e) => setClaimDescription(e.target.value)}
            rows={4}
          />
        </div>
      </Modal>
    </div>
  );
}
