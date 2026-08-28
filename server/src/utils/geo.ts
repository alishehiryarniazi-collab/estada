/**
 * Privacy: publicly we show an APPROXIMATE pin, not the exact house.
 * We offset the real coordinates by up to ~100m in a fixed direction derived
 * from the property id — so the fuzzed point is stable (doesn't jitter on each
 * request) but never reveals the precise location until an enquiry is made.
 */

// ~0.0009 degrees latitude ≈ 100 metres.
const MAX_OFFSET_DEG = 0.0009;

function seededUnit(id: string): { dx: number; dy: number } {
  // Cheap deterministic hash of the id -> an angle, so each listing has its
  // own consistent offset direction.
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  return { dx: Math.cos(angle), dy: Math.sin(angle) };
}

export function approximateLocation(lat: number, lng: number, id: string) {
  const { dx, dy } = seededUnit(id);
  return {
    lat: lat + dy * MAX_OFFSET_DEG,
    lng: lng + dx * MAX_OFFSET_DEG,
  };
}
