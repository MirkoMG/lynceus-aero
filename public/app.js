const REFRESH_MS  = 60_000;
const PINS_KEY    = 'lynceus_pins';
const THEME_KEY   = 'lynceus_theme';

const ICON_MOON = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_SUN  = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  document.getElementById('theme-color').setAttribute('content', theme === 'dark' ? '#0c0c11' : '#f5f5fa');
  const btn = document.getElementById('theme-btn');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
    btn.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
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
  delayed: 0, info: 0, cancelled: 1, boarding: 2,
  'on-time': 3, confirmed: 3, scheduled: 4, arrived: 5, departed: 5,
};

const STATUS_MAP = {
  'on time':     { key: 'on-time',   label: 'En Horario'   },
  'en horario':  { key: 'on-time',   label: 'En Horario'   },
  'arrived':     { key: 'arrived',   label: 'En Tierra'    },
  'en tierra':   { key: 'arrived',   label: 'En Tierra'    },
  'confirmed':   { key: 'confirmed', label: 'Confirmado'   },
  'confirmado':  { key: 'confirmed', label: 'Confirmado'   },
  'pre-boarding':{ key: 'boarding',  label: 'Pre-Embarque' },
  'pre-embarque':{ key: 'boarding',  label: 'Pre-Embarque' },
  'boarding':    { key: 'boarding',  label: 'Embarcando'   },
  'embarque':    { key: 'boarding',  label: 'Embarcando'   },
  'departed':    { key: 'departed',  label: 'Despegó'      },
  'salida':      { key: 'departed',  label: 'Despegó'      },
  'cancelled':   { key: 'cancelled', label: 'Cancelado'    },
  'cancelado':   { key: 'cancelled', label: 'Cancelado'    },
  'information': { key: 'info',      label: 'Informes'     },
  'informes':    { key: 'info',      label: 'Informes'     },
};

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
function readURLState() {
  const p = new URLSearchParams(window.location.search);
  return {
    airport: p.get('aero') || 'El ALTo',
    tipo:    p.get('tipo') || 'L',
  };
}

function writeURLState() {
  const p = new URLSearchParams({ aero: state.airport, tipo: state.tipo });
  history.replaceState(null, '', `?${p}`);
}

// ── Flight helpers ──────────────────────────────────────
function getStatus(flight) {
  const obs = (flight.OBSERVACION_INGLES || flight.OBSERVACION || '').trim().toLowerCase();
  const actual = (flight.HORA_REAL || '').trim();
  const sched  = (flight.HORA_ESTIMADA || '').trim();

  for (const [key, val] of Object.entries(STATUS_MAP)) {
    if (obs.includes(key)) return val;
  }

  if (actual && sched && actual !== sched) {
    const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    let diff = toMin(actual) - toMin(sched);
    if (diff < -720) diff += 1440; // midnight crossing
    if (diff > 4) return { key: 'delayed', label: 'Demorado' };
  }

  return { key: 'scheduled', label: '' };
}

function calcDelayMin(sched, actual) {
  if (!sched || !actual) return 0;
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  let diff = toMin(actual) - toMin(sched);
  if (diff < -720) diff += 1440;
  return diff;
}

function formatDelay(sched, actual) {
  const diff = calcDelayMin(sched, actual);
  if (diff <= 4) return '';
  if (diff < 60) return `+${diff}m`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m ? `+${h}h ${m}m` : `+${h}h`;
}

const STATUS_DOT = {
  'on-time':   { color: 'green', pulse: true  },
  'confirmed': { color: 'green', pulse: true  },
  'boarding':  { color: 'blue',  pulse: true  },
  'delayed':   { color: 'red',   pulse: true  },
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

  const stops = raw.split('|').map(s => s.trim()).filter(Boolean);
  if (stops.length <= 1) return { label: titleCase(stops[0] || '—'), stops: [], intermediateCount: 0 };

  const titled = stops.map(titleCase);
  const intermediateCount = stops.length - 2; // excludes first and last

  return {
    label: `${titled[0]} → ${titled[titled.length - 1]}`,
    stops: titled,
    intermediateCount: Math.max(0, intermediateCount),
  };
}

