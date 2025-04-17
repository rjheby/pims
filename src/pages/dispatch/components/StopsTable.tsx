import React from 'react';
import { Stop, DeliveryStop, DeliveryStatus } from './stops/types';
import { getStatusBadgeVariant } from './stops/types';

interface StopsTableProps {
  stops: Stop[];
  onStopUpdate?: (stop: DeliveryStop) => void;
  onStopDelete?: (stopId: string) => void;
}

export function StopsTable({ stops, onStopUpdate, onStopDelete }: StopsTableProps) {
  const convertToDeliveryStop = (stop: Stop): DeliveryStop => {
    return {
      ...stop,
      master_schedule_id: stop.master_schedule_id || '',
      customer_name: stop.customer_name || '',
      customer_address: stop.customer_address || '',
      customer_phone: stop.customer_phone || '',
      stop_number: stop.stop_number || 0,
      status: stop.status || DeliveryStatus.PENDING
    };
  };

  return (
    <div className="space-y-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stop #</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stops.map((stop, index) => {
            const deliveryStop = convertToDeliveryStop(stop);
            return (
              <tr key={stop.id || index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deliveryStop.stop_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{deliveryStop.customer_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deliveryStop.items}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeVariant(deliveryStop.status)}`}>
                    {deliveryStop.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {onStopUpdate && (
                    <button
                      onClick={() => onStopUpdate(deliveryStop)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                  )}
                  {onStopDelete && stop.id && (
                    <button
                      onClick={() => onStopDelete(stop.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 