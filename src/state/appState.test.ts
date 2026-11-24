import { describe, expect, it } from 'vitest';

import { calculateBudget } from '../logic/budget';
import { filterTrips } from '../logic/explore';
import { clampPinCoord, nextJourneyDay, tabHref } from '../logic/categoryStyles';
import { createInitialState, reducer } from './reducer';

function budgetOf(state = createInitialState()) {
  return calculateBudget(state);
}

describe('live trip budget', () => {
  it('sums seed stops and checked add-ons against the $1850 target', () => {
    const budget = budgetOf();
    expect(budget.hotelCost).toBe(340);
    expect(budget.foodShopCost).toBe(24);
    expect(budget.activityCost).toBe(80);
    expect(budget.addonsCost).toBe(365);
    expect(budget.totalSpent).toBe(809);
    expect(budget.targetBudget).toBe(1850);
    expect(budget.isOverBudget).toBe(false);
    expect(budget.remaining).toBe(1041);
    expect(budget.pct).toBe(44);
  });

  it('enters an over-budget state when the target is lowered below spent', () => {
    const state = reducer(createInitialState(), { type: 'setTargetBudget', value: 800 });
    const budget = budgetOf(state);
    expect(state.targetBudget).toBe(800);
    expect(budget.isOverBudget).toBe(true);
    expect(budget.overBy).toBe(9);
    expect(budget.pct).toBe(100);
  });

  it('snaps and clamps the target slider range', () => {
    expect(reducer(createInitialState(), { type: 'setTargetBudget', value: 625 }).targetBudget).toBe(650);
    expect(reducer(createInitialState(), { type: 'setTargetBudget', value: 100 }).targetBudget).toBe(600);
    expect(reducer(createInitialState(), { type: 'setTargetBudget', value: 9999 }).targetBudget).toBe(4000);
  });

  it('includes a paid add-on in the total when it is checked', () => {
    const state = reducer(createInitialState(), { type: 'toggleReminder', remId: 'rem-4' });
    expect(state.smartReminders.find((item) => item.id === 'rem-4')?.checked).toBe(true);
    expect(budgetOf(state).addonsCost).toBe(387);
    expect(budgetOf(state).totalSpent).toBe(831);
    expect(state.lastToast?.title).toBe('Add-on Included in Budget');
  });

  it('drops an add-on from the total when it is unchecked', () => {
    const state = reducer(createInitialState(), { type: 'toggleReminder', remId: 'rem-2' });
    expect(budgetOf(state).addonsCost).toBe(45);
    expect(budgetOf(state).totalSpent).toBe(489);
  });
});

