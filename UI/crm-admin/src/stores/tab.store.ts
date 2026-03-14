import { create } from "zustand";

// ── Document Types ──────────────────────────────────────

export type DocumentType =
  | "SALE_INVOICE"
  | "SALE_ORDER"
  | "QUOTATION"
  | "PROFORMA_INVOICE"
  | "DELIVERY_CHALLAN"
  | "SALE_RETURN"
  | "CREDIT_NOTE"
  | "PURCHASE_ORDER"
  | "PURCHASE_INVOICE"
  | "GOODS_RECEIPT"
  | "DEBIT_NOTE"
  | "RFQ"
  | "JOURNAL_ENTRY"
  | "PAYMENT_IN"
  | "PAYMENT_OUT"
  | "WARRANTY_CLAIM";

// ── Document Config ─────────────────────────────────────

export interface DocumentTypeConfig {
  shortName: string;
  icon: string;
  color: string;
  apiEndpoint: string;
  listPath: string;
  entityLabel: string;
  entityField: "customerId" | "vendorId";
  hasItems: boolean;
  hasTax: boolean;
  hasDiscount: boolean;
  columns: string[];
  defaultFormData: () => Record<string, any>;
}

export const DOCUMENT_CONFIG: Record<DocumentType, DocumentTypeConfig> = {
  SALE_INVOICE: {
    shortName: "Sale Invoice", icon: "file-text", color: "#10b981",
    apiEndpoint: "/api/v1/invoices", listPath: "/finance/invoices",
    entityLabel: "Customer", entityField: "customerId",
    hasItems: true, hasTax: true, hasDiscount: true,
    columns: ["#", "Item", "HSN", "Qty", "Unit", "Rate", "Disc%", "Tax%", "Amount"],
    defaultFormData: () => ({
      customerId: "", customerName: "", invoiceDate: new Date().toISOString().slice(0, 10),
      items: [], subtotal: 0, discountAmount: 0, taxableAmount: 0,
      cgstAmount: 0, sgstAmount: 0, igstAmount: 0, grandTotal: 0, notes: "",
    }),
  },
  SALE_ORDER: {
    shortName: "Sale Order", icon: "clipboard-list", color: "#3b82f6",
    apiEndpoint: "/api/v1/sales/orders", listPath: "/sales/orders",
    entityLabel: "Customer", entityField: "customerId",
    hasItems: true, hasTax: true, hasDiscount: true,
    columns: ["#", "Item", "HSN", "Qty", "Unit", "Rate", "Disc%", "Tax%", "Amount"],
    defaultFormData: () => ({
      customerId: "", customerName: "", orderDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: "", items: [], subtotal: 0, grandTotal: 0, notes: "",
    }),
  },
  QUOTATION: {
    shortName: "Quotation", icon: "file-badge", color: "#8b5cf6",
    apiEndpoint: "/api/v1/quotations", listPath: "/quotations",
    entityLabel: "Customer", entityField: "customerId",
    hasItems: true, hasTax: true, hasDiscount: true,
    columns: ["#", "Item", "HSN", "Qty", "Unit", "Rate", "Disc%", "Tax%", "Amount"],
    defaultFormData: () => ({
      customerId: "", customerName: "", validUntil: "", items: [], grandTotal: 0, notes: "",
    }),
  },
  PROFORMA_INVOICE: {
    shortName: "Proforma", icon: "file-clock", color: "#f59e0b",
    apiEndpoint: "/api/v1/sales/proforma", listPath: "/sales/proforma",
    entityLabel: "Customer", entityField: "customerId",
    hasItems: true, hasTax: true, hasDiscount: true,
    columns: ["#", "Item", "HSN", "Qty", "Unit", "Rate", "Disc%", "Tax%", "Amount"],
    defaultFormData: () => ({
      customerId: "", customerName: "", items: [], grandTotal: 0, notes: "",
    }),
  },
  DELIVERY_CHALLAN: {
    shortName: "Delivery Challan", icon: "truck", color: "#0ea5e9",
    apiEndpoint: "/api/v1/sales/delivery-challans", listPath: "/sales/delivery-challans",
    entityLabel: "Customer", entityField: "customerId",
    hasItems: true, hasTax: false, hasDiscount: false,
    columns: ["#", "Item", "Qty", "Unit", "Batch", "Serial", "Location"],
    defaultFormData: () => ({
      customerId: "", customerName: "", items: [], transporterName: "", vehicleNumber: "",
    }),
  },
  SALE_RETURN: {
    shortName: "Sale Return", icon: "undo-2", color: "#f97316",
    apiEndpoint: "/api/v1/sales/returns", listPath: "/sales/returns",
    entityLabel: "Customer", entityField: "customerId",
    hasItems: true, hasTax: true, hasDiscount: false,
    columns: ["#", "Item", "Qty", "Unit", "Rate", "Reason", "Amount"],
    defaultFormData: () => ({
      customerId: "", customerName: "", returnReason: "", items: [], grandTotal: 0,
    }),
  },
  CREDIT_NOTE: {
    shortName: "Credit Note", icon: "receipt", color: "#ef4444",
    apiEndpoint: "/api/v1/sales/credit-notes", listPath: "/sales/credit-notes",
    entityLabel: "Customer", entityField: "customerId",
    hasItems: true, hasTax: true, hasDiscount: false,
    columns: ["#", "Item", "Qty", "Unit", "Rate", "Tax%", "Amount"],
    defaultFormData: () => ({
      customerId: "", customerName: "", reason: "", items: [], grandTotal: 0,
    }),
  },
  PURCHASE_ORDER: {
    shortName: "Purchase Order", icon: "shopping-cart", color: "#6366f1",
    apiEndpoint: "/api/v1/procurement/purchase-orders", listPath: "/procurement/purchase-orders",
    entityLabel: "Vendor", entityField: "vendorId",
    hasItems: true, hasTax: true, hasDiscount: true,
    columns: ["#", "Item", "HSN", "Qty", "Unit", "Rate", "Disc%", "Tax%", "Amount"],
    defaultFormData: () => ({
      vendorId: "", vendorName: "", items: [], grandTotal: 0, notes: "",
    }),
  },
  PURCHASE_INVOICE: {
    shortName: "Purchase Invoice", icon: "file-input", color: "#14b8a6",
    apiEndpoint: "/api/v1/procurement/invoices", listPath: "/procurement/invoices",
    entityLabel: "Vendor", entityField: "vendorId",
    hasItems: true, hasTax: true, hasDiscount: true,
    columns: ["#", "Item", "HSN", "Qty", "Unit", "Rate", "Disc%", "Tax%", "Amount"],
    defaultFormData: () => ({
      vendorId: "", vendorName: "", items: [], grandTotal: 0, notes: "",
    }),
  },
  GOODS_RECEIPT: {
    shortName: "Goods Receipt", icon: "package-check", color: "#84cc16",
    apiEndpoint: "/api/v1/procurement/goods-receipts", listPath: "/procurement/goods-receipts",
    entityLabel: "Vendor", entityField: "vendorId",
    hasItems: true, hasTax: false, hasDiscount: false,
    columns: ["#", "Item", "Ordered", "Received", "Accepted", "Rejected"],
    defaultFormData: () => ({
      vendorId: "", vendorName: "", items: [],
    }),
  },
  DEBIT_NOTE: {
    shortName: "Debit Note", icon: "file-minus", color: "#f43f5e",
    apiEndpoint: "/api/v1/sales/debit-notes", listPath: "/sales/debit-notes",
    entityLabel: "Vendor", entityField: "vendorId",
    hasItems: true, hasTax: true, hasDiscount: false,
    columns: ["#", "Item", "Qty", "Unit", "Rate", "Tax%", "Amount"],
    defaultFormData: () => ({
      vendorId: "", vendorName: "", reason: "", items: [], grandTotal: 0,
    }),
  },
  RFQ: {
    shortName: "RFQ", icon: "mail", color: "#06b6d4",
    apiEndpoint: "/api/v1/procurement/rfq", listPath: "/procurement/rfq",
    entityLabel: "Vendor", entityField: "vendorId",
    hasItems: true, hasTax: false, hasDiscount: false,
    columns: ["#", "Item", "Qty", "Unit", "Specs"],
    defaultFormData: () => ({
      vendorId: "", vendorName: "", items: [], dueDate: "",
    }),
  },
  JOURNAL_ENTRY: {
    shortName: "Journal Entry", icon: "book-open", color: "#a855f7",
    apiEndpoint: "/api/v1/accounts/journal-entries", listPath: "/accounts/journal-entries",
    entityLabel: "Reference", entityField: "customerId",
    hasItems: true, hasTax: false, hasDiscount: false,
    columns: ["#", "Ledger", "Debit", "Credit", "Narration"],
    defaultFormData: () => ({
      entries: [], narration: "",
    }),
  },
  PAYMENT_IN: {
    shortName: "Receipt", icon: "arrow-down-circle", color: "#22c55e",
    apiEndpoint: "/api/v1/accounts/payments", listPath: "/accounts/payments?type=receipt",
    entityLabel: "Customer", entityField: "customerId",
    hasItems: false, hasTax: false, hasDiscount: false,
    columns: ["#", "Invoice", "Amount Due", "Paying"],
    defaultFormData: () => ({
      customerId: "", customerName: "", amount: 0, paymentMode: "CASH", reference: "",
    }),
  },
  PAYMENT_OUT: {
    shortName: "Payment", icon: "arrow-up-circle", color: "#f97316",
    apiEndpoint: "/api/v1/accounts/payments", listPath: "/accounts/payments?type=payment",
    entityLabel: "Vendor", entityField: "vendorId",
    hasItems: false, hasTax: false, hasDiscount: false,
    columns: ["#", "Invoice", "Amount Due", "Paying"],
    defaultFormData: () => ({
      vendorId: "", vendorName: "", amount: 0, paymentMode: "CASH", reference: "",
    }),
  },
  WARRANTY_CLAIM: {
    shortName: "Warranty Claim", icon: "shield-check", color: "#eab308",
    apiEndpoint: "/api/v1/warranty/claims", listPath: "/post-sales/warranty/claims",
    entityLabel: "Customer", entityField: "customerId",
    hasItems: false, hasTax: false, hasDiscount: false,
    columns: ["Product", "Serial", "Issue", "Type"],
    defaultFormData: () => ({
      customerId: "", customerName: "", productId: "", issue: "",
    }),
  },
};

