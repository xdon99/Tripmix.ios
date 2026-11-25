import { getCategoryStyle } from '../logic/categoryStyles';
import { boundsForTrip, percentToLatLng } from '../logic/mapProjection';
import type { Category, PinCoords } from '../types';

export type GoogleMapMarkerInput = {
  id: string;
  name: string;
  category: Category;
  x: number;
  y: number;
};

export type GoogleMapHtmlState = {
  tripId: string;
  markers: GoogleMapMarkerInput[];
  selectedId: string | null;
  dropPinMode: boolean;
  dropPin: PinCoords | null;
  showRoute: boolean;
};

export type GoogleMapHtmlConfig = GoogleMapHtmlState & {
  apiKey: string;
};

export type MapToAppMessage =
  | { type: 'ready' }
  | { type: 'select'; id: string }
  | { type: 'drop'; lat: number; lng: number }
  | { type: 'error'; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseMapToAppMessage(raw: string): MapToAppMessage | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(data) || typeof data.type !== 'string') return null;
  if (data.type === 'ready') return { type: 'ready' };
  if (data.type === 'select' && typeof data.id === 'string') {
    return { type: 'select', id: data.id };
  }
  if (
    data.type === 'drop' &&
    typeof data.lat === 'number' &&
    typeof data.lng === 'number' &&
    Number.isFinite(data.lat) &&
    Number.isFinite(data.lng)
  ) {
    return { type: 'drop', lat: data.lat, lng: data.lng };
  }
  if (data.type === 'error' && typeof data.message === 'string') {
    return { type: 'error', message: data.message };
  }
  return null;
}

export function serializeMapState(state: GoogleMapHtmlState): string {
  const bounds = boundsForTrip(state.tripId);
  const payload = {
    bounds,
    dropPinMode: state.dropPinMode,
    showRoute: state.showRoute,
    selectedId: state.selectedId,
    dropPin: state.dropPin
      ? { ...percentToLatLng(state.dropPin, bounds) }
      : null,
    markers: state.markers.map((marker, index) => {
      const style = getCategoryStyle(marker.category);
      const point = percentToLatLng({ x: marker.x, y: marker.y }, bounds);
      return {
        id: marker.id,
        name: marker.name,
        index: index + 1,
        color: style.pinBg,
        ring: style.ring,
        lat: point.lat,
        lng: point.lng,
      };
    }),
  };
  return JSON.stringify(payload).replace(/</g, '\\u003c');
}

export function buildMapUpdateScript(state: GoogleMapHtmlState): string {
  return `window.__tripmixUpdate && window.__tripmixUpdate(${serializeMapState(state)}); true;`;
}

