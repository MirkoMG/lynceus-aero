# Lynceus Aero

A mobile-first flight information display for Bolivian airports, built on top of the public [NAABOL FIDS](https://fids.naabol.gob.bo) API.

## Features

- Live arrivals and departures for all Bolivian airports
- Delay indicators with actual vs scheduled times
- Search by flight number, destination, or airline
- Sort by time, delays first, or airline
- Pin flights to track at the top
- Multi-stop route modal
- Light and dark theme
- Auto-refreshes every 60 seconds

## Stack

- Vanilla HTML / CSS / JS — no framework
- Express proxy server for local dev (avoids CORS)
- Cloudflare Pages + Pages Functions for production

## Local development

```bash
pnpm install
pnpm dev        # starts on http://localhost:3000
```

## Deploy to Cloudflare Pages

1. Push this repo to GitHub
2. Connect to [Cloudflare Pages](https://pages.cloudflare.com)
3. Set **Build output directory** to `public`
4. Leave build command empty
5. Deploy

The `functions/api/flights.js` file is picked up automatically as a Cloudflare Worker at `/api/flights`.

## Data source

Flight data comes from NAABOL (Navegación Aérea Administración Bolivia), the Bolivian state aviation authority. The only endpoint used is:

```
GET https://fids.naabol.gob.bo/Fids/itin/vuelos?aero={airport}&tipo={L|S}
```
