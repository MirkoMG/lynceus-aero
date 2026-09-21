const REFRESH_MS  = 60_000;
const PINS_KEY    = 'lynceus_pins';
const AIRPORT_KEY = 'lynceus_airport';
const THEME_KEY   = 'lynceus_theme';

// ── Icons ───────────────────────────────────────────────
// Lucide v1.46 (ISC). One 24px grid, one 2px stroke, round caps and joins —
// the previous set was hand-drawn across six different stroke widths, which is
// why it never read as a family. Geometry is copied verbatim, not redrawn.
const ICONS = {
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  bookmark: '<path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  planeLanding: '<path d="M2 22h20"/><path d="M3.77 10.77 2 9l2-4.5 1.1.55c.55.28.9.84.9 1.45s.35 1.17.9 1.45L8 8.5l3-6 1.05.53a2 2 0 0 1 1.09 1.52l.72 5.4a2 2 0 0 0 1.09 1.52l4.4 2.2c.42.22.78.55 1.01.96l.6 1.03c.49.88-.06 1.98-1.06 2.1l-1.18.15c-.47.06-.95-.02-1.37-.24L4.29 11.15a2 2 0 0 1-.52-.38Z"/>',
  planeTakeoff: '<path d="M2 22h20"/><path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z"/>',
  wifiOff: '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>',
  arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
  radio: '<path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/><circle cx="12" cy="12" r="2"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  volume2: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
  volumeX: '<path d="M11 4.702a.7.7 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.7.7 0 0 0 11 19.298z"/><path d="m16.5 14.5 5-5"/><path d="m16.5 9.5 5 5"/>',
  menu: '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',
  list: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>',
  layoutGrid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  searchX: '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
};