export function buildGoogleMapHtml(config: GoogleMapHtmlConfig): string {
  const initial = serializeMapState(config);
  const key = encodeURIComponent(config.apiKey);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #EDF2F7; }
    .missing { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 16px; color: #334155; font-size: 13px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const INITIAL = ${initial};
    let map = null;
    let markers = [];
    let route = null;
    let dropMarker = null;
    let info = null;
    let dropPinMode = INITIAL.dropPinMode;
    let lastFitKey = "";

    function post(message) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    }

    function clearOverlays() {
      markers.forEach((marker) => marker.setMap(null));
      markers = [];
      if (route) { route.setMap(null); route = null; }
      if (dropMarker) { dropMarker.setMap(null); dropMarker = null; }
      if (info) { info.close(); info = null; }
    }

    function pinIcon(color, ring, scale) {
      return {
        path: "M 0 -20 C -11 -20 -18 -12 -18 -4 C -18 6 0 20 0 20 C 0 20 18 6 18 -4 C 18 -12 11 -20 0 -20 Z",
        fillColor: color,
        fillOpacity: 1,
        strokeColor: ring,
        strokeWeight: 2,
        scale: scale,
        labelOrigin: { x: 0, y: -8 },
        anchor: { x: 0, y: 20 },
      };
    }

    function applyState(state) {
      if (!map || !window.google || !google.maps) return;
      dropPinMode = !!state.dropPinMode;
      clearOverlays();
      const bounds = new google.maps.LatLngBounds();
      let hasPoint = false;

      state.markers.forEach((item) => {
        const position = { lat: item.lat, lng: item.lng };
        const selected = item.id === state.selectedId;
        const marker = new google.maps.Marker({
          position: position,
          map: map,
          title: item.name,
          label: { text: String(item.index), color: "#FFFFFF", fontSize: "11px", fontWeight: "700" },
          icon: pinIcon(item.color, selected ? "#FFFFFF" : item.ring, selected ? 1.25 : 1),
          zIndex: selected ? 1000 : item.index,
        });
        marker.addListener("click", () => post({ type: "select", id: item.id }));
        markers.push(marker);
        bounds.extend(position);
        hasPoint = true;
        if (selected) {
          info = new google.maps.InfoWindow({
            content: "<div style='font:700 12px -apple-system,sans-serif;color:#0F172A;max-width:160px'>" + item.name + "</div>",
          });
          info.open({ map: map, anchor: marker });
        }
      });

      if (state.showRoute && state.markers.length > 1) {
        route = new google.maps.Polyline({
          path: state.markers.map((item) => ({ lat: item.lat, lng: item.lng })),
          geodesic: true,
          strokeColor: "#4F46E5",
          strokeOpacity: 0.9,
          strokeWeight: 3,
          map: map,
        });
      }

      if (state.dropPin) {
        dropMarker = new google.maps.Marker({
          position: state.dropPin,
          map: map,
          title: "Pinned Here",
          icon: pinIcon("#4F46E5", "#A5B4FC", 1.15),
          zIndex: 2000,
        });
        bounds.extend(state.dropPin);
        hasPoint = true;
      }

      const fitKey = state.markers.map((item) => item.id + ":" + item.lat + ":" + item.lng).join("|")
        + (state.dropPin ? ("|" + state.dropPin.lat + ":" + state.dropPin.lng) : "")
        + "|" + state.bounds.north + ":" + state.bounds.south + ":" + state.bounds.west + ":" + state.bounds.east;
      if (hasPoint) {
        const selected = state.markers.find((item) => item.id === state.selectedId);
        if (fitKey !== lastFitKey) {
          lastFitKey = fitKey;
          map.fitBounds(bounds, 36);
          google.maps.event.addListenerOnce(map, "idle", () => {
            if (map.getZoom() > 15) map.setZoom(15);
            if (map.getZoom() < 11) map.setZoom(11);
          });
        } else if (selected) {
          map.panTo({ lat: selected.lat, lng: selected.lng });
        } else if (state.dropPin) {
          map.panTo(state.dropPin);
        }
      } else if (fitKey !== lastFitKey) {
        lastFitKey = fitKey;
        map.setCenter({
          lat: (state.bounds.north + state.bounds.south) / 2,
          lng: (state.bounds.west + state.bounds.east) / 2,
        });
        map.setZoom(12);
      }
    }

    window.__tripmixUpdate = applyState;

    window.gm_authFailure = function () {
      post({
        type: "error",
        message: "Google Maps rejected the API key. Enable the Maps JavaScript API and avoid tight HTTP-referrer restrictions while testing in Expo Go.",
      });
    };

    function initMap() {
      const start = {
        lat: (INITIAL.bounds.north + INITIAL.bounds.south) / 2,
        lng: (INITIAL.bounds.west + INITIAL.bounds.east) / 2,
      };
      map = new google.maps.Map(document.getElementById("map"), {
        center: start,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        rotateControl: false,
        clickableIcons: false,
        gestureHandling: "cooperative",
        keyboardShortcuts: false,
      });
      map.addListener("click", (event) => {
        if (!dropPinMode) return;
        const ll = event.latLng;
        if (!ll) return;
        post({ type: "drop", lat: ll.lat(), lng: ll.lng() });
      });
      applyState(INITIAL);
      post({ type: "ready" });
    }

    window.initMap = initMap;
  </script>
  <script src="https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap" async defer></script>
</body>
</html>`;
}
