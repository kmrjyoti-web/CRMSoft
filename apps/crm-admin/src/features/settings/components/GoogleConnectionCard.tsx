'use client';

import { useCallback, useMemo, useState } from 'react';

import toast from 'react-hot-toast';

import { Button, Icon, Badge } from '@/components/ui';

import { useCredentials } from '../hooks/useIntegrations';
import { useGoogleOAuthInitiate, useGoogleDisconnect } from '../hooks/useGoogleIntegration';

import type { GoogleServiceId, GoogleConnectionStatus } from '../types/google-integration.types';

interface GoogleConnectionCardProps {
  connectionStatus?: GoogleConnectionStatus;
  selectedServices: GoogleServiceId[];
  onConnected: () => void;
}

export function GoogleConnectionCard({
  connectionStatus,
  selectedServices,
  onConnected,
}: GoogleConnectionCardProps) {
  const [connecting, setConnecting] = useState(false);
  const initiateMut = useGoogleOAuthInitiate();
  const disconnectMut = useGoogleDisconnect();

  // Check if Google OAuth credentials are configured at tenant level
  const { data: credentialsResponse } = useCredentials();
  const hasGoogleCreds = useMemo(() => {
    const raw = (credentialsResponse as any)?.data ?? credentialsResponse ?? [];
    const items = Array.isArray(raw) ? raw : [];
    return items.some(
      (c: any) =>
        (c.provider === 'GMAIL' || c.provider === 'GOOGLE') && c.status === 'ACTIVE',
    );
  }, [credentialsResponse]);

  const isConnected = connectionStatus?.isConnected ?? false;

  const handleConnect = useCallback(async () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one Google service');
      return;
    }

    try {
      setConnecting(true);

      // Store selected services for the callback page
      localStorage.setItem('google-oauth-services', JSON.stringify(selectedServices));

      const result = await initiateMut.mutateAsync({ services: selectedServices });
      const authUrl = result.data?.authUrl;

      if (!authUrl) {
        toast.error('Failed to generate OAuth URL. Check server configuration.');
        return;
      }

      // Open OAuth popup (same pattern as EmailConfigForm)
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        authUrl,
        'google_oauth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`,
      );

      if (!popup) {
        window.location.href = authUrl;
        return;
      }

      // Listen for callback message
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'google-oauth-callback') {
          window.removeEventListener('message', handleMessage);
          setConnecting(false);
          if (event.data.success) {
            toast.success('Google account connected successfully');
            onConnected();
          } else {
            toast.error(event.data.error || 'Google OAuth connection failed');
          }
        }
      };
      window.addEventListener('message', handleMessage);

      // Poll for popup close
      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval);
          setConnecting(false);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
    } catch {
      toast.error('Failed to initiate Google OAuth');
      setConnecting(false);
    }
  }, [selectedServices, initiateMut, onConnected]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnectMut.mutateAsync();
      toast.success('Google account disconnected');
      onConnected();
    } catch {
      toast.error('Failed to disconnect');
    }
  }, [disconnectMut, onConnected]);

  // Connected state
  if (isConnected && connectionStatus) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {connectionStatus.googleAvatar ? (
              <img
                src={connectionStatus.googleAvatar}
                alt=""
                style={{ width: 44, height: 44, borderRadius: '50%' }}
              />
            ) : (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#4285F4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {(connectionStatus.googleName ?? connectionStatus.googleEmail ?? 'G')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p style={{ fontWeight: 600, fontSize: 15, color: '#1e293b' }}>
                {connectionStatus.googleName ?? 'Google Account'}
              </p>
              <p style={{ fontSize: 13, color: '#64748b' }}>
                {connectionStatus.googleEmail}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge variant="success">Connected</Badge>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDisconnect}
              disabled={disconnectMut.isPending}
            >
              Disconnect
            </Button>
          </div>
        </div>
        {connectionStatus.connectedAt && (
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
            Connected since {new Date(connectionStatus.connectedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    );
  }

  // Disconnected state
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      {/* Warning if no Google OAuth credentials */}
      {!hasGoogleCreds && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 mb-4">
          <Icon name="alert-triangle" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Google OAuth credentials not configured
            </p>
            <p className="text-xs text-amber-600 mt-1">
              An admin must first add Google API credentials in{' '}
              <a href="/settings/integrations" className="underline font-medium">
                Settings &gt; Integrations
              </a>{' '}
              before OAuth sign-in can work.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: '#4285F4' }}
        >
          <Icon name="globe" size={24} color="#fff" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Sign in with Google</p>
          <p className="text-xs text-gray-500">
            OAuth 2.0 — Connect once to enable selected Google services
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleConnect}
          disabled={connecting || !hasGoogleCreds || selectedServices.length === 0}
        >
          <Icon name="external-link" size={14} />
          {connecting ? 'Connecting...' : 'Sign in with Google'}
        </Button>
      </div>

      {selectedServices.length === 0 && (
        <p className="text-xs text-amber-600 mt-3">
          <Icon name="info" size={12} className="inline mr-1" />
          Select at least one service above to connect.
        </p>
      )}

      <p className="text-xs text-gray-400 mt-3">
        <Icon name="shield" size={12} className="inline mr-1" />
        Your credentials are never stored. We use OAuth tokens that can be revoked at any time
        from your Google account settings.
      </p>
    </div>
  );
}
