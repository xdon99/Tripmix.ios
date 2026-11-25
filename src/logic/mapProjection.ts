import type { PinCoords } from '../types';

export type GeoBounds = {
  north: number;
  south: number;
  west: number;
  east: number;
};

export type LatLng = {
  lat: number;
  lng: number;
};

/** Central Tokyo: Yoyogi / Shibuya through Azabudai. */
export const TOKYO_BOUNDS: GeoBounds = {
  north: 35.68,
  south: 35.64,
  west: 139.68,
  east: 139.76,
};

/** Amalfi Coast: Positano through Praiano and Ravello. */
export const AMALFI_BOUNDS: GeoBounds = {
  north: 40.66,
  south: 40.6,
  west: 14.47,
  east: 14.65,
};

/** Seoul: Hongdae through Gwangjang Market and Seongsu. */
export const SEOUL_BOUNDS: GeoBounds = {
  north: 37.58,
  south: 37.53,
  west: 126.91,
  east: 127.07,
};

export function boundsForTrip(tripId: string): GeoBounds {
  if (tripId === 'amalfi') return AMALFI_BOUNDS;
  if (tripId === 'seoul') return SEOUL_BOUNDS;
  return TOKYO_BOUNDS;
}

export function percentToLatLng(coords: PinCoords, bounds: GeoBounds): LatLng {
  const lngSpan = bounds.east - bounds.west;
  const latSpan = bounds.north - bounds.south;
  return {
    lat: bounds.north - (coords.y / 100) * latSpan,
    lng: bounds.west + (coords.x / 100) * lngSpan,
  };
}

export function latLngToPercent(point: LatLng, bounds: GeoBounds): PinCoords {
  const lngSpan = bounds.east - bounds.west;
  const latSpan = bounds.north - bounds.south;
  return {
    x: lngSpan === 0 ? 0 : ((point.lng - bounds.west) / lngSpan) * 100,
    y: latSpan === 0 ? 0 : ((bounds.north - point.lat) / latSpan) * 100,
  };
}

export function formatLatLng(point: LatLng): string {
  const latHem = point.lat >= 0 ? 'N' : 'S';
  const lngHem = point.lng >= 0 ? 'E' : 'W';
  return `${Math.abs(point.lat).toFixed(5)}° ${latHem}, ${Math.abs(point.lng).toFixed(5)}° ${lngHem}`;
}

export function getGoogleMapsApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (typeof key !== 'string') return null;
  const trimmed = key.trim();
  return trimmed.length > 0 ? trimmed : null;
}
