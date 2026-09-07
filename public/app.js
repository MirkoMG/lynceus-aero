const REFRESH_MS  = 60_000;
const PINS_KEY    = 'lynceus_pins';
const THEME_KEY   = 'lynceus_theme';

const ICON_MOON = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_SUN  = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

// ── i18n ────────────────────────────────────────────────
// Bolivia's boards serve a lot of non-Spanish traffic — GOL and Copa routes,
// and relatives tracking a flight from abroad. Three locales, no library: the
// catalogue is keyed by string id, and any Portuguese tag resolves to pt-BR
// since that is the only Portuguese variant this covers.
const LANG_KEY  = 'lynceus_lang';
const LOCALES   = ['es', 'en', 'pt-BR'];
const FALLBACK  = 'es';

const MESSAGES = {
  es: {
    live: 'EN VIVO',
    selectAirport: 'Seleccionar aeropuerto',
    themeToDark: 'Cambiar a modo oscuro',
    themeToLight: 'Cambiar a modo claro',
    arrivals: 'Llegadas',
    departures: 'Salidas',
    searchPlaceholder: 'Vuelo, destino o aerolínea…',
    clearSearch: 'Limpiar búsqueda',
    sortGroup: 'Ordenar vuelos',
    sortTime: 'Hora',
    sortDelayed: 'Demorados primero',
    sortAirline: 'Aerolínea',
    flightsList: 'Lista de vuelos',
    offline: 'Sin conexión',
    scrollTop: 'Volver arriba',
    close: 'Cerrar',
  },
  en: {
    live: 'LIVE',
    selectAirport: 'Select airport',
    themeToDark: 'Switch to dark mode',
    themeToLight: 'Switch to light mode',
    arrivals: 'Arrivals',
    departures: 'Departures',
    searchPlaceholder: 'Flight, destination or airline…',
    clearSearch: 'Clear search',
    sortGroup: 'Sort flights',
    sortTime: 'Time',
    sortDelayed: 'Delayed first',
    sortAirline: 'Airline',
    flightsList: 'Flight list',
    offline: 'Offline',
    scrollTop: 'Back to top',
    close: 'Close',
  },
  'pt-BR': {
    live: 'AO VIVO',
    selectAirport: 'Selecionar aeroporto',
    themeToDark: 'Mudar para modo escuro',
    themeToLight: 'Mudar para modo claro',
    arrivals: 'Chegadas',
    departures: 'Partidas',
    searchPlaceholder: 'Voo, destino ou companhia…',
    clearSearch: 'Limpar busca',
    sortGroup: 'Ordenar voos',
    sortTime: 'Hora',
    sortDelayed: 'Atrasados primeiro',
    sortAirline: 'Companhia',
    flightsList: 'Lista de voos',
    offline: 'Sem conexão',
    scrollTop: 'Voltar ao topo',
    close: 'Fechar',
  },
};

// 'pt', 'pt-PT', 'PT-br' → 'pt-BR'; anything unrecognised → null
function matchLocale(tag) {
  const base = (tag || '').toLowerCase().split('-')[0];
  if (base === 'pt') return 'pt-BR';
  return LOCALES.find(l => l.toLowerCase().split('-')[0] === base) || null;
}

function resolveLocale() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  let stored = null;
  try { stored = localStorage.getItem(LANG_KEY); } catch { /* private mode */ }
  const candidates = [fromUrl, stored, ...(navigator.languages || [navigator.language])];
  for (const c of candidates) {
    const hit = matchLocale(c);
    if (hit) return hit;
  }
  return FALLBACK;
}

let locale = resolveLocale();

function t(key, vars) {
  const str = MESSAGES[locale]?.[key] ?? MESSAGES[FALLBACK][key] ?? key;
  return vars
    ? str.replace(/\{(\w+)\}/g, (_, n) => (n in vars ? vars[n] : `{${n}}`))
    : str;
}

// Static chrome carries its string id in a data attribute so the markup stays
// declarative and one pass can re-translate everything when the locale changes.
function applyStaticStrings() {
  document.documentElement.setAttribute('lang', locale);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  document.getElementById('theme-color').setAttribute('content', theme === 'dark' ? '#0c0c11' : '#f5f5fa');
  const btn = document.getElementById('theme-btn');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
    btn.setAttribute('aria-label', theme === 'dark' ? t('themeToLight') : t('themeToDark'));
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ── Airline metadata ────────────────────────────────────
const AIRLINE_META = {
  'BOLIVIANA DE AVIACION':             { abbr: 'BoA', cls: 'al-boa', iata: 'OB' },
  'AVIANCA':                           { abbr: 'AV',  cls: 'al-av',  iata: 'AV' },
  'AEROVIAS DEL CONTINENTE AMERICANO': { abbr: 'AV',  cls: 'al-av',  iata: 'AV' },
  'LATAM':                             { abbr: 'LA',  cls: 'al-la',  iata: 'LA' },
  'LATAM AIRLINES':                    { abbr: 'LA',  cls: 'al-la',  iata: 'LA' },
  'ECO JET':                           { abbr: 'ECO', cls: 'al-eco', iata: '8J' },
  'GOL':                               { abbr: 'G3',  cls: 'al-g3',  iata: 'G3' },
  'COPA AIRLINES':                     { abbr: 'CM',  cls: 'al-cm',  iata: 'CM' },
  'MINERA SAN CRISTOBAL':              { abbr: 'MSC', cls: 'al-msc', iata: null  },
};

// Lower = shown first when sort = 'delayed'
const SORT_PRIORITY = {
  delayed: 0, retimed: 0, info: 0, cancelled: 1, boarding: 2,
  'on-time': 3, confirmed: 3, scheduled: 4, arrived: 5, departed: 5,
};

// Upstream is inconsistent about spacing, hyphens and accents ("PRE-BOARDING",
// "PRE BOARDING", "PREEMBARCANDO") and pads values with trailing spaces, so both
// these keys and the incoming value are squashed to bare letters before matching.
const squashStatus = s => (s || '')
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]/g, '');

