"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, Badge, Button, Card, Input } from "@/components/ui";
import { useSerialTrackingReport } from "../hooks/useInventory";
import type { SerialTrackingItem } from "../types/inventory.types";

function getStatusVariant(status: string): "primary" | "success" | "warning" | "secondary" | "danger" {
  const map: Record<string, any> = {
    AVAILABLE: "success", SOLD: "primary", RESERVED: "warning",
    EXPIRED: "danger", DAMAGED: "danger", RETURNED: "secondary",
    ACTIVATED: "success", DEACTIVATED: "secondary",
  };
  return map[status] ?? "secondary";
}

export function SerialTrackingReport() {
  const router = useRouter();
  const [serialNo, setSerialNo] = useState("");

  const params: Record<string, any> = {};
  if (serialNo) params.serialNo = serialNo;

  const { data, isLoading } = useSerialTrackingReport(Object.keys(params).length > 0 ? params : undefined);
  const items: SerialTrackingItem[] = (data?.data ?? []) as SerialTrackingItem[];

  return (
    <div className="p-6">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Button variant="ghost" onClick={() => router.push("/inventory/reports")}>
          <Icon name="arrow-left" size={18} />
        </Button>
        <h4 className="mb-0" style={{ fontWeight: 600 }}>Serial Tracking</h4>
      </div>

      <div className="d-flex gap-3 mb-4">
        <div style={{ width: 300 }}>
          <Input
            label="Search Serial No"
            value={serialNo}
            onChange={setSerialNo}
            leftIcon={<Icon name="search" size={16} />}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5 text-muted"><Icon name="loader" size={24} /> Loading...</div>
      ) : items.length === 0 ? (
        <Card>
          <div className="text-center py-5 text-muted">
            <Icon name="hash" size={40} />
            <p className="mt-3 mb-0">Enter a serial number to track its lifecycle.</p>
          </div>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0" style={{ fontWeight: 600 }}>{item.serialNo}</h6>
                    <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                  </div>
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    Created: {new Date(item.createDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="d-flex gap-4 mb-3" style={{ fontSize: 12 }}>
                  {item.code1 && <span><strong>Code 1:</strong> {item.code1}</span>}
                  {item.code2 && <span><strong>Code 2:</strong> {item.code2}</span>}
                  {item.expiryDate && <span><strong>Expiry:</strong> {new Date(item.expiryDate).toLocaleDateString()}</span>}
                </div>

                {item.lifecycle.length > 0 && (
                  <div>
                    <p className="text-muted mb-2" style={{ fontSize: 12, fontWeight: 600 }}>LIFECYCLE</p>
                    <div style={{ borderLeft: "2px solid #d8dbe0", paddingLeft: 16 }}>
                      {item.lifecycle.map((txn, i) => (
                        <div key={txn.id} className="mb-2" style={{ fontSize: 12, position: "relative" }}>
                          <div
                            style={{
                              position: "absolute", left: -22, top: 4,
                              width: 10, height: 10, borderRadius: "50%",
                              background: txn.quantity > 0 ? "#2eb85c" : "#e55353",
                            }}
                          />
                          <span className="text-muted">{new Date(txn.transactionDate).toLocaleDateString()}</span>
                          {" — "}
                          <Badge variant="secondary">{txn.transactionType.replace("_", " ")}</Badge>
                          {" "}
                          <span style={{ fontWeight: 600, color: txn.quantity > 0 ? "#2eb85c" : "#e55353" }}>
                            {txn.quantity > 0 ? `+${txn.quantity}` : txn.quantity}
                          </span>
                          {txn.remarks && <span className="text-muted"> — {txn.remarks}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
