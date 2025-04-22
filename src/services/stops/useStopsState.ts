/**
 * Core state management for stops
 */

import { useState, useCallback } from 'react';
import type { DeliveryStop, StopFormData } from '@/types';

/**
 * Hook for managing stops state
 */
export function useStopsState(initialStops: DeliveryStop[] = []) {
  const [stops, setStops] = useState<DeliveryStop[]>(initialStops);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Add a new stop to the list
   */
  const addStop = useCallback((newStop: DeliveryStop) => {
    setStops(prevStops => [...prevStops, newStop]);
  }, []);

  /**
   * Update an existing stop
   */
  const updateStop = useCallback((stopId: string, updatedStop: Partial<DeliveryStop>) => {
    setStops(prevStops => 
      prevStops.map(stop => 
        stop.id === stopId ? { ...stop, ...updatedStop } : stop
      )
    );
  }, []);

  /**
   * Remove a stop from the list
   */
  const removeStop = useCallback((stopId: string) => {
    setStops(prevStops => prevStops.filter(stop => stop.id !== stopId));
  }, []);

  /**
   * Reorder stops
   */
  const reorderStops = useCallback((startIndex: number, endIndex: number) => {
    setStops(prevStops => {
      const result = Array.from(prevStops);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((stop, index) => ({ ...stop, stop_number: index + 1 }));
    });
  }, []);

  /**
   * Update stop numbers
   */
  const updateStopNumbers = useCallback(() => {
    setStops(prevStops => 
      prevStops.map((stop, index) => ({ ...stop, stop_number: index + 1 }))
    );
  }, []);

  /**
   * Reset stops to initial state
   */
  const resetStops = useCallback(() => {
    setStops(initialStops);
  }, [initialStops]);

  return {
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
  };
} 