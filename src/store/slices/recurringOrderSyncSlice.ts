import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SyncResult } from "@/pages/dispatch/components/stops/types";

interface RecurringOrderSyncState {
  isSyncing: boolean;
  syncResult: SyncResult | null;
  error: string | null;
  lastSyncedDate: string | null;
}

const initialState: RecurringOrderSyncState = {
  isSyncing: false,
  syncResult: null,
  error: null,
  lastSyncedDate: null,
};

const recurringOrderSyncSlice = createSlice({
  name: "recurringOrderSync",
  initialState,
  reducers: {
    startSync: (state) => {
      state.isSyncing = true;
      state.error = null;
    },
    syncSuccess: (state, action: PayloadAction<{ result: SyncResult; date: string }>) => {
      state.isSyncing = false;
      state.syncResult = action.payload.result;
      state.lastSyncedDate = action.payload.date;
      state.error = null;
    },
    syncError: (state, action: PayloadAction<string>) => {
      state.isSyncing = false;
      state.error = action.payload;
    },
    resetSyncState: (state) => {
      state.isSyncing = false;
      state.syncResult = null;
      state.error = null;
    },
  },
});

export const { startSync, syncSuccess, syncError, resetSyncState } = recurringOrderSyncSlice.actions;

export default recurringOrderSyncSlice.reducer; 