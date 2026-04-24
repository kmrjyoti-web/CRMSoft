import { render, screen } from "@testing-library/react";

import { usePermissionStore } from "@/stores/permission.store";

import { FeatureGate } from "../FeatureGate";

// ── Setup ────────────────────────────────────────────────

beforeEach(() => {
  usePermissionStore.getState().reset();
});

// ── Tests ────────────────────────────────────────────────

describe("FeatureGate", () => {
  it("renders children when feature is enabled", () => {
    usePermissionStore.getState().setFeatures(["WHATSAPP_INTEGRATION"]);

    render(
      <FeatureGate feature="WHATSAPP_INTEGRATION">
        <span>WhatsApp Widget</span>
      </FeatureGate>,
    );

    expect(screen.getByText("WhatsApp Widget")).toBeInTheDocument();
  });

  it("hides children when feature is disabled", () => {
    usePermissionStore.getState().setFeatures([]);

    render(
      <FeatureGate feature="WHATSAPP_INTEGRATION">
        <span>WhatsApp Widget</span>
      </FeatureGate>,
    );

    expect(screen.queryByText("WhatsApp Widget")).not.toBeInTheDocument();
  });

  it("renders fallback when feature is disabled", () => {
    usePermissionStore.getState().setFeatures([]);

    render(
      <FeatureGate feature="BULK_IMPORT" fallback={<span>Upgrade Required</span>}>
        <span>Import Tool</span>
      </FeatureGate>,
    );

    expect(screen.queryByText("Import Tool")).not.toBeInTheDocument();
    expect(screen.getByText("Upgrade Required")).toBeInTheDocument();
  });
});
