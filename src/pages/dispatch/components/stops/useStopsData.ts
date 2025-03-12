import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryStop } from './types';

const transformStopData = (stop: any): DeliveryStop => {
  return {
    ...stop,
    id: stop.id?.toString(), // Ensure id is converted to string
    customer_id: stop.customer_id?.toString(),
    driver_id: stop.driver_id?.toString(),
    master_schedule_id: stop.master_schedule_id?.toString(),
    stop_number: Number(stop.stop_number)
  };
};

export const useStopsData = () => {
  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStops = async () => {
      setLoading(true);
      try {
        // Fetch stops from Supabase
        const { data, error } = await supabase
          .from('delivery_stops')
          .select('*');

        if (error) {
          throw new Error(error.message);
        }

        // Transform the data to match the DeliveryStop interface
        const transformedStops = data ? data.map(stop => transformStopData(stop)) : [];
        setStops(transformedStops);
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStops();
  }, []);

  const addStop = (newStop: DeliveryStop) => {
    setStops(prevStops => [...prevStops, transformStopData(newStop)]);
  };

  const updateStop = (updatedStop: DeliveryStop) => {
    setStops(prevStops =>
      prevStops.map(stop =>
        stop.id === updatedStop.id ? transformStopData(updatedStop) : stop
      )
    );
  };

  const removeStop = (stopId: string) => {
    setStops(prevStops => prevStops.filter(stop => stop.id !== stopId));
  };

  const updateStops = (newStops: DeliveryStop[]) => {
    setStops(newStops.map(stop => transformStopData(stop)));
  };

  return {
    stops,
    loading,
    error,
    addStop,
    updateStop,
    removeStop,
    updateStops,
  };
};
