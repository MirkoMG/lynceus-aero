export async function onRequestGet({ request }) {
  const { searchParams } = new URL(request.url);
  const aero = searchParams.get('aero') ?? 'El ALTo';
  const tipo = searchParams.get('tipo') ?? 'L';

  try {
    const upstream = await fetch(
      `https://fids.naabol.gob.bo/Fids/itin/vuelos?aero=${encodeURIComponent(aero)}&tipo=${tipo}`,
      { headers: { Accept: 'application/json' } }
    );

    if (!upstream.ok) {
      return Response.json({ error: `Upstream ${upstream.status}` }, { status: upstream.status });
    }

    const data = await upstream.json();
    return Response.json(data, {
      headers: { 'Cache-Control': 'public, max-age=30' },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
