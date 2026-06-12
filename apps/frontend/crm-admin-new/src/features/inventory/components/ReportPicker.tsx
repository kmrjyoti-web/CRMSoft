"use client";

import { useRouter } from "next/navigation";
import { Icon, Card } from "@/components/ui";

const REPORTS = [
  { title: "Stock Ledger", desc: "View running balance and all stock movements", icon: "clipboard-list", path: "/inventory/reports/ledger" },
  { title: "Expiry Report", desc: "Items expiring in 30/60/90 days", icon: "clock", path: "/inventory/reports/expiry" },
  { title: "Stock Valuation", desc: "Total inventory value by product", icon: "indian-rupee", path: "/inventory/reports/valuation" },
  { title: "Serial Tracking", desc: "Full lifecycle of serial numbers", icon: "hash", path: "/inventory/reports/serial-tracking" },
];

export function ReportPicker() {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Icon name="clipboard-list" size={22} />
        <h4 className="mb-0" style={{ fontWeight: 600 }}>Inventory Reports</h4>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {REPORTS.map((r) => (
          <Card
            key={r.path}
            style={{ cursor: "pointer", transition: "box-shadow 0.2s" }}
            onClick={() => router.push(r.path)}
          >
            <div className="p-4 d-flex align-items-center gap-3">
              <div
                style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: "#321fdb15", color: "#321fdb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Icon name={r.icon as any} size={24} />
              </div>
              <div>
                <h6 className="mb-1" style={{ fontWeight: 600 }}>{r.title}</h6>
                <p className="text-muted mb-0" style={{ fontSize: 13 }}>{r.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