// ── Route → DocumentType map ────────────────────────────
// Used by CRMSidebar to detect which menu items support POS mode

export const ROUTE_TO_DOC_TYPE: Record<string, DocumentType> = {
  "/finance/invoices": "SALE_INVOICE",
  "/sales/orders": "SALE_ORDER",
  "/quotations": "QUOTATION",
  "/sales/proforma": "PROFORMA_INVOICE",
  "/sales/delivery-challans": "DELIVERY_CHALLAN",
  "/sales/returns": "SALE_RETURN",
  "/sales/credit-notes": "CREDIT_NOTE",
  "/procurement/purchase-orders": "PURCHASE_ORDER",
  "/procurement/invoices": "PURCHASE_INVOICE",
  "/procurement/goods-receipts": "GOODS_RECEIPT",
  "/sales/debit-notes": "DEBIT_NOTE",
  "/procurement/rfq": "RFQ",
  "/accounts/journal-entries": "JOURNAL_ENTRY",
  "/accounts/payments": "PAYMENT_IN",
  "/post-sales/warranty/claims": "WARRANTY_CLAIM",
};

// ── Tab ─────────────────────────────────────────────────

export interface WorkspaceTab {
  id: string;
  documentType: DocumentType;
  documentId?: string;
  title: string;
  icon: string;
  color: string;
  formData: Record<string, any>;
  isDirty: boolean;
  createdAt: number;
}

