/**
 * Single-listing location map. When the viewer isn't allowed the exact address
 * yet, we show a ~150m circle around the approximate point and a note; once
 * unlocked (owner/admin/after enquiry) we drop a precise pin.
 */
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

const pin = L.divIcon({
  className: '',
  html: '<span class="price-pin">📍</span>',
  iconSize: [0, 0],
});

export default function LocationMap({
  lat,
  lng,
  approximate,
}: {
  lat: number;
  lng: number;
  approximate: boolean;
}) {
  return (
    <div>
      <div className="h-64 w-full overflow-hidden rounded-card border border-hairline">
        <MapContainer center={[lat, lng]} zoom={14} className="h-full w-full" scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {approximate ? (
            <Circle center={[lat, lng]} radius={150} pathOptions={{ color: '#0F2A47', fillOpacity: 0.12 }} />
          ) : (
            <Marker position={[lat, lng]} icon={pin} />
          )}
        </MapContainer>
      </div>
      {approximate && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin size={14} /> Approximate location — the exact address is shared after you enquire.
        </p>
      )}
    </div>
  );
}
