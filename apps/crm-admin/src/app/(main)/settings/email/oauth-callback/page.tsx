'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui';
import { useOAuthCallback } from '@/features/settings/hooks/useEmailConfig';

export default function OAuthCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing OAuth authorization...');
  const oauthCallbackMutation = useOAuthCallback();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    // Determine provider from the URL or referrer
    const isOutlook = window.location.href.includes('session_state') || params.has('session_state');
    const provider: 'GMAIL' | 'OUTLOOK' = isOutlook ? 'OUTLOOK' : 'GMAIL';

    if (error) {
      setStatus('error');
      setMessage(`Authorization denied: ${error}`);
      notifyOpener(provider, false, `Authorization denied: ${error}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      notifyOpener(provider, false, 'No authorization code received');
      return;
    }

    // Exchange code for tokens via backend
    oauthCallbackMutation
      .mutateAsync({ code, provider })
      .then(() => {
        setStatus('success');
        setMessage(`${provider === 'GMAIL' ? 'Gmail' : 'Outlook'} account connected successfully!`);
        notifyOpener(provider, true);
        // Auto-close popup after brief delay
        setTimeout(() => window.close(), 2000);
      })
      .catch(() => {
        setStatus('error');
        setMessage('Failed to connect account. Please try again.');
        notifyOpener(provider, false, 'Failed to exchange authorization code');
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
            <h2 className="text-lg font-semibold text-gray-900">Connecting Account</h2>
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

function notifyOpener(provider: string, success: boolean, error?: string) {
  if (window.opener) {
    window.opener.postMessage(
      { type: 'oauth-callback', provider, success, error },
      window.location.origin,
    );
  }
}