describe('remix and copy to My Journey', () => {
  it('copies a single stop onto the active journey day', () => {
    const onDay2 = reducer(createInitialState(), { type: 'setJourneyDay', day: 2 });
    const state = reducer(onDay2, { type: 'copyStopToJourney', tripId: 'tokyo', stopId: 'tk-4' });
    const added = state.myJourney.find((item) => item.id === 'tk-4');
    expect(added).toMatchObject({
      name: 'Kapital Legs Vintage & Denim',
      day: 2,
      cost: 165,
      sourceAuthor: '@mayatravels',
      sourceTrip: '5 Days in Tokyo & Kyoto',
    });
    expect(state.myJourney).toHaveLength(5);
    expect(budgetOf(state).foodShopCost).toBe(189);
    expect(state.lastToast?.title).toBe('Copied to Day 2!');
  });

  it('does not duplicate a stop that is already in the journey', () => {
    const state = reducer(createInitialState(), {
      type: 'copyStopToJourney',
      tripId: 'tokyo',
      stopId: 'tk-1',
    });
    expect(state.myJourney).toHaveLength(4);
    expect(state.lastToast?.title).toBe('Already in My Journey');
  });

  it('merges only the missing stops when copying a full trip', () => {
    const state = reducer(createInitialState(), { type: 'copyFullTrip', tripId: 'tokyo' });
    expect(state.myJourney.map((item) => item.id)).toEqual(['tk-1', 'tk-2', 'tk-3', 'sl-3', 'tk-4']);
    expect(state.myJourney.find((item) => item.id === 'tk-4')?.day).toBe(2);
    expect(state.lastToast?.title).toBe('Remixed 1 Stops!');
  });

  it('reports when every stop in a trip is already copied', () => {
    const first = reducer(createInitialState(), { type: 'copyFullTrip', tripId: 'tokyo' });
    const second = reducer(first, { type: 'copyFullTrip', tripId: 'tokyo' });
    expect(second.myJourney).toHaveLength(5);
    expect(second.lastToast?.title).toBe('All Stops Already Copied');
  });

  it('copies a full foreign trip using each stop’s original day', () => {
    const state = reducer(createInitialState(), { type: 'copyFullTrip', tripId: 'amalfi' });
    expect(state.myJourney).toHaveLength(7);
    expect(state.myJourney.filter((item) => item.sourceTrip === 'Amalfi Coast Slow Travel')).toHaveLength(3);
    expect(state.myJourney.find((item) => item.id === 'am-3')?.day).toBe(2);
  });

  it('removes a journey item and recalculates the budget', () => {
    const state = reducer(createInitialState(), { type: 'removeJourneyItem', itemId: 'tk-1' });
    expect(state.myJourney).toHaveLength(3);
    expect(budgetOf(state).hotelCost).toBe(0);
    expect(budgetOf(state).totalSpent).toBe(469);
    expect(state.lastToast?.title).toBe('Removed from Journey');
  });

  it('moves a day-1 item to day 2 and a day-2 item back to day 1', () => {
    const moved = reducer(createInitialState(), { type: 'moveJourneyItemDay', itemId: 'tk-1' });
    expect(moved.myJourney.find((item) => item.id === 'tk-1')?.day).toBe(2);
    const back = reducer(moved, { type: 'moveJourneyItemDay', itemId: 'tk-1' });
    expect(back.myJourney.find((item) => item.id === 'tk-1')?.day).toBe(1);
    const fromDay2 = reducer(createInitialState(), { type: 'moveJourneyItemDay', itemId: 'sl-3' });
    expect(fromDay2.myJourney.find((item) => item.id === 'sl-3')?.day).toBe(1);
  });

  it('matches the prototype next-day toggle (day 3 also returns to day 1)', () => {
    expect(nextJourneyDay(1)).toBe(2);
    expect(nextJourneyDay(2)).toBe(1);
    expect(nextJourneyDay(3)).toBe(1);
  });

  it('cycles custom stops onto the active day', () => {
    const first = reducer(createInitialState(), { type: 'addCustomStop', now: 1000 });
    expect(first.myJourney.at(-1)).toMatchObject({
      id: 'custom-1000',
      name: 'Shibuya Sky Sunset Deck',
      category: 'Entertainment',
      cost: 20,
      day: 1,
      sourceAuthor: '@you',
      sourceTrip: 'Personal Note',
    });
    const onDay3 = reducer(first, { type: 'setJourneyDay', day: 3 });
    const second = reducer(onDay3, { type: 'addCustomStop', now: 2000 });
    expect(second.myJourney.at(-1)).toMatchObject({
      name: 'Hoshinoya Boutique Ryokan',
      day: 3,
      cost: 410,
    });
  });
});