const STATUS_MAP = {
  'on time':       { key: 'on-time',   label: 'En Horario'   },
  'en horario':    { key: 'on-time',   label: 'En Horario'   },
  'arrived':       { key: 'arrived',   label: 'En Tierra'    },
  'landed':        { key: 'arrived',   label: 'En Tierra'    },
  'en tierra':     { key: 'arrived',   label: 'En Tierra'    },
  'confirmed':     { key: 'confirmed', label: 'Confirmado'   },
  'confirmado':    { key: 'confirmed', label: 'Confirmado'   },
  'pre-boarding':  { key: 'boarding',  label: 'Pre-Embarque' },
  'pre-embarque':  { key: 'boarding',  label: 'Pre-Embarque' },
  'preembarcando': { key: 'boarding',  label: 'Pre-Embarque' },
  'boarding':      { key: 'boarding',  label: 'Embarcando'   },
  'embarque':      { key: 'boarding',  label: 'Embarcando'   },
  'new time':      { key: 'retimed',   label: 'Nueva Hora'   },
  'nueva hora':    { key: 'retimed',   label: 'Nueva Hora'   },
  'delayed':       { key: 'delayed',   label: 'Demorado'     },
  'demorado':      { key: 'delayed',   label: 'Demorado'     },
  'departed':      { key: 'departed',  label: 'Despegó'      },
  'salida':        { key: 'departed',  label: 'Despegó'      },
  'cancelled':     { key: 'cancelled', label: 'Cancelado'    },
  'cancelado':     { key: 'cancelled', label: 'Cancelado'    },
  'information':   { key: 'info',      label: 'Informes'     },
  'informes':      { key: 'info',      label: 'Informes'     },
};

// Longest key first, so "preboarding" is never swallowed by "boarding"
const STATUS_LOOKUP = Object.entries(STATUS_MAP)
  .map(([k, v]) => [squashStatus(k), v])
  .sort((a, b) => b[0].length - a[0].length);

// ── Pin helpers ─────────────────────────────────────────
function getPins() {
  try { return new Set(JSON.parse(localStorage.getItem(PINS_KEY)) || []); }
  catch { return new Set(); }
}

function savePins(set) {
  localStorage.setItem(PINS_KEY, JSON.stringify([...set]));
}

function togglePin(flightNum) {
  const pins = getPins();
  pins.has(flightNum) ? pins.delete(flightNum) : pins.add(flightNum);
  savePins(pins);
}

// ── URL state ───────────────────────────────────────────
const SORT_MODES = ['time', 'delayed', 'airline'];

function readURLState() {
  const p = new URLSearchParams(window.location.search);
  const sort = p.get('sort');
  return {
    airport: p.get('aero') || 'El ALTo',
    tipo:    p.get('tipo') === 'S' ? 'S' : 'L',
    sort:    SORT_MODES.includes(sort) ? sort : 'time',
    search:  p.get('q') || '',
  };
}

function writeURLState() {
  const p = new URLSearchParams({ aero: state.airport, tipo: state.tipo });
  if (state.sort !== 'time') p.set('sort', state.sort);
  if (state.search.trim())   p.set('q', state.search.trim());
  history.replaceState(null, '', `?${p}`);
}

// ── Flight helpers ──────────────────────────────────────
function getStatus(flight) {
  const obs = squashStatus(flight.OBSERVACION_INGLES || flight.OBSERVACION);
  if (obs) {
    const hit = STATUS_LOOKUP.find(([key]) => obs.includes(key));
    if (hit) return hit[1];
  }

  // No usable status text — infer a delay from the times themselves
  const actual = (flight.HORA_REAL || '').trim();
  const sched  = (flight.HORA_ESTIMADA || '').trim();
  if (actual && sched && actual !== sched && delayMinutes(flight) > 4) {
    return { key: 'delayed', label: 'Demorado' };
  }

  return { key: 'scheduled', label: '' };
}

// ── Dates ───────────────────────────────────────────────
// Every record carries full timestamps (FECHA, FECHA_HORA_FORMAT) next to the
// bare HH:MM fields. Using them removes the midnight-crossing guesswork the
// HH:MM math needed. Bolivia keeps UTC-4 year round with no DST, so board times
// are pinned to that offset rather than the viewer's — a countdown then reads
// the same whether you open this in La Paz or from another timezone.
const BOLIVIA_OFFSET_MIN = -240;

