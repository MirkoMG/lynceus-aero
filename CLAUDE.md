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
- `NRO_VUELO` — flight number (digits only, no airline prefix)
- `NOMBRE_AEROLINEA` — airline name in uppercase
- `ID_EMPRESA` — airline code used for logos (e.g. B50015 = BoA)
- `HORA_ESTIMADA` — scheduled time HH:MM
- `HORA_REAL` — actual time HH:MM (empty if on time)
- `OBSERVACION` — status in Spanish
- `OBSERVACION_INGLES` — status in English
- `RUTA0` / `RUTA` — route/destination (pipe or >> separated for multi-stop)
- `NRO_PUERTA` — gate number

Airline logos: `https://fids.naabol.gob.bo/img/Aerolineas/{ID_EMPRESA}.png`
