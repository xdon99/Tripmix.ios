import { seedJourney, seedReminders, seedTrips } from '../data/seed';
import { clampPinCoord, nextJourneyDay } from '../logic/categoryStyles';
import {
  BUDGET_TARGET_MAX,
  BUDGET_TARGET_MIN,
  BUDGET_TARGET_STEP,
  CUSTOM_PLACES,
  type AppState,
  type Category,
  type Stop,
  type TabName,
  type ToastTone,
} from '../types';

export type AppAction =
  | { type: 'switchTab'; tab: TabName }
  | { type: 'openItinerary'; tripId: string }
  | { type: 'setCategoryFilter'; filter: string }
  | { type: 'selectMapPin'; stopId: string | null }
  | { type: 'selectTrip'; tripId: string }
  | { type: 'copyStopToJourney'; tripId: string; stopId: string }
  | { type: 'copyFullTrip'; tripId: string }
  | { type: 'removeJourneyItem'; itemId: string }
  | { type: 'moveJourneyItemDay'; itemId: string }
  | { type: 'setJourneyDay'; day: number }
  | { type: 'setTargetBudget'; value: number }
  | { type: 'toggleReminder'; remId: string }
  | { type: 'addCustomStop'; now: number }
  | { type: 'setReviewCategory'; category: Category }
  | { type: 'setReviewRating'; rating: number }
  | { type: 'dropPin'; x: number; y: number }
  | {
      type: 'publishNewSpot';
      name: string;
      cost: number;
      review: string;
      now: number;
    }
  | { type: 'clearToast' };

function toast(
  state: AppState,
  title: string,
  subtitle: string,
  tone: ToastTone,
): Pick<AppState, 'lastToast' | 'toastSeq'> {
  const toastSeq = state.toastSeq + 1;
  return {
    toastSeq,
    lastToast: { id: toastSeq, title, subtitle, tone },
  };
}

function snapBudget(value: number): number {
  const clamped = Math.max(BUDGET_TARGET_MIN, Math.min(BUDGET_TARGET_MAX, value));
  return Math.round(clamped / BUDGET_TARGET_STEP) * BUDGET_TARGET_STEP;
}

