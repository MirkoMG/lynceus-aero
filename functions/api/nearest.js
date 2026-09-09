// Coordinates from the OurAirports public dataset (iso_country = BO), not
// hand-entered. `aero` is the exact string the NAABOL endpoint expects.
export const AIRPORTS = [
  { iata: 'BYC', aero: 'Yacuiba', lat: -21.9609, lon: -63.6517 },
  { iata: 'CBB', aero: 'Jorge Wilstermann', lat: -17.42111, lon: -66.1771 },
  { iata: 'CIJ', aero: 'Cobija', lat: -11.03911, lon: -68.78277 },
  { iata: 'GYA', aero: 'Guayamerin', lat: -10.88856, lon: -65.38096 },
  { iata: 'LPB', aero: 'El ALTo', lat: -16.51027, lon: -68.18942 },
  { iata: 'ORU', aero: 'Oruro', lat: -17.95615, lon: -67.07583 },
  { iata: 'POI', aero: 'Potosi', lat: -19.54333, lon: -65.72373 },
  { iata: 'RBQ', aero: 'Rurrenabaque', lat: -14.4279, lon: -67.4968 },
  { iata: 'RIB', aero: 'Riberalta', lat: -11.00935, lon: -66.07547 },
  { iata: 'SRE', aero: 'Sucre', lat: -19.24684, lon: -65.14961 },
  { iata: 'TDD', aero: 'Trinidad', lat: -14.8187, lon: -64.918 },
  { iata: 'TJA', aero: 'Tarija', lat: -21.5557, lon: -64.7013 },
  { iata: 'UYU', aero: 'Uyuni', lat: -20.4413, lon: -66.85755 },
  { iata: 'VVI', aero: 'Viru Viru', lat: -17.6448, lon: -63.1354 },
];

export const DEFAULT_AERO = 'El ALTo';

// Beyond this, "nearest Bolivian airport" stops being a useful answer — someone
// opening this from Madrid should get the default board, not Cobija. Generous
// enough that border traffic in northern Argentina or western Brazil still
// resolves to the airport it actually means.
const MAX_DISTANCE_KM = 500;

function haversineKm(aLat, aLon, bLat, bLon) {
  const R = 6371;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Returns { aero, iata, distanceKm } for the closest airport, or null when the
// coordinates are unusable or nothing is near enough to be meaningful.
export function nearestAirport(lat, lon) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  let best = null;
  for (const a of AIRPORTS) {
    const distanceKm = haversineKm(lat, lon, a.lat, a.lon);
    if (!best || distanceKm < best.distanceKm) best = { aero: a.aero, iata: a.iata, distanceKm };
  }
  return best && best.distanceKm <= MAX_DISTANCE_KM ? best : null;
}

export async function onRequestGet({ request }) {
  // Cloudflare resolves this from the client IP at the edge — no third-party
  // lookup, no permission prompt, and nothing about the visitor is stored.
  const cf = request.cf ?? {};
  const hit = nearestAirport(parseFloat(cf.latitude), parseFloat(cf.longitude));

  return Response.json(
    hit
      ? { airport: hit.aero, iata: hit.iata, distanceKm: Math.round(hit.distanceKm) }
      : { airport: DEFAULT_AERO, fallback: true },
    // Depends on the caller's IP, so it must never be cached at the edge
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
