
import { useState, useEffect, useRef } from 'react';

/**
 * A hook that delays updating a value until a specified delay has passed
 * Useful for search inputs to prevent excessive API calls
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timer if value changes before delay completes
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set a timeout to update the debounced value after the specified delay
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout when component unmounts or value changes
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
