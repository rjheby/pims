import { configureStore } from "@reduxjs/toolkit";
import stopsReducer from "./slices/stopsSlice";
import recurringOrderSyncReducer from "./slices/recurringOrderSyncSlice";

export const store = configureStore({
  reducer: {
    stops: stopsReducer,
    recurringOrderSync: recurringOrderSyncReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 