const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007';

export function buildShareUrls(
  entityType: 'listing' | 'post' | 'offer',
  entityId: string,
  title: string,
) {
  const url = `${BASE_URL}/${entityType === 'listing' ? 'listings' : entityType === 'offer' ? 'offers' : 'feed'}/${entityId}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
  return { url, whatsapp };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function shareNative(title: string, url: string) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    return navigator.share({ title, url });
  }
  return Promise.reject(new Error('Native share not supported'));
}
