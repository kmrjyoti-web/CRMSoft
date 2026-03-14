"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, Badge, Button, Card, SelectInput } from "@/components/ui";
import { useSerialDetail, useChangeSerialStatus } from "../hooks/useInventory";

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "SOLD", label: "Sold" },
  { value: "RESERVED", label: "Reserved" },
  { value: "ACTIVATED", label: "Activated" },
  { value: "DEACTIVATED", label: "Deactivated" },
  { value: "DAMAGED", label: "Damaged" },
  { value: "RETURNED", label: "Returned" },
  { value: "EXPIRED", label: "Expired" },
];

function getStatusVariant(status: string): "primary" | "success" | "warning" | "secondary" | "danger" {
  const map: Record<string, any> = {
    AVAILABLE: "success", SOLD: "primary", RESERVED: "warning",
    EXPIRED: "danger", DAMAGED: "danger", RETURNED: "secondary",
    ACTIVATED: "success", DEACTIVATED: "secondary",
  };
  return map[status] ?? "secondary";
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid #eee" }}>
      <span className="text-muted" style={{ fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value ?? "—"}</span>
    </div>
  );
}

export function SerialDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading } = useSerialDetail(id);
  const changeStatus = useChangeSerialStatus();
  const [newStatus, setNewStatus] = useState("");

  const serial = data?.data;

  if (isLoading) {
    return (
      <div className="p-6 text-center text-muted">
        <Icon name="loader" size={24} /> Loading...
      </div>
    );
  }

  if (!serial) {
    return (
      <div className="p-6 text-center text-muted">
        <Icon name="alert-circle" size={40} />
        <p className="mt-3">Serial not found</p>
      </div>
    );
  }

  function handleStatusChange() {
    if (!newStatus) return;
    changeStatus.mutate({ id, status: newStatus });
    setNewStatus("");
  }

  return (
    <div className="p-6">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <Icon name="arrow-left" size={18} />
        </Button>
        <h4 className="mb-0" style={{ fontWeight: 600 }}>
          Serial: {serial.serialNo}
        </h4>
        <Badge variant={getStatusVariant(serial.status)}>{serial.status}</Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div>
          <Card>
            <div className="p-4">
              <h6 style={{ fontWeight: 600 }} className="mb-3">Details</h6>
              <InfoRow label="Serial No" value={serial.serialNo} />
              <InfoRow label="Code 1" value={serial.code1} />
              <InfoRow label="Code 2" value={serial.code2} />
              <InfoRow label="Batch No" value={serial.batchNo} />
              <InfoRow label="HSN Code" value={serial.hsnCode} />
              <InfoRow label="Product ID" value={serial.productId} />
              <InfoRow label="Location" value={serial.locationId} />
            </div>
          </Card>

          <Card className="mt-3">
            <div className="p-4">
              <h6 style={{ fontWeight: 600 }} className="mb-3">Pricing</h6>
              <InfoRow label="MRP" value={serial.mrp ? `₹${Number(serial.mrp).toFixed(2)}` : null} />
              <InfoRow label="Purchase Rate" value={serial.purchaseRate ? `₹${Number(serial.purchaseRate).toFixed(2)}` : null} />
              <InfoRow label="Sale Rate" value={serial.saleRate ? `₹${Number(serial.saleRate).toFixed(2)}` : null} />
              <InfoRow label="Cost Price" value={serial.costPrice ? `₹${Number(serial.costPrice).toFixed(2)}` : null} />
            </div>
          </Card>

          <Card className="mt-3">
            <div className="p-4">
              <h6 style={{ fontWeight: 600 }} className="mb-3">Dates</h6>
              <InfoRow label="Created" value={new Date(serial.createDate).toLocaleString()} />
              <InfoRow label="Activation Date" value={serial.activationDate ? new Date(serial.activationDate).toLocaleString() : null} />
              <InfoRow label="Sold Date" value={serial.soldDate ? new Date(serial.soldDate).toLocaleString() : null} />
              <InfoRow
                label="Expiry"
                value={
                  serial.expiryDate
                    ? new Date(serial.expiryDate).toLocaleDateString()
                    : serial.expiryType === "NEVER"
                    ? "Never"
                    : serial.expiryValue
                    ? `${serial.expiryValue} ${serial.expiryType.toLowerCase()}`
                    : null
                }
              />
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="p-4">
              <h6 style={{ fontWeight: 600 }} className="mb-3">Change Status</h6>
              <SelectInput
                label="New Status"
                value={newStatus}
                options={STATUS_OPTIONS.filter((o) => o.value !== serial.status)}
                onChange={(v) => setNewStatus(String(v ?? ""))}
              />
              <Button
                variant="primary"
                size="sm"
                className="mt-3 w-100"
                onClick={handleStatusChange}
                disabled={!newStatus || changeStatus.isPending}
              >
                {changeStatus.isPending ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </Card>

          {serial.customerId && (
            <Card className="mt-3">
              <div className="p-4">
                <h6 style={{ fontWeight: 600 }} className="mb-3">Customer</h6>
                <InfoRow label="Customer ID" value={serial.customerId} />
                <InfoRow label="Invoice ID" value={serial.invoiceId} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
