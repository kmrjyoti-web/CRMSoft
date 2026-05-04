"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { authService } from "@/features/auth/services/auth.service";
import { setAuthCookie, clearAuthCookie } from "@/features/auth/utils/auth-cookies";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Auto-login: if a token exists in the Zustand store (persisted in
 * localStorage) but the user profile hasn't been loaded yet, fetch it.
 * Also keeps the auth cookie in sync for the Next.js middleware.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, user } = useAuthStore();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    if (!token || !isAuthenticated) return;
    if (user?.id) return; // profile already loaded

    attemptedRef.current = true;

    // Sync cookie with existing localStorage token
    setAuthCookie(token);

    authService.getProfile().catch(() => {
      // Token expired and refresh also failed — clear everything
      useAuthStore.getState().clearAuth();
      clearAuthCookie();
    });
  }, [token, isAuthenticated, user]);

  return <>{children}</>;
}
