#!/usr/bin/env node
/**
 * Push all CRM development session history to Notion.
 *
 * Usage:
 *   NOTION_TOKEN=ntn_xxx node scripts/push-sessions-to-notion.js
 *
 * If no NOTION_DATABASE_ID is set, the script will search for the existing
 * "CRM Dev Sessions" data source and use it.
 */

const { Client } = require("@notionhq/client");

const TOKEN = process.env.NOTION_TOKEN;
let DATA_SOURCE_ID = process.env.NOTION_DATABASE_ID;

if (!TOKEN) {
  console.error("Usage: NOTION_TOKEN=ntn_xxx node scripts/push-sessions-to-notion.js");
  console.error("");
  console.error("Optional: NOTION_DATABASE_ID=xxx (data source ID from Notion)");
  process.exit(1);
}

const notion = new Client({ auth: TOKEN });

// ── All 16 Development Sessions ──────────────────────────

const SESSIONS = [
  {
    prompt: "P1",
    title: "Project Setup & Auth Foundation",
    date: "2026-01-15",
    status: "Completed",
    description:
      "Initial project scaffolding: Next.js 14 App Router + TypeScript strict mode. NestJS backend setup. CoreUI submodule integration (AIC-prefixed fork). ESLint rules enforcing 3-layer import chain. Jest configuration.",
    filesChanged:
      "next.config.js, tsconfig.json, package.json, eslint.config.js, jest.config.ts, lib/coreui/ (submodule), src/app/layout.tsx",
    testResults: "Initial test suite configured",
  },
  {
    prompt: "P2",
    title: "Authentication & Login",
    date: "2026-01-17",
    status: "Completed",
    description:
      "Login page with react-hook-form + zod validation. Auth store (Zustand) with JWT token management. API client with interceptors for auth headers, token refresh, and error handling. Auth cookies for SSR.",
    filesChanged:
      "src/features/auth/ (LoginForm, auth.store, auth-cookies, auth.service), src/services/api-client.ts, src/app/(auth)/login/page.tsx",
    testResults: "Auth service tests, store tests passing",
  },
  {
    prompt: "P3",
    title: "Protected Layout & AIC Rename",
    date: "2026-01-20",
    status: "Completed",
    description:
      "Protected route layout with sidebar + header. Route group (main) for authenticated pages, (auth) for login/forgot-password. CoreUI component rename from CUI to AIC prefix.",
    filesChanged:
      "src/app/(main)/layout.tsx, src/components/layout/ (Sidebar, Header, ProtectedLayout)",
    testResults: "Layout rendering tests passing",
  },
  {
    prompt: "P4",
    title: "56 UI Wrappers & Component Library",
    date: "2026-01-23",
    status: "Completed",
    description:
      "Created 56 UI wrapper components in src/components/ui/ — the ONLY layer that imports from @coreui/*. Components: Input, SelectInput, DatePicker, NumberInput, CurrencyInput, Button, Modal, Drawer, TableFull, Badge, Avatar, Icon system (single lucide-react entry point), and more.",
    filesChanged:
      "src/components/ui/ (56 wrapper files + index.ts barrel export), src/components/ui/Icon.tsx (lucide-react gateway)",
    testResults: "56 UI wrapper tests, all passing",
  },
  {
    prompt: "P5",
    title: "Features Scaffold & Shared Components",
    date: "2026-01-26",
    status: "Completed",
    description:
      "DDD feature scaffolding pattern (components/hooks/services/types/utils per feature). Shared components: DataTable, FilterPanel, PageHeader, FormErrors, LoadingSpinner, TableSkeleton, FeatureGate, PermissionGate. Utility libraries: date-utils, format-utils.",
    filesChanged:
      "src/features/ (scaffold), src/components/common/ (8 shared components), src/lib/ (utilities)",
    testResults: "Shared component tests passing",
  },
  {
    prompt: "P6",
    title: "Contacts CRUD",
    date: "2026-01-29",
    status: "Completed",
    description:
      "Full Contacts feature: list page with TableFull (10 view modes), detail page, create/edit form with react-hook-form + zod. Service layer, React Query hooks, type definitions. Communication sub-entities (email, phone).",
    filesChanged:
      "src/features/contacts/ (ContactList, ContactDetail, ContactForm, contacts.service, useContacts, contacts.types)",
    testResults: "Contact list + form tests passing",
  },
  {
    prompt: "P7",
    title: "Organizations CRUD",
    date: "2026-02-01",
    status: "Completed",
    description:
      "Organizations feature mirroring Contacts pattern: list, detail, form. Industry/country fields, address management, linked contacts display. Soft-delete via isActive flag with deactivate/reactivate endpoints.",
    filesChanged:
      "src/features/organizations/ (OrganizationList, OrganizationDetail, OrganizationForm, organizations.service, useOrganizations)",
    testResults: "Organization list + form tests passing",
  },
  {
    prompt: "P8",
    title: "Leads & Kanban Board",
    date: "2026-02-04",
    status: "Completed",
    description:
      "Leads pipeline with Kanban board using @dnd-kit for drag-and-drop. Lead stages (New, Qualified, Proposal, Negotiation, Won, Lost). Lead form with expected close date, priority, value fields. Pipeline view + table view toggle.",
    filesChanged:
      "src/features/leads/ (LeadList, LeadForm, LeadKanban, leads.service, useLeads, leads.types)",
    testResults: "Lead list + form tests passing",
  },
  {
    prompt: "P9",
    title: "Settings — Users, Roles & Permissions",
    date: "2026-02-07",
    status: "Completed",
    description:
      "Settings module: User management (list, create, edit, activate/deactivate), Role management (CRUD with permission assignment), Permission matrix view. Role-based access control foundation.",
    filesChanged:
      "src/features/settings/ (UserList, UserForm, RoleList, RoleForm, PermissionMatrix, SettingsHome), route pages under /settings/",
    testResults: "User list + form + roles service tests passing",
  },
  {
    prompt: "P10",
    title: "Activities, Follow-ups & Tour Plans",
    date: "2026-02-10",
    status: "Completed",
    description:
      "Activities feature (calls, meetings, tasks, emails) with CRUD. Follow-ups linked to activities. Tour Plans for field sales team scheduling. Activity types with color coding.",
    filesChanged:
      "src/features/activities/, src/features/follow-ups/, src/features/tour-plans/ (lists, forms, services, hooks)",
    testResults: "Activity + tour plan tests passing",
  },
  {
    prompt: "P11",
    title: "Quotations with GST Calculations",
    date: "2026-02-14",
    status: "Completed",
    description:
      "Quotation module with line items, GST tax calculations (CGST/SGST for intra-state, IGST for inter-state). Quotation form with dynamic line items, discount handling, tax summary. PDF-ready data structure.",
    filesChanged:
      "src/features/quotations/ (QuotationList, QuotationForm, quotations.service, useQuotations, gst.ts utility)",
    testResults: "Quotation list + form + GST calculation tests passing",
  },
  {
    prompt: "P12",
    title: "Finance — Invoices & Payments",
    date: "2026-02-17",
    status: "Completed",
    description:
      "Invoice module (create from quotation, line items, tax, billing/shipping addresses). Payment tracking (multiple payment methods, partial payments, payment history). Invoice status workflow (Draft -> Sent -> Paid).",
    filesChanged:
      "src/features/finance/ (InvoiceList, InvoiceForm, PaymentList, finance.service, useInvoices, usePayments)",
    testResults: "Invoice + payment list tests passing",
  },
  {
    prompt: "P13",
    title: "Post-Sales — Installations, Trainings & Tickets",
    date: "2026-02-20",
    status: "Completed",
    description:
      "Post-sales module: Installation tracking, Training session management, Support ticket system (create, assign, status workflow, priority levels). Linked to contacts and organizations.",
    filesChanged:
      "src/features/post-sales/ (InstallationList, TicketList, TicketForm, post-sales.service, hooks)",
    testResults: "Installation + ticket list + form tests passing",
  },
  {
    prompt: "P14",
    title: "Dashboard & Reports",
    date: "2026-02-23",
    status: "Completed",
    description:
      "Dashboard with KPI cards (total contacts, active leads, revenue, pending tasks). Recharts-powered charts (line, bar, pie, area). Report catalog with filterable report templates. Data aggregation from multiple features.",
    filesChanged:
      "src/features/dashboard/ (DashboardOverview, ReportCatalog, KPICards, charts components, dashboard.service)",
    testResults: "Dashboard + report catalog tests passing",
  },
  {
    prompt: "P15",
    title: "Communication, Workflows & Menu Editor",
    date: "2026-02-26",
    status: "Completed",
    description:
      "Communication module: Email/SMS template builder with variable placeholders, email signature management. Workflow automation: visual workflow builder with drag-and-drop nodes, trigger/action/condition steps. Dynamic menu editor for sidebar navigation.",
    filesChanged:
      "src/features/communication/ (TemplateList, SignatureEditor), src/features/workflows/ (WorkflowList, WorkflowBuilder), src/features/settings/components/MenuEditor.tsx",
    testResults: "341 tests, 64 suites, all passing",
  },
  {
    prompt: "P16",
    title: "Bulk Operations & Notion Integration",
    date: "2026-03-03",
    status: "Completed",
    description:
      "Bulk Operations System: generic useBulkSelect + useBulkOperations hooks, BulkActionsBar, BulkSelectDrawer, BulkDeleteDialog (double confirmation), BulkEditPanel. Integrated into all 6 list pages. Notion Integration: NestJS backend module with @notionhq/client SDK, Prisma NotionConfig model, settings UI page for token config + database linking + session entry push + session log table.",
    filesChanged:
      "6 new generic files (useBulkSelect, useBulkOperations, BulkActionsBar, BulkSelectDrawer, BulkDeleteDialog, BulkEditPanel), 6 list pages modified, 8 new Notion files (backend + frontend), Prisma schema, settings.module.ts, SettingsHome.tsx",
    testResults: "385 tests, 72 suites, all passing",
  },
];

