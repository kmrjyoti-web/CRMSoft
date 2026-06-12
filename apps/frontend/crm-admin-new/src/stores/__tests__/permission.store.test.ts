import { usePermissionStore } from "../permission.store";

// ── Setup ────────────────────────────────────────────────

beforeEach(() => {
  usePermissionStore.getState().reset();
});

// ── Tests ────────────────────────────────────────────────

describe("permission.store setCodes", () => {
  it("stores permission codes and marks loaded", () => {
    usePermissionStore.getState().setCodes(["leads.view", "leads.create"]);

    const state = usePermissionStore.getState();
    expect(state.codes).toEqual(["leads.view", "leads.create"]);
    expect(state.loaded).toBe(true);
  });
});

describe("permission.store hasPermission", () => {
  it("returns true for an existing permission", () => {
    usePermissionStore.getState().setCodes(["leads.view", "leads.create"]);
    expect(usePermissionStore.getState().hasPermission("leads.view")).toBe(true);
  });

  it("returns false for a missing permission", () => {
    usePermissionStore.getState().setCodes(["leads.view"]);
    expect(usePermissionStore.getState().hasPermission("leads.delete")).toBe(false);
  });
});

describe("permission.store hasAnyPermission", () => {
  it("returns true if at least one matches", () => {
    usePermissionStore.getState().setCodes(["leads.view"]);
    expect(
      usePermissionStore.getState().hasAnyPermission(["leads.view", "leads.delete"]),
    ).toBe(true);
  });

  it("returns false if none match", () => {
    usePermissionStore.getState().setCodes(["leads.view"]);
    expect(
      usePermissionStore.getState().hasAnyPermission(["leads.delete", "leads.export"]),
    ).toBe(false);
  });
});

describe("permission.store hasAllPermissions", () => {
  it("returns true only if every code matches", () => {
    usePermissionStore.getState().setCodes(["leads.view", "leads.create", "leads.delete"]);
    expect(
      usePermissionStore.getState().hasAllPermissions(["leads.view", "leads.create"]),
    ).toBe(true);
  });

  it("returns false if any code is missing", () => {
    usePermissionStore.getState().setCodes(["leads.view"]);
    expect(
      usePermissionStore.getState().hasAllPermissions(["leads.view", "leads.create"]),
    ).toBe(false);
  });
});

describe("permission.store hasFeature", () => {
  it("returns true for an enabled feature", () => {
    usePermissionStore.getState().setFeatures(["WHATSAPP_INTEGRATION"]);
    expect(usePermissionStore.getState().hasFeature("WHATSAPP_INTEGRATION")).toBe(true);
  });

  it("returns false for a disabled feature", () => {
    usePermissionStore.getState().setFeatures([]);
    expect(usePermissionStore.getState().hasFeature("WHATSAPP_INTEGRATION")).toBe(false);
  });
});

describe("permission.store reset", () => {
  it("clears all permissions and features", () => {
    usePermissionStore.getState().setCodes(["leads.view"]);
    usePermissionStore.getState().setFeatures(["BULK_IMPORT"]);
    usePermissionStore.getState().reset();

    const state = usePermissionStore.getState();
    expect(state.codes).toEqual([]);
    expect(state.features).toEqual([]);
    expect(state.loaded).toBe(false);
  });
});
