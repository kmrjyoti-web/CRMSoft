import React from 'react';

let MapContainer: any;
let TileLayer: any;
let Marker: any;
let Popup: any;
let L: any;

if (typeof window !== 'undefined') {
  try {
    const rl = require('react-leaflet');
    MapContainer = rl.MapContainer;
    TileLayer = rl.TileLayer;
    Marker = rl.Marker;
    Popup = rl.Popup;
    L = require('leaflet');

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  } catch {
    // react-leaflet not installed — MapView will show a fallback
  }
}

// Error boundary to catch react-leaflet context consumer crashes
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
          <div className="text-center">
            <p className="font-medium mb-1">Map view unavailable</p>
            <p className="text-xs">There was an error loading the map. Try switching to another view.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MapContent({ data }: { data: any[] }) {
  const center: [number, number] = data.length > 0 && data[0].lat && data[0].lng
    ? [data[0].lat, data[0].lng]
    : [39.8283, -98.5795];

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer center={center} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.filter(d => d.lat && d.lng).map(contact => (
          <Marker key={contact.id} position={[contact.lat, contact.lng]}>
            <Popup>
              <div className="p-1">
                <h3 className="font-semibold text-gray-900">{contact.contactName || contact.name || '-'}</h3>
                <p className="text-sm text-gray-600">{contact.accountName || '-'}</p>
                <div className="mt-2 text-xs text-gray-500">
                  <p>{contact.city}{contact.state ? `, ${contact.state}` : ''}</p>
                  {contact.quotationValue && (
                    <p className="mt-1 font-medium text-blue-600">${contact.quotationValue.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export function MapView({ data }: { data: any[] }) {
  if (!MapContainer) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
        <div className="text-center">
          <p className="font-medium mb-1">Map view requires react-leaflet</p>
          <p className="text-xs">Install <code className="bg-gray-200 px-1 rounded">leaflet</code> and <code className="bg-gray-200 px-1 rounded">react-leaflet</code> to enable this view.</p>
        </div>
      </div>
    );
  }

  return (
    <MapErrorBoundary>
      <MapContent data={data} />
    </MapErrorBoundary>
  );
}