function icon(name, size = 16, opts = {}) {
  const { fill = 'none', cls = '' } = opts;
  return `<svg class="icon${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" width="${size}" height="${size}" `
    + `fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" `
    + `stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

const ICON_MOON = icon('moon', 15);
const ICON_SUN  = icon('sun', 15);

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
    selectLanguage: 'Seleccionar idioma',
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
    stOnTime: 'En Horario', stLanded: 'En Tierra', stConfirmed: 'Confirmado',
    stPreBoarding: 'Pre-Embarque', stBoarding: 'Embarcando', stRetimed: 'Nueva Hora',
    stDelayed: 'Demorado', stDeparted: 'Despegó', stCancelled: 'Cancelado', stInfo: 'Informes',
    stScheduled: 'Programado',
    routeFrom: 'Desde', routeTo: 'Hacia', dirFrom: 'desde', dirTo: 'a',
    now: 'ahora', inMin: 'en {n} min', inHour: 'en {h}h', inHourMin: 'en {h}h {m}m',
    flights_one: '{n} vuelo', flights_other: '{n} vuelos',
    flightsOfTotal: '{shown} de {total} vuelos',
    delayedCount_one: '{n} demorado', delayedCount_other: '{n} demorados',
    emptySearch: 'Sin resultados para esa búsqueda', emptyBoard: 'No hay vuelos para mostrar',
    loadError: 'No se pudieron cargar los vuelos', retry: 'Reintentar',
    gate: 'Puerta', gateShort: 'P.{n}',
    fullRoute: 'Ruta del avión',
    youAreHere: 'aquí', journeyApprox: 'estimado',
    col_time: 'hora', col_flight: 'vuelo', col_place: 'ciudad', col_gate: 'puerta', col_status: 'estado',
    viewList: 'Ver como lista', viewBoard: 'Ver como tablero',
    menu: 'Menú', labelSound: 'Sonido', labelView: 'Vista', labelLanguage: 'Idioma', labelTheme: 'Tema',
    footerAbout: 'Llegadas y salidas de los 14 aeropuertos de Bolivia.', footerData: 'Datos', footerProject: 'Proyecto',
    footerLegal: 'Sitio no oficial. Los datos provienen de NAABOL y pueden cambiar sin aviso — confirma siempre con tu aerolínea.',
    soundOn: 'Activar sonido', soundOff: 'Silenciar', thisFlight: 'Este vuelo', earlierToday: 'Antes, el mismo avión', laterToday: 'Después, el mismo avión',
    journeyOnWay: 'En el aire', journeyBefore: 'Por salir', journeyDone: 'Completado',
    track: 'Ver en Flightradar24', share: 'Compartir',
    copied: 'Copiado ✓', copyFailed: 'No se pudo copiar',
    arrival: 'Llegada', departure: 'Salida',
    pinAdd: 'Guardar vuelo {n}', pinRemove: 'Quitar vuelo {n}',
    scheduled: 'programado',
    cardLabel: 'Vuelo {airline} {n} {dir} {place}, {status}. Ver detalle',
  },
  en: {
    live: 'LIVE',
    selectAirport: 'Select airport',
    selectLanguage: 'Select language',
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
    stOnTime: 'On Time', stLanded: 'Landed', stConfirmed: 'Confirmed',
    stPreBoarding: 'Pre-Boarding', stBoarding: 'Boarding', stRetimed: 'New Time',
    stDelayed: 'Delayed', stDeparted: 'Departed', stCancelled: 'Cancelled', stInfo: 'Information',
    stScheduled: 'Scheduled',
    routeFrom: 'From', routeTo: 'To', dirFrom: 'from', dirTo: 'to',
    now: 'now', inMin: 'in {n} min', inHour: 'in {h}h', inHourMin: 'in {h}h {m}m',
    flights_one: '{n} flight', flights_other: '{n} flights',
    flightsOfTotal: '{shown} of {total} flights',
    delayedCount_one: '{n} delayed', delayedCount_other: '{n} delayed',
    emptySearch: 'No results for that search', emptyBoard: 'No flights to show',
    loadError: "Couldn't load flights", retry: 'Retry',
    gate: 'Gate', gateShort: 'G.{n}',
    fullRoute: 'Aircraft route',
    youAreHere: 'here', journeyApprox: 'estimated',
    col_time: 'time', col_flight: 'flight', col_place: 'city', col_gate: 'gate', col_status: 'status',
    viewList: 'View as list', viewBoard: 'View as board',
    menu: 'Menu', labelSound: 'Sound', labelView: 'View', labelLanguage: 'Language', labelTheme: 'Theme',
    footerAbout: 'Arrivals and departures for all 14 Bolivian airports.', footerData: 'Data', footerProject: 'Project',
    footerLegal: 'Unofficial site. Data comes from NAABOL and can change without notice — always confirm with your airline.',
    soundOn: 'Turn sound on', soundOff: 'Mute', thisFlight: 'This flight', earlierToday: 'Earlier, same aircraft', laterToday: 'Later, same aircraft',
    journeyOnWay: 'In the air', journeyBefore: 'Not departed', journeyDone: 'Completed',
    track: 'View on Flightradar24', share: 'Share',
    copied: 'Copied ✓', copyFailed: "Couldn't copy",
    arrival: 'Arrival', departure: 'Departure',
    pinAdd: 'Save flight {n}', pinRemove: 'Remove flight {n}',
    scheduled: 'scheduled',
    cardLabel: 'Flight {airline} {n} {dir} {place}, {status}. View detail',
  },
  'pt-BR': {
    live: 'AO VIVO',
    selectAirport: 'Selecionar aeroporto',
    selectLanguage: 'Selecionar idioma',
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
    stOnTime: 'No Horário', stLanded: 'Em Solo', stConfirmed: 'Confirmado',
    stPreBoarding: 'Pré-Embarque', stBoarding: 'Embarcando', stRetimed: 'Novo Horário',
    stDelayed: 'Atrasado', stDeparted: 'Decolou', stCancelled: 'Cancelado', stInfo: 'Informações',
    stScheduled: 'Programado',
    routeFrom: 'De', routeTo: 'Para', dirFrom: 'de', dirTo: 'para',
    now: 'agora', inMin: 'em {n} min', inHour: 'em {h}h', inHourMin: 'em {h}h {m}m',
    flights_one: '{n} voo', flights_other: '{n} voos',
    flightsOfTotal: '{shown} de {total} voos',
    delayedCount_one: '{n} atrasado', delayedCount_other: '{n} atrasados',
    emptySearch: 'Nenhum resultado para essa busca', emptyBoard: 'Nenhum voo para mostrar',
    loadError: 'Não foi possível carregar os voos', retry: 'Tentar novamente',
    gate: 'Portão', gateShort: 'P.{n}',
    fullRoute: 'Rota da aeronave',
    youAreHere: 'aqui', journeyApprox: 'estimado',
    col_time: 'hora', col_flight: 'voo', col_place: 'cidade', col_gate: 'portao', col_status: 'estado',
    viewList: 'Ver como lista', viewBoard: 'Ver como painel',
    menu: 'Menu', labelSound: 'Som', labelView: 'Vista', labelLanguage: 'Idioma', labelTheme: 'Tema',
    footerAbout: 'Chegadas e partidas dos 14 aeroportos da Bolívia.', footerData: 'Dados', footerProject: 'Projeto',
    footerLegal: 'Site não oficial. Os dados vêm da NAABOL e podem mudar sem aviso — confirme sempre com a sua companhia.',
    soundOn: 'Ativar som', soundOff: 'Silenciar',
    thisFlight: 'Este voo', earlierToday: 'Antes, a mesma aeronave', laterToday: 'Depois, a mesma aeronave',
    journeyOnWay: 'No ar', journeyBefore: 'A partir', journeyDone: 'Concluído',
    track: 'Ver no Flightradar24', share: 'Compartilhar',
    copied: 'Copiado ✓', copyFailed: 'Não foi possível copiar',
    arrival: 'Chegada', departure: 'Partida',
    pinAdd: 'Salvar voo {n}', pinRemove: 'Remover voo {n}',
    scheduled: 'programado',
    cardLabel: 'Voo {airline} {n} {dir} {place}, {status}. Ver detalhe',
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

// Intl picks the plural category; the catalogue supplies one/other per locale
function plural(base, n) {
  const dict = MESSAGES[locale] ?? MESSAGES[FALLBACK];
  const cat  = new Intl.PluralRules(locale).select(n);
  return t(`${base}_${cat}` in dict ? `${base}_${cat}` : `${base}_other`, { n });
}

function t(key, vars) {
  const str = MESSAGES[locale]?.[key] ?? MESSAGES[FALLBACK][key] ?? key;
  return vars
    ? str.replace(/\{(\w+)\}/g, (_, n) => (n in vars ? vars[n] : `{${n}}`))
    : str;
}

function setLocale(next) {
  if (!LOCALES.includes(next) || next === locale) return;
  locale = next;
  try { localStorage.setItem(LANG_KEY, locale); } catch { /* private mode */ }
  applyStaticStrings();
  // Re-run so the theme button's aria-label picks up the new locale
  applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
  writeURLState();
  renderFlights(false);
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
  // The band is black in both themes, and it is what sits under the status bar
  document.getElementById('theme-color').setAttribute('content', '#000000');
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
  'BOLIVIANA DE AVIACION':             { abbr: 'BoA', iata: 'OB' },
  'AVIANCA':                           { abbr: 'AV',  cls: 'al-av',  iata: 'AV' },
  'AEROVIAS DEL CONTINENTE AMERICANO': { abbr: 'AV',  cls: 'al-av',  iata: 'AV' },
  'LATAM':                             { abbr: 'LA',  cls: 'al-la',  iata: 'LA' },
  'LATAM AIRLINES':                    { abbr: 'LA',  cls: 'al-la',  iata: 'LA' },
  'ECO JET':                           { abbr: 'ECO', iata: '8J' },
  'GOL':                               { abbr: 'G3',  cls: 'al-g3',  iata: 'G3' },
  'COPA AIRLINES':                     { abbr: 'CM',  cls: 'al-cm',  iata: 'CM' },
  'MINERA SAN CRISTOBAL':              { abbr: 'MSC', iata: null  },
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

// label is a message id, not a string: 'boarding' and 'pre-boarding' share a
// status key but must still read differently on the badge
const STATUS_MAP = {
  'on time':       { key: 'on-time',   label: 'stOnTime'      },
  'en horario':    { key: 'on-time',   label: 'stOnTime'      },
  'arrived':       { key: 'arrived',   label: 'stLanded'      },
  'landed':        { key: 'arrived',   label: 'stLanded'      },
  'en tierra':     { key: 'arrived',   label: 'stLanded'      },
  'confirmed':     { key: 'confirmed', label: 'stConfirmed'   },
  'confirmado':    { key: 'confirmed', label: 'stConfirmed'   },
  'pre-boarding':  { key: 'boarding',  label: 'stPreBoarding' },
  'pre-embarque':  { key: 'boarding',  label: 'stPreBoarding' },
  'preembarcando': { key: 'boarding',  label: 'stPreBoarding' },
  'boarding':      { key: 'boarding',  label: 'stBoarding'    },
  'embarque':      { key: 'boarding',  label: 'stBoarding'    },
  'new time':      { key: 'retimed',   label: 'stRetimed'     },
  'nueva hora':    { key: 'retimed',   label: 'stRetimed'     },
  'delayed':       { key: 'delayed',   label: 'stDelayed'     },
  'demorado':      { key: 'delayed',   label: 'stDelayed'     },
  'departed':      { key: 'departed',  label: 'stDeparted'    },
  'salida':        { key: 'departed',  label: 'stDeparted'    },
  'cancelled':     { key: 'cancelled', label: 'stCancelled'   },
  'cancelado':     { key: 'cancelled', label: 'stCancelled'   },
  'information':   { key: 'info',      label: 'stInfo'        },
  'informes':      { key: 'info',      label: 'stInfo'        },
};

// COD_COMENTARIO is a stable numeric status code, and it is better data than
// OBSERVACION: one code covers both the 'PRE-EMBARQUE' and 'PREEMBARCANDO'
// spellings, and several distinct codes share a single label, so the code
// separates cases the text collapses together.
//
// Only codes observed alongside real text are mapped here. Codes 11, 19, 76 and
// 77 stay out: across 159 records they are ALWAYS empty, ALWAYS on a flight
// still in the future, and never on one whose time has moved — NAABOL's
// "scheduled, nothing published yet" state. They split by direction like the
// rest (11/77 arrivals, 19/76 departures), so there are two such states each
// and nothing distinguishes them from outside. They fall through to 'scheduled'
// on their own, which is already correct, so mapping them would add no
// information. logUnmappedCode() reports any code carrying text that is missing
// here, which is how 2 was found.
const STATUS_CODES = {
  2:  { key: 'boarding',  label: 'stPreBoarding' },
  4:  { key: 'delayed',   label: 'stDelayed'     },
  6:  { key: 'boarding',  label: 'stBoarding'    },
  8:  { key: 'on-time',   label: 'stOnTime'      },
  16: { key: 'delayed',   label: 'stDelayed'     },
  18: { key: 'retimed',   label: 'stRetimed'     },
  22: { key: 'on-time',   label: 'stOnTime'      },
  35: { key: 'on-time',   label: 'stOnTime'      },
  54: { key: 'delayed',   label: 'stDelayed'     },
  71: { key: 'arrived',   label: 'stLanded'      },
  72: { key: 'boarding',  label: 'stPreBoarding' },
  74: { key: 'confirmed', label: 'stConfirmed'   },
  82: { key: 'confirmed', label: 'stConfirmed'   },
  // "INFORMES" / "INFORMATION" — the airport is telling you to ask at the desk.
  // Five codes for one meaning, varying by airport and direction.
  14: { key: 'info',      label: 'stInfo'        },
  20: { key: 'info',      label: 'stInfo'        },
  80: { key: 'info',      label: 'stInfo'        },
  84: { key: 'info',      label: 'stInfo'        },
  85: { key: 'info',      label: 'stInfo'        },
};

const reportedCodes = new Set();

// A code we have no mapping for is only news when it arrives with text, since
// that is the pairing that lets it be added to STATUS_CODES.
function logUnmappedCode(code, flight) {
  if (reportedCodes.has(code)) return;
  const text = (flight.OBSERVACION || '').trim() || (flight.OBSERVACION_INGLES || '').trim();
  if (!text) return;
  reportedCodes.add(code);
  console.info(`[lynceus] unmapped COD_COMENTARIO ${code} → ${text}`);
}

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

// ── Bolivian airports ───────────────────────────────────
// `city` is how the airport appears inside RUTA0, which uses city names rather
// than the ?aero= keys ('LA PAZ' for El Alto, 'SANTA CRUZ' for Viru Viru).
const BOLIVIAN_AIRPORTS = [
  { aero: 'El ALTo',           code: 'LPB', city: 'La Paz',       lat: -16.51027, lon: -68.18942 },
  { aero: 'Viru Viru',         code: 'VVI', city: 'Santa Cruz',   lat: -17.6448,  lon: -63.1354  },
  { aero: 'Jorge Wilstermann', code: 'CBB', city: 'Cochabamba',   lat: -17.42111, lon: -66.1771  },
  { aero: 'Sucre',             code: 'SRE', city: 'Sucre',        lat: -19.24684, lon: -65.14961 },
  { aero: 'Tarija',            code: 'TJA', city: 'Tarija',       lat: -21.5557,  lon: -64.7013  },
  { aero: 'Potosi',            code: 'POI', city: 'Potosi',       lat: -19.54333, lon: -65.72373 },
  { aero: 'Oruro',             code: 'ORU', city: 'Oruro',        lat: -17.95615, lon: -67.07583 },
  { aero: 'Trinidad',          code: 'TDD', city: 'Trinidad',     lat: -14.8187,  lon: -64.918   },
  { aero: 'Cobija',            code: 'CIJ', city: 'Cobija',       lat: -11.03911, lon: -68.78277 },
  { aero: 'Riberalta',         code: 'RIB', city: 'Riberalta',    lat: -11.00935, lon: -66.07547 },
  { aero: 'Guayamerin',        code: 'GYA', city: 'Guayaramerin', lat: -10.88856, lon: -65.38096 },
  { aero: 'Rurrenabaque',      code: 'RBQ', city: 'Rurrenabaque', lat: -14.4279,  lon: -67.4968  },
  { aero: 'Uyuni',             code: 'UYU', city: 'Uyuni',        lat: -20.4413,  lon: -66.85755 },
  { aero: 'Yacuiba',           code: 'BYC', city: 'Yacuiba',      lat: -21.9609,  lon: -63.6517  },
];

// Cities RUTA0 reaches outside Bolivia. Coordinates from the OurAirports dataset;
// 'Panama' and 'Tocumen' are the same airport, which is why the feed's
// "PANAMA  -  TOCUMEN" looks like two stops.
const OUTSIDE_AIRPORTS = [
  { city: 'Sao Paulo',         code: 'GRU', lat: -23.4313, lon: -46.47   },
  { city: 'Buenos Aires',      code: 'EZE', lat: -34.8222, lon: -58.5358 },
  { city: 'Lima',              code: 'LIM', lat: -12.0219, lon: -77.1143 },
  { city: 'Miami',             code: 'MIA', lat:  25.796,  lon: -80.2898 },
  { city: 'Madrid',            code: 'MAD', lat:  40.4934, lon:  -3.5722 },
  { city: 'Santiago De Chile', code: 'SCL', lat: -33.393,  lon: -70.7858 },
  { city: 'Santiago',          code: 'SCL', lat: -33.393,  lon: -70.7858 },
  { city: 'Bogota',            code: 'BOG', lat:   4.7016, lon: -74.1469 },
  { city: 'Iquique',           code: 'IQQ', lat: -20.5363, lon: -70.1814 },
  { city: 'Asuncion',          code: 'ASU', lat: -25.2402, lon: -57.5192 },
  { city: 'Panama',            code: 'PTY', lat:   9.0714, lon: -79.3835 },
  { city: 'Tocumen',           code: 'PTY', lat:   9.0714, lon: -79.3835 },
  { city: 'Cuzco',             code: 'CUZ', lat: -13.5357, lon: -71.9388 },
];

// Block time from great-circle distance. Fitted against seven legs whose real
// duration we could read off both boards (LPB-VVI 65m, CBB-VVI 50m, LPB-CBB
// 45m): 800 km/h plus 25 minutes of taxi, climb and approach lands within a
// mean of 1.9 minutes. Good enough to place an aircraft on a bar; not a
// substitute for a real departure time, so anything using it is flagged.
const CRUISE_KMH = 800;
const GROUND_MIN = 25;

function estimateLegMinutes(a, b) {
  if (!a || !b) return null;
  const R = 6371, rad = d => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  const km = 2 * R * Math.asin(Math.sqrt(h));
  return Math.round((km / CRUISE_KMH) * 60 + GROUND_MIN);
}

function airportByCity(name) {
  const n = norm(name);
  return n ? BOLIVIAN_AIRPORTS.find(a => norm(a.city) === n) || null : null;
}

function anyAirportByCity(name) {
  const n = norm(name);
  if (!n) return null;
  return BOLIVIAN_AIRPORTS.find(a => norm(a.city) === n)
      || OUTSIDE_AIRPORTS.find(a => norm(a.city) === n)
      || null;
}

function airportByAero(value) {
  return BOLIVIAN_AIRPORTS.find(a => a.aero === value) || null;
}

// ── Journey ─────────────────────────────────────────────
// A domestic leg appears on two boards: departures at its origin and arrivals at
// its destination. The route fix tells us which city holds the other end, so one
// request to the existing endpoint is enough — no fan-out across all 14 boards.
// International legs have no counterpart board and simply return null.
const journeyCache = new Map();
const boardCache   = new Map();
let   progressRun  = 0;

const PLANE_SVG = icon('plane', 20);

// Every arrival from La Paz wants the same El Alto departures board, so cache the
// promise rather than the result — 20 cards resolve from one request.
function loadBoard(aero, tipo) {
  const key = `${aero}|${tipo}`;
  if (!boardCache.has(key)) {
    boardCache.set(key, fetch(`/api/flights?aero=${encodeURIComponent(aero)}&tipo=${tipo}`,
        { signal: AbortSignal.timeout(6000) })
      .then(r => (r.ok ? r.json() : []))
      .catch(() => []));
  }
  return boardCache.get(key);
}

async function loadJourney(flight, route, isArrival) {
  const here     = airportByAero(state.airport);
  const fromCity = isArrival ? route.inboundFrom : route.outboundTo;
  const there    = airportByCity(fromCity);
  if (!here) return null;

  // No Bolivian board holds the other end (Bogota, Miami, Madrid...). The feed
  // gives no departure time for those, so derive one from the distance and mark
  // the result approximate rather than pretending we were told.
  if (!there || here.aero === there.aero) {
    const outside = isArrival ? anyAirportByCity(fromCity) : null;
    const mins    = outside && estimateLegMinutes(outside, here);
    const arrive  = actualAt(flight) || scheduledAt(flight);
    if (!outside || !mins || !arrive) return null;
    return {
      from: outside, to: here,
      departAt: new Date(arrive.getTime() - mins * 60_000),
      arriveAt: arrive,
      estimated: true,
    };
  }

  const key = `${flight.IDDW_ITINERARIO || flight.NRO_VUELO}|${there.aero}`;
  if (journeyCache.has(key)) return journeyCache.get(key);

  const mine = actualAt(flight) || scheduledAt(flight);
  if (!mine) return null;

  try {
    const rows = await loadBoard(there.aero, isArrival ? 'S' : 'L');

    // Same flight number can run twice in a day, so require the counterpart to
    // fall on the correct side of this leg and pick the closest such match.
    const MAX_LEG_MS = 5 * 60 * 60_000;
    let best = null;
    for (const r of rows) {
      if (r.ID_EMPRESA !== flight.ID_EMPRESA) continue;
      if ((r.NRO_VUELO || '').trim() !== (flight.NRO_VUELO || '').trim()) continue;
      const when = actualAt(r) || scheduledAt(r);
      if (!when) continue;
      const gap = isArrival ? mine - when : when - mine;
      if (gap <= 0 || gap > MAX_LEG_MS) continue;
      if (!best || gap < best.gap) best = { gap, when, record: r };
    }
    if (!best) return null;

    const journey = isArrival
      ? { from: there, to: here, departAt: best.when, arriveAt: mine }
      : { from: here, to: there, departAt: mine,      arriveAt: best.when };
    journeyCache.set(key, journey);
    return journey;
  } catch {
    return null;
  }
}

// ── Airport preference ──────────────────────────────────
// The API's airport keys are not the city names ('Jorge Wilstermann', not
// 'Cochabamba'), so a hand-typed or stale ?aero= is easy to get wrong. An
// unrecognised value used to reach the <select> untouched, which leaves it with
// selectedIndex -1 — blank on desktop, but rendered as the FIRST option on iOS
// and several mobile browsers, i.e. Cobija, for any bad value.
const KNOWN_AERO = new Set(['Cobija', 'Jorge Wilstermann', 'El ALTo', 'Guayamerin',
  'Oruro', 'Potosi', 'Riberalta', 'Rurrenabaque', 'Viru Viru', 'Sucre', 'Tarija',
  'Trinidad', 'Uyuni', 'Yacuiba']);

function validAero(value) {
  return value && KNOWN_AERO.has(value) ? value : null;
}

function storedAirport() {
  try { return localStorage.getItem(AIRPORT_KEY); } catch { return null; }
}

function rememberAirport(aero) {
  try { localStorage.setItem(AIRPORT_KEY, aero); } catch { /* private mode */ }
}

// Cloudflare resolves the nearest airport from the caller's IP at the edge.
// Any failure — offline, blocked, slow, or an older engine without
// AbortSignal.timeout — just leaves the default in place.
async function detectAirport(valid) {
  try {
    const res = await fetch('/api/nearest', { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const { airport } = await res.json();
    return valid.has(airport) ? airport : null;
  } catch {
    return null;
  }
}

// ── URL state ───────────────────────────────────────────
const SORT_MODES = ['time', 'delayed', 'airline'];

function readURLState() {
  const p = new URLSearchParams(window.location.search);
  const sort  = p.get('sort');
  let view = p.get('view');
  if (view !== 'board' && view !== 'list') {
    try { view = localStorage.getItem(VIEW_KEY); } catch { view = null; }
  }
  let sound = null;
  try { sound = localStorage.getItem(SOUND_KEY); } catch { /* private mode */ }
  // A link's ?aero= wins, then a previously picked airport. Only when there is
  // neither is the visitor new enough for geolocation to be the right guess.
  const aero  = validAero(p.get('aero'));
  const saved = validAero(storedAirport());
  return {
    airport: aero || saved || 'El ALTo',
    airportExplicit: Boolean(aero || saved),
    tipo:    p.get('tipo') === 'S' ? 'S' : 'L',
    sort:    SORT_MODES.includes(sort) ? sort : 'time',
    view:    view === 'board' ? 'board' : 'list',
    sound:   sound === '1',
    search:  p.get('q') || '',
  };
}

function writeURLState() {
  const p = new URLSearchParams({ aero: state.airport, tipo: state.tipo });
  if (state.sort !== 'time') p.set('sort', state.sort);
  if (state.search.trim())   p.set('q', state.search.trim());
  if (locale !== FALLBACK)   p.set('lang', locale);
  if (state.view === 'board') p.set('view', 'board');
  history.replaceState(null, '', `?${p}`);
}

// ── Flight helpers ──────────────────────────────────────
function getStatus(flight) {
  const code = Number.parseInt(flight.COD_COMENTARIO, 10);
  if (Number.isInteger(code)) {
    const byCode = STATUS_CODES[code];
    if (byCode) return { key: byCode.key, label: t(byCode.label) };
    logUnmappedCode(code, flight);
  }

  const obs = squashStatus(flight.OBSERVACION_INGLES || flight.OBSERVACION);
  if (obs) {
    const hit = STATUS_LOOKUP.find(([key]) => obs.includes(key));
    if (hit) return { key: hit[1].key, label: t(hit[1].label) };
  }

  // No usable status text — infer a delay from the times themselves
  const actual = (flight.HORA_REAL || '').trim();
  const sched  = (flight.HORA_ESTIMADA || '').trim();
  if (actual && sched && actual !== sched && delayMinutes(flight) > 4) {
    return { key: 'delayed', label: t('stDelayed') };
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

// Date → "HH:MM" on the Bolivian clock. getHours() would read the viewer's
// timezone and put a derived time hours away from the board it sits beside.
function formatBoliviaTime(date) {
  const b = new Date(date.getTime() + BOLIVIA_OFFSET_MIN * 60_000);
  return `${String(b.getUTCHours()).padStart(2, '0')}:${String(b.getUTCMinutes()).padStart(2, '0')}`;
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
  if (diff <= 1)  return t('now');
  if (diff < 60)  return t('inMin', { n: diff });
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m ? t('inHourMin', { h, m }) : t('inHour', { h });
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
  return AIRLINE_META[(name || '').trim().toUpperCase()] ?? { abbr: (name || '').slice(0, 3).toUpperCase() };
}

function formatTime(t) { return (t || '').trim() || '—'; }

function airlineIdHtml(meta) {
  return `<span class="airline-chip">${meta.abbr}</span>`;
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
    return { label: only, inboundFrom: only, outboundTo: only, stops: only === '—' ? [] : [only] };
  }

  const titled = stops.map(titleCase);

  // RUTA0 is the aircraft's rotation, and it reads in opposite directions on the
  // two boards. Verified against 35 flights cross-matched between boards:
  //
  //   departures  COCHABAMBA - ORURO - SUCRE - TARIJA   (17/17 go to the FIRST)
  //               -> this flight goes to Cochabamba; the rest is the aircraft's
  //                  later day, after everyone aboard has got off
  //   arrivals    MADRID - BUENOS AIRES - SANTA CRUZ    (18/19 came from the LAST)
  //               -> this flight came from Santa Cruz; Madrid was hours earlier
  //
  // So neither end is "the destination" on its own, and the stops in between are
  // not layovers anyone travelling on this leg experiences.
  return {
    label: `${titled[0]} → ${titled[titled.length - 1]}`,
    outboundTo: titled[0],
    inboundFrom: titled[titled.length - 1],
    stops: titled,
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
  const tipoLabel    = state.tipo === 'L' ? t('arrival') : t('departure');
  const relTime      = relTimeLabel(flight, statusKey);

  const fr24Url = meta.iata && flightNum
    ? `https://www.flightradar24.com/data/flights/${meta.iata.toLowerCase()}${flightNum.replace(/\s+/g, '')}`
    : null;

  // RUTA0 never contains the airport you are standing in, so on its own the list
  // reads as four unexplained cities — for an arrival at Cochabamba, Cochabamba
  // is absent and only the last entry is this flight's origin. Splice the current
  // airport onto the correct end and mark the single hop that is actually your
  // flight; everything else is the same aircraft earlier or later in its day.
  const isArr     = state.tipo === 'L';
  const hereCity  = airportByAero(state.airport)?.city || state.airport;
  const published = route.stops.length ? route.stops : [route.label];
  const chain     = isArr ? [...published, hereCity] : [hereCity, ...published];

  // the two ends of this leg: last pair on arrivals, first pair on departures
  const legFrom = isArr ? chain.length - 2 : 0;
  const legTo   = legFrom + 1;

  const stopsHtml = chain.map((stop, i) => {
    const onLeg = i === legFrom || i === legTo;
    const here  = isArr ? i === chain.length - 1 : i === 0;
    const caption = i === legFrom
      ? t('thisFlight')
      : (!isArr && i === legTo + 1) ? t('laterToday')
      : (isArr && i === 0 && legFrom > 0) ? t('earlierToday')
      : '';
    return `
      ${caption ? `<p class="route-caption">${caption}</p>` : ''}
      <div class="route-stop${onLeg ? ' on-leg' : ' off-leg'}">
        <div class="route-stop-dot${onLeg ? ' filled' : ''}"></div>
        <span class="route-stop-name">${stop}${here ? ` <span class="route-here">· ${t('youAreHere')}</span>` : ''}</span>
      </div>
      ${i < chain.length - 1 ? `<div class="route-stop-line${i === legFrom ? ' on-leg' : ''}"></div>` : ''}
    `;
  }).join('');

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-head">
      <div class="modal-logo">${airlineIdHtml(meta)}</div>
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
      ${gate ? `<span class="row-gate">${t('gateShort', { n: gate })}</span>` : ''}
    </div>
    <div id="modal-journey" data-for="${flight.IDDW_ITINERARIO || flightNum}"></div>
    <p class="modal-section-label">${t('fullRoute')}</p>
    <div class="modal-route">${stopsHtml}</div>
    <div class="modal-actions">
      ${fr24Url ? `
        <a class="modal-action" href="${fr24Url}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">
          ${icon('radio', 16)}
          ${t('track')}
        </a>` : ''}
      <button class="modal-action" id="modal-share">
        ${icon('share', 16)}
        ${t('share')}
      </button>
    </div>
  `;

  const shareBtn = document.getElementById('modal-share');
  shareBtn.addEventListener('click', async () => {
    // Share the link alone. Passing both `text` and `url` to navigator.share
    // lets some targets concatenate them, which is how a shared "link" came out
    // as a URL with the whole flight summary glued onto its end. The link now
    // carries ?flight=, so it says everything the text used to.
    const link = new URL(window.location.href);
    link.searchParams.set('flight', flight.IDDW_ITINERARIO || flightNum);
    const url = link.toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${meta.iata ? meta.iata + ' ' : ''}${flightNum} · ${isArr ? route.inboundFrom : route.outboundTo}`,
          url,
        });
      } catch { /* user cancelled the share sheet */ }
      return;
    }

    const copied = await copyText(url);
    shareBtn.querySelector('svg').style.display = 'none';
    shareBtn.lastChild.textContent = copied ? t('copied') : t('copyFailed');
  });

  // Departures are all at 0% until the aircraft leaves, so the bar only earns
  // its place on arrivals, where watching the plane close in is the whole point.
  const wantJourney = state.tipo === 'L';
  (wantJourney ? loadJourney(flight, route, true) : Promise.resolve(null)).then(j => {
    const slot = document.getElementById('modal-journey');
    // The sheet may have been closed and reopened on another flight by now
    if (!j || !slot || slot.dataset.for !== String(flight.IDDW_ITINERARIO || flightNum)) return;

    const span = j.arriveAt - j.departAt;
    const pct  = Math.max(0, Math.min(1, (Date.now() - j.departAt) / (span || 1)));
    const phase = pct <= 0 ? t('journeyBefore') : pct >= 1 ? t('journeyDone') : t('journeyOnWay');
    const mins = Math.round(span / 60_000);
    const dur  = mins >= 60 ? `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m` : `${mins} min`;

    slot.innerHTML = `
      <p class="modal-section-label">${phase} · ${dur}${j.estimated ? ` · ${t('journeyApprox')}` : ''}</p>
      <div class="journey">
        <div class="journey-end">
          <span class="journey-code">${j.from.code}</span>
          <span class="journey-time">${j.estimated ? '~' : ''}${formatBoliviaTime(j.departAt)}</span>
        </div>
        <div class="journey-track">
          <div class="journey-fill" style="width:${(pct * 100).toFixed(1)}%"></div>
          <div class="journey-plane" style="left:${(pct * 100).toFixed(1)}%" aria-hidden="true">
            ${icon('plane', 22)}
          </div>
        </div>
        <div class="journey-end">
          <span class="journey-code">${j.to.code}</span>
          <span class="journey-time">${formatBoliviaTime(j.arriveAt)}</span>
        </div>
      </div>`;
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
    ? `<span class="summary-count">${t('flightsOfTotal', { shown, total })}</span>`
    : `<span class="summary-count">${plural('flights', total)}</span>`;

  strip.innerHTML = delayed
    ? `${countLabel}<span class="summary-sep">·</span><span class="summary-delayed">${plural('delayedCount', delayed)}</span>`
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
  const endpoint    = isArrival ? route.inboundFrom : route.outboundTo;
  const flightNum   = (flight.NRO_VUELO || '').trim();
  const cardId      = flight.IDDW_ITINERARIO || flightNum;
  const pinned      = getPins().has(flightNum);
  const dotCfg      = STATUS_DOT[statusKey];
  const relTime     = relTimeLabel(flight, statusKey);

  const badgeClass = BADGE_KEYS.has(statusKey) ? statusKey : 'scheduled';

  const pinIcon = icon('bookmark', 15, pinned ? { fill: 'currentColor' } : {});

  return `
    <article class="flight-row status-${statusKey}${pinned ? ' is-pinned' : ''}" role="listitem"
      data-flight="${flightNum}" data-id="${cardId}" tabindex="0"
      aria-label="${t('cardLabel', { airline: meta.abbr, n: flightNum, dir: isArrival ? t('dirFrom') : t('dirTo'), place: endpoint, status: statusLabel || t('scheduled') })}">
      <div class="fr-head">
        <span class="fr-logo airline-chip">${meta.abbr}</span>
        <span class="fr-airline">${flight.NOMBRE_AEROLINEA || ''}</span>
        <span class="fr-flightnum">${flightNum}</span>
        <button class="pin-btn${pinned ? ' pinned' : ''}"
          aria-label="${pinned ? t('pinRemove', { n: flightNum }) : t('pinAdd', { n: flightNum })}"
          aria-pressed="${pinned}"
          data-pin="${flightNum}">
          ${pinIcon}
        </button>
      </div>
      <div class="fr-journey${isArrival ? ' inbound' : ''}">
        ${[
          `<div class="fr-dest-wrap">
             <span class="fr-dest-label">${isArrival ? t('routeFrom') : t('routeTo')}</span>
             <span class="fr-dest">${endpoint}</span>
           </div>`,
          `<div class="fr-route-line" data-leg="${cardId}" aria-hidden="true"></div>`,
          `<div class="fr-times">
             ${showActual ? `<span class="fr-time-old">${sched}</span>` : ''}
             <span class="fr-time${showActual ? ` ${timeTone}` : ''}">${showActual ? actual : sched}</span>
             ${delay ? `<span class="delay-tag ${timeTone}">${delay}</span>` : ''}
           </div>`,
        // An arrival reads origin -> time ("from Bogota, landing 02:22"); a
        // departure reads time -> destination. Same arrow, opposite order.
        ][isArrival ? 'slice' : 'reverse']().join('')}
      </div>
      <div class="fr-footer">
        ${dotCfg ? `<span class="status-dot ${dotCfg.color}${dotCfg.pulse ? ' pulse' : ''}" aria-hidden="true"></span>` : ''}
        ${statusLabel ? `<span class="status-badge ${badgeClass}">${statusLabel}</span>` : ''}
        ${relTime ? `<span class="rel-time">${relTime}</span>` : ''}
        ${gate ? `<div class="gate-badge"><span class="gate-label">${t('gate')}</span><span class="gate-num">${gate}</span></div>` : ''}
      </div>
    </article>
  `;
}



// ── Flap sound ──────────────────────────────────────────
// A flap landing is a broadband transient with a very fast decay, so it is
// synthesised rather than shipped as an audio file: nothing to download, works
// offline, and every click can be varied slightly so a cascade does not sound
// like one sample on loop.
//
// Off by default — a board that starts clattering unannounced is not a nice
// surprise — and the AudioContext is only created once the user asks for it,
// since browsers refuse to start audio without a gesture anyway.
const SOUND_KEY = 'lynceus_sound';
let audio = null;

function initAudio() {
  if (audio) return audio;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();

  const master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);

  // A handful of pre-rendered noise bursts, cycled at random, is far cheaper
  // than building a buffer per click during a full-board cascade.
  const buffers = Array.from({ length: 6 }, () => {
    const len = Math.floor(ctx.sampleRate * 0.035);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const decay = Math.pow(1 - i / len, 7);      // sharp attack, quick tail
      data[i] = (Math.random() * 2 - 1) * decay;
    }
    return buf;
  });

  audio = { ctx, master, buffers };
  return audio;
}

