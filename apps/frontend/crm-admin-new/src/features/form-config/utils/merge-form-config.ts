import type { FormFieldConfig, FormConfigData } from "./form-registry";

/**
 * Merge saved form config with system defaults.
 * - Keeps only fields that exist in system defaults (removes stale overrides).
 * - Preserves user label + visibility overrides.
 * - Required fields are always forced visible.
 * - New system fields (not in saved) use defaults.
 */
export function mergeFormConfig(
  saved: FormConfigData | null | undefined,
  systemDefaults: FormFieldConfig[],
): FormFieldConfig[] {
  if (!saved?.fields?.length) return systemDefaults;

  const savedMap = new Map(saved.fields.map((f) => [f.id, f]));
  const result: FormFieldConfig[] = [];

  for (const def of systemDefaults) {
    const override = savedMap.get(def.id);
    if (override) {
      result.push({
        ...def,
        label: override.label || def.label,
        visible: def.required ? true : (override.visible ?? def.visible),
      });
    } else {
      result.push(def);
    }
  }

  return result;
}
