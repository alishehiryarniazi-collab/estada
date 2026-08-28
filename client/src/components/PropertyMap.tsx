/**
 * Interactive results map (Leaflet + OpenStreetMap — free, no API key).
 * Shows a price-tagged pin per listing. Optionally re-runs the search when the
 * user pans/zooms ("search as you move the map"), debounced.
 *
 * NOTE: pins use the listing's approximate (offset) coordinates from the API,
 * so exact locations are never exposed on the public map.
 */
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { formatPriceShort, formatPricePKRLabeled } from '../utils/formatPrice';
import type { PropertyCard } from '../types/property';

export interface MapBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

interface Props {
  items: PropertyCard[];
  searchAsMove: boolean;
  onBoundsChange?: (b: MapBounds) => void;
}

// Pakistan-centred default view before any results load.
const DEFAULT_CENTER: [number, number] = [30.3753, 69.3451];
const DEFAULT_ZOOM = 5;

function priceIcon(p: PropertyCard) {
  const cls = p.listingType === 'rent' ? 'price-pin rent' : 'price-pin';
  return L.divIcon({
    className: '',
    html: `<span class="${cls}">${formatPriceShort(p.price)}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/** Fits the map to the current results (only when NOT in search-as-move mode). */
function FitToItems({ items, enabled }: { items: PropertyCard[]; enabled: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || items.length === 0) return;
    const bounds = L.latLngBounds(items.map((i) => [i.lat, i.lng] as [number, number]));
    map.fitBounds(bounds.pad(0.25), { maxZoom: 14, animate: false });
  }, [items, enabled, map]);
  return null;
}

/** Emits debounced bounds on pan/zoom when search-as-move is enabled. */
function MoveWatcher({
  enabled,
  onBounds,
}: {
  enabled: boolean;
  onBounds?: (b: MapBounds) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const map = useMapEvents({
    moveend() {
      if (!enabled || !onBounds) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const b = map.getBounds();
        onBounds({
          swLat: b.getSouth(),
          swLng: b.getWest(),
          neLat: b.getNorth(),
          neLng: b.getEast(),
        });
      }, 400); // debounce so we don't fire on every frame (Section 8)
    },
  });
  return null;
}

export default function PropertyMap({ items, searchAsMove, onBoundsChange }: Props) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToItems items={items} enabled={!searchAsMove} />
      <MoveWatcher enabled={searchAsMove} onBounds={onBoundsChange} />

      {items.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={priceIcon(p)}>
          <Popup>
            <div className="min-w-[160px]">
              <p className="font-semibold text-primary">{formatPricePKRLabeled(p.price)}</p>
              <p className="mt-0.5 text-sm text-ink">{p.title}</p>
              <p className="text-xs text-ink-muted">
                {p.areaName}, {p.city}
              </p>
              <Link
                to={`/listings/${p.id}`}
                className="mt-2 inline-block text-sm font-medium text-primary underline"
              >
                View listing
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
