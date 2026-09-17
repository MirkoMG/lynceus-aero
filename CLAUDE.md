# Lynceus Aero — Claude context

## What this is

A mobile-first flight information display (FIDS) for Bolivian airports. Redesign of the official NAABOL FIDS at https://fids.naabol.gob.bo. Built with vanilla HTML/CSS/JS, no framework by choice.

## Running locally

```bash
pnpm dev   # Express server on :3000
```

The Express server in `server.js` proxies `/api/flights` to the NAABOL API to avoid CORS. In production this is replaced by `functions/api/flights.js` (Cloudflare Pages Function).

## Architecture

```
public/
  index.html   — layout, airport dropdown, tabs, search, sort bar
  style.css    — all styles, light/dark via html[data-theme="dark"]
  app.js       — all client logic, no dependencies
  sw.js        — service worker: network-first cache, offline fallback
  manifest.webmanifest, icon.svg, apple-touch-icon.png — PWA assets

functions/
  api/
    flights.js — Cloudflare Pages Function, mirrors server.js proxy

server.js      — local dev Express proxy (not deployed)
```

## Key design decisions

- **No framework** — intentional, keeps it fast and simple
- **pnpm** — use pnpm, not npm
- **Theme** — `html[data-theme]` attribute, set by inline script before CSS to prevent flash
- **Design system** — monochrome transit-kiosk: white canvas, one grey surface
  step (`--surface-2`), black structural bands (header, active tab, active sort
  pill). Strictly flat — **no drop shadows anywhere**; depth is the surface
  progression plus 1px hairlines. Radii are binary: `--r-card` (8px) for
  surfaces and controls, `--r-pill` for toggles only. Type is Inter for the
  interface, Plex Mono for clock times.

  **The one colour exception:** flight state. Chrome, controls, labels and
  numerals are achromatic; green/amber/red/blue appear only on status badges and
  the status rail, and on a time that has actually moved. On a departure board
  that is content, not decoration — stripping it would look right and read
  badly. Do not add colour to buttons, tabs, links or headings.

- **Animations** — Emil Kowalski principles: specific properties, `cubic-bezier(0.23, 1, 0.32, 1)`, `scale(0.97)` on active, hover only on `(hover: hover) and (pointer: fine)`
- **Logos** — served from NAABOL's own CDN using `ID_EMPRESA` field from API response
- **Card layout** — Skyscanner-inspired: airline header row, large time → route line → destination, status + gate footer; the whole card opens the detail sheet
- **Mobile gestures** — custom pull-to-refresh (native disabled via `overscroll-behavior-y: contain`) and swipe-down to dismiss the bottom sheet; both in `app.js`
- **PWA** — installable; `sw.js` uses network-first with cache fallback so the last-seen board still opens offline
- **Logos on dark chips** — NAABOL serves light-on-dark logos, so `<img>` logos always sit on a `#191922` chip in both themes
- **Flightradar24 links** — must carry `rel="noopener noreferrer"` and
  `referrerpolicy="no-referrer"`. FR24 answers **451 Unavailable For Legal Reasons**
  when a request arrives with a `Referer` it does not expect; the same URL typed
  directly loads fine. Do not drop these attributes. Note FR24 also has no data at
  all for many Bolivian domestic flights and paywalls the history of the rest, so
  the action is labelled "Ver en Flightradar24", not "track"
- **Route parsing** — the API pads routes with numeric placeholders (`"SANTA CRUZ - 000"`); `parseRoute()` drops all-digit stops

## NAABOL API

Single endpoint: `GET /Fids/itin/vuelos?aero=<airport>&tipo=<L|S>`

Key response fields:
- `IDDW_ITINERARIO` — stable per-flight id (use this as a key, not `NRO_VUELO`)
- `FECHA` — operational date, `YYYY-MM-DD 00:00:00.000`
- `FECHA_HORA` / `FECHA_HORA_FORMAT` — full effective timestamp; mirrors `HORA_REAL`
  once a new time is published. Times carry no offset — they are Bolivian local
  (UTC-4, no DST), which is why `app.js` pins them to that offset rather than the
  viewer's timezone
- `NRO_VUELO` — flight number (digits only, no airline prefix; NOT unique across
  airlines or airports, so it is not a safe key)
- `NOMBRE_AEROLINEA` — airline name in uppercase
- `ID_EMPRESA` — airline code used for logos (e.g. B50015 = BoA)
- `HORA_ESTIMADA` — scheduled time HH:MM
- `HORA_REAL` — actual time HH:MM (empty if on time)
- `COD_COMENTARIO` — **the authoritative status code**, and better data than the
  text: code 72 covers both `PRE-EMBARQUE` and `PREEMBARCANDO`, and codes 4/16/54
  all read `DEMORADO`, so the code separates cases the wording collapses.
  `getStatus()` tries it first.

  **Codes are direction-specific**: arrivals use 8/11/77/82, departures use
  2/19/22/35/72/76. The same meaning therefore has different codes on the two
  boards — `EN HORARIO` is 8 inbound but 35 or 22 outbound.

  Codes **11 and 77 (arrivals) and 19 and 76 (departures)** are the
  "scheduled, nothing published yet" state. Across 159 records they are always
  empty, always on a flight still in the future, and never on one whose time has
  moved. They are left unmapped because falling through to `scheduled` is already
  correct. This is why a board can look empty: at El Alto at 01:00, 21 of 22
  flights sit in that state, while Viru Viru has already been updated. The
  split-flap view names it `PROGRAMADO` because a fixed grid cannot have a blank
  column; the list omits the badge instead.

  `logUnmappedCode()` prints any code that turns up carrying text, which is how
  codes 2, 14, 20, 80, 84 and 85 were found. The last five all mean `INFORMES` /
  `INFORMATION` — the airport telling passengers to ask at the desk. It is real
  upstream data, not a rendering fault
- `OBSERVACION` — status in Spanish
- `OBSERVACION_INGLES` — status in English, right-padded with spaces. Spacing and
  hyphenation are inconsistent (`PRE-BOARDING`, `PRE BOARDING`, `PREEMBARCANDO`),
  so `getStatus()` matches on a squashed form, longest key first
- `RUTA0` / `RUTA` — the aircraft's **rotation**, not this flight's itinerary, and it
  reads in **opposite directions on the two boards**. Verified by cross-matching 35
  flights between boards:
  - **departures**: the FIRST stop is where this leg actually goes (17/17). The rest
    is the aircraft's later day — e.g. La Paz→Cochabamba is a 45-minute nonstop, but
    publishes as `COCHABAMBA - ORURO - SUCRE - TARIJA - TRINIDAD`
  - **arrivals**: the LAST stop is where this leg came from (18/19). Earlier entries
    are hours-old history — `MADRID - BUENOS AIRES - SANTA CRUZ` arriving La Paz
    flew in from Santa Cruz, not Madrid

  The intermediate stops are **not layovers** for anyone on this leg, so the board
  shows one endpoint and no stop count. Never render `RUTA0` first → last.
- `NRO_PUERTA` — gate number

Airline logos: `https://fids.naabol.gob.bo/img/Aerolineas/{ID_EMPRESA}.png`