// Token bucket. A cascade can fire hundreds of flips a second; a real board is
// a clatter, not a wall of white noise, so only so many clicks are let through
// per window and the rest are dropped.
let clickTokens = 0;
let tokenStamp  = 0;

function flapClick() {
  if (!state.sound || !audio) return;
  const { ctx, master, buffers } = audio;
  if (ctx.state === 'suspended') return;

  const now = performance.now();
  if (now - tokenStamp > 90) { tokenStamp = now; clickTokens = 7; }
  if (clickTokens <= 0) return;
  clickTokens--;

  const src = ctx.createBufferSource();
  src.buffer = buffers[(Math.random() * buffers.length) | 0];
  src.playbackRate.value = 0.85 + Math.random() * 0.4;

  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 1500 + Math.random() * 1400;
  band.Q.value = 0.9;

  const gain = ctx.createGain();
  gain.gain.value = 0.12 + Math.random() * 0.12;

  src.connect(band).connect(gain).connect(master);
  src.start();
}

// ── Split-flap board ────────────────────────────────────
// A Solari board only ever carried capitals, digits and a little punctuation,
// so text is folded to that set — accents included, which is why Potosí reads
// POTOSI here and nowhere else in the app.
const FLAP_CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-/';
const VIEW_KEY   = 'lynceus_view';

