/**
 * Actions/mutations for stops
 */

import { useCallback } from 'react';
import type { DeliveryStop, StopFormData, RecurrenceData } from '@/types';
import { useStopsState } from './useStopsState';
import { useStopsValidation } from './useStopsValidation';

/**
 * Hook for managing stop actions
 */
export function useStopsActions(initialStops: DeliveryStop[] = []) {
  const {
    stops,
    isLoading,
    error,
    setStops,
    setIsLoading,
    setError,
    addStop,
    updateStop,
    removeStop,
    reorderStops,
    updateStopNumbers,
    resetStops
  } = useStopsState(initialStops);

  const { validateStop, validateStops, isValidStop, isValidStops } = useStopsValidation();

  /**
   * Create a new stop
   */
  const createStop = useCallback(async (stopData: StopFormData, recurrenceData?: RecurrenceData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate stop data
      const validationErrors = validateStop(stopData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.map(err => err.message).join(', '));
      }

      // Create new stop
      const newStop: DeliveryStop = {
        ...stopData,
        id: crypto.randomUUID(),
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        master_schedule_id: stopData.master_schedule_id || crypto.randomUUID()
      };

      // Add recurrence data if provided
      if (recurrenceData?.isRecurring) {
        newStop.recurrence_id = crypto.randomUUID();
      }

      addStop(newStop);
      return newStop;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create stop'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addStop, setIsLoading, setError, validateStop]);

  /**
   * Update an existing stop
   */
  const editStop = useCallback(async (stopId: string, stopData: Partial<StopFormData>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate stop data
      const validationErrors = validateStop(stopData as StopFormData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.map(err => err.message).join(', '));
      }

      // Update stop
      updateStop(stopId, {
        ...stopData,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update stop'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateStop, setIsLoading, setError, validateStop]);

  /**
   * Delete a stop
   */
  const deleteStop = useCallback(async (stopId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      removeStop(stopId);
      updateStopNumbers();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete stop'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [removeStop, updateStopNumbers, setIsLoading, setError]);

  /**
   * Save all stops
   */
  const saveStops = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate all stops
      const validationErrors = validateStops(stops);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.map(err => err.message).join(', '));
      }

      // Here you would typically make an API call to save the stops
      // For now, we'll just update the state
      setStops(stops.map(stop => ({
        ...stop,
        updated_at: new Date().toISOString()
      })));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save stops'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [stops, setStops, setIsLoading, setError, validateStops]);

  return {
    stops,
    isLoading,
    error,
    createStop,
    editStop,
    deleteStop,
    saveStops,
    reorderStops,
    updateStopNumbers,
    resetStops
  };
} 