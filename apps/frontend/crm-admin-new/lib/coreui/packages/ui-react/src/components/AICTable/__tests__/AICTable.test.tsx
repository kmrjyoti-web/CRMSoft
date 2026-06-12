/**
 * AICTable tests.
 * 12+ test cases covering rendering, sorting, pagination, views,
 * search, column chooser, multi-select, footer aggregation, and more.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AICTable } from "../AICTable";
import type { TableConfig } from "@coreui/ui";

// ---------------------------------------------------------------------------
// Mock config
// ---------------------------------------------------------------------------

const mockColumns = [
  {
    index: 0,
    name: "ID",
    code: "id",
    display: "ID",
    header: "ID",
    visible: true,
    sortable: true,
    filterable: true,
    align: "left" as const,
    showOnColumnChooser: true,
  },
  {
    index: 1,
    name: "Name",
    code: "name",
    display: "Name",
    header: "Name",
    visible: true,
    sortable: true,
    filterable: true,
    align: "left" as const,
    showOnColumnChooser: true,
  },
  {
    index: 2,
    name: "Email",
    code: "email",
    display: "Email",
    header: "Email",
    visible: true,
    sortable: true,
    filterable: true,
    columnType: "EMAIL" as const,
    align: "left" as const,
    showOnColumnChooser: true,
  },
  {
    index: 3,
    name: "Amount",
    code: "amount",
    display: "Amount",
    header: "Amount",
    visible: true,
    sortable: true,
    columnType: "numeric" as const,
    align: "right" as const,
    showOnColumnChooser: true,
  },
  {
    index: 4,
    name: "Hidden Column",
    code: "hidden",
    display: "Hidden",
    visible: false,
    showOnColumnChooser: true,
  },
];

const mockConfig: TableConfig = {
  feature: "test",
  key: "test-table",
  api: {
    url: "/api",
    pathTable: "/data",
    pathExport: "/export",
    method: "POST",
    defaultPageSize: 10,
  },
  config: {
    id: "test-table",
    title: "Test Table",
    primaryKey: "id",
    dataStrategy: "ONLINE_FIRST",
    pagingMode: "paginator",
    paginatorPosition: "bottom",
    stripedRows: true,
    showGridlines: false,
    rowHover: true,
    enableColumnChooser: true,
    enableRowMenu: false,
    enableHeaderActions: false,
    enableSavedQueries: false,
    enableConfigButton: false,
    enableMultiSelect: false,
    enableQuickActions: false,
    defaultRows: 5,
    role: "admin",
    toolbarActions: [
      { label: "Refresh", icon: "refresh", key: "refresh" },
      { label: "Add", icon: "plus", key: "add" },
    ],
    sizerConfig: {
      enabled: true,
      defaultDensity: "comfortable",
      densities: [
        { name: "comfortable", cssClass: "", rowHeight: 48 },
        { name: "compact", cssClass: "compact", rowHeight: 36 },
        { name: "dense", cssClass: "dense", rowHeight: 28 },
      ],
    },
    searchConfig: {
      enabled: true,
      fields: ["name", "email"],
      placeholder: "Search records...",
      debounceTime: 0, // immediate for tests
    },
    exportConfig: {
      enabled: true,
      options: [
        { label: "CSV", key: "csv", icon: "csv" },
        { label: "PDF", key: "pdf", icon: "pdf" },
        { label: "Excel", key: "excel", icon: "excel" },
      ],
    },
    emptyStateConfig: {
      enabled: true,
      title: "No records found",
      subtitle: "Try adjusting your search or filters.",
    },
    footerConfig: {
      enabled: true,
      columns: [
        { code: "amount", aggregation: "sum", display: "Total" },
      ],
    },
    styleConfig: {
      enableTransparency: false,
    },
    cardViewConfig: {
      cardsPerRow: 3,
    },
  },
  columns: mockColumns,
  rowMenu: [],
};

const mockData = [
  { id: "1", name: "Alice", email: "alice@example.com", amount: 100 },
  { id: "2", name: "Bob", email: "bob@example.com", amount: 200 },
  { id: "3", name: "Charlie", email: "charlie@example.com", amount: 300 },
  { id: "4", name: "Diana", email: "diana@example.com", amount: 400 },
  { id: "5", name: "Eve", email: "eve@example.com", amount: 500 },
  { id: "6", name: "Frank", email: "frank@example.com", amount: 150 },
  { id: "7", name: "Grace", email: "grace@example.com", amount: 250 },
  { id: "8", name: "Hank", email: "hank@example.com", amount: 350 },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AICTable", () => {
  // ── 1. Renders with config and displays title ─────────
  it("renders with config and displays title", () => {
    const { container } = render(
      <AICTable config={mockConfig} data={mockData} />,
    );
    const table = container.querySelector("[data-testid='aic-table']");
    expect(table).toBeTruthy();

    const title = container.querySelector("[data-testid='aic-table-title']");
    expect(title).toBeTruthy();
    expect(title?.textContent).toBe("Test Table");
  });

  // ── 2. Shows record count badge ──────────────────────
  it("shows record count badge", () => {
    const { container } = render(
      <AICTable config={mockConfig} data={mockData} />,
    );
    const badge = container.querySelector(
      "[data-testid='aic-table-record-count']",
    );
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toBe("8");
  });

  // ── 3. Renders table columns based on visible columns ─
  it("renders table columns based on visible columns", () => {
    const { container } = render(
      <AICTable config={mockConfig} data={mockData} />,
    );
    // Should render 4 visible columns (not the hidden one)
    const idHeader = container.querySelector(
      "[data-testid='aic-table-header-id']",
    );
    const nameHeader = container.querySelector(
      "[data-testid='aic-table-header-name']",
    );
    const emailHeader = container.querySelector(
      "[data-testid='aic-table-header-email']",
    );
    const amountHeader = container.querySelector(
      "[data-testid='aic-table-header-amount']",
    );
    const hiddenHeader = container.querySelector(
      "[data-testid='aic-table-header-hidden']",
    );

    expect(idHeader).toBeTruthy();
    expect(nameHeader).toBeTruthy();
    expect(emailHeader).toBeTruthy();
    expect(amountHeader).toBeTruthy();
    expect(hiddenHeader).toBeNull();
  });

  // ── 4. Handles sort click and toggles direction ───────
  it("handles sort click and toggles direction", () => {
    const onSortChange = vi.fn();
    const { container } = render(
      <AICTable
        config={mockConfig}
        data={mockData}
        onSortChange={onSortChange}
      />,
    );
    const nameHeader = container.querySelector(
      "[data-testid='aic-table-header-name']",
    );
    expect(nameHeader).toBeTruthy();

    // First click: asc
    fireEvent.click(nameHeader!);
    expect(onSortChange).toHaveBeenCalledWith("name", "asc");

    // Second click: desc
    fireEvent.click(nameHeader!);
    expect(onSortChange).toHaveBeenCalledWith("name", "desc");
  });

  // ── 5. Paginates data correctly ──────────────────────
  it("paginates data correctly", () => {
    const { container } = render(
      <AICTable config={mockConfig} data={mockData} />,
    );
    // defaultRows = 5, so first page shows 5 rows
    const rows = container.querySelectorAll("[data-testid^='aic-table-row-']");
    expect(rows.length).toBe(5);

    // Paginator should exist
    const paginator = container.querySelector(
      "[data-testid='aic-table-paginator']",
    );
    expect(paginator).toBeTruthy();

    // Click next page
    const nextBtn = container.querySelector(
      "[data-testid='aic-table-next-page']",
    );
    expect(nextBtn).toBeTruthy();
    fireEvent.click(nextBtn!);

    // Second page should show remaining 3 rows
    const rowsPage2 = container.querySelectorAll(
      "[data-testid^='aic-table-row-']",
    );
    expect(rowsPage2.length).toBe(3);
  });

  // ── 6. Shows empty state when no data ─────────────────
  it("shows empty state when no data", () => {
    const { container } = render(
      <AICTable config={mockConfig} data={[]} />,
    );
    const emptyState = container.querySelector(
      "[data-testid='aic-table-empty']",
    );
    expect(emptyState).toBeTruthy();
    expect(emptyState?.textContent).toContain("No records found");
    expect(emptyState?.textContent).toContain(
      "Try adjusting your search or filters.",
    );
  });

  // ── 7. Shows loading skeleton when loading=true ───────
  it("shows loading skeleton when loading=true", () => {
    const { container } = render(
      <AICTable config={mockConfig} data={mockData} loading={true} />,
    );
    const loading = container.querySelector(
      "[data-testid='aic-table-loading']",
    );
    expect(loading).toBeTruthy();

    // Should not render table view
    const tableView = container.querySelector(
      "[data-testid='aic-table-view-table']",
    );
    expect(tableView).toBeNull();
  });

  // ── 8. Switches view mode (table → card) ──────────────
  it("switches view mode from table to card", () => {
    const onViewModeChange = vi.fn();
    const { container } = render(
      <AICTable
        config={mockConfig}
        data={mockData}
        onViewModeChange={onViewModeChange}
      />,
    );
    // Initially table view
    expect(
      container.querySelector("[data-testid='aic-table-view-table']"),
    ).toBeTruthy();

    // Open view selector
    const viewToggle = container.querySelector(
      "[data-testid='aic-table-view-toggle']",
    );
    expect(viewToggle).toBeTruthy();
    fireEvent.click(viewToggle!);

    // Click card mode
    const cardOption = container.querySelector(
      "[data-testid='view-mode-card']",
    );
    expect(cardOption).toBeTruthy();
    fireEvent.click(cardOption!);

    expect(onViewModeChange).toHaveBeenCalledWith("card");

    // Should now show card view
    expect(
      container.querySelector("[data-testid='aic-table-view-card']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='aic-table-view-table']"),
    ).toBeNull();
  });

  // ── 9. Global search filters data ─────────────────────
  it("global search filters data", () => {
    const { container } = render(
      <AICTable config={mockConfig} data={mockData} />,
    );
    const searchInput = container.querySelector(
      "[data-testid='aic-table-search']",
    ) as HTMLInputElement;
    expect(searchInput).toBeTruthy();

    // Search for "Alice"
    fireEvent.change(searchInput, { target: { value: "Alice" } });

    // With debounceTime=0, the filter should apply immediately (via setTimeout(fn, 0))
    // We need to wait for the next tick
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const rows = container.querySelectorAll(
          "[data-testid^='aic-table-row-']",
        );
        expect(rows.length).toBe(1);
        resolve();
      }, 10);
    });
  });

  // ── 10. Column chooser toggle works ───────────────────
  it("column chooser toggle works", () => {
    const { container } = render(
      <AICTable config={mockConfig} data={mockData} />,
    );
    // Column chooser should not be visible initially
    expect(
      container.querySelector("[data-testid='aic-table-column-chooser']"),
    ).toBeNull();

    // Click the column chooser toggle
    const toggle = container.querySelector(
      "[data-testid='aic-table-column-chooser-toggle']",
    );
    expect(toggle).toBeTruthy();
    fireEvent.click(toggle!);

    // Column chooser should now be visible
    const chooser = container.querySelector(
      "[data-testid='aic-table-column-chooser']",
    );
    expect(chooser).toBeTruthy();

    // Should show checkboxes for all choosable columns (5 including hidden)
    const checkboxes = chooser!.querySelectorAll("input[type='checkbox']");
    expect(checkboxes.length).toBe(5);
  });

  // ── 11. Multi-select checkbox renders when enabled ────
  it("multi-select checkbox renders when enabled", () => {
    const multiSelectConfig = {
      ...mockConfig,
      config: {
        ...mockConfig.config,
        enableMultiSelect: true,
      },
    };
    const onSelectionChange = vi.fn();
    const { container } = render(
      <AICTable
        config={multiSelectConfig}
        data={mockData}
        onSelectionChange={onSelectionChange}
      />,
    );

    // AICSelect-all checkbox should be present
    const selectAll = container.querySelector(
      "[data-testid='aic-table-select-all']",
    );
    expect(selectAll).toBeTruthy();

    // Row checkboxes should be present
    const rowCheckbox = container.querySelector(
      "[data-testid='aic-table-row-checkbox-0']",
    );
    expect(rowCheckbox).toBeTruthy();

    // Click a row checkbox
    fireEvent.click(rowCheckbox!);
    expect(onSelectionChange).toHaveBeenCalledWith(["1"]);

    // Click select all
    fireEvent.click(selectAll!);
    expect(onSelectionChange).toHaveBeenCalled();
  });

  // ── 12. Footer aggregation displays correct values ────
  it("footer aggregation displays correct values", () => {
    const { container } = render(
      <AICTable config={mockConfig} data={mockData} />,
    );
    const footer = container.querySelector(
      "[data-testid='aic-table-footer']",
    );
    expect(footer).toBeTruthy();

    const amountFooter = container.querySelector(
      "[data-testid='aic-table-footer-amount']",
    );
    expect(amountFooter).toBeTruthy();
    // Sum of all amounts: 100+200+300+400+500+150+250+350 = 2250
    expect(amountFooter?.textContent).toContain("Total");
    expect(amountFooter?.textContent).toContain("2,250");
  });

  // ── 13. Toolbar actions fire callbacks ────────────────
  it("toolbar actions fire callbacks", () => {
    const onToolbarAction = vi.fn();
    const { container } = render(
      <AICTable
        config={mockConfig}
        data={mockData}
        onToolbarAction={onToolbarAction}
      />,
    );
    const refreshBtn = container.querySelector(
      "[data-testid='toolbar-action-refresh']",
    );
    expect(refreshBtn).toBeTruthy();
    fireEvent.click(refreshBtn!);
    expect(onToolbarAction).toHaveBeenCalledWith("refresh");
  });

  // ── 14. Page size selector works ──────────────────────
  it("page size selector works", () => {
    const onPageSizeChange = vi.fn();
    const { container } = render(
      <AICTable
        config={mockConfig}
        data={mockData}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    const pageSizeSelect = container.querySelector(
      "[data-testid='aic-table-page-size']",
    ) as HTMLSelectElement;
    expect(pageSizeSelect).toBeTruthy();

    // Change page size to 10
    fireEvent.change(pageSizeSelect, { target: { value: "10" } });
    expect(onPageSizeChange).toHaveBeenCalledWith(10);

    // All 8 rows should now be visible on one page
    const rows = container.querySelectorAll(
      "[data-testid^='aic-table-row-']",
    );
    expect(rows.length).toBe(8);
  });

  // ── 15. List view renders correctly ───────────────────
  it("list view renders correctly", () => {
    const { container } = render(
      <AICTable config={mockConfig} data={mockData} />,
    );

    // AICSwitch to list view
    const viewToggle = container.querySelector(
      "[data-testid='aic-table-view-toggle']",
    );
    fireEvent.click(viewToggle!);

    const listOption = container.querySelector(
      "[data-testid='view-mode-list']",
    );
    fireEvent.click(listOption!);

    const listView = container.querySelector(
      "[data-testid='aic-table-view-list']",
    );
    expect(listView).toBeTruthy();

    const listItems = container.querySelectorAll(
      "[data-testid^='aic-table-list-item-']",
    );
    expect(listItems.length).toBe(5); // page size = 5
  });

  // ── 16. Density selector changes density ──────────────
  it("density selector changes density", () => {
    const { container } = render(
      <AICTable config={mockConfig} data={mockData} />,
    );

    // Click compact density
    const compactBtn = container.querySelector(
      "[data-testid='density-compact']",
    );
    expect(compactBtn).toBeTruthy();
    fireEvent.click(compactBtn!);

    // The compact button should now have the active style (bg-blue-600)
    expect(compactBtn?.className).toContain("bg-blue-600");
  });
});
