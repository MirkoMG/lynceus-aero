# Lynceus Aero

A mobile-first flight information display for Bolivian airports, built on top of the public [NAABOL FIDS](https://fids.naabol.gob.bo) API.

## Features

- Live arrivals and departures for all Bolivian airports
- Delay indicators with actual vs scheduled times, plus live "en X min" countdowns
- Search by flight number, destination, or airline (accent-insensitive)
- Sort by time, delays first, or airline
- Pin flights to track at the top
- Tap any flight for a detail sheet: full route, share, and Flightradar24 tracking
- Pull to refresh, swipe down to dismiss the sheet
- Installable PWA — the last-seen board still opens offline
- Available in Spanish, English and Brazilian Portuguese
- Opens on the airport nearest you, resolved from your IP at the edge
- Responsive from phone to desktop — the board becomes a card grid on wide screens
- Light and dark theme
- Auto-refreshes every 60 seconds (and on reconnect / returning to the tab)

## Stack

- Vanilla HTML / CSS / JS — no framework
- Express proxy server for local dev (avoids CORS)
- Cloudflare Pages + Pages Functions for production

## Local development

```bash
pnpm install
pnpm dev        # starts on http://localhost:3000
```

Nearest-airport detection relies on Cloudflare's edge geolocation, which does not
exist locally. To exercise it in dev, pretend the request came from somewhere:

```bash
LYNCEUS_DEV_LATLON="-17.78,-63.18" pnpm dev   # Santa Cruz
```

## Deploy to Cloudflare Pages

1. Push this repo to GitHub
2. Connect to [Cloudflare Pages](https://pages.cloudflare.com)
3. Set **Build output directory** to `public`
4. Leave build command empty
5. Deploy

Everything under `functions/` is picked up automatically: `/api/flights` proxies
the upstream feed, and `/api/nearest` resolves the closest airport from the
caller's IP using Cloudflare's own geolocation — no third-party lookup, no
browser permission prompt, and nothing about the visitor is stored or logged.

## Data source

Flight data comes from NAABOL (Navegación Aérea Administración Bolivia), the Bolivian state aviation authority. The only endpoint used is:

```
GET https://fids.naabol.gob.bo/Fids/itin/vuelos?aero={airport}&tipo={L|S}
```

## Credits

Airport coordinates come from the [OurAirports](https://ourairports.com/data/)
public dataset.

Co-authored with [Claude](https://claude.ai/code).
