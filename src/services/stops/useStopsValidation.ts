/**
 * Validation logic for stops
 */

import { useCallback } from 'react';
import type { StopFormData, DeliveryStop } from '@/types';

/**
 * Validation error type
 */
export type ValidationError = {
  field: keyof StopFormData;
  message: string;
};

/**
 * Hook for validating stops
 */
export function useStopsValidation() {
  /**
   * Validate a single stop
   */
  const validateStop = useCallback((stop: StopFormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!stop.client_id) {
      errors.push({
        field: 'client_id',
        message: 'Customer is required'
      });
    }

    if (!stop.items) {
      errors.push({
        field: 'items',
        message: 'Items are required'
      });
    }

    if (typeof stop.stop_number !== 'number' || stop.stop_number < 1) {
      errors.push({
        field: 'stop_number',
        message: 'Stop number must be a positive number'
      });
    }

    return errors;
  }, []);

  /**
   * Validate multiple stops
   */
  const validateStops = useCallback((stops: DeliveryStop[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Check for duplicate stop numbers
    const stopNumbers = new Set<number>();
    stops.forEach(stop => {
      if (stopNumbers.has(stop.stop_number)) {
        errors.push({
          field: 'stop_number',
          message: `Duplicate stop number: ${stop.stop_number}`
        });
      }
      stopNumbers.add(stop.stop_number);
    });

    // Check for gaps in stop numbers
    const sortedStopNumbers = [...stopNumbers].sort((a, b) => a - b);
    for (let i = 0; i < sortedStopNumbers.length - 1; i++) {
      if (sortedStopNumbers[i + 1] - sortedStopNumbers[i] > 1) {
        errors.push({
          field: 'stop_number',
          message: `Gap in stop numbers between ${sortedStopNumbers[i]} and ${sortedStopNumbers[i + 1]}`
        });
      }
    }

    return errors;
  }, []);

  /**
   * Check if a stop is valid
   */
  const isValidStop = useCallback((stop: StopFormData): boolean => {
    return validateStop(stop).length === 0;
  }, [validateStop]);

  /**
   * Check if multiple stops are valid
   */
  const isValidStops = useCallback((stops: DeliveryStop[]): boolean => {
    return validateStops(stops).length === 0;
  }, [validateStops]);

  return {
    validateStop,
    validateStops,
    isValidStop,
    isValidStops
  };
} 