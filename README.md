# MyRain365

Mobile app that tells a resident whether rainwater harvesting is worth it for their home, built with Expo (SDK 57),
Expo Router and TypeScript. Designs follow the "MyRain365 screens" Figma file (Rain & brick palette, Geist, Phosphor
icons). English and French throughout.

## Getting started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `w` to open the web version. "See an example first" on the welcome screen
loads a real Roubaix courée house so every screen can be explored without typing anything.

Optional: set `EXPO_PUBLIC_ROOF_API_URL` to the roof material API (`../roof-api`) to detect the material from the
aerial photo. Without it, the app uses the IGN record or the user's choice.

## Scripts

| Command                | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `npm start`            | Start the dev server                      |
| `npm run lint`         | Lint with `eslint-config-expo`            |
| `npm run typecheck`    | Type-check                                |
| `npm run format`       | Format with Prettier (`.prettierrc.json`) |
| `npm run format:check` | Check formatting                          |

Run `lint`, `typecheck` and `format:check` before every push.

## User flow

1. **Welcome**: find my building, manage a courée or site, or see an example.
2. **Locate** (tab): GPS or address, pin on the roof, IGN outline and area.
3. **Setup** (5 steps): roof (area, drained share, material, runoff), home (people, uses), site (private or
   shared, courée, room for a tank), water use and access needs, review.
4. **Analysing**: ten years of daily rain are fetched and the tank is simulated day by day.
5. **Results** (tab): verdict, coverage, savings, payback, water-cut autonomy, then details: month by month with
   dry, typical and wet years, performance, tank size, cost, money, alone or shared, recommendations and why,
   water quality and treatment, water cut readiness, data used, PDF report.
6. **My tank** (tab): estimated level from recent rain, three-day forecast, overflow advice, water-cut autonomy today.
7. **Alerts** (tab): heavy rain, overflow, low tank, water-cut readiness, filter upkeep, courée.
8. **Settings** (tab): language, home, sewer charge, notifications, data and privacy, start again.

Emergency resilience is part of the normal flow rather than a separate mode: the "If the water is cut" card on
Results and My tank, the Water cut detail page, the water-cut alert and the reserve recommendation all use the same
calculation (`data/calculations/resilience.ts`).

## Project structure

```
src/
  app/                          routes only (Expo Router), each file renders one screen
    welcome.tsx
    setup/                      roof, home, site, quality, review, analysing
    (tabs)/                     building (Locate), results/*, tank, alerts, settings
  data/
    calculations/               pure functions, no React: simulation, finance, resilience,
                                quality, recommendations, tank size, constants
    services/                   network and device access: IGN, Open-Meteo, GPS, roof model
    store/                      project state (context + reducer), saved on the phone
    hooks/                      results and tank status shared by several features
  features/<feature>/           onboarding, buildings, setup, results, tank, alerts, settings
    components/                 presentational components
    hooks/                      state and side effects
    screens/                    screens composed from components and hooks
  shared/
    components/                 design system: AppText, Button, Card, Controls, ListRow, Screen, charts
    i18n/                       en.ts, fr.ts, useI18n
    geo.ts                      coordinates, polygon area and hit testing
    global.styles.ts            colours, fonts, radii, shadows
```

## How the numbers are made

- **Roof**: IGN BD TOPO outline, area by the shoelace formula on a local projection, times the drained share.
- **Rain**: Open-Meteo daily precipitation 2015 to 2024 for the building (ERA5 reanalysis), cached on the phone.
- **Tank**: daily water balance. Inflow = area × rain × runoff coefficient × 0.9 (first flush), tank capped at its
  size, demand served from the tank. Same model as `myrain365/mockups/sim.py`, checked to give identical results.
- **Money**: typical French installed prices, 25-year life, €40 a year upkeep, Iléo water price with or without
  the sewer charge.
- **Water cut**: tank level typical for the current month, no rain assumed, toilets and cleaning only.

## Data sources

All free and keyless:

- IGN Géoplateforme, Licence Ouverte 2.0: BD ORTHO aerial photos, BD TOPO buildings, geocoder.
- Open-Meteo: historical and forecast daily rain, CC BY 4.0.
