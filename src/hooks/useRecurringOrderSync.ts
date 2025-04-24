
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { startSync, syncSuccess, syncError, resetSyncState } from "@/store/slices/recurringOrderSyncSlice";
import { UseRecurringOrderSyncReturn, SyncResult } from "@/pages/dispatch/components/stops/types";
import { DeliveryStop } from "@/types/delivery";
import moment from "moment";

export const useRecurringOrderSync = (): UseRecurringOrderSyncReturn => {
  const dispatch = useDispatch();
  const { isSyncing, syncResult, error } = useSelector(
    (state: RootState) => state.recurringOrderSync
  );

  const syncRecurringOrders = useCallback(
    async (date: string) => {
      try {
        dispatch(startSync());

        // TODO: Replace with actual API call
        const response = await fetch(`/api/recurring-orders/sync?date=${date}`);
        if (!response.ok) {
          throw new Error("Failed to sync recurring orders");
        }

        const result: SyncResult = await response.json();
        dispatch(syncSuccess({ result, date }));
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        dispatch(syncError(errorMessage));
        throw err;
      }
    },
    [dispatch]
  );

  const resetSyncState = useCallback(() => {
    dispatch(resetSyncState());
  }, [dispatch]);

  return {
    isSyncing,
    syncResult,
    syncError: error,
    syncRecurringOrders,
    resetSyncState,
  };
};
