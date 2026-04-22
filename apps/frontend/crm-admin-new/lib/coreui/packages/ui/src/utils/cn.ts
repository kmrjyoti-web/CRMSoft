/**
 * className merger utility.
 * Combines conditional class names into a single string.
 */
export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[];

function flatten(arr: ClassValue[]): (string | number | boolean | undefined | null)[] {
  const result: (string | number | boolean | undefined | null)[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

export function cn(...inputs: ClassValue[]): string {
  return flatten(inputs)
    .filter(
      (v): v is string | number =>
        v !== null && v !== undefined && v !== false && v !== true,
    )
    .map(String)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
