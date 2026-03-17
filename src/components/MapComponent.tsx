import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Mosque } from '../types';

// Fix for default marker icon in Leaflet
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  mosques: Mosque[];
  onMosqueClick: (mosque: Mosque) => void;
  center?: [number, number];
  zoom?: number;
}

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const MapComponent: React.FC<MapComponentProps> = ({ mosques, onMosqueClick, center = [23.6850, 90.3563] as [number, number], zoom = 7 }) => {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mosques.map((mosque) => (
        <Marker 
          key={mosque.id} 
          position={[mosque.lat, mosque.lng]}
          eventHandlers={{
            click: () => onMosqueClick(mosque),
          }}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-lg">{mosque.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{mosque.address}</p>
              <div className="space-y-1">
                {mosque.prayerTimes?.map((pt, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium">{pt.label}:</span>
                    <span>{pt.time}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => onMosqueClick(mosque)}
                className="mt-3 w-full bg-emerald-600 text-white py-1 px-2 rounded text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                View Details / Edit
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
