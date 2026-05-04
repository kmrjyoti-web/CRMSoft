import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth.store";

interface TermEntry {
  singular: string;
  plural: string;
  icon?: string;
}

/**
 * Hook to get industry-specific terminology.
 * Uses the terminology stored in auth store (loaded on login).
 * Falls back to default entity names.
 *
 * Usage:
 *   const { t, icon } = useTerminology();
 *   <h1>{t('product', 'plural')}</h1>  // "Menu Items" for restaurant
 */
export function useTerminology() {
  const terminology = useAuthStore((s) => s.terminology);

  return useMemo(() => ({
    /**
     * Get label for an entity.
     * @param entity - "product", "lead", "contact", "quotation", "invoice", "organization", "activity"
     * @param form - "singular" or "plural" (default: "singular")
     */
    t: (entity: string, form: 'singular' | 'plural' = 'singular'): string => {
      if (!terminology) return capitalize(entity);

      // Check for full TermEntry object format: { singular, plural, icon }
      const entry = terminology[entity];
      if (entry && typeof entry === 'object' && (entry as TermEntry)[form]) {
        return (entry as TermEntry)[form];
      }

      // Legacy format: simple key->value ("Product" -> "Menu Item")
      const key = capitalize(entity);
      if (terminology[key] && typeof terminology[key] === 'string') {
        return terminology[key] as string;
      }

      return capitalize(entity);
    },

    /**
     * Get icon override for an entity.
     */
    icon: (entity: string): string | undefined => {
      if (!terminology) return undefined;
      const entry = terminology[entity];
      if (entry && typeof entry === 'object' && (entry as TermEntry).icon) {
        return (entry as TermEntry).icon;
      }
      return undefined;
    },

    /** Raw terminology map */
    raw: terminology,
  }), [terminology]);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
