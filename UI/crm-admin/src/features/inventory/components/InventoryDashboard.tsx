"use client";

import { Icon, Card, Badge } from "@/components/ui";
import { useInventoryDashboard } from "../hooks/useInventory";

function KPICard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <Card>
      <div className="p-4">
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 48, height: 48, borderRadius: 10,
              background: `${color}15`, color,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon name={icon as any} size={24} />
          </div>
          <div>
            <p className="text-muted mb-0" style={{ fontSize: 12 }}>{label}</p>
            <h4 className="mb-0" style={{ fontWeight: 700 }}>{value}</h4>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function InventoryDashboard() {
  const { data, isLoading } = useInventoryDashboard();
  const dashboard = data?.data;

  if (isLoading) {
    return (
      <div className="p-6 text-center text-muted">
        <Icon name="loader" size={24} /> Loading dashboard...
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
  };

  return (
    <div className="p-6">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Icon name="warehouse" size={22} />
        <h4 className="mb-0" style={{ fontWeight: 600 }}>Inventory Dashboard</h4>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <KPICard
          icon="package"
          label="Total Stock"
          value={dashboard?.totalStock?.toLocaleString() ?? 0}
          color="#321fdb"
        />
        <KPICard
          icon="indian-rupee"
          label="Stock Value"
          value={formatCurrency(dashboard?.stockValue ?? 0)}
          color="#2eb85c"
        />
        <KPICard
          icon="clock"
          label="Expiring Soon"
          value={dashboard?.expiringSoon ?? 0}
          color="#f9b115"
        />
        <KPICard
          icon="alert-triangle"
          label="Low Stock Alerts"
          value={dashboard?.lowStockAlerts ?? 0}
          color="#e55353"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Card>
          <div className="p-4">
            <h6 style={{ fontWeight: 600 }}>
              <Icon name="hash" size={16} /> Serial Numbers
            </h6>
            <p className="text-muted mb-0">
              {dashboard?.totalSerials?.toLocaleString() ?? 0} total serials tracked
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h6 style={{ fontWeight: 600 }}>
              <Icon name="package" size={16} /> Products
            </h6>
            <p className="text-muted mb-0">
              {dashboard?.totalProducts ?? 0} products in inventory
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h6 style={{ fontWeight: 600 }}>
              <Icon name="activity" size={16} /> Quick Actions
            </h6>
            <div className="d-flex gap-2 mt-2">
              <Badge variant="primary">Stock In</Badge>
              <Badge variant="warning">Transfer</Badge>
              <Badge variant="danger">Adjustment</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
