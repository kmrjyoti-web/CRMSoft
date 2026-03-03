/**
 * React AICRating component.
 * Star rating with hover preview, half-star, custom icons, readonly.
 * Source: Angular rating.component.ts
 */

import React, { useCallback, useState } from "react";
import {
  cn,
  generateStars,
  isStarFilled,
  isStarHalf,
  computeRatingFromEvent,
  ratingSizeStyles,
} from "@coreui/ui";
import type { RatingSize } from "@coreui/ui";

export interface RatingProps {
  value?: number;
  defaultValue?: number;
  max?: number;
  readonly?: boolean;
  disabled?: boolean;
  allowHalf?: boolean;
  icon?: React.ReactNode;
  size?: RatingSize;
  label?: string;
  className?: string;
  onChange?: (value: number) => void;
}

export const AICRating = React.forwardRef<HTMLDivElement, RatingProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = 0,
      max = 5,
      readonly = false,
      disabled = false,
      allowHalf = false,
      icon,
      size = "md",
      label,
      className,
      onChange,
    } = props;

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [hoverValue, setHoverValue] = useState(0);
    const currentValue = isControlled ? controlledValue : internalValue;
    const stars = generateStars(max);
    const sizeConfig = ratingSizeStyles[size];

    const handleClick = useCallback(
      (star: number, e: React.MouseEvent) => {
        if (readonly || disabled) return;
        const rating = computeRatingFromEvent(
          star,
          allowHalf,
          e.nativeEvent.offsetX,
          (e.target as HTMLElement).getBoundingClientRect().width,
        );
        if (!isControlled) {
          setInternalValue(rating);
        }
        onChange?.(rating);
      },
      [readonly, disabled, allowHalf, isControlled, onChange],
    );

    const handleMouseEnter = useCallback(
      (star: number) => {
        if (readonly || disabled) return;
        setHoverValue(star);
      },
      [readonly, disabled],
    );

    const handleMouseLeave = useCallback(() => {
      setHoverValue(0);
    }, []);

    const defaultStarSvg = (filled: boolean, half: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={filled || half ? "currentColor" : "none"}
        stroke={!filled && !half ? "currentColor" : "none"}
        strokeWidth={!filled && !half ? 1.5 : 0}
        className={sizeConfig.icon}
      >
        <path
          fillRule="evenodd"
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
          clipRule="evenodd"
        />
      </svg>
    );

    return (
      <div className={cn("relative", className)} ref={ref} data-testid="rating">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            {label}
          </label>
        )}

        <div
          className="flex items-center gap-1"
          onMouseLeave={handleMouseLeave}
          data-testid="rating-stars"
        >
          {stars.map((star) => {
            const filled = isStarFilled(star, hoverValue, currentValue);
            const half = allowHalf && isStarHalf(star, hoverValue, currentValue);
            return (
              <button
                key={star}
                type="button"
                onClick={(e) => handleClick(star, e)}
                onMouseEnter={() => handleMouseEnter(star)}
                className={cn(
                  "focus:outline-none transition-transform active:scale-95",
                  filled ? "text-yellow-400" : "text-gray-300",
                  (readonly || disabled) && "cursor-default",
                  !readonly && !disabled && "cursor-pointer",
                )}
                disabled={disabled}
                title={`${star} stars`}
                data-testid={`rating-star-${star}`}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                {icon || defaultStarSvg(filled, half)}
              </button>
            );
          })}

          {currentValue > 0 && (
            <span
              className={cn(
                "ml-2 font-medium text-[var(--color-text-tertiary)] min-w-[3rem]",
                sizeConfig.text,
              )}
              data-testid="rating-value"
            >
              {hoverValue > 0 ? hoverValue : currentValue} / {max}
            </span>
          )}
        </div>
      </div>
    );
  },
);

AICRating.displayName = "AICRating";