// Column widths in characters — a real board has a fixed number of flaps per
// column, so text is truncated or padded to fit.
//
// The full board is 42 characters wide, which cannot be shown legibly on a
// phone: fitting it would put the tiles under 7px. So narrower screens drop
// columns rather than shrink past readability. Gate goes first (it is often
// empty anyway), then the flight number.
const BOARD_LAYOUTS = [
  { upTo: 560,      cols: [['time', 5], ['place', 11], ['status', 9]] },
  { upTo: 900,      cols: [['time', 5], ['flight', 7], ['place', 12], ['status', 10]] },
  { upTo: Infinity, cols: [['time', 5], ['flight', 7], ['place', 14], ['gate', 4], ['status', 12]] },
];

function boardColumns() {
  const w = document.documentElement.clientWidth;
  const layout = BOARD_LAYOUTS.find(l => w <= l.upTo) ?? BOARD_LAYOUTS[BOARD_LAYOUTS.length - 1];
  return layout.cols.map(([key, width]) => ({ key, width }));
}

// Tile size is solved from the space actually available rather than guessed with
// clamp(), so the board always lands exactly inside its container and never
// scrolls sideways.
const TILE_GAP = 2;

function fitBoard(board, cols) {
  const chars   = cols.reduce((n, c) => n + c.width, 0);
  const colGap  = document.documentElement.clientWidth < 560 ? 7 : 16;
  const style   = getComputedStyle(board);
  const inner   = board.clientWidth
    - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const gaps    = (chars - cols.length) * TILE_GAP + (cols.length - 1) * colGap;
  const tile    = Math.max(7, Math.floor((inner - gaps) / chars));
  board.style.setProperty('--flap-w', `${tile}px`);
  board.style.setProperty('--flap-h', `${Math.round(tile * 1.55)}px`);
  board.style.setProperty('--flap-col-gap', `${colGap}px`);
}

