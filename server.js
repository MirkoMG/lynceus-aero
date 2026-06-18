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

app.listen(PORT, () => {
  console.log(`Lynceus Aero → http://localhost:${PORT}`);
});
