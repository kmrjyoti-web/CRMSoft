'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui';
import { useGoogleOAuthCallback } from '@/features/settings/hooks/useGoogleIntegration';
import type { GoogleServiceId } from '@/features/settings/types/google-integration.types';

export default function GoogleOAuthCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing Google authorization...');
  const callbackMutation = useGoogleOAuthCallback();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    // Read selected services from localStorage (set before popup opened)
    const servicesJson = localStorage.getItem('google-oauth-services');
    const services: GoogleServiceId[] = servicesJson ? JSON.parse(servicesJson) : [];
    localStorage.removeItem('google-oauth-services');

    if (error) {
      setStatus('error');
      setMessage(`Authorization denied: ${error}`);
      notifyOpener(false, `Authorization denied: ${error}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      notifyOpener(false, 'No authorization code received');
      return;
    }

    callbackMutation
      .mutateAsync({ code, services })
      .then(() => {
        setStatus('success');
        setMessage('Google account connected successfully!');
        notifyOpener(true);
        setTimeout(() => window.close(), 2000);
      })
      .catch(() => {
        setStatus('error');
        setMessage('Failed to connect account. Please try again.');
        notifyOpener(false, 'Failed to exchange authorization code');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        {status === 'processing' && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <Icon name="loader" size={24} className="animate-spin text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Connecting Google Account</h2>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <Icon name="check-circle" size={24} color="#10b981" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Connected!</h2>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            <p className="mt-3 text-xs text-gray-400">This window will close automatically...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Icon name="x-circle" size={24} color="#ef4444" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Connection Failed</h2>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            <button
              className="mt-4 text-sm text-blue-500 hover:underline"
              onClick={() => window.close()}
            >
              Close this window
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function notifyOpener(success: boolean, error?: string) {
  if (window.opener) {
    window.opener.postMessage(
      { type: 'google-oauth-callback', success, error },
      window.location.origin,
    );
  }
}