// ── Store ───────────────────────────────────────────────

interface TabStore {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  isPOSMode: boolean;

  addTab: (type: DocumentType, documentId?: string, initialData?: Record<string, any>) => string;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  updateTabData: (tabId: string, data: Record<string, any>) => void;
  updateTabTitle: (tabId: string, title: string) => void;
  setTabDirty: (tabId: string, dirty: boolean) => void;
  closeAllTabs: () => void;
  getActiveTab: () => WorkspaceTab | undefined;
  switchToNext: () => void;
  switchToPrev: () => void;
  switchToIndex: (index: number) => void;
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  isPOSMode: false,

  addTab: (type, documentId, initialData) => {
    const id = crypto.randomUUID();
    const config = DOCUMENT_CONFIG[type];
    const title = documentId
      ? `${config.shortName} #${documentId.slice(0, 8).toUpperCase()}`
      : `${config.shortName} #NEW`;

    const newTab: WorkspaceTab = {
      id,
      documentType: type,
      documentId,
      title,
      icon: config.icon,
      color: config.color,
      formData: initialData ?? config.defaultFormData(),
      isDirty: false,
      createdAt: Date.now(),
    };

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: id,
      isPOSMode: true,
    }));

    return id;
  },

  closeTab: (tabId) => {
    const state = get();
    const newTabs = state.tabs.filter((t) => t.id !== tabId);
    let newActiveId = state.activeTabId;

    if (state.activeTabId === tabId) {
      const closedIndex = state.tabs.findIndex((t) => t.id === tabId);
      newActiveId = newTabs.length > 0
        ? newTabs[Math.min(closedIndex, newTabs.length - 1)].id
        : null;
    }

    set({
      tabs: newTabs,
      activeTabId: newActiveId,
      isPOSMode: newTabs.length > 0,
    });
  },

  switchTab: (tabId) => {
    set({ activeTabId: tabId });
  },

  updateTabData: (tabId, data) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId
          ? { ...t, formData: { ...t.formData, ...data }, isDirty: true }
          : t,
      ),
    }));
  },

  updateTabTitle: (tabId, title) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, title } : t)),
    }));
  },

  setTabDirty: (tabId, dirty) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, isDirty: dirty } : t)),
    }));
  },

  closeAllTabs: () => set({ tabs: [], activeTabId: null, isPOSMode: false }),

  getActiveTab: () => {
    const state = get();
    return state.tabs.find((t) => t.id === state.activeTabId);
  },

  switchToNext: () => {
    const { tabs, activeTabId } = get();
    if (tabs.length <= 1) return;
    const idx = tabs.findIndex((t) => t.id === activeTabId);
    set({ activeTabId: tabs[(idx + 1) % tabs.length].id });
  },

  switchToPrev: () => {
    const { tabs, activeTabId } = get();
    if (tabs.length <= 1) return;
    const idx = tabs.findIndex((t) => t.id === activeTabId);
    set({ activeTabId: tabs[(idx - 1 + tabs.length) % tabs.length].id });
  },

  switchToIndex: (index) => {
    const { tabs } = get();
    if (index >= 0 && index < tabs.length) {
      set({ activeTabId: tabs[index].id });
    }
  },
}));