export function createInitialState(): AppState {
  return {
    activeTab: 'explore',
    selectedTripId: 'tokyo',
    selectedCategoryFilter: 'All',
    selectedMapPinId: null,
    journeyActiveDay: 1,
    targetBudget: 1850,
    newPinCoords: { x: 54, y: 46 },
    newReviewRating: 5,
    newReviewCategory: 'Hotel',
    trips: structuredClone(seedTrips),
    myJourney: structuredClone(seedJourney),
    smartReminders: structuredClone(seedReminders),
    lastToast: null,
    toastSeq: 0,
  };
}

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'switchTab':
      return { ...state, activeTab: action.tab };
    case 'openItinerary':
      return {
        ...state,
        selectedTripId: action.tripId,
        selectedMapPinId: null,
        activeTab: 'mapview',
      };
    case 'setCategoryFilter':
      return { ...state, selectedCategoryFilter: action.filter };
    case 'selectMapPin':
      return { ...state, selectedMapPinId: action.stopId };
    case 'selectTrip':
      return { ...state, selectedTripId: action.tripId, selectedMapPinId: null };
    case 'copyStopToJourney': {
      const trip = state.trips.find((item) => item.id === action.tripId);
      if (!trip) return state;
      const stop = trip.stops.find((item) => item.id === action.stopId);
      if (!stop) return state;
      if (state.myJourney.some((item) => item.id === stop.id)) {
        return {
          ...state,
          ...toast(
            state,
            'Already in My Journey',
            `"${stop.name}" is already in your plan`,
            'info',
          ),
        };
      }
      return {
        ...state,
        myJourney: [
          ...state.myJourney,
          {
            id: stop.id,
            day: state.journeyActiveDay,
            time: stop.time,
            name: stop.name,
            category: stop.category,
            cost: stop.cost,
            sourceAuthor: trip.authorHandle,
            sourceTrip: trip.title,
          },
        ],
        ...toast(
          state,
          `Copied to Day ${state.journeyActiveDay}!`,
          `${stop.name} (+$${stop.cost}) added to budget`,
          'success',
        ),
      };
    }
    case 'copyFullTrip': {
      const trip = state.trips.find((item) => item.id === action.tripId);
      if (!trip) return state;
      const additions = trip.stops
        .filter((stop) => !state.myJourney.some((item) => item.id === stop.id))
        .map((stop) => ({
          id: stop.id,
          day: stop.day,
          time: stop.time,
          name: stop.name,
          category: stop.category,
          cost: stop.cost,
          sourceAuthor: trip.authorHandle,
          sourceTrip: trip.title,
        }));
      if (additions.length === 0) {
        return {
          ...state,
          ...toast(state, 'All Stops Already Copied', 'View your combined trip in My Journey', 'neutral'),
        };
      }
      return {
        ...state,
        myJourney: [...state.myJourney, ...additions],
        ...toast(
          state,
          `Remixed ${additions.length} Stops!`,
          `Full "${trip.title}" merged into My Journey`,
          'info',
        ),
      };
    }
    case 'removeJourneyItem':
      return {
        ...state,
        myJourney: state.myJourney.filter((item) => item.id !== action.itemId),
        ...toast(state, 'Removed from Journey', 'Budget recalculated automatically', 'danger'),
      };
    case 'moveJourneyItemDay': {
      const item = state.myJourney.find((entry) => entry.id === action.itemId);
      if (!item) return state;
      const newDay = nextJourneyDay(item.day);
      return {
        ...state,
        myJourney: state.myJourney.map((entry) =>
          entry.id === action.itemId ? { ...entry, day: newDay } : entry,
        ),
        ...toast(state, `Moved to Day ${newDay}`, item.name, 'info'),
      };
    }
    case 'setJourneyDay':
      return { ...state, journeyActiveDay: action.day };
    case 'setTargetBudget':
      return { ...state, targetBudget: snapBudget(action.value) };
    case 'toggleReminder': {
      const rem = state.smartReminders.find((item) => item.id === action.remId);
      if (!rem) return state;
      const checked = !rem.checked;
      const next: AppState = {
        ...state,
        smartReminders: state.smartReminders.map((item) =>
          item.id === action.remId ? { ...item, checked } : item,
        ),
      };
      if (checked && rem.estCost > 0) {
        return {
          ...next,
          ...toast(next, 'Add-on Included in Budget', `${rem.title} (+$${rem.estCost})`, 'success'),
        };
      }
      return next;
    }
    case 'addCustomStop': {
      const pick = CUSTOM_PLACES[state.myJourney.length % CUSTOM_PLACES.length];
      if (!pick) return state;
      return {
        ...state,
        myJourney: [
          ...state.myJourney,
          {
            id: `custom-${action.now}`,
            day: state.journeyActiveDay,
            time: pick.time,
            name: pick.name,
            category: pick.category,
            cost: pick.cost,
            sourceAuthor: '@you',
            sourceTrip: 'Personal Note',
          },
        ],
        ...toast(state, 'Custom Stop Added', `${pick.name} (+$${pick.cost})`, 'info'),
      };
    }
    case 'setReviewCategory':
      return { ...state, newReviewCategory: action.category };
    case 'setReviewRating':
      return {
        ...state,
        newReviewRating: Math.max(1, Math.min(5, Math.round(action.rating))),
      };
    case 'dropPin':
      return { ...state, newPinCoords: clampPinCoord(action.x, action.y) };
    case 'publishNewSpot': {
      const name = action.name.trim();
      const review = action.review.trim();
      if (!name || !review) return state;
      const cost = Number.isFinite(action.cost) ? Math.max(0, action.cost) : 0;
      const newStop: Stop = {
        id: `user-${action.now}`,
        day: 1,
        time: '04:00 PM',
        name,
        category: state.newReviewCategory,
        rating: Number(state.newReviewRating.toFixed(1)),
        cost,
        x: state.newPinCoords.x,
        y: state.newPinCoords.y,
        review,
        author: 'You',
      };
      const trips = state.trips.map((trip, index) => {
        if (index !== 0) return trip;
        return {
          ...trip,
          stops: [newStop, ...trip.stops],
          totalBudget: trip.totalBudget + newStop.cost,
        };
      });
      const targetTrip = trips[0];
      if (!targetTrip) return state;
      return {
        ...state,
        trips,
        selectedTripId: targetTrip.id,
        selectedMapPinId: newStop.id,
        activeTab: 'mapview',
        ...toast(state, 'Spot Published & Pinned!', `"${newStop.name}" is now live on the map`, 'info'),
      };
    }
    case 'clearToast':
      return { ...state, lastToast: null };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
