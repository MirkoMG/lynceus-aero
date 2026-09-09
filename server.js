const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/flights', async (req, res) => {
  const aero = req.query.aero ?? 'El ALTo';
  const tipo = req.query.tipo ?? 'L';

  try {
    const url = `https://fids.naabol.gob.bo/Fids/itin/vuelos?aero=${encodeURIComponent(aero)}&tipo=${tipo}`;
    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Upstream ${upstream.status}` });
    }

    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// There is no request.cf outside Cloudflare, so dev takes ?lat=&lon= to
// exercise the same resolver the Pages Function runs in production.
app.get('/api/nearest', async (req, res) => {
  const { nearestAirport, DEFAULT_AERO } = await import('./functions/api/nearest.js');
  // LYNCEUS_DEV_LATLON="-17.78,-63.18" pretends the request came from there,
  // which is the only way to exercise the detection path off Cloudflare.
  const [envLat, envLon] = (process.env.LYNCEUS_DEV_LATLON || '').split(',');
  const lat = parseFloat(req.query.lat ?? envLat);
  const lon = parseFloat(req.query.lon ?? envLon);
  const hit = nearestAirport(lat, lon);

  res.set('Cache-Control', 'no-store');
  res.json(hit
    ? { airport: hit.aero, iata: hit.iata, distanceKm: Math.round(hit.distanceKm) }
    : { airport: DEFAULT_AERO, fallback: true });
});

app.listen(PORT, () => {
  console.log(`Lynceus Aero → http://localhost:${PORT}`);
});
