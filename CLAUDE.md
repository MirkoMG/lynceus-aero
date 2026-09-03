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
- **Animations** — Emil Kowalski principles: specific properties, `cubic-bezier(0.23, 1, 0.32, 1)`, `scale(0.97)` on active, hover only on `(hover: hover) and (pointer: fine)`
- **Logos** — served from NAABOL's own CDN using `ID_EMPRESA` field from API response
- **Card layout** — Skyscanner-inspired: airline header row, large time → route line → destination, status + gate footer; the whole card opens the detail sheet
- **Mobile gestures** — custom pull-to-refresh (native disabled via `overscroll-behavior-y: contain`) and swipe-down to dismiss the bottom sheet; both in `app.js`
- **PWA** — installable; `sw.js` uses network-first with cache fallback so the last-seen board still opens offline
- **Logos on dark chips** — NAABOL serves light-on-dark logos, so `<img>` logos always sit on a `#191922` chip in both themes
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
- `OBSERVACION` — status in Spanish
- `OBSERVACION_INGLES` — status in English, right-padded with spaces. Spacing and
  hyphenation are inconsistent (`PRE-BOARDING`, `PRE BOARDING`, `PREEMBARCANDO`),
  so `getStatus()` matches on a squashed form, longest key first
- `RUTA0` / `RUTA` — the aircraft's full published rotation (pipe or `>>` separated).
  It frequently neither starts nor ends at the airport being viewed, so the board
  shows the origin on arrivals and the destination on departures rather than
  first → last; the detail sheet lists the whole chain
- `NRO_PUERTA` — gate number

Airline logos: `https://fids.naabol.gob.bo/img/Aerolineas/{ID_EMPRESA}.png`
