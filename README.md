# NYC Housing Policy Map (Starter)

A single-page static website that displays an interactive NYC map with sample zoning and housing-policy context areas.

## What's included

- Leaflet-powered map centered on NYC
- Local GeoJSON dataset (`data/zoning_context.geojson`)
- Sidebar filters:
  - Borough
  - Affordable housing overlay toggle
  - Minimum allowed FAR slider
- Popup details for each policy area
- Responsive layout for desktop/mobile

## Run locally

Because the app fetches a local JSON file, use a local web server (not `file://`).

```bash
cd /Users/mitchstepleton/Documents/projects/nyc-housing-maps
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Deploy options

### Option A (Recommended first): GitHub Pages

This project is pure static files, so GitHub Pages is the fastest path.

1. Push this repo to GitHub.
2. In repo settings: `Pages` -> `Build and deployment`.
3. Set `Source` to `Deploy from a branch`.
4. Pick branch `main` and folder `/ (root)`.
5. Save. Your site will publish to a `github.io` URL.

### Option B: Netlify or Vercel

Both can auto-deploy on each push to GitHub and work well if you want previews for every branch/PR.

## Next data upgrades

- Replace sample GeoJSON with NYC Zoning Map + PLUTO joins
- Add overlays for:
  - Mandatory Inclusionary Housing areas
  - Historic districts / landmarks
  - Flood risk and coastal resilience zones
- Add parcel-level search by address or BBL
