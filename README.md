# easy-dash

Dashboard SPA (Vite + React) for [easy-stage](https://github.com/easystage-nl/easy-scraper) —
lists scraped internships with filters and a map view.

Deployed as a static-assets Cloudflare Worker on `easystage.nl`. Reads the API
worker on `api.easystage.nl` (`GET /listings`, `GET /runs`); the base URL is
`VITE_API_BASE` (`.env.production`), empty in dev so the Vite proxy handles it.

## Develop & deploy

```bash
npm install
npm run dev      # :5173 (proxies API to local easy-scraper on :8787)
npm run deploy   # vite build && wrangler deploy
```
