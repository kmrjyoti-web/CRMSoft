/**
 * TagsInput state logic and pure helper functions.
 * Framework-agnostic.
 * Source: Angular tags-input.component.ts
 */

/** Add a tag if not duplicate and within limits. Returns new array or same if blocked. */
export function addTag(
  tags: string[],
  value: string,
  maxTags?: number,
  minLength?: number,
  maxLength?: number,
): string[] {
  const trimmed = value.trim();
  if (!trimmed) return tags;
  if (minLength && trimmed.length < minLength) return tags;
  if (maxLength && trimmed.length > maxLength) return tags;
  if (tags.includes(trimmed)) return tags; // duplicate prevention
  if (maxTags && tags.length >= maxTags) return tags;
  return [...tags, trimmed];
}

/** Remove a tag at given index. */
export function removeTag(tags: string[], index: number): string[] {
  return tags.filter((_, i) => i !== index);
}

/** Remove the last tag (backspace on empty input). */
export function removeLastTag(tags: string[]): string[] {
  if (tags.length === 0) return tags;
  return tags.slice(0, -1);
}

/** Filter suggestions based on input and existing tags. */
export function filterSuggestions(
  suggestions: string[],
  query: string,
  existingTags: string[],
): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return suggestions.filter(
    (s) => s.toLowerCase().includes(q) && !existingTags.includes(s),
  );
}

/** Check if tag can be added (for UI feedback). */
export function canAddTag(
  tags: string[],
  value: string,
  maxTags?: number,
): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (tags.includes(trimmed)) return false;
  if (maxTags && tags.length >= maxTags) return false;
  return true;
}