function boliviaDate(y, mo, d, h, mi, sec = 0) {
  return new Date(Date.UTC(y, mo - 1, d, h, mi, sec) - BOLIVIA_OFFSET_MIN * 60_000);
}

// "2026-09-14 18:37:00.000" → Date. Hand-parsed because engines disagree on the
// space-separated form, and Date would read it as the viewer's local time.
function parseApiDateTime(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec((str || '').trim());
  return m ? boliviaDate(+m[1], +m[2], +m[3], +m[4], +m[5], +(m[6] || 0)) : null;
}

// HORA_ESTIMADA / HORA_REAL carry no date, so pair them with the record's FECHA
function flightDateAt(flight, hhmm) {
  const d = /^(\d{4})-(\d{2})-(\d{2})/.exec((flight.FECHA || flight.FECHA_HORA || '').trim());
  const t = /^(\d{1,2}):(\d{2})/.exec((hhmm || '').trim());
  return d && t ? boliviaDate(+d[1], +d[2], +d[3], +t[1], +t[2]) : null;
}

function scheduledAt(flight) {
  return flightDateAt(flight, flight.HORA_ESTIMADA);
}

// FECHA_HORA tracks the live time — it mirrors HORA_REAL once one is published
function actualAt(flight) {
  return parseApiDateTime(flight.FECHA_HORA_FORMAT || flight.FECHA_HORA)
      || flightDateAt(flight, flight.HORA_REAL);
}

function delayMinutes(flight) {
  const sched = scheduledAt(flight);
  const real  = actualAt(flight);
  if (sched && real) return Math.round((real - sched) / 60_000);

  // No usable dates — fall back to wall-clock strings and the old midnight guess
  const s = (flight.HORA_ESTIMADA || '').trim();
  const a = (flight.HORA_REAL || '').trim();
  if (!s || !a) return 0;
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  let diff = toMin(a) - toMin(s);
  if (diff < -720) diff += 1440;
  return diff;
}

function formatDelay(flight) {
  const diff = delayMinutes(flight);
  if (diff <= 4) return '';
  if (diff < 60) return `+${diff}m`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m ? `+${h}h ${m}m` : `+${h}h`;
}

// Minutes from now until HH:MM, assuming the nearest day (API has no date)
function relMinutes(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const now = new Date();
  let diff = h * 60 + m - (now.getHours() * 60 + now.getMinutes());
  if (diff < -720) diff += 1440;
  if (diff > 720)  diff -= 1440;
  return diff;
}

