"use client";

export function PricingUserHelp() {
  return (
    <div style={{ fontSize: 14, lineHeight: 1.7, color: "#374151" }}>
      <h3 style={{ marginTop: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Product Pricing — How It Works</h3>

      <section style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>💰 Price Types</h4>
        <p style={{ margin: 0 }}>Each product can have multiple price types:</p>
        <ul style={{ paddingLeft: 18, margin: "8px 0 0" }}>
          <li><strong>BASE</strong> — Your cost / base reference price</li>
          <li><strong>MRP</strong> — Maximum Retail Price (printed on product)</li>
          <li><strong>SELLING</strong> — Default price charged to customers</li>
          <li><strong>WHOLESALE</strong> — For bulk / wholesale buyers</li>
          <li><strong>DISTRIBUTOR</strong> — For your distribution channel</li>
          <li><strong>SPECIAL</strong> — Promotional or custom pricing</li>
        </ul>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>📊 Slab Pricing (Price Tiers)</h4>
        <p style={{ margin: 0 }}>
          Set different prices for different quantity ranges. Example:
        </p>
        <div style={{ background: "#f9fafb", borderRadius: 6, padding: "10px 12px", margin: "8px 0 0", fontSize: 13 }}>
          <div>Qty 1–9 → ₹100/unit</div>
          <div>Qty 10–49 → ₹90/unit</div>
          <div>Qty 50+ → ₹80/unit</div>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "#6b7280" }}>
          When a customer orders 15 units, the system automatically applies ₹90/unit.
        </p>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>👥 Group Prices</h4>
        <p style={{ margin: 0 }}>
          Assign special prices to specific customer price groups (e.g. "VIP Customers", "Gold Members"). When a customer from that group places an order, the group price automatically applies instead of the default selling price.
        </p>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>🧮 Price Calculator</h4>
        <p style={{ margin: 0 }}>
          Simulates the exact price a specific customer will pay. Enter:
        </p>
        <ul style={{ paddingLeft: 18, margin: "8px 0 0" }}>
          <li><strong>Quantity</strong> — triggers slab price lookup</li>
          <li><strong>Contact / Organization</strong> — applies group discount if linked</li>
          <li><strong>Inter-State</strong> — determines IGST vs CGST+SGST</li>
        </ul>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "#6b7280" }}>
          Priority: Group Price → Slab Price → SELLING price
        </p>
      </section>

      <section>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>✏️ How to Edit Prices</h4>
        <ol style={{ paddingLeft: 18, margin: 0 }}>
          <li>Find the product in the table below</li>
          <li>Click <strong>Edit Prices</strong> (pencil icon) on any row</li>
          <li>A drawer opens with 4 tabs — Base Prices, Slab Pricing, Group Prices, Calculator</li>
          <li>Update values and click <strong>Save</strong></li>
        </ol>
      </section>
    </div>
  );
}
