"use client";

import { useCallback, type ReactNode } from "react";

import { useSidePanelStore } from "@/stores/side-panel.store";

import type { ActionButton } from "@/stores/side-panel.store";

// ── Types ──────────────────────────────────────────────

interface EntityDashboardProps {
  entityId: string;
  onEdit: () => void;
  onClose: () => void;
}

interface EntityPanelConfig {
  /** Short key used for panel/form IDs, e.g. "contact", "lead", "invoice" */
  entityKey: string;
  /** Human-readable label, e.g. "Contact", "Lead" */
  entityLabel: string;
  /** The form component to render inside the panel */
  FormComponent: React.ComponentType<any>;
  /** Prop name for the entity ID on the form, e.g. "contactId", "leadId" */
  idProp: string;
  /** Edit route with :id placeholder, e.g. "/contacts/:id/edit" */
  editRoute: string;
  /** Create route, e.g. "/contacts/new" */
  createRoute: string;
  /** Row field used for panel title (default: "name") */
  displayField?: string;
  /** Optional header action buttons (e.g. Call/Email for contacts) */
  headerButtons?: ActionButton[];
  /** If true, panel shows viewContent instead of a form with only a Close button */
  viewOnly?: boolean;
  /** Content renderer for view-only panels */
  viewContent?: (row: Record<string, unknown>) => ReactNode;
  /** Dashboard component for view mode (row click opens dashboard instead of form) */
  DashboardComponent?: React.ComponentType<EntityDashboardProps>;
  /** Custom panel width for dashboard view (default 900) */
  dashboardWidth?: number;
  /** Custom panel width for create/edit forms (default uses CSS: 600px) */
  panelWidth?: number;
}

// ── Hook ───────────────────────────────────────────────

export function useEntityPanel(config: EntityPanelConfig) {
  const {
    entityKey,
    entityLabel,
    FormComponent,
    idProp,
    editRoute,
    createRoute,
    displayField = "name",
    headerButtons,
    viewOnly = false,
    viewContent,
    DashboardComponent,
    dashboardWidth = 900,
    panelWidth,
  } = config;

  const openPanel = useSidePanelStore((s) => s.openPanel);
  const closePanel = useSidePanelStore((s) => s.closePanel);

  const handleRowEdit = useCallback(
    (row: Record<string, unknown>) => {
      const id = row.id as string;
      const panelId = `${entityKey}-edit-${id}`;
      const formId = `sp-form-${entityKey}-${id}`;
      const display = (row[displayField] as string) || entityLabel;

      if (viewOnly && viewContent) {
        openPanel({
          id: panelId,
          title: `${entityLabel}: ${display}`,
          newTabUrl: editRoute.replace(":id", id),
          footerButtons: [
            { id: "close", label: "Close", showAs: "text", variant: "secondary", onClick: () => closePanel(panelId) },
          ],
          content: viewContent(row),
        });
        return;
      }

      const formProps: Record<string, unknown> = {
        [idProp]: id,
        mode: "panel",
        panelId,
        onSuccess: () => closePanel(panelId),
        onCancel: () => closePanel(panelId),
      };

      openPanel({
        id: panelId,
        title: `${entityLabel}: ${display}`,
        newTabUrl: editRoute.replace(":id", id),
        ...(panelWidth ? { width: panelWidth } : {}),
        ...(headerButtons ? { headerButtons } : {}),
        footerButtons: [
          { id: "cancel", label: "Cancel", showAs: "text", variant: "secondary", onClick: () => closePanel(panelId) },
          {
            id: "save",
            label: "Save Changes",
            icon: "check",
            showAs: "both",
            variant: "primary",
            onClick: () => {
              const form = document.getElementById(formId) as HTMLFormElement | null;
              form?.requestSubmit();
            },
          },
        ],
        content: <FormComponent {...formProps} />,
      });
    },
    [openPanel, closePanel, entityKey, entityLabel, FormComponent, idProp, editRoute, displayField, headerButtons, viewOnly, viewContent, panelWidth],
  );

  const handleCreate = useCallback(() => {
    if (viewOnly) return;

    const panelId = `${entityKey}-new`;
    const formId = `sp-form-${entityKey}-new`;

    const formProps: Record<string, unknown> = {
      mode: "panel",
      panelId,
      onSuccess: () => closePanel(panelId),
      onCancel: () => closePanel(panelId),
    };

    openPanel({
      id: panelId,
      title: `New ${entityLabel}`,
      newTabUrl: createRoute,
      ...(panelWidth ? { width: panelWidth } : {}),
      footerButtons: [
        { id: "cancel", label: "Cancel", showAs: "text", variant: "secondary", onClick: () => closePanel(panelId) },
        {
          id: "save",
          label: "Save",
          icon: "check",
          showAs: "both",
          variant: "primary",
          onClick: () => {
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
      content: <FormComponent {...formProps} />,
    });
  }, [openPanel, closePanel, entityKey, entityLabel, FormComponent, createRoute, viewOnly, panelWidth]);

  const handleRowView = useCallback(
    (row: Record<string, unknown>) => {
      if (!DashboardComponent) {
        handleRowEdit(row);
        return;
      }

      const id = row.id as string;
      const panelId = `${entityKey}-view-${id}`;
      const display = (row[displayField] as string) || entityLabel;
      const detailRoute = editRoute.replace(":id", id).replace("/edit", "");

      openPanel({
        id: panelId,
        title: `${entityLabel}: ${display}`,
        newTabUrl: detailRoute,
        width: dashboardWidth,
        noPadding: true,
        footerButtons: [
          {
            id: "close",
            label: "Close",
            showAs: "text",
            variant: "secondary",
            onClick: () => closePanel(panelId),
          },
          {
            id: "edit",
            label: "Edit Details",
            icon: "edit",
            showAs: "both",
            variant: "primary",
            onClick: () => {
              closePanel(panelId);
              handleRowEdit(row);
            },
          },
        ],
        content: (
          <DashboardComponent
            entityId={id}
            onEdit={() => {
              closePanel(panelId);
              handleRowEdit(row);
            }}
            onClose={() => closePanel(panelId)}
          />
        ),
      });
    },
    [openPanel, closePanel, entityKey, entityLabel, editRoute, displayField, dashboardWidth, DashboardComponent, handleRowEdit],
  );

  return { handleRowEdit, handleCreate, handleRowView };
}

// ── Content Panel Hook (read-only info/help panels) ───

interface ContentPanelConfig {
  id: string;
  title: string;
  content: ReactNode;
  icon?: string;
  width?: number;
}

export function useContentPanel() {
  const openPanel = useSidePanelStore((s) => s.openPanel);
  const closePanel = useSidePanelStore((s) => s.closePanel);

  const openContent = useCallback(
    (config: ContentPanelConfig) => {
      openPanel({
        id: config.id,
        title: config.title,
        icon: config.icon,
        width: config.width,
        footerButtons: [
          { id: "close", label: "Close", showAs: "text", variant: "secondary", onClick: () => closePanel(config.id) },
        ],
        content: config.content,
      });
    },
    [openPanel, closePanel],
  );

  const closeContent = useCallback(
    (id: string) => closePanel(id),
    [closePanel],
  );

  return { openContent, closeContent };
}
