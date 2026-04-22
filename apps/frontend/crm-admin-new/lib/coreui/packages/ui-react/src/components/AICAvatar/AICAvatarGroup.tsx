/**
 * React AICAvatarGroup component.
 * Renders a stack of AICAvatar components with optional overflow indicator.
 */

import React from "react";

import {
  getAvatarGroupStyles,
  getAvatarOverflowStyles,
  getAvatarGroupA11yProps,
} from "@coreui/ui";

import type {
  AvatarSize,
  AvatarGroupSpacing,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICAvatarGroup props.
 */
export interface AvatarGroupProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "children"
  > {
  /** Maximum number of avatars to show before the overflow indicator. */
  max?: number;
  /** Size preset applied to all child avatars. */
  size?: AvatarSize;
  /** Spacing between stacked avatars. */
  spacing?: AvatarGroupSpacing;
  /** AICAvatar children. */
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICAvatarGroup that stacks AICAvatar components with negative
 * margin overlap and shows a +N overflow indicator when `max` is exceeded.
 */
export const AICAvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (props, ref) => {
    const {
      max,
      size = "md",
      spacing = "normal",
      children,
      className,
      ...rest
    } = props;

    // -----------------------------------------------------------------------
    // Compute visible / overflow children
    // -----------------------------------------------------------------------

    const childArray = React.Children.toArray(children);
    const totalCount = childArray.length;

    const visibleChildren =
      max !== undefined && max < totalCount
        ? childArray.slice(0, max)
        : childArray;

    const overflowCount =
      max !== undefined && max < totalCount
        ? totalCount - max
        : 0;

    // -----------------------------------------------------------------------
    // Styles & a11y
    // -----------------------------------------------------------------------

    const containerClasses = getAvatarGroupStyles({
      spacing,
      className,
    });

    const overflowClasses = getAvatarOverflowStyles({
      size,
    });

    const groupA11yProps = getAvatarGroupA11yProps(totalCount);

    // -----------------------------------------------------------------------
    // Clone children with ring border for stacking
    // -----------------------------------------------------------------------

    const styledChildren = visibleChildren.map((child, index) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(
          child as React.ReactElement<{ className?: string; size?: AvatarSize }>,
          {
            key: index,
            className: `ring-2 ring-[var(--color-bg)] ${
              (child as React.ReactElement<{ className?: string }>).props.className || ""
            }`.trim(),
            size,
          },
        );
      }
      return child;
    });

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={containerClasses}
        {...groupA11yProps}
        {...rest}
      >
        {styledChildren}

        {/* Overflow indicator */}
        {overflowCount > 0 && (
          <span className={overflowClasses}>
            +{overflowCount}
          </span>
        )}
      </div>
    );
  },
);

AICAvatarGroup.displayName = "AICAvatarGroup";
