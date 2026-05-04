/**
 * Avatar props validation schema (Zod).
 * Framework-agnostic — no React/Angular imports.
 *
 * Provides runtime validation and default resolution for the subset of
 * Avatar props that carry default values.
 */

import { z } from "zod";
import type { AvatarProps, AvatarGroupProps } from "./avatar.types";

// ---------------------------------------------------------------------------
// Avatar Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the serialisable / defaultable portion of `AvatarProps`.
 */
export const avatarPropsSchema = z.object({
  size: z
    .enum(["xs", "sm", "md", "lg", "xl"])
    .default("md"),
  shape: z
    .enum(["circle", "square"])
    .default("circle"),
});

/** Inferred input type (all fields optional thanks to `.default()`). */
export type AvatarPropsSchemaInput = z.input<typeof avatarPropsSchema>;

/** Inferred output type (all defaults resolved, every field required). */
export type AvatarPropsSchemaOutput = z.output<typeof avatarPropsSchema>;

/**
 * Parses a partial set of avatar props through the Zod schema, filling in
 * any missing values with their defined defaults.
 *
 * @param props - Partial props.
 * @returns Fully resolved props with all defaults applied.
 */
export function resolveAvatarDefaults(
  props?: Partial<AvatarProps>,
): AvatarPropsSchemaOutput {
  return avatarPropsSchema.parse(props ?? {});
}

// ---------------------------------------------------------------------------
// AvatarGroup Schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for the serialisable / defaultable portion of `AvatarGroupProps`.
 */
export const avatarGroupPropsSchema = z.object({
  max: z.number().int().positive().optional(),
  size: z
    .enum(["xs", "sm", "md", "lg", "xl"])
    .default("md"),
  spacing: z
    .enum(["tight", "normal", "loose"])
    .default("normal"),
});

/** Inferred input type. */
export type AvatarGroupPropsSchemaInput = z.input<typeof avatarGroupPropsSchema>;

/** Inferred output type. */
export type AvatarGroupPropsSchemaOutput = z.output<typeof avatarGroupPropsSchema>;

/**
 * Parses a partial set of avatar group props through the Zod schema.
 *
 * @param props - Partial props.
 * @returns Fully resolved props with all defaults applied.
 */
export function resolveAvatarGroupDefaults(
  props?: Partial<AvatarGroupProps>,
): AvatarGroupPropsSchemaOutput {
  return avatarGroupPropsSchema.parse(props ?? {});
}