function relTimeLabel(flight, statusKey) {
  if (['arrived', 'departed', 'cancelled'].includes(statusKey)) return '';
  const when = actualAt(flight) || scheduledAt(flight);
  const diff = when
    ? Math.round((when - Date.now()) / 60_000)
    : relMinutes((flight.HORA_REAL || '').trim() || (flight.HORA_ESTIMADA || '').trim());
  if (diff === null || diff < -20 || diff > 360) return '';
  if (diff <= 1)  return 'ahora';
  if (diff < 60)  return `en ${diff} min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m ? `en ${h}h ${m}m` : `en ${h}h`;
}

// Status keys that have a .status-badge rule in style.css; anything else
// falls back to the neutral 'scheduled' badge
// Statuses whose published time has moved, so the card shows the new time
// struck through against the old one
const TIME_MOVED_KEYS = new Set(['delayed', 'info', 'retimed']);

const BADGE_KEYS = new Set(['on-time', 'confirmed', 'boarding', 'delayed',
  'retimed', 'info', 'arrived', 'departed', 'cancelled']);

const STATUS_DOT = {
  'on-time':   { color: 'green', pulse: true  },
  'confirmed': { color: 'green', pulse: true  },
  'boarding':  { color: 'blue',  pulse: true  },
  'delayed':   { color: 'red',   pulse: true  },
  'retimed':   { color: 'amber', pulse: true  },
  'info':      { color: 'red',   pulse: true  },
  'cancelled': { color: 'red',   pulse: false },
  'arrived':   { color: 'gray',  pulse: false },
  'departed':  { color: 'gray',  pulse: false },
};

function getAirlineMeta(name) {
  return AIRLINE_META[(name || '').trim().toUpperCase()] ?? { abbr: (name || '').slice(0, 3).toUpperCase(), cls: 'al-def' };
}

function formatTime(t) { return (t || '').trim() || '—'; }

const NAABOL_LOGO = id => `https://fids.naabol.gob.bo/img/Aerolineas/${id}.png`;

function airlineIdHtml(meta, idEmpresa) {
  if (!idEmpresa) return `<span class="airline-chip ${meta.cls}">${meta.abbr}</span>`;
  return `<div class="airline-id">
    <img class="airline-logo" src="${NAABOL_LOGO(idEmpresa)}" alt="" aria-hidden="true" onerror="this.closest('.airline-id').classList.add('logo-error')">
    <span class="airline-chip ${meta.cls}">${meta.abbr}</span>
  </div>`;
}

function titleCase(str) {
  return (str || '').toLowerCase().replace(/\b([a-záéíóúüñ])/gi, c => c.toUpperCase());
}

function parseRoute(ruta0, ruta) {
  const raw = (ruta0 || ruta || '').trim()
    .replace(/>>/g, '|')
    .replace(/\s*-\s*/g, '|')
    .replace(/\s{2,}/g, ' ');

  // The API pads routes with numeric placeholders like "000" — drop them
  const stops = raw.split('|').map(s => s.trim()).filter(s => s && !/^\d+$/.test(s));
  if (stops.length <= 1) {
    const only = titleCase(stops[0] || '—');
    return { label: only, origin: only, destination: only, stops: [], intermediateCount: 0 };
  }

  const titled = stops.map(titleCase);
  const intermediateCount = stops.length - 2; // excludes first and last

  return {
    label: `${titled[0]} → ${titled[titled.length - 1]}`,
    origin: titled[0],
    destination: titled[titled.length - 1],
    stops: titled,
    intermediateCount: Math.max(0, intermediateCount),
  };
}

// ── Search / filter ─────────────────────────────────────
// Accent-insensitive: "potosi" matches "Potosí"
function norm(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filterFlights(flights) {
  const q = norm(state.search.trim());
  if (!q) return flights;
  return flights.filter(f =>
    norm(f.RUTA0 || f.RUTA).includes(q) ||
    norm(f.NRO_VUELO).includes(q) ||
    norm(f.NOMBRE_AEROLINEA).includes(q)
  );
}

// ── Sort ────────────────────────────────────────────────
function sortFlights(flights, mode) {
  const pins = getPins();
  const pinned = flights.filter(f => pins.has(f.NRO_VUELO));
  const rest   = flights.filter(f => !pins.has(f.NRO_VUELO));

  const toMin = t => { const [h, m] = (t || '00:00').split(':').map(Number); return h * 60 + m; };

  let sorted;
  if (mode === 'delayed') {
    sorted = rest.sort((a, b) => {
      const ap = SORT_PRIORITY[getStatus(a).key] ?? 9;
      const bp = SORT_PRIORITY[getStatus(b).key] ?? 9;
      if (ap !== bp) return ap - bp;
      return toMin(a.HORA_ESTIMADA) - toMin(b.HORA_ESTIMADA);
    });
  } else if (mode === 'airline') {
    sorted = rest.sort((a, b) => (a.NOMBRE_AEROLINEA || '').localeCompare(b.NOMBRE_AEROLINEA || '', 'es'));
  } else {
    sorted = rest; // API order is chronological
  }

  return [...pinned, ...sorted];
}

// Clipboard with a legacy fallback for contexts where the async API is unavailable
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { return document.execCommand('copy'); }
    catch { return false; }
    finally { ta.remove(); }
  }
}

// Rows whose full route is expanded, keyed by IDDW_ITINERARIO. Held outside the
// DOM because renderFlights() rebuilds the list wholesale on every refresh.
const openStops = new Set();

// ── Modal ───────────────────────────────────────────────
let lastFocusedEl = null;

