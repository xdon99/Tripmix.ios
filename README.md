# Tripmix — Social Travel & Itinerary Remix

Expo (SDK 58) / React Native / TypeScript iOS prototype. It follows the interactive HTML prototype: community trip feed, map itinerary remixing, live budget, smart add-ons, and pin-and-review publishing.

## Run it

```bash
cd tripmix-ios
npm install
npm start
```

Then open the project in Expo Go, or use:

- `npm run ios` — requires macOS and Xcode
- `npm run android`
- `npm run web` — Expo web preview (optional)

This repo is meant to be tested on an iPhone or the iOS Simulator. A Linux machine cannot run a real iOS Simulator.

## Google Maps

Trip Map and Pin & Share use the Google Maps JavaScript API inside a WebView so the app can run in Expo Go (SDK 58). Native Google Maps (`react-native-maps` + `PROVIDER_GOOGLE`) is not available in Expo Go on iOS and would require a dev build.

Create a `.env` from `.env.example` and set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` to a key with the Maps JavaScript API enabled, then restart the Expo dev server. Without a key, those screens keep a stand-in map so pin, remix, and publish flows still work.

## Checks

```bash
npm run typecheck
npm test
```

Tests cover budget math (including over-budget), copy/remix into My Journey, pin-and-review publish, and tab/navigation flows.

## App flows

- **Explore** — category pills, search, Mix & Match “Try It”, community trip cards
- **Trip Map** — creator itinerary, Google Map pins, Highlight Pin, + Remix / Copy All, Pinned Spots & Reviews
- **Pin & Share** — category, tap-to-drop pin, name / cost / rating / review, publish onto the Tokyo community itinerary
- **My Journey** — day plans, custom stop, move to next day, live budget vs adjustable target, smart reminders & add-ons, journey tab badge

## Push later

The app lives in this folder. To publish it to `https://github.com/xdon99/Tripmix.ios` (empty public repo, default branch `main`):

```bash
git remote add origin https://github.com/xdon99/Tripmix.ios.git
git add .
git commit -m "Implement Tripmix Expo iOS prototype from the HTML flows"
git push -u origin main
```

Do not kick an EAS or TestFlight build until that is requested.
