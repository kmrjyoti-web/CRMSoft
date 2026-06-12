const COOKIE_NAME = "crm-token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function setAuthCookie(token: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? ";Secure" : "";
  document.cookie = `${COOKIE_NAME}=${token};path=/;max-age=${MAX_AGE};SameSite=Lax${secure}`;
}

export function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=;path=/;max-age=0`;
}