describe('pin and review publish', () => {
  it('publishes a reviewed pin onto the Tokyo itinerary and opens the map', () => {
    const placed = reducer(
      reducer(createInitialState(), { type: 'setReviewCategory', category: 'Shop/Food' }),
      { type: 'setReviewRating', rating: 4 },
    );
    const dropped = reducer(placed, { type: 'dropPin', x: 40, y: 50 });
    const state = reducer(dropped, {
      type: 'publishNewSpot',
      name: '  Ichiran Shibuya  ',
      cost: 18,
      review: '  Get the extra nori.  ',
      now: 42,
    });
    const tokyo = state.trips[0];
    const published = tokyo?.stops[0];
    expect(published).toMatchObject({
      id: 'user-42',
      name: 'Ichiran Shibuya',
      review: 'Get the extra nori.',
      category: 'Shop/Food',
      rating: 4,
      cost: 18,
      x: 40,
      y: 50,
      day: 1,
      time: '04:00 PM',
      author: 'You',
    });
    expect(tokyo?.stops).toHaveLength(5);
    expect(tokyo?.totalBudget).toBe(1498);
    expect(state.selectedTripId).toBe('tokyo');
    expect(state.selectedMapPinId).toBe('user-42');
    expect(state.activeTab).toBe('mapview');
    expect(state.lastToast?.title).toBe('Spot Published & Pinned!');
  });

  it('refuses to publish without a name or review', () => {
    const missingName = reducer(createInitialState(), {
      type: 'publishNewSpot',
      name: '   ',
      cost: 10,
      review: 'Nice',
      now: 1,
    });
    const missingReview = reducer(createInitialState(), {
      type: 'publishNewSpot',
      name: 'A bar',
      cost: 10,
      review: ' ',
      now: 1,
    });
    expect(missingName.trips[0]?.stops).toHaveLength(4);
    expect(missingName.activeTab).toBe('explore');
    expect(missingReview.trips[0]?.stops).toHaveLength(4);
  });

  it('clamps dropped pin coordinates like the prototype map', () => {
    expect(clampPinCoord(-10, 0)).toEqual({ x: 12, y: 22 });
    expect(clampPinCoord(200, 200)).toEqual({ x: 88, y: 88 });
    expect(clampPinCoord(33.4, 47.6)).toEqual({ x: 33, y: 48 });
  });
});

describe('tab and navigation flows', () => {
  it('starts on Explore with Tokyo selected and a journey badge of 4', () => {
    const state = createInitialState();
    expect(state.activeTab).toBe('explore');
    expect(state.selectedTripId).toBe('tokyo');
    expect(state.myJourney).toHaveLength(4);
  });

  it('switchTab only changes the active tab', () => {
    let state = createInitialState();
    state = reducer(state, { type: 'switchTab', tab: 'journey' });
    expect(state.activeTab).toBe('journey');
    state = reducer(state, { type: 'switchTab', tab: 'share' });
    expect(state.activeTab).toBe('share');
    state = reducer(state, { type: 'switchTab', tab: 'mapview' });
    expect(state.activeTab).toBe('mapview');
    expect(state.selectedTripId).toBe('tokyo');
  });

  it('openItinerary (Try It / trip card) jumps to Trip Map for that itinerary', () => {
    const state = reducer(createInitialState(), { type: 'openItinerary', tripId: 'seoul' });
    expect(state.activeTab).toBe('mapview');
    expect(state.selectedTripId).toBe('seoul');
    expect(state.selectedMapPinId).toBeNull();
  });

  it('selecting a trip pill or pin updates map highlight state', () => {
    const trip = reducer(createInitialState(), { type: 'selectTrip', tripId: 'amalfi' });
    expect(trip.selectedTripId).toBe('amalfi');
    expect(trip.selectedMapPinId).toBeNull();
    const pinned = reducer(trip, { type: 'selectMapPin', stopId: 'am-2' });
    expect(pinned.selectedMapPinId).toBe('am-2');
  });

  it('maps tabs to Expo Router hrefs', () => {
    expect(tabHref('explore')).toBe('/(tabs)');
    expect(tabHref('mapview')).toBe('/(tabs)/map');
    expect(tabHref('share')).toBe('/(tabs)/share');
    expect(tabHref('journey')).toBe('/(tabs)/journey');
  });
});

describe('explore filters', () => {
  it('filters the feed by category tag', () => {
    const state = createInitialState();
    expect(filterTrips(state.trips, 'All', '').map((trip) => trip.id)).toEqual([
      'tokyo',
      'amalfi',
      'seoul',
    ]);
    expect(filterTrips(state.trips, 'Coastal Luxury', '').map((trip) => trip.id)).toEqual(['amalfi']);
  });

  it('searches titles, subtitles, and stop names across all trips', () => {
    const state = createInitialState();
    expect(filterTrips(state.trips, 'Coastal Luxury', 'ramen').map((trip) => trip.id)).toEqual(['tokyo']);
    expect(filterTrips(state.trips, 'All', 'hidden bars')).toHaveLength(0);
    expect(filterTrips(state.trips, 'All', 'listening bars').map((trip) => trip.id)).toEqual(['seoul']);
    expect(filterTrips(state.trips, 'All', 'Capri').map((trip) => trip.id)).toEqual(['amalfi']);
  });
});
