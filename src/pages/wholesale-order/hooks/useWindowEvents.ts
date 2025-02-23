
import { useEffect } from 'react';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';

export function useWindowEvents() {
  const { hasUnsavedChanges } = useWholesaleOrder();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
}