function flapText(str, width) {
  const folded = (str || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .split('')
    .map(c => (FLAP_CHARS.includes(c) ? c : ' '))
    .join('');
  return folded.slice(0, width).padEnd(width, ' ');
}

function boardRowValues(flight) {
  const { key: statusKey, label: statusLabel } = getStatus(flight);
  const route     = parseRoute(flight.RUTA0, flight.RUTA);
  const isArrival = state.tipo === 'L';
  const meta      = getAirlineMeta(flight.NOMBRE_AEROLINEA);
  const showReal  = TIME_MOVED_KEYS.has(statusKey) && (flight.HORA_REAL || '').trim();
  return {
    time:   showReal ? flight.HORA_REAL.trim() : (flight.HORA_ESTIMADA || '').trim(),
    flight: `${meta.iata || meta.abbr} ${(flight.NRO_VUELO || '').trim()}`,
    place:  isArrival ? route.inboundFrom : route.outboundTo,
    gate:   (flight.NRO_PUERTA || '').trim(),
    // A Solari column cannot be blank the way a card can just omit its badge,
    // so the default state is named here rather than left empty.
    status: statusLabel || t('stScheduled'),
    statusKey,
  };
}

// Cycling the glyph is what sells a split-flap: the tile runs forward through
// the drum to its target rather than cutting straight to it, because a real
// flap cannot reverse.
//
// Two things have to be tracked per tile. The settled value lives in dataset.v,
// not in textContent, so a re-render mid-flip compares against where the tile
// is *going* rather than whichever glyph it happens to be showing. And the
// running timers are held so a new value cancels the old animation — without
// that, two intervals interleave on one tile and it sticks partway down the
// drum.
const flapTimers = new WeakMap();

function stopFlap(tile) {
  const running = flapTimers.get(tile);
  if (!running) return;
  clearTimeout(running.start);
  clearInterval(running.tick);
  flapTimers.delete(tile);
}

function flipTile(tile, target, delay, animate = true) {
  stopFlap(tile);
  const from = FLAP_CHARS.indexOf(tile.dataset.v ?? ' ');
  const to   = FLAP_CHARS.indexOf(target);
  tile.dataset.v = target;

  if (!animate || to < 0 || from === to ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tile.textContent = target;
    return;
  }

  let i = from < 0 ? 0 : from;
  const steps = (to - i + FLAP_CHARS.length) % FLAP_CHARS.length;
  let n = 0;
  const start = setTimeout(() => {
    const tick = setInterval(() => {
      i = (i + 1) % FLAP_CHARS.length;
      tile.textContent = FLAP_CHARS[i];
      flapClick();
      tile.classList.remove('flipping');
      void tile.offsetWidth;
      tile.classList.add('flipping');
      if (++n >= steps) {
        clearInterval(tick);
        tile.textContent = target;
      }
    }, 38);
    flapTimers.set(tile, { tick });
  }, delay);
  flapTimers.set(tile, { start });
}

function renderBoard(flights) {
  const host = document.getElementById('flights-list');
  const cols = boardColumns();
  const head = cols.map(c =>
    `<div class="flap-head" style="--w:${c.width}">${t('col_' + c.key)}</div>`).join('');

  const existing = host.querySelector('.flap-board');
  const rows = flights;
  const shape = `${rows.length}:${cols.map(c => c.key + c.width).join(',')}`;

  if (!existing || existing.dataset.shape !== shape) {
    host.innerHTML = `
      <div class="flap-board" data-shape="${shape}">
        <div class="flap-row flap-header">${head}</div>
        ${rows.map(() => `<div class="flap-row">${
          cols.map(c => `<div class="flap-cell" style="--w:${c.width}">${
            Array.from({ length: c.width }, () => '<span class="flap-tile"> </span>').join('')
          }</div>`).join('')
        }</div>`).join('')}
      </div>`;
  }

  // Headings are plain text, not flaps, so they are refreshed on every render
  // rather than only when the board is rebuilt — otherwise a language change
  // updates the tiles but leaves the headings stale.
  const headEls = host.querySelectorAll('.flap-head');
  cols.forEach((c, i) => { if (headEls[i]) headEls[i].textContent = t('col_' + c.key); });

  fitBoard(host.querySelector('.flap-board'), cols);

  // A busy airport runs to 60+ rows. Cascading all of them would keep thousands
  // of tile timers alive and take seconds to reach the bottom, so only rows on
  // screen flip; the rest settle instantly and are already right when scrolled
  // to. The stagger counts from the first visible row so the cascade starts at
  // once however far down the board is scrolled.
  const rowEls  = [...host.querySelectorAll('.flap-row:not(.flap-header)')];
  const onScreen = rowEls.map(el => {
    const { top, bottom } = el.getBoundingClientRect();
    return bottom > 0 && top < window.innerHeight;
  });
  const firstVisible = Math.max(0, onScreen.indexOf(true));

  rows.forEach((flight, r) => {
    const values = boardRowValues(flight);
    const cells  = [...rowEls[r].children];
    const rowDelay = (r - firstVisible) * 52;
    rowEls[r].dataset.status = values.statusKey;
    cols.forEach((col, c) => {
      const text  = flapText(values[col.key], col.width);
      const tiles = [...cells[c].children];
      tiles.forEach((tile, i) => {
        if ((tile.dataset.v ?? ' ') !== text[i]) {
          flipTile(tile, text[i], rowDelay + (c * 40 + i * 16), onScreen[r]);
        }
      });
    });
  });
}

function renderFlights(animate) {
  if (state.view === 'board') {
    const filtered = filterFlights(state.flights);
    renderBoard(sortFlights(filtered, state.sort));
    updateSummary(state.flights, filtered);
    return;
  }

  const list     = document.getElementById('flights-list');
  const filtered = filterFlights(state.flights);
  const flights  = sortFlights(filtered, state.sort);

  list.classList.toggle('no-animate', !animate);

  list.innerHTML = flights.length
    ? flights.map(renderCard).join('')
    : `<div class="state-empty">
        ${icon(state.search ? 'searchX' : 'plane', 34)}
        <p>${state.search ? t('emptySearch') : t('emptyBoard')}</p>
      </div>`;

  updateSummary(state.flights, filtered);
  if (state.tipo === 'L') paintCardProgress(flights);
}

// Draws the aircraft onto each arrival card's connector line. Runs after the
// list is on screen and mutates in place, so a slow counterpart board never
// delays the board itself.
async function paintCardProgress(flights) {
  const token = ++progressRun;
  for (const flight of flights) {
    const j = await loadJourney(flight, parseRoute(flight.RUTA0, flight.RUTA), true);
    if (token !== progressRun) return;   // a newer render superseded this pass
    if (!j) continue;

    const id   = flight.IDDW_ITINERARIO || (flight.NRO_VUELO || '').trim();
    const line = document.querySelector(`.fr-route-line[data-leg="${id}"]`);
    if (!line || line.dataset.painted) continue;

    const span = j.arriveAt - j.departAt;
    const pct  = Math.max(0, Math.min(1, (Date.now() - j.departAt) / (span || 1))) * 100;
    line.dataset.painted = '1';
    line.classList.add('has-progress');
    line.innerHTML =
      `<div class="fr-progress-fill" style="width:${pct.toFixed(1)}%"></div>` +
      `<div class="fr-progress-plane${j.estimated ? ' estimated' : ''}" style="left:${pct.toFixed(1)}%">${PLANE_SVG}</div>`;
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
const initURL = readURLState();

const state = {
  airport: initURL.airport,
  airportExplicit: initURL.airportExplicit,
  tipo:    initURL.tipo,
  sort:    initURL.sort,
  view:    initURL.view,
  sound:   initURL.sound,
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
    boardCache.clear();
    journeyCache.clear();
    lastFetchAt = Date.now();
    renderFlights(!isRefresh);

    const now = new Date();
    document.getElementById('last-updated').textContent =
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  } catch (err) {
    if (!isRefresh) {
      list.innerHTML = `
        <div class="state-empty">
          ${icon('alert', 34)}
          <p>${t('loadError')}</p>
          <button class="retry-btn" type="button">${t('retry')}</button>
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
document.addEventListener('DOMContentLoaded', async () => {
  const airportSelect = document.getElementById('airport-select');
  const tabs          = document.querySelectorAll('.tab');
  const sortPills     = document.querySelectorAll('.sort-pill');
  const flightsList   = document.getElementById('flights-list');
  const searchInput   = document.getElementById('search-input');
  const searchClear   = document.getElementById('search-clear');
  const searchBar     = document.getElementById('search-bar');

  applyStaticStrings();

  // On a 393px phone the six header controls needed 396px on their own, so they
  // collapse behind one button and reappear as a labelled panel.
  const navToggle = document.getElementById('nav-toggle');
  const navPanel  = document.getElementById('header-controls');
  navToggle.innerHTML = icon('menu', 16);

  const setNav = open => {
    navPanel.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.innerHTML = icon(open ? 'x' : 'menu', 16);
  };
  navToggle.addEventListener('click', e => {
    e.stopPropagation();
    setNav(!navPanel.classList.contains('is-open'));
  });
  document.addEventListener('click', e => {
    if (navPanel.classList.contains('is-open') && !navPanel.contains(e.target)) setNav(false);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });

  const viewBtn  = document.getElementById('view-btn');
  const soundBtn = document.getElementById('sound-btn');

  const syncSoundBtn = () => {
    soundBtn.innerHTML = icon(state.sound ? 'volume2' : 'volumeX', 15);
    soundBtn.setAttribute('aria-label', t(state.sound ? 'soundOff' : 'soundOn'));
    soundBtn.setAttribute('aria-pressed', String(state.sound));
    soundBtn.classList.toggle('is-on', state.sound);
    // The clatter only belongs to the board, so the control goes with it
    document.getElementById('sound-row').hidden = state.view !== 'board';
  };

  const syncViewBtn = () => {
    viewBtn.innerHTML = icon(state.view === 'board' ? 'list' : 'layoutGrid', 15);
    viewBtn.setAttribute('aria-label', t(state.view === 'board' ? 'viewList' : 'viewBoard'));
    viewBtn.setAttribute('aria-pressed', String(state.view === 'board'));
    document.body.classList.toggle('view-board', state.view === 'board');
    syncSoundBtn();
  };
  syncViewBtn();

  soundBtn.addEventListener('click', () => {
    state.sound = !state.sound;
    try { localStorage.setItem(SOUND_KEY, state.sound ? '1' : '0'); } catch { /* private mode */ }
    if (state.sound) {
      const a = initAudio();
      // Browsers hand back a suspended context until a gesture resumes it, and
      // resume() is async — clicking before it settles is silently dropped.
      if (a && a.ctx.state === 'suspended') {
        a.ctx.resume().then(flapClick, () => {});
      } else {
        flapClick();                     // confirm the toggle audibly
      }
    }
    syncSoundBtn();
  });
  viewBtn.addEventListener('click', () => {
    state.view = state.view === 'board' ? 'list' : 'board';
    try { localStorage.setItem(VIEW_KEY, state.view); } catch { /* private mode */ }
    syncViewBtn();
    writeURLState();
    document.getElementById('flights-list').innerHTML = '';
    renderFlights(true);
  });

  const langSelect = document.getElementById('lang-select');
  langSelect.value = locale;
  langSelect.addEventListener('change', () => setLocale(langSelect.value));

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

  const placeIndicator = () => {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) updateTabIndicator(activeTab);
  };
  requestAnimationFrame(placeIndicator);
  // The indicator is sized from measured text, so it has to be re-measured once
  // the webfont swaps in — otherwise it keeps the fallback font's width.
  if (document.fonts?.ready) document.fonts.ready.then(placeIndicator);

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
    state.airportExplicit = true;
    rememberAirport(state.airport);
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

  // The tab indicator is positioned from measured rects, which only ran on
  // click and at startup — fine on a phone, wrong the moment a desktop window
  // is resized. Re-measure on resize.
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const activeTab = document.querySelector('.tab.active');
      if (activeTab) updateTabIndicator(activeTab);
      // The board solves its tile size from the container, so it has to be
      // re-solved whenever that container changes width.
      if (state.view === 'board') renderFlights(false);
    }, 120);
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

  // A ?flight= link opens straight onto that flight's sheet once the board has
  // loaded. writeURLState never writes it back, so it clears on any interaction.
  const openSharedFlight = () => {
    const wanted = new URLSearchParams(window.location.search).get('flight');
    if (!wanted) return;
    const match = state.flights.find(f =>
      String(f.IDDW_ITINERARIO) === wanted || (f.NRO_VUELO || '').trim() === wanted);
    if (match) openModal(match);
  };

  if (!state.airportExplicit) {
    const valid = new Set([...airportSelect.options].map(o => o.value));
    const detected = await detectAirport(valid);
    if (detected && detected !== state.airport) {
      state.airport = detected;
      airportSelect.value = detected;
      writeURLState();
    }
  }

  await fetchFlights();
  openSharedFlight();
  scheduleRefresh();
});
