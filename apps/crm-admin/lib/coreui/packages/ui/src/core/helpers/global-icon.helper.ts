// Pure TypeScript — no framework imports
// Source: core/ui-kit/angular/src/lib/helpers/global-icon.helper.ts

import { IconHelper } from "./icon.helper";
import type { IconName } from "../models/icon.types";

export type IconType = "fontawesome" | "prime" | "material" | "svg";

export interface IconDefinition {
  fontawesome?: string;
  prime?: string;
  material?: string;
  svg?: string;
}

export const ICON_MAP: Record<string, IconDefinition> = {
  sync: { prime: "pi pi-sync", fontawesome: "fa-solid fa-sync", material: "sync" },
  spinner: { prime: "pi pi-spin pi-spinner", fontawesome: "fa-solid fa-spinner fa-spin", material: "autorenew" },
  filter: { prime: "pi pi-filter", fontawesome: "fa-solid fa-filter", material: "filter_list" },
  tag: { prime: "pi pi-tag", fontawesome: "fa-solid fa-tag", material: "local_offer" },
  table: { prime: "pi pi-table", fontawesome: "fa-solid fa-table", material: "table_chart" },
  freeze: { prime: "pi pi-snowflake", fontawesome: "fa-regular fa-snowflake", material: "ac_unit" },
  columns: { prime: "pi pi-th-large", fontawesome: "fa-solid fa-table-columns", material: "view_column" },
  database: { prime: "pi pi-database", fontawesome: "fa-solid fa-database", material: "storage" },
  download: { prime: "pi pi-download", fontawesome: "fa-solid fa-download", material: "download" },
  eye: { prime: "pi pi-eye", fontawesome: "fa-regular fa-eye", material: "visibility" },
  sparkles: { prime: "pi pi-sparkles", fontawesome: "fa-solid fa-wand-magic-sparkles", material: "auto_awesome" },
  add: { prime: "pi pi-plus", fontawesome: "fa-solid fa-plus", material: "add" },
  search: { prime: "pi pi-search", fontawesome: "fa-solid fa-search", material: "search" },
  "chevron-down": { prime: "pi pi-chevron-down", fontawesome: "fa-solid fa-chevron-down", material: "expand_more" },
  calendar: { prime: "pi pi-calendar", fontawesome: "fa-regular fa-calendar", material: "calendar_today" },
  user: { prime: "pi pi-user", fontawesome: "fa-regular fa-user", material: "person" },
  check: { prime: "pi pi-check", fontawesome: "fa-solid fa-check", material: "check" },
  times: { prime: "pi pi-times", fontawesome: "fa-solid fa-times", material: "close" },
  trash: { prime: "pi pi-trash", fontawesome: "fa-solid fa-trash", material: "delete" },
  pencil: { prime: "pi pi-pencil", fontawesome: "fa-solid fa-pencil", material: "edit" },
  refresh: { prime: "pi pi-refresh", fontawesome: "fa-solid fa-rotate", material: "refresh" },
  home: { prime: "pi pi-home", fontawesome: "fa-solid fa-home", material: "home" },
  cog: { prime: "pi pi-cog", fontawesome: "fa-solid fa-cog", material: "settings" },
  envelope: { prime: "pi pi-envelope", fontawesome: "fa-solid fa-envelope", material: "email" },
  lock: { prime: "pi pi-lock", fontawesome: "fa-solid fa-lock", material: "lock" },
  folder: { prime: "pi pi-folder", fontawesome: "fa-solid fa-folder", material: "folder" },
  file: { prime: "pi pi-file", fontawesome: "fa-solid fa-file", material: "description" },
  list: { prime: "pi pi-list", fontawesome: "fa-solid fa-list", material: "list" },
  bars: { prime: "pi pi-bars", fontawesome: "fa-solid fa-bars", material: "menu" },
  "ellipsis-v": { prime: "pi pi-ellipsis-v", fontawesome: "fa-solid fa-ellipsis-vertical", material: "more_vert" },
  "ellipsis-h": { prime: "pi pi-ellipsis-h", fontawesome: "fa-solid fa-ellipsis", material: "more_horiz" },
};

export class GlobalIconHelper {
  static getIcon(
    name: string,
    type: IconType = "prime",
  ): { class?: string; content?: string; type: IconType } {
    if (!name) return { class: "", type };

    const def = ICON_MAP[name];

    // If no definition found, but name exists in SVG helper, try to use that if type is svg
    if (!def) {
      if (type === "svg" && IconHelper[name as IconName]) {
        return { content: IconHelper[name as IconName], type: "svg" };
      }
      return { class: "", type };
    }

    // Explicit request
    if (type === "prime" && def.prime) return { class: def.prime, type: "prime" };
    if (type === "fontawesome" && def.fontawesome) return { class: def.fontawesome, type: "fontawesome" };
    if (type === "material" && def.material) return { class: def.material, type: "material" };
    if (type === "svg" && def.svg) return { content: def.svg, type: "svg" };

    // Fallback logic (ordering: Prime -> FontAwesome -> Material -> SVG)
    if (def.prime) return { class: def.prime, type: "prime" };
    if (def.fontawesome) return { class: def.fontawesome, type: "fontawesome" };
    if (def.material) return { class: def.material, type: "material" };
    if (def.svg) return { content: def.svg, type: "svg" };

    return { class: "", type };
  }
}
