
// components/run/RunSessionProvider.tsx
"use client";

import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import type { GeoPoint } from '@/utils/helpers';

export type RunStatus = 'idle' | 'locating' | 'running' | 'paused' | 'ended' | 'saving';

export interface RunSessionState {
  status: RunStatus;
  startTime: number | null; // Timestamp of initial start
  activeDuration: number; // Seconds, accumulates only when running
  route: GeoPoint[];
  currentPosition: GeoPoint | null;
  error: string | null;
  gpsSignalLost: boolean; // New state for GPS signal
}

const initialState: RunSessionState = {
  status: 'idle',
  startTime: null,
  activeDuration: 0,
  route: [],
  currentPosition: null,
  error: null,
  gpsSignalLost: false, // Initial GPS signal state
};

type RunAction =
  | { type: 'REQUEST_LOCATION' }
  | { type: 'LOCATION_SUCCESS'; payload: GeoPoint }
  | { type: 'LOCATION_ERROR'; payload: string }
  | { type: 'START_RUN'; payload: GeoPoint }
  | { type: 'PAUSE_RUN' }
  | { type: 'RESUME_RUN' }
  | { type: 'ADD_ROUTE_POINT'; payload: GeoPoint }
  | { type: 'INCREMENT_DURATION' }
  | { type: 'PREPARE_SAVE' }
  | { type: 'SAVE_RUN_SUCCESS' } // Indicates saving process is complete
  | { type: 'RESET_RUN' }
  | { type: 'GPS_SIGNAL_LOST' }
  | { type: 'GPS_SIGNAL_REACQUIRED' };

const RunSessionContext = createContext<{
  state: RunSessionState;
  dispatch: React.Dispatch<RunAction>;
} | undefined>(undefined);

const runSessionReducer = (state: RunSessionState, action: RunAction): RunSessionState => {
  switch (action.type) {
    case 'REQUEST_LOCATION':
      return { ...state, status: 'locating', error: null, gpsSignalLost: false };
    case 'LOCATION_SUCCESS':
      return { ...state, status: 'idle', currentPosition: action.payload, error: null, gpsSignalLost: false };
    case 'LOCATION_ERROR':
      // Don't reset gpsSignalLost here as it might be a temporary error while running
      return { ...state, status: 'idle', error: action.payload };
    case 'START_RUN':
      return {
        ...state,
        status: 'running',
        startTime: Date.now(),
        activeDuration: 0,
        route: [action.payload], // Start route with current position
        currentPosition: action.payload,
        error: null,
        gpsSignalLost: false, // Reset on new run
      };
    case 'PAUSE_RUN':
      return { ...state, status: 'paused' };
    case 'RESUME_RUN':
      return { ...state, status: 'running' }; // gpsSignalLost state persists through pause/resume
    case 'ADD_ROUTE_POINT':
      return {
        ...state,
        route: [...state.route, action.payload],
        currentPosition: action.payload,
      };
    case 'INCREMENT_DURATION':
      return { ...state, activeDuration: state.activeDuration + 1 };
    case 'PREPARE_SAVE':
      return { ...state, status: 'saving' };
    case 'SAVE_RUN_SUCCESS':
      return { ...state, status: 'ended' };
    case 'RESET_RUN':
      // Keep last known position and current error state, reset GPS signal.
      return { ...initialState, status: 'idle', currentPosition: state.currentPosition, error: state.error, gpsSignalLost: false };
    case 'GPS_SIGNAL_LOST':
      return { ...state, gpsSignalLost: true };
    case 'GPS_SIGNAL_REACQUIRED':
      return { ...state, gpsSignalLost: false };
    default:
      return state;
  }
};

interface RunSessionProviderProps {
  children: ReactNode;
}

export const RunSessionProvider = ({ children }: RunSessionProviderProps) => {
  const [state, dispatch] = useReducer(runSessionReducer, initialState);
  return (
    <RunSessionContext.Provider value={{ state, dispatch }}>
      {children}
    </RunSessionContext.Provider>
  );
};

export const useRunSession = () => {
  const context = useContext(RunSessionContext);
  if (context === undefined) {
    throw new Error('useRunSession must be used within a RunSessionProvider');
  }
  return context;
};