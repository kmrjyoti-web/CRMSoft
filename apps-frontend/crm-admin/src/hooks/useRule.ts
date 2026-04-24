"use client";

import { useState, useEffect } from "react";

import { controlRoomCache } from "@/lib/control-room-cache";

/**
 * Read a single rule value from the Control Room cache (IndexedDB).
 * If `pageCode` is provided and the rule has a page-specific override, that value is returned.
 */
export function useRule(
  ruleCode: string,
  pageCode?: string,
): { value: unknown; isLoading: boolean } {
  const [value, setValue] = useState<unknown>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    controlRoomCache
      .getRule(ruleCode, pageCode)
      .then((v) => {
        if (!cancelled) {
          setValue(v);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ruleCode, pageCode]);

  return { value, isLoading };
}

/**
 * Read multiple rule values from the Control Room cache (IndexedDB).
 * Returns a record keyed by ruleCode.
 */
export function useRules(
  ruleCodes: string[],
): { values: Record<string, unknown>; isLoading: boolean } {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const result: Record<string, unknown> = {};

      await Promise.all(
        ruleCodes.map(async (code) => {
          const v = await controlRoomCache.getRule(code);
          result[code] = v;
        }),
      );

      if (!cancelled) {
        setValues(result);
        setIsLoading(false);
      }
    };

    load().catch(() => {
      if (!cancelled) {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [ruleCodes.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return { values, isLoading };
}
