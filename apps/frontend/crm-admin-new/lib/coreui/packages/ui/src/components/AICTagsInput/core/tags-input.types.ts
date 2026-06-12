/**
 * TagsInput component types.
 * Framework-agnostic.
 * Source: Angular tags-input.component.ts
 */

export interface TagsInputProps<OnChange = (tags: string[]) => void> {
  /** Current tags array. */
  value?: string[];
  /** Default tags for uncontrolled usage. */
  defaultValue?: string[];
  /** Placeholder text. */
  placeholder?: string;
  /** Maximum number of tags allowed. */
  maxTags?: number;
  /** Minimum tag length. */
  minLength?: number;
  /** Maximum tag length. */
  maxLength?: number;
  /** Autocomplete suggestions. */
  suggestions?: string[];
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Label text. */
  label?: string;
  /** Additional CSS class name(s). */
  className?: string;
  /** Change handler. */
  onChange?: OnChange;
}
