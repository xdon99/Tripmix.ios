import { describe, expect, it } from 'vitest';
import {
  AMALFI_BOUNDS,
  SEOUL_BOUNDS,
  TOKYO_BOUNDS,
  boundsForTrip,
  formatLatLng,
  latLngToPercent,
  percentToLatLng,
} from './mapProjection';

describe('mapProjection', () => {
  it('uses city bounds for each seeded itinerary and Tokyo as the default', () => {
    expect(boundsForTrip('tokyo')).toEqual(TOKYO_BOUNDS);
    expect(boundsForTrip('amalfi')).toEqual(AMALFI_BOUNDS);
    expect(boundsForTrip('seoul')).toEqual(SEOUL_BOUNDS);
    expect(boundsForTrip('unknown-city')).toEqual(TOKYO_BOUNDS);
  });

  it('maps percent coordinates onto the city box and back', () => {
    const origin = percentToLatLng({ x: 0, y: 0 }, TOKYO_BOUNDS);
    expect(origin.lat).toBeCloseTo(TOKYO_BOUNDS.north);
    expect(origin.lng).toBeCloseTo(TOKYO_BOUNDS.west);

    const corner = percentToLatLng({ x: 100, y: 100 }, TOKYO_BOUNDS);
    expect(corner.lat).toBeCloseTo(TOKYO_BOUNDS.south);
    expect(corner.lng).toBeCloseTo(TOKYO_BOUNDS.east);

    const mid = percentToLatLng({ x: 50, y: 50 }, AMALFI_BOUNDS);
    const roundTrip = latLngToPercent(mid, AMALFI_BOUNDS);
    expect(roundTrip.x).toBeCloseTo(50, 8);
    expect(roundTrip.y).toBeCloseTo(50, 8);
  });

  it('formats coordinates for the pin-and-share label', () => {
    expect(formatLatLng({ lat: 35.6612, lng: 139.7401 })).toBe('35.66120° N, 139.74010° E');
    expect(formatLatLng({ lat: -33.8688, lng: 151.2093 })).toBe('33.86880° S, 151.20930° E');
  });

  it('places a Seoul percent pin in Seoul, not Tokyo', () => {
    const seoul = percentToLatLng({ x: 72, y: 66 }, boundsForTrip('seoul'));
    expect(seoul.lat).toBeGreaterThan(37);
    expect(seoul.lat).toBeLessThan(38);
    expect(seoul.lng).toBeGreaterThan(126);
    expect(seoul.lng).toBeLessThan(128);
  });
});
