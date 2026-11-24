import { router } from 'expo-router';
import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';

import { tabHref } from '../logic/categoryStyles';
import type { AppState, TabName } from '../types';
import { createInitialState, reducer, type AppAction } from './reducer';

type TripStore = {
  state: AppState;
  dispatch: (action: AppAction) => void;
  switchTab: (tab: TabName) => void;
  openItinerary: (tripId: string) => void;
};

const TripStoreContext = createContext<TripStore | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  const value = useMemo<TripStore>(() => {
    return {
      state,
      dispatch,
      switchTab: (tab: TabName) => {
        dispatch({ type: 'switchTab', tab });
        router.navigate(tabHref(tab));
      },
      openItinerary: (tripId: string) => {
        dispatch({ type: 'openItinerary', tripId });
        router.navigate(tabHref('mapview'));
      },
    };
  }, [state]);

  return <TripStoreContext.Provider value={value}>{children}</TripStoreContext.Provider>;
}

export function useTripStore(): TripStore {
  const store = useContext(TripStoreContext);
  if (!store) {
    throw new Error('useTripStore must be used within TripProvider');
  }
  return store;
}

