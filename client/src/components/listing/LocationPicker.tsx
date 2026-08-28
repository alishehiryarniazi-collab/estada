/**
 * Location picker for the listing form. Uses free OSM Nominatim geocoding
 * (search a place -> coordinates) and lets the user fine-tune by clicking the
 * map. No Google Places, no API key, no credit card.
 *
 * Nominatim asks for light usage — we only query on explicit search, not on
 * every keystroke.
 */
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin } from 'lucide-react';

export interface PickedLocation {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
}

const pin = L.divIcon({ className: '', html: '<span class="price-pin">📍</span>', iconSize: [0, 0] });

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.setView([lat, lng], Math.max(map.getZoom(), 14), { animate: true });
  return null;
}

export default function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (loc: PickedLocation) => void;
}) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const hasPoint = lat !== 0 || lng !== 0;

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=pk&limit=1&q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      if (data[0]) {
        const r = data[0];
        onChange({
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          address: r.display_name,
          city: r.address?.city || r.address?.town || r.address?.state_district,
        });
      }
    } catch {
      // Geocoding failed — user can still click the map manually.
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-hairline bg-white px-3">
          <Search size={16} className="text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), search())}
            placeholder="Search a place, e.g. DHA Phase 5 Lahore"
            className="w-full bg-transparent py-2.5 text-sm text-ink outline-none"
          />
        </div>
        <button
          type="button"
          onClick={search}
          disabled={searching}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60"
        >
          {searching ? 'Finding…' : 'Find'}
        </button>
      </div>

      <div className="h-64 w-full overflow-hidden rounded-card border border-hairline">
        <MapContainer center={[hasPoint ? lat : 30.3753, hasPoint ? lng : 69.3451]} zoom={hasPoint ? 14 : 5} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onPick={(la, ln) => onChange({ lat: la, lng: ln })} />
          {hasPoint && (
            <>
              <Marker position={[lat, lng]} icon={pin} />
              <Recenter lat={lat} lng={lng} />
            </>
          )}
        </MapContainer>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
        <MapPin size={13} /> Search a place or click the map to drop the pin. Buyers only ever see an
        approximate location.
      </p>
    </div>
  );
}