function openModal(flight) {
  const route     = parseRoute(flight.RUTA0, flight.RUTA);
  const meta      = getAirlineMeta(flight.NOMBRE_AEROLINEA);
  const { key: statusKey, label: statusLabel } = getStatus(flight);
  const sched     = formatTime(flight.HORA_ESTIMADA);
  const actual    = formatTime(flight.HORA_REAL);
  const timeMoved  = TIME_MOVED_KEYS.has(statusKey);
  const showActual = timeMoved && actual !== '—' && actual !== sched;
  const timeTone   = statusKey === 'retimed' ? 'amber' : 'red';
  const delay     = showActual ? formatDelay(flight) : '';
  const gate      = (flight.NRO_PUERTA || '').trim();
  const flightNum = (flight.NRO_VUELO || '').trim();
  const badgeClass = BADGE_KEYS.has(statusKey) ? statusKey : 'scheduled';

  const airportLabel = document.getElementById('airport-select')?.selectedOptions[0]?.textContent || state.airport;
  const tipoLabel    = state.tipo === 'L' ? 'Llegada' : 'Salida';
  const relTime      = relTimeLabel(flight, statusKey);

  const fr24Url = meta.iata && flightNum
    ? `https://www.flightradar24.com/data/flights/${meta.iata.toLowerCase()}${flightNum.replace(/\s+/g, '')}`
    : null;

  const stops = route.stops.length ? route.stops : [route.label];
  const stopsHtml = stops.map((stop, i) => {
    const isFirst = i === 0;
    const isLast  = i === stops.length - 1;
    return `
      <div class="route-stop">
        <div class="route-stop-dot${isFirst || isLast ? ' filled' : ''}"></div>
        <span class="route-stop-name">${stop}</span>
      </div>
      ${!isLast ? '<div class="route-stop-line"></div>' : ''}
    `;
  }).join('');

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-head">
      <div class="modal-logo">${airlineIdHtml(meta, flight.ID_EMPRESA)}</div>
      <div class="modal-flight-info">
        <div class="modal-flightnum">${meta.iata ? `${meta.iata} ` : ''}${flightNum}</div>
        <div class="modal-airline-name">${flight.NOMBRE_AEROLINEA || ''}</div>
        <div class="modal-context">${tipoLabel} · ${airportLabel}</div>
      </div>
    </div>
    <div class="modal-time-row">
      <span class="modal-time${timeMoved ? ' old' : ''}">${sched}</span>
      ${showActual ? `
        <span class="modal-time-sep" aria-hidden="true">→</span>
        <span class="modal-time new ${timeTone}">${actual}</span>
        ${delay ? `<span class="delay-tag ${timeTone}">${delay}</span>` : ''}
      ` : ''}
      ${statusLabel ? `<span class="status-badge ${badgeClass}">${statusLabel}</span>` : ''}
      ${relTime ? `<span class="rel-time">${relTime}</span>` : ''}
      ${gate ? `<span class="row-gate">P.${gate}</span>` : ''}
    </div>
    <p class="modal-section-label">Ruta completa</p>
    <div class="modal-route">${stopsHtml}</div>
    <div class="modal-actions">
      ${fr24Url ? `
        <a class="modal-action" href="${fr24Url}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <path d="M16.24 7.76a6 6 0 0 1 0 8.48M7.76 16.24a6 6 0 0 1 0-8.48M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
          </svg>
          Rastrear vuelo
        </a>` : ''}
      <button class="modal-action" id="modal-share">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
          <path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Compartir
      </button>
    </div>
  `;

  const shareBtn = document.getElementById('modal-share');
  shareBtn.addEventListener('click', async () => {
    const text = `${tipoLabel} ${flight.NOMBRE_AEROLINEA || ''} ${flightNum} — ${route.stops.length ? route.stops.join(' → ') : route.label} — ${showActual ? actual : sched}${statusLabel ? ` (${statusLabel})` : ''} · ${airportLabel}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Lynceus Aero', text, url: location.href }); }
      catch { /* user cancelled the share sheet */ }
      return;
    }
    const copied = await copyText(`${text}\n${location.href}`);
    shareBtn.querySelector('svg').style.display = 'none';
    shareBtn.lastChild.textContent = copied ? 'Copiado ✓' : 'No se pudo copiar';
  });

  lastFocusedEl = document.activeElement;
  const overlay = document.getElementById('modal-overlay');
  overlay.removeAttribute('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('is-open')));
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close').focus({ preventScroll: true });
}

function closeModal({ slide = false } = {}) {
  const overlay = document.getElementById('modal-overlay');
  if (overlay.hasAttribute('hidden') || !overlay.classList.contains('is-open')) return;
  const sheet = document.getElementById('modal-sheet');
  if (slide) {
    // Continue the swipe: let the sheet keep travelling down instead of snapping back
    sheet.style.transition = 'transform 240ms var(--ease-out)';
    sheet.style.transform  = 'translateY(110%)';
  } else {
    sheet.style.transition = '';
    sheet.style.transform  = '';
  }
  overlay.classList.remove('is-open');
  overlay.addEventListener('transitionend', () => {
    overlay.setAttribute('hidden', '');
    sheet.style.transition = '';
    sheet.style.transform  = '';
    document.body.style.overflow = '';
    lastFocusedEl?.focus?.({ preventScroll: true });
    lastFocusedEl = null;
  }, { once: true });
}

// ── Summary strip ───────────────────────────────────────
function updateSummary(flights, filtered) {
  const strip = document.getElementById('summary-strip');
  if (!strip) return;

  const total   = flights.length;
  const shown   = filtered.length;
  const delayed = filtered.filter(f => { const s = getStatus(f).key; return s === 'delayed' || s === 'info'; }).length;

  if (!total) { strip.innerHTML = ''; return; }

  const countLabel = state.search && shown !== total
    ? `<span class="summary-count">${shown} de ${total} vuelos</span>`
    : `<span class="summary-count">${total} vuelos</span>`;

  strip.innerHTML = delayed
    ? `${countLabel}<span class="summary-sep">·</span><span class="summary-delayed">${delayed} demorado${delayed !== 1 ? 's' : ''}</span>`
    : countLabel;
}