// ── Find data source ID ─────────────────────────────

async function findDataSourceId() {
  if (DATA_SOURCE_ID) {
    console.log(`Using provided ID: ${DATA_SOURCE_ID.slice(0, 8)}...`);
    return DATA_SOURCE_ID;
  }

  console.log("Searching for 'CRM Dev Sessions' data source...");

  const searchResult = await notion.search({
    query: "CRM Dev Sessions",
    filter: { property: "object", value: "data_source" },
    page_size: 10,
  });

  for (const result of searchResult.results) {
    const title = result.title?.[0]?.plain_text ?? "";
    if (title === "CRM Dev Sessions") {
      console.log(`Found data source: ${result.id.slice(0, 8)}...`);
      return result.id;
    }
  }

  console.error("ERROR: 'CRM Dev Sessions' database not found.");
  console.error("The database exists in Notion but the data source was not found.");
  console.error("");
  console.error("Please open the database in Notion, copy its URL, and extract the ID.");
  console.error("Then run: NOTION_DATABASE_ID=<id> NOTION_TOKEN=... node scripts/push-sessions-to-notion.js");
  process.exit(1);
}

// ── Push entry using raw API request ─────────────────

async function pushEntry(dsId, session) {
  const properties = {
    Prompt: { title: [{ text: { content: session.prompt } }] },
    Title: { rich_text: [{ text: { content: session.title } }] },
    Date: { date: { start: session.date } },
    Status: { select: { name: session.status } },
  };

  if (session.description) {
    properties["Description"] = {
      rich_text: [{ text: { content: session.description.slice(0, 2000) } }],
    };
  }
  if (session.filesChanged) {
    properties["Files Changed"] = {
      rich_text: [{ text: { content: session.filesChanged.slice(0, 2000) } }],
    };
  }
  if (session.testResults) {
    properties["Test Results"] = {
      rich_text: [{ text: { content: session.testResults.slice(0, 2000) } }],
    };
  }

  // Use notion.request() to bypass SDK parameter validation issues in v5
  return notion.request({
    method: "post",
    path: "pages",
    body: {
      parent: { type: "data_source_id", data_source_id: dsId },
      properties,
    },
  });
}

// ── Main ────────────────────────────────────────────

async function main() {
  // Step 1: verify token
  console.log("Verifying Notion connection...");
  try {
    const me = await notion.users.me({});
    console.log(`Connected as: ${me.name ?? me.id}`);
  } catch (err) {
    console.error(`Connection failed: ${err.message}`);
    console.error("Check your NOTION_TOKEN and try again.");
    process.exit(1);
  }

  // Step 2: find data source
  const dsId = await findDataSourceId();

  // Step 3: push all sessions
  console.log("");
  console.log(`Pushing ${SESSIONS.length} sessions to data source ${dsId.slice(0, 8)}...`);
  console.log("");

  let succeeded = 0;
  let failed = 0;

  for (const session of SESSIONS) {
    try {
      await pushEntry(dsId, session);
      succeeded++;
      console.log(`  + ${session.prompt}: ${session.title}`);
    } catch (err) {
      failed++;
      console.error(`  x ${session.prompt}: ${err.message}`);
    }
  }

  console.log("");
  console.log(`Done! ${succeeded} pushed, ${failed} failed.`);

  if (succeeded > 0) {
    console.log("");
    console.log("Open Notion to see your CRM Dev Sessions database.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
