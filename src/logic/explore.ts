import type { Trip } from '../types';

export function filterTrips(trips: Trip[], categoryFilter: string, query: string): Trip[] {
  const byCategory =
    categoryFilter === 'All' ? trips : trips.filter((trip) => trip.tag === categoryFilter);

  const q = query.toLowerCase().trim();
  if (!q) return byCategory;

  // Prototype search runs against the full trip list, not the category filter.
  const matches = trips.filter(
    (trip) =>
      trip.title.toLowerCase().includes(q) ||
      trip.subtitle.toLowerCase().includes(q) ||
      trip.stops.some((stop) => stop.name.toLowerCase().includes(q)),
  );
  return matches;
}

export function tripPreviewLabel(title: string): string {
  return title.split(' ').slice(0, 3).join(' ');
}
