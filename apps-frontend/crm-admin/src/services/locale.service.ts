'use server';

import { cookies } from 'next/headers';

export type Locale = 'en' | 'hi' | 'mr';

export async function setLocaleCookie(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('locale', locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  });
}