// ── Search / filter ─────────────────────────────────────
function filterFlights(flights) {
  const q = state.search.trim().toLowerCase();
  if (!q) return flights;
  return flights.filter(f => {
    const dest    = (f.RUTA0 || f.RUTA || '').toLowerCase();
    const num     = (f.NRO_VUELO || '').toLowerCase();
    const airline = (f.NOMBRE_AEROLINEA || '').toLowerCase();
    return dest.includes(q) || num.includes(q) || airline.includes(q);
  });
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

// ── Modal ───────────────────────────────────────────────
function openModal(flight) {
  const route     = parseRoute(flight.RUTA0, flight.RUTA);
  const meta      = getAirlineMeta(flight.NOMBRE_AEROLINEA);
  const { key: statusKey, label: statusLabel } = getStatus(flight);
  const sched     = formatTime(flight.HORA_ESTIMADA);
  const actual    = formatTime(flight.HORA_REAL);
  const isDelayed = statusKey === 'delayed' || statusKey === 'info';
  const showActual = isDelayed && actual !== '—' && actual !== sched;
  const delay     = showActual ? formatDelay(flight.HORA_ESTIMADA, flight.HORA_REAL) : '';
  const gate      = (flight.NRO_PUERTA || '').trim();
  const flightNum = (flight.NRO_VUELO || '').trim();
  const badgeClass = ['on-time','confirmed','boarding','delayed','info','arrived','departed','cancelled']
    .includes(statusKey) ? statusKey : 'scheduled';

  const stopsHtml = route.stops.map((stop, i) => {
    const isFirst = i === 0;
    const isLast  = i === route.stops.length - 1;
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
        <div class="modal-flightnum">${flightNum}</div>
        <div class="modal-airline-name">${flight.NOMBRE_AEROLINEA || ''}</div>
      </div>
    </div>
    <div class="modal-time-row">
      <span class="modal-time${isDelayed ? ' old' : ''}">${sched}</span>
      ${showActual ? `
        <span class="modal-time-sep" aria-hidden="true">→</span>
        <span class="modal-time new">${actual}</span>
        ${delay ? `<span class="delay-tag">${delay}</span>` : ''}
      ` : ''}
      ${statusLabel ? `<span class="status-badge ${badgeClass}">${statusLabel}</span>` : ''}
      ${gate ? `<span class="row-gate">P.${gate}</span>` : ''}
    </div>
    <p class="modal-section-label">Ruta completa</p>
    <div class="modal-route">${stopsHtml}</div>
  `;

  const overlay = document.getElementById('modal-overlay');
  overlay.removeAttribute('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('is-open')));
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('is-open');
  overlay.addEventListener('transitionend', () => {
    overlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
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
  const isDelayed   = statusKey === 'delayed' || statusKey === 'info';
  const showActual  = isDelayed && actual !== '—' && actual !== sched;
  const delay       = showActual ? formatDelay(flight.HORA_ESTIMADA, flight.HORA_REAL) : '';
  const gate        = (flight.NRO_PUERTA || '').trim();
  const route       = parseRoute(flight.RUTA0, flight.RUTA);
  const destination = route.label;
  const flightNum   = (flight.NRO_VUELO || '').trim();
  const cardId      = flight.IDDW_ITINERARIO || flightNum;
  const pinned      = getPins().has(flightNum);
  const dotCfg      = STATUS_DOT[statusKey];

  const badgeClass = ['on-time','confirmed','boarding','delayed','info','arrived','departed','cancelled']
    .includes(statusKey) ? statusKey : 'scheduled';

  const pinIcon = pinned
    ? `<svg viewBox="0 0 14 16" width="12" height="13" aria-hidden="true"><path d="M2 1h10v14L7 11.5 2 15V1z" fill="currentColor"/></svg>`
    : `<svg viewBox="0 0 14 16" width="12" height="13" aria-hidden="true"><path d="M2 1h10v14L7 11.5 2 15V1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/></svg>`;

  const fr24Url = meta.iata
    ? `https://www.flightradar24.com/data/flights/${meta.iata.toLowerCase()}${flightNum.replace(/\s+/g, '')}`
    : null;

  return `
    <article class="flight-row status-${statusKey}${pinned ? ' is-pinned' : ''}" role="listitem"
      data-flight="${flightNum}"
      aria-label="Vuelo ${meta.abbr} ${flightNum} a ${destination}, ${statusLabel || 'programado'}">
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
          <span class="fr-time${showActual ? ' red' : ''}">${showActual ? actual : sched}</span>
          ${delay ? `<span class="delay-tag">${delay}</span>` : ''}
        </div>
        <div class="fr-route-line" aria-hidden="true"></div>
        <div class="fr-dest-wrap">
          <span class="fr-dest">${destination}</span>
          ${route.intermediateCount > 0 ? `
            <button class="stops-toggle" aria-label="Ver ruta completa">
              <svg class="stops-chevron" viewBox="0 0 12 12" fill="none" width="10" height="10" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              ${route.intermediateCount} esc.
            </button>` : ''}
        </div>
      </div>
      <div class="fr-footer">
        ${dotCfg ? `<span class="status-dot ${dotCfg.color}${dotCfg.pulse ? ' pulse' : ''}" aria-hidden="true"></span>` : ''}
        ${statusLabel ? `<span class="status-badge ${badgeClass}">${statusLabel}</span>` : ''}
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
    : `<div class="state-empty">${state.search ? 'Sin resultados para esa búsqueda' : 'No hay vuelos para mostrar'}</div>`;

  updateSummary(state.flights, filtered);
}

function updateSortBar() {
  const delayedPill = document.querySelector('.sort-pill[data-sort="delayed"]');
  if (!delayedPill) return;
  const isLlegadas = state.tipo === 'L';
  delayedPill.hidden = isLlegadas;
  if (isLlegadas && state.sort === 'delayed') {
    state.sort = 'time';
    document.querySelectorAll('.sort-pill').forEach(p =>
      p.classList.toggle('active', p.dataset.sort === 'time')
    );
  }
}

function updateTabIndicator(activeTab) {
  const indicator  = document.querySelector('.tab-indicator');
  const rect       = activeTab.getBoundingClientRect();
  const parentRect = activeTab.parentElement.getBoundingClientRect();
  indicator.style.width     = `${rect.width}px`;
  indicator.style.transform = `translateX(${rect.left - parentRect.left}px)`;
}

// ── State ───────────────────────────────────────────────
const { airport: initAirport, tipo: initTipo } = readURLState();

const state = {
  airport: initAirport,
  tipo:    initTipo,
  sort:    'time',
  search:  '',
  flights: [],
  loading: false,
};

let refreshTimer = null;

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
    renderFlights(!isRefresh);

    const now = new Date();
    document.getElementById('last-updated').textContent =
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  } catch (err) {
    if (!isRefresh) {
      list.innerHTML = `<div class="state-empty">Error al cargar vuelos — reintentando…</div>`;
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

  requestAnimationFrame(() => {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) updateTabIndicator(activeTab);
    updateSortBar();
  });

  // Search
  searchInput.addEventListener('input', () => {
    state.search = searchInput.value;
    searchBar.classList.toggle('has-query', !!state.search);
    renderFlights(false);
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    state.search = '';
    searchBar.classList.remove('has-query');
    searchInput.focus();
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
      updateSortBar();
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
      renderFlights(true);
    });
  });

  // Pin + stops toggle — delegate to the list container
  flightsList.addEventListener('click', e => {
    const stopBtn = e.target.closest('.stops-toggle');
    if (stopBtn) {
      const card      = stopBtn.closest('.flight-row');
      const flightNum = card?.dataset.flight;
      const flight    = state.flights.find(f => (f.NRO_VUELO || '').trim() === flightNum);
      if (flight) openModal(flight);
      return;
    }

    const pinBtn = e.target.closest('.pin-btn');
    if (pinBtn) {
      togglePin(pinBtn.dataset.pin);
      renderFlights(false);
    }
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  fetchFlights();
  scheduleRefresh();
});
