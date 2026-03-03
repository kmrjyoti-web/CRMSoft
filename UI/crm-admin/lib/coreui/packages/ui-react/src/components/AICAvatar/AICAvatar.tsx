/**
 * React AICAvatar component.
 * Thin wrapper around the framework-agnostic core from @coreui/ui.
 */

import React, { useReducer, useCallback, useEffect } from "react";

import {
  getAvatarStyles,
  getAvatarImageStyles,
  getAvatarFallbackStyles,
  getAvatarStatusStyles,
  getAvatarFallbackText,
  getAvatarA11yProps,
  getAvatarImageA11yProps,
  avatarReducer,
  initialAvatarState,
  shouldShowFallback,
} from "@coreui/ui";

import type {
  AvatarSize,
  AvatarShape,
  AvatarStatus,
} from "@coreui/ui";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * React-specific AICAvatar props.
 * The component also accepts all native `<div>` HTML attributes.
 */
export interface AvatarProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "children"
  > {
  /** Image source URL. */
  src?: string;
  /** Alt text for the image. */
  alt?: string;
  /** Fallback text (e.g. user initials) shown when image is not available. */
  fallback?: string;
  /** Size preset. */
  size?: AvatarSize;
  /** Shape of the avatar. */
  shape?: AvatarShape;
  /** Online presence status indicator dot. */
  status?: AvatarStatus;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** AICAvatar content (overrides default rendering if provided). */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Design-system AICAvatar built on the shared core logic from `@coreui/ui`.
 *
 * Uses `React.forwardRef` so consumers can attach refs to the underlying
 * DOM element.
 */
export const AICAvatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (props, ref) => {
    const {
      src,
      alt,
      fallback,
      size = "md",
      shape = "circle",
      status,
      ariaLabel,
      children,
      className,
      ...rest
    } = props;

    // -----------------------------------------------------------------------
    // Internal interaction state
    // -----------------------------------------------------------------------

    const [internalState, dispatch] = useReducer(
      avatarReducer,
      initialAvatarState,
    );

    // Reset image state when src changes
    useEffect(() => {
      dispatch({ type: "IMAGE_RESET" });
    }, [src]);

    // -----------------------------------------------------------------------
    // Styles & a11y
    // -----------------------------------------------------------------------

    const containerClasses = getAvatarStyles({
      size,
      shape,
      className,
    });

    const imageClasses = getAvatarImageStyles();
    const fallbackClasses = getAvatarFallbackStyles();

    const a11yProps = getAvatarA11yProps({
      alt,
      ariaLabel,
    });

    const imageA11yProps = getAvatarImageA11yProps(alt);

    const showFallback = shouldShowFallback(internalState.imageState, src);
    const fallbackText = getAvatarFallbackText(fallback, alt);

    // -----------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------

    const handleImageLoad = useCallback(() => {
      dispatch({ type: "IMAGE_LOAD" });
    }, []);

    const handleImageError = useCallback(() => {
      dispatch({ type: "IMAGE_ERROR" });
    }, []);

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={containerClasses}
        {...a11yProps}
        {...rest}
      >
        {/* Custom children override */}
        {children ? (
          children
        ) : (
          <>
            {/* Image */}
            {src && !showFallback && (
              <img
                src={src}
                className={imageClasses}
                onLoad={handleImageLoad}
                onError={handleImageError}
                {...imageA11yProps}
              />
            )}

            {/* Hidden image for loading detection when src exists but loading */}
            {src && internalState.imageState === "loading" && (
              <img
                src={src}
                className="sr-only"
                onLoad={handleImageLoad}
                onError={handleImageError}
                alt=""
                aria-hidden="true"
              />
            )}

            {/* Fallback initials */}
            {showFallback && fallbackText && (
              <span className={fallbackClasses}>
                {fallbackText}
              </span>
            )}

            {/* Empty fallback (no text, no image) */}
            {showFallback && !fallbackText && (
              <span className={fallbackClasses}>
                <svg
                  className="h-[60%] w-[60%] text-[var(--color-text-muted)]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
            )}
          </>
        )}

        {/* Status indicator */}
        {status && (
          <span
            className={getAvatarStatusStyles({ status, size, shape })}
            aria-hidden="true"
          />
        )}
      </div>
    );
  },
);

AICAvatar.displayName = "AICAvatar";
