# MyRain365

Mobile app that estimates how much rainwater a home can collect, built with Expo (SDK 57), Expo Router and TypeScript.

## Getting started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `w` to open the web version.

## Scripts

| Command             | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `npm start`         | Start the dev server                      |
| `npm run lint`      | Lint with `eslint-config-expo`            |
| `npm run typecheck` | Type-check                                |
| `npm run format`    | Format with Prettier (`.prettierrc.json`) |

Run `lint`, `typecheck` and `format:check` before every push.

## Project structure

```
src/
  app/                      routes only (Expo Router)
    (tabs)/_layout.tsx      bottom tabs: Overview, Locate
    (tabs)/index.tsx        Overview
    (tabs)/building.tsx     Locate (roof selection)
  data/services/            network and device access, no UI
    ignService.ts           IGN Géoplateforme: address search, reverse geocoding, building lookup
    locationService.ts      device GPS with permission handling
  features/<feature>/       one folder per feature
    components/             presentational components
    hooks/                  state and side effects
    screens/                screens composed from components and hooks
    types.ts                feature types
  shared/                   code used by several features
    geo.ts                  coordinates, polygon area and hit testing
    global.styles.ts        colours, shadows, shared styles
```

## Locate screen

1. The user taps the location button or searches an address.
2. The map flies to the point. The pin stays in the centre and the map moves under it.
3. Each time the map stops after a user action, the app fetches the IGN BD TOPO building under the pin,
   draws its outline and shows the roof area computed from the outline.
4. "Use this roof" returns the building id, roof area, coordinates and address to the Overview.

The map is Leaflet running in a WebView (`BuildingMap.tsx`) or an iframe on web (`BuildingMap.web.tsx`),
showing IGN BD ORTHO aerial photos. Both share `useMapBridge`, which queues commands until the map is ready
and turns map messages into typed events (`buildingMap.types.ts`).

## Data sources

All from the IGN Géoplateforme, free, no API key, Licence Ouverte 2.0 (credit "IGN" on the map):

- Aerial photos: BD ORTHO (WMTS `ORTHOIMAGERY.ORTHOPHOTOS`)
- Buildings: BD TOPO (WFS `BDTOPO_V3:batiment`)
- Addresses: Géoplateforme geocoder (`/geocodage/completion`, `/geocodage/reverse`)
