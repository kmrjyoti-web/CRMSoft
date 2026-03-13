"use client";

import { useRouter } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useServiceVisit } from "../hooks/useAmcWarranty";
import type { ServiceCharge, VisitStatus } from "../types/amc-warranty.types";

const STATUS_COLOR_MAP: Record<string, string> = {
  scheduled: "primary",
  in_progress: "warning",
  completed: "success",
  cancelled: "danger",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      ))}
      <span className="ml-1 text-gray-500">({rating}/5)</span>
    </span>
  );
}

interface Props {
  visitId: string;
}

export function ServiceVisitDetail({ visitId }: Props) {
  const router = useRouter();
  const { data, isLoading } = useServiceVisit(visitId);

  const visit = data?.data;

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!visit) {
    return (
      <div className="p-6 text-center py-12">
        <p className="text-sm text-gray-500">Service visit not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/post-sales/service-visits")}
          className="mt-4"
        >
          Back to Service Visits
        </Button>
      </div>
    );
  }

  const charges: ServiceCharge[] = visit.charges ?? [];
  const chargesTotal = charges.reduce((sum, c) => sum + c.totalAmount, 0);

  return (
    <div className="p-6">
      <PageHeader
        title={`Visit ${visit.visitNumber}`}
        subtitle={`${visit.visitType} — ${visit.customerName ?? ""}`}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-sm text-gray-500">Status:</span>
        <StatusBadge status={visit.status} colorMap={STATUS_COLOR_MAP} />
        <Badge variant={visit.isBillable ? "warning" : "outline"}>
          {visit.isBillable ? "Billable" : "Free"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Visit Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Visit Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Visit Number</dt>
                <dd className="text-sm font-medium">{visit.visitNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Visit Type</dt>
                <dd className="text-sm">{visit.visitType}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Source Type</dt>
                <dd className="text-sm">
                  {visit.sourceType.replace(/_/g, " ")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Visit Date</dt>
                <dd className="text-sm">
                  {new Date(visit.visitDate).toLocaleDateString("en-IN")}
                </dd>
              </div>
              {visit.startTime && (
                <div>
                  <dt className="text-xs text-gray-400">Start Time</dt>
                  <dd className="text-sm">{visit.startTime}</dd>
                </div>
              )}
              {visit.endTime && (
                <div>
                  <dt className="text-xs text-gray-400">End Time</dt>
                  <dd className="text-sm">{visit.endTime}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-400">Customer</dt>
                <dd className="text-sm">{visit.customerName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Technician</dt>
                <dd className="text-sm">{visit.technicianName ?? "—"}</dd>
              </div>
              {visit.issueReported && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-400">Issue Reported</dt>
                  <dd className="text-sm">{visit.issueReported}</dd>
                </div>
              )}
              {visit.workDone && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-400">Work Done</dt>
                  <dd className="text-sm whitespace-pre-wrap">
                    {visit.workDone}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Charges Table */}
          {charges.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Charges
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 text-xs text-gray-400 font-medium">
                      Description
                    </th>
                    <th className="pb-2 text-xs text-gray-400 font-medium">
                      Type
                    </th>
                    <th className="pb-2 text-xs text-gray-400 font-medium text-right">
                      Qty
                    </th>
                    <th className="pb-2 text-xs text-gray-400 font-medium text-right">
                      Unit Price
                    </th>
                    <th className="pb-2 text-xs text-gray-400 font-medium text-right">
                      Total
                    </th>
                    <th className="pb-2 text-xs text-gray-400 font-medium">
                      Coverage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {charges.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-2">{c.description}</td>
                      <td className="py-2">{c.chargeType}</td>
                      <td className="py-2 text-right">{c.quantity}</td>
                      <td className="py-2 text-right">
                        ₹{Number(c.unitPrice).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 text-right font-medium">
                        ₹{Number(c.totalAmount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2">
                        {c.isCoveredByWarranty ? (
                          <Badge variant="success">Warranty</Badge>
                        ) : c.isCoveredByAMC ? (
                          <Badge variant="primary">AMC</Badge>
                        ) : (
                          <Badge variant="outline">Paid</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td
                      colSpan={4}
                      className="pt-2 text-sm font-semibold text-right"
                    >
                      Total:
                    </td>
                    <td className="pt-2 text-right font-bold">
                      ₹{Number(chargesTotal).toLocaleString("en-IN")}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Feedback */}
          {(visit.customerFeedback || visit.rating) && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Customer Feedback
              </h3>
              {visit.rating && <StarRating rating={visit.rating} />}
              {visit.customerFeedback && (
                <p className="mt-2 text-sm text-gray-700">
                  {visit.customerFeedback}
                </p>
              )}
            </div>
          )}

          {/* Photos */}
          {visit.photos && visit.photos.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Photos ({visit.photos.length})
              </h3>
              <ul className="space-y-1">
                {visit.photos.map((photo, idx) => (
                  <li key={idx} className="text-sm text-blue-600 underline">
                    {photo}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Charge Summary
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Billable</dt>
                <dd>
                  <Badge variant={visit.isBillable ? "warning" : "outline"}>
                    {visit.isBillable ? "Yes" : "No"}
                  </Badge>
                </dd>
              </div>
              {visit.chargeAmount !== undefined &&
                visit.chargeAmount !== null && (
                  <div>
                    <dt className="text-xs text-gray-400">Charge Amount</dt>
                    <dd className="font-medium">
                      ₹
                      {Number(visit.chargeAmount).toLocaleString("en-IN")}
                    </dd>
                  </div>
                )}
            </dl>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Metadata
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Created</dt>
                <dd>
                  {new Date(visit.createdAt).toLocaleDateString("en-IN")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated</dt>
                <dd>
                  {new Date(visit.updatedAt).toLocaleDateString("en-IN")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
