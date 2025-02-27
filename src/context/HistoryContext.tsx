
import React, { createContext, useContext, useReducer, useCallback } from 'react';

type ActionType = {
  type: string;
  payload: any;
  reverse?: () => void;
};

type HistoryState = {
  past: ActionType[];
  future: ActionType[];
  present: any;
};

const initialState: HistoryState = {
  past: [],
  future: [],
  present: null,
};

type HistoryContextType = {
  state: HistoryState;
  dispatch: (action: ActionType) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

function historyReducer(state: HistoryState, action: ActionType): HistoryState {
  switch (action.type) {
    case 'PERFORM_ACTION':
      return {
        past: [...state.past, action],
        present: action.payload,
        future: [],
      };
    case 'UNDO':
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      
      // Execute reverse function if provided
      if (previous.reverse) {
        previous.reverse();
      }
      
      return {
        past: state.past.slice(0, state.past.length - 1),
        present: previous.payload,
        future: [previous, ...state.future],
      };
    case 'REDO':
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: [...state.past, next],
        present: next.payload,
        future: state.future.slice(1),
      };
    default:
      return state;
  }
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(historyReducer, initialState);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO', payload: null });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO', payload: null });
  }, []);

  const value = {
    state,
    dispatch,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
