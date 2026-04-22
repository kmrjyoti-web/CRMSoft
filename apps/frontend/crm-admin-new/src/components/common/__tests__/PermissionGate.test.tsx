import { render, screen } from "@testing-library/react";

import { usePermissionStore } from "@/stores/permission.store";

import { PermissionGate } from "../PermissionGate";

// ── Setup ────────────────────────────────────────────────

beforeEach(() => {
  usePermissionStore.getState().reset();
});

// ── Tests ────────────────────────────────────────────────

describe("PermissionGate", () => {
  it("renders children when single permission is granted", () => {
    usePermissionStore.getState().setCodes(["leads.view"]);

    render(
      <PermissionGate code="leads.view">
        <span>Secret Content</span>
      </PermissionGate>,
    );

    expect(screen.getByText("Secret Content")).toBeInTheDocument();
  });

  it("hides children when permission is missing", () => {
    usePermissionStore.getState().setCodes(["leads.view"]);

    render(
      <PermissionGate code="leads.delete">
        <span>Secret Content</span>
      </PermissionGate>,
    );

    expect(screen.queryByText("Secret Content")).not.toBeInTheDocument();
  });

  it("renders fallback when permission is missing", () => {
    usePermissionStore.getState().setCodes([]);

    render(
      <PermissionGate code="leads.view" fallback={<span>No Access</span>}>
        <span>Secret Content</span>
      </PermissionGate>,
    );

    expect(screen.queryByText("Secret Content")).not.toBeInTheDocument();
    expect(screen.getByText("No Access")).toBeInTheDocument();
  });

  it("mode='any' shows children if at least one permission matches", () => {
    usePermissionStore.getState().setCodes(["leads.view"]);

    render(
      <PermissionGate code={["leads.view", "leads.delete"]} mode="any">
        <span>Visible</span>
      </PermissionGate>,
    );

    expect(screen.getByText("Visible")).toBeInTheDocument();
  });

  it("mode='all' hides children if any permission is missing", () => {
    usePermissionStore.getState().setCodes(["leads.view"]);

    render(
      <PermissionGate code={["leads.view", "leads.delete"]} mode="all">
        <span>Hidden</span>
      </PermissionGate>,
    );

    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });
});