// ── Render ──────────────────────────────────────────────
function renderSkeleton() {
  return Array.from({ length: 6 }, () => `
    <div class="skeleton-card" aria-hidden="true">
      <div style="display:flex;gap:.75rem;align-items:flex-start">
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.25rem;width:3.5rem;flex-shrink:0">
          <div class="skeleton-line" style="width:100%;height:1rem"></div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:.375rem">
          <div style="display:flex;gap:.5rem;align-items:center">
            <div class="skeleton-line" style="flex:1;height:1rem"></div>
            <div class="skeleton-line" style="width:4.5rem;height:1.25rem;border-radius:6px"></div>
          </div>
          <div style="display:flex;gap:.375rem;align-items:center">
            <div class="skeleton-line" style="width:1.75rem;height:1.75rem;border-radius:5px;flex-shrink:0"></div>
            <div class="skeleton-line" style="width:3rem;height:.75rem"></div>
            <div class="skeleton-line" style="width:40%;height:.75rem"></div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderCard(flight) {
  const { key: statusKey, label: statusLabel } = getStatus(flight);
  const meta        = getAirlineMeta(flight.NOMBRE_AEROLINEA);
  const sched       = formatTime(flight.HORA_ESTIMADA);
  const actual      = formatTime(flight.HORA_REAL);
  const timeMoved   = TIME_MOVED_KEYS.has(statusKey);
  const showActual  = timeMoved && actual !== '—' && actual !== sched;
  const timeTone    = statusKey === 'retimed' ? 'amber' : 'red';
  const delay       = showActual ? formatDelay(flight) : '';
  const gate        = (flight.NRO_PUERTA || '').trim();
  const route       = parseRoute(flight.RUTA0, flight.RUTA);
  // RUTA0 publishes the aircraft's whole rotation, which often neither starts
  // nor ends at the airport you are looking at — an El Alto arrival can read
  // "MIAMI - SAO PAULO - BUENOS AIRES - SUCRE - SANTA CRUZ". Headlining first →
  // last would name a city this flight is not taking you to, so show the end
  // that means something for the board you are on: where an arrival is coming
  // from, where a departure is going. The sheet still lists the full chain.
  const isArrival   = state.tipo === 'L';
  const endpoint    = isArrival ? route.origin : route.destination;
  const flightNum   = (flight.NRO_VUELO || '').trim();
  const cardId      = flight.IDDW_ITINERARIO || flightNum;
  const stopsOpen   = openStops.has(cardId);
  const pinned      = getPins().has(flightNum);
  const dotCfg      = STATUS_DOT[statusKey];
  const relTime     = relTimeLabel(flight, statusKey);

  const badgeClass = BADGE_KEYS.has(statusKey) ? statusKey : 'scheduled';

  const pinIcon = pinned
    ? `<svg viewBox="0 0 14 16" width="12" height="13" aria-hidden="true"><path d="M2 1h10v14L7 11.5 2 15V1z" fill="currentColor"/></svg>`
    : `<svg viewBox="0 0 14 16" width="12" height="13" aria-hidden="true"><path d="M2 1h10v14L7 11.5 2 15V1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/></svg>`;

  return `
    <article class="flight-row status-${statusKey}${pinned ? ' is-pinned' : ''}${stopsOpen ? ' stops-open' : ''}" role="listitem"
      data-flight="${flightNum}" data-id="${cardId}" tabindex="0"
      aria-label="Vuelo ${meta.abbr} ${flightNum} ${isArrival ? 'desde' : 'a'} ${endpoint}, ${statusLabel || 'programado'}. Ver detalle">
      <div class="fr-head">
        ${flight.ID_EMPRESA
          ? `<img class="fr-logo" src="${NAABOL_LOGO(flight.ID_EMPRESA)}" alt="" aria-hidden="true">`
          : `<span class="fr-logo airline-chip ${meta.cls}">${meta.abbr}</span>`}
        <span class="fr-airline">${flight.NOMBRE_AEROLINEA || ''}</span>
        <span class="fr-flightnum">${flightNum}</span>
        <button class="pin-btn${pinned ? ' pinned' : ''}"
          aria-label="${pinned ? 'Quitar' : 'Guardar'} vuelo ${flightNum}"
          aria-pressed="${pinned}"
          data-pin="${flightNum}">
          ${pinIcon}
        </button>
      </div>
      <div class="fr-journey">
        <div class="fr-times">
          ${showActual ? `<span class="fr-time-old">${sched}</span>` : ''}
          <span class="fr-time${showActual ? ` ${timeTone}` : ''}">${showActual ? actual : sched}</span>
          ${delay ? `<span class="delay-tag ${timeTone}">${delay}</span>` : ''}
        </div>
        <div class="fr-route-line" aria-hidden="true"></div>
        <div class="fr-dest-wrap">
          <span class="fr-dest-label">${isArrival ? 'Desde' : 'Hacia'}</span>
          <span class="fr-dest">${endpoint}</span>
          ${route.intermediateCount > 0 ? `
            <button class="stops-toggle" aria-expanded="${stopsOpen}" aria-label="Ver ruta completa">
              <svg class="stops-chevron" viewBox="0 0 12 12" fill="none" width="10" height="10" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              ${route.intermediateCount} esc.
            </button>` : ''}
        </div>
      </div>
      ${route.intermediateCount > 0 ? `
        <div class="route-detail">
          <div class="route-detail-inner">
            <p class="stops-list">${route.stops.join(' → ')}</p>
          </div>
        </div>` : ''}
      <div class="fr-footer">
        ${dotCfg ? `<span class="status-dot ${dotCfg.color}${dotCfg.pulse ? ' pulse' : ''}" aria-hidden="true"></span>` : ''}
        ${statusLabel ? `<span class="status-badge ${badgeClass}">${statusLabel}</span>` : ''}
        ${relTime ? `<span class="rel-time">${relTime}</span>` : ''}
        ${gate ? `<div class="gate-badge"><span class="gate-label">Puerta</span><span class="gate-num">${gate}</span></div>` : ''}
      </div>
    </article>
  `;
}

function renderFlights(animate) {
  const list     = document.getElementById('flights-list');
  const filtered = filterFlights(state.flights);
  const flights  = sortFlights(filtered, state.sort);

  list.classList.toggle('no-animate', !animate);

  list.innerHTML = flights.length
    ? flights.map(renderCard).join('')
    : `<div class="state-empty">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" aria-hidden="true">
          ${state.search
            ? '<circle cx="10.5" cy="10.5" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M16 16l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
            : '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'}
        </svg>
        <p>${state.search ? 'Sin resultados para esa búsqueda' : 'No hay vuelos para mostrar'}</p>
      </div>`;

  updateSummary(state.flights, filtered);
}

function updateTabIndicator(activeTab) {
  const indicator  = document.querySelector('.tab-indicator');
  const rect       = activeTab.getBoundingClientRect();
  const parentRect = activeTab.parentElement.getBoundingClientRect();
  indicator.style.width     = `${rect.width}px`;
  indicator.style.transform = `translateX(${rect.left - parentRect.left}px)`;
}

// ── State ───────────────────────────────────────────────
const initURL = readURLState();

const state = {
  airport: initURL.airport,
  tipo:    initURL.tipo,
  sort:    initURL.sort,
  search:  initURL.search,
  flights: [],
  loading: false,
};

let refreshTimer = null;
let lastFetchAt  = 0;

// ── Fetch ───────────────────────────────────────────────
async function fetchFlights({ isRefresh = false } = {}) {
  if (state.loading) return;
  state.loading = true;

  const list = document.getElementById('flights-list');

  if (!isRefresh) {
    list.classList.remove('no-animate');
    list.innerHTML = renderSkeleton();
  }

  try {
    const url = `/api/flights?aero=${encodeURIComponent(state.airport)}&tipo=${state.tipo}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    state.flights = await res.json();
    lastFetchAt = Date.now();
    renderFlights(!isRefresh);

    const now = new Date();
    document.getElementById('last-updated').textContent =
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  } catch (err) {
    if (!isRefresh) {
      list.innerHTML = `
        <div class="state-empty">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" aria-hidden="true">
            <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>No se pudieron cargar los vuelos</p>
          <button class="retry-btn" type="button">Reintentar</button>
        </div>`;
    }
    console.error(err);
  } finally {
    state.loading = false;
  }
}

function scheduleRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    fetchFlights({ isRefresh: true });
    scheduleRefresh();
  }, REFRESH_MS);
}

// ── Init ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const airportSelect = document.getElementById('airport-select');
  const tabs          = document.querySelectorAll('.tab');
  const sortPills     = document.querySelectorAll('.sort-pill');
  const flightsList   = document.getElementById('flights-list');
  const searchInput   = document.getElementById('search-input');
  const searchClear   = document.getElementById('search-clear');
  const searchBar     = document.getElementById('search-bar');

  applyStaticStrings();

  // Init theme button icon to match the already-applied data-theme
  applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
  document.getElementById('theme-btn').addEventListener('click', toggleTheme);

  // Sync controls to URL state
  airportSelect.value = state.airport;
  tabs.forEach(t => {
    const isActive = t.dataset.tipo === state.tipo;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', String(isActive));
  });
  sortPills.forEach(p => p.classList.toggle('active', p.dataset.sort === state.sort));
  if (state.search) {
    searchInput.value = state.search;
    searchBar.classList.add('has-query');
  }

  requestAnimationFrame(() => {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) updateTabIndicator(activeTab);
  });

  // Search
  searchInput.addEventListener('input', () => {
    state.search = searchInput.value;
    searchBar.classList.toggle('has-query', !!state.search);
    writeURLState();
    renderFlights(false);
  });

  searchClear.addEventListener('click', () => {
    state.search = '';
    searchInput.value = '';
    searchBar.classList.remove('has-query');
    searchInput.focus();
    writeURLState();
    renderFlights(false);
  });

  function clearSearch() {
    searchInput.value = '';
    state.search = '';
    searchBar.classList.remove('has-query');
  }

  // Airport change
  airportSelect.addEventListener('change', () => {
    clearSearch();
    state.airport = airportSelect.value;
    writeURLState();
    fetchFlights();
    scheduleRefresh();
  });

  // Tab switch
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.dataset.tipo === state.tipo) return;
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      state.tipo = tab.dataset.tipo;
      clearSearch();
      updateTabIndicator(tab);
      writeURLState();
      fetchFlights();
      scheduleRefresh();
    });
  });

  // Sort
  sortPills.forEach(pill => {
    pill.addEventListener('click', () => {
      if (pill.dataset.sort === state.sort) return;
      sortPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.sort = pill.dataset.sort;
      writeURLState();
      renderFlights(true);
    });
  });

  function openFlightModal(flightNum) {
    const flight = state.flights.find(f => (f.NRO_VUELO || '').trim() === flightNum);
    if (flight) openModal(flight);
  }

  // Pin / retry / card tap — delegate to the list container
  flightsList.addEventListener('click', e => {
    const pinBtn = e.target.closest('.pin-btn');
    if (pinBtn) {
      navigator.vibrate?.(10);
      togglePin(pinBtn.dataset.pin);
      renderFlights(false);
      return;
    }

    if (e.target.closest('.retry-btn')) {
      fetchFlights();
      scheduleRefresh();
      return;
    }

    const stopsBtn = e.target.closest('.stops-toggle');
    if (stopsBtn) {
      const row  = stopsBtn.closest('.flight-row');
      const open = !openStops.has(row.dataset.id);
      open ? openStops.add(row.dataset.id) : openStops.delete(row.dataset.id);
      row.classList.toggle('stops-open', open);
      stopsBtn.setAttribute('aria-expanded', String(open));
      return; // don't fall through and open the sheet as well
    }

    const card = e.target.closest('.flight-row');
    if (card) openFlightModal(card.dataset.flight);
  });

  // Keyboard: open card detail with Enter / Space
  flightsList.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.flight-row');
    if (card && e.target === card) {
      e.preventDefault();
      openFlightModal(card.dataset.flight);
    }
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Swipe down on the sheet to dismiss (only when its content is scrolled to top).
  // The drag engages after a 10px threshold so plain taps on buttons inside the
  // sheet are never preventDefault-ed (which would swallow their click events).
  const sheet = document.getElementById('modal-sheet');
  const SHEET_DRAG_THRESHOLD = 10;
  let sheetStartY  = null;
  let sheetDelta   = 0;
  let sheetDragging = false;

  sheet.addEventListener('touchstart', e => {
    sheetStartY = sheet.scrollTop <= 0 ? e.touches[0].clientY : null;
    sheetDelta = 0;
    sheetDragging = false;
  }, { passive: true });

  sheet.addEventListener('touchmove', e => {
    if (sheetStartY === null) return;
    sheetDelta = e.touches[0].clientY - sheetStartY;
    if (!sheetDragging && sheetDelta > SHEET_DRAG_THRESHOLD && sheet.scrollTop <= 0) {
      sheetDragging = true;
    }
    if (sheetDragging && sheetDelta > 0) {
      e.preventDefault();
      sheet.style.transition = 'none';
      sheet.style.transform = `translateY(${sheetDelta - SHEET_DRAG_THRESHOLD}px)`;
    }
  }, { passive: false });

  sheet.addEventListener('touchend', () => {
    if (sheetStartY === null) return;
    sheetStartY = null;
    if (sheetDragging && sheetDelta > 90) {
      closeModal({ slide: true });
    } else if (sheetDragging) {
      sheet.style.transition = '';
      sheet.style.transform = '';
    }
    sheetDelta = 0;
    sheetDragging = false;
  });

  // Pull to refresh — engages only at the very top of the page
  const ptr = document.getElementById('ptr');
  const PTR_TRIGGER = 58;
  let ptrStartY = null;
  let ptrPull   = 0;

  document.addEventListener('touchstart', e => {
    const modalOpen = !document.getElementById('modal-overlay').hasAttribute('hidden');
    ptrStartY = (window.scrollY <= 0 && !modalOpen && !ptr.classList.contains('refreshing'))
      ? e.touches[0].clientY : null;
    ptrPull = 0;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (ptrStartY === null) return;
    const delta = e.touches[0].clientY - ptrStartY;
    if (delta <= 0 || window.scrollY > 0) { ptrPull = 0; ptr.style.opacity = 0; return; }
    ptrPull = Math.min(delta * 0.45, PTR_TRIGGER + 14);
    ptr.style.opacity   = Math.min(ptrPull / PTR_TRIGGER, 1);
    ptr.style.transform = `translateX(-50%) translateY(${ptrPull}px) rotate(${ptrPull * 3}deg)`;
    ptr.classList.toggle('ready', ptrPull >= PTR_TRIGGER);
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (ptrStartY === null) return;
    ptrStartY = null;
    if (ptrPull >= PTR_TRIGGER) {
      ptr.classList.add('refreshing');
      ptr.style.transform = `translateX(-50%) translateY(${PTR_TRIGGER}px)`;
      navigator.vibrate?.(10);
      fetchFlights({ isRefresh: true }).finally(() => {
        scheduleRefresh();
        ptr.classList.remove('refreshing', 'ready');
        ptr.style.opacity = 0;
        ptr.style.transform = 'translateX(-50%) translateY(0)';
      });
    } else {
      ptr.classList.remove('ready');
      ptr.style.opacity = 0;
      ptr.style.transform = 'translateX(-50%) translateY(0)';
    }
    ptrPull = 0;
  });

  // Connectivity
  const offlineBanner = document.getElementById('offline-banner');
  offlineBanner.hidden = navigator.onLine !== false;
  window.addEventListener('offline', () => { offlineBanner.hidden = false; });
  window.addEventListener('online',  () => {
    offlineBanner.hidden = true;
    fetchFlights({ isRefresh: true });
    scheduleRefresh();
  });

  // Refresh when the tab comes back after being backgrounded (mobile timers pause)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastFetchAt > REFRESH_MS) {
      fetchFlights({ isRefresh: true });
      scheduleRefresh();
    }
  });

  // Scroll to top
  const scrollTopBtn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    scrollTopBtn.hidden = window.scrollY < 600;
  }, { passive: true });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  fetchFlights();
  scheduleRefresh();
});
