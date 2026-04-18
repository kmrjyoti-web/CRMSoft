'use client';

import { useState, useCallback, useMemo } from 'react';

import { Button, Icon, Fieldset } from '@/components/ui';

import { useGoogleStatus, useGoogleSync } from '../hooks/useGoogleIntegration';

import { GOOGLE_SERVICES } from '../utils/google-services';
import { GoogleConnectionCard } from './GoogleConnectionCard';
import { GoogleServiceCard } from './GoogleServiceCard';
import { GoogleCalendarSettings } from './GoogleCalendarSettings';
import { GoogleContactsSettings } from './GoogleContactsSettings';

import type { GoogleServiceId } from '../types/google-integration.types';

export function GoogleIntegration() {
  const [selectedServices, setSelectedServices] = useState<GoogleServiceId[]>([
    'gmail',
    'calendar',
    'docs',
    'meet',
    'contacts',
  ]);

  const { data: statusData, refetch } = useGoogleStatus();
  const syncMut = useGoogleSync();

  const connectionStatus = statusData?.data;
  const isConnected = connectionStatus?.isConnected ?? false;

  const enabledServices = useMemo(() => {
    if (!connectionStatus?.services) return new Set<GoogleServiceId>();
    return new Set(
      connectionStatus.services
        .filter((s) => s.enabled)
        .map((s) => s.serviceId),
    );
  }, [connectionStatus]);

  const getServiceStatus = useCallback(
    (id: GoogleServiceId) =>
      connectionStatus?.services?.find((s) => s.serviceId === id),
    [connectionStatus],
  );

  const toggleService = (id: GoogleServiceId, checked: boolean) => {
    setSelectedServices((prev) =>
      checked ? [...prev, id] : prev.filter((s) => s !== id),
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Google Integration
        </h1>
        <p className="text-sm text-gray-500">
          Connect your Google account and enable the services you need
        </p>
      </div>

      {/* Service Selection (before connection) */}
      {!isConnected && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            <Icon name="check-square" size={18} className="inline mr-2 text-gray-500" />
            Select Services
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Choose which Google services you want to connect. You can change this later.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GOOGLE_SERVICES.map((svc) => (
              <GoogleServiceCard
                key={svc.id}
                meta={svc}
                selectable
                selected={selectedServices.includes(svc.id)}
                onToggle={(checked) => toggleService(svc.id, checked)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Connection Card */}
      <GoogleConnectionCard
        connectionStatus={connectionStatus}
        selectedServices={selectedServices}
        onConnected={() => refetch()}
      />

      {/* Connected Services */}
      {isConnected && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            <Icon name="zap" size={18} className="inline mr-2 text-gray-500" />
            Connected Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GOOGLE_SERVICES.filter((svc) => enabledServices.has(svc.id)).map(
              (svc) => (
                <GoogleServiceCard
                  key={svc.id}
                  meta={svc}
                  status={getServiceStatus(svc.id)}
                  onSync={() => syncMut.mutate(svc.id)}
                  syncing={syncMut.isPending}
                />
              ),
            )}
          </div>
        </div>
      )}

      {/* Calendar Settings */}
      {isConnected && enabledServices.has('calendar') && (
        <Fieldset title="Calendar Sync Settings">
          <GoogleCalendarSettings />
        </Fieldset>
      )}

      {/* Contacts Settings */}
      {isConnected && enabledServices.has('contacts') && (
        <Fieldset title="Contacts Sync Settings">
          <GoogleContactsSettings />
        </Fieldset>
      )}

      {/* Manage Services (reconnect with different scopes) */}
      {isConnected && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Manage Services</p>
            <p className="text-sm text-gray-500">
              Need to add or remove Google services? Re-authenticate to update permissions.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              // Reset to selection mode by showing service cards
              setSelectedServices(
                Array.from(enabledServices) as GoogleServiceId[],
              );
            }}
          >
            Manage Google Services
          </Button>
        </div>
      )}
    </div>
  );
}
