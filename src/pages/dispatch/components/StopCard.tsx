
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, FileText, User, Edit, Eye } from "lucide-react";
import { DeliveryStop, getStatusBadgeVariant, getSchedulingStatusBadgeVariant } from './stops/types';

interface StopCardProps {
  stop: DeliveryStop;
  onEditClick?: () => void;
  onViewClick?: () => void;
}

export const StopCard: React.FC<StopCardProps> = ({
  stop,
  onEditClick,
  onViewClick
}) => {
  const formatTimeWindow = (timeWindow?: { start: string, end: string }) => {
    if (!timeWindow) return "Any time";
    return `${timeWindow.start} - ${timeWindow.end}`;
  };

  return (
    <Card className="shadow-sm hover:shadow transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{stop.customer_name || "No Customer"}</span>
              {stop.status && (
                <Badge variant={getStatusBadgeVariant(stop.status)}>
                  {stop.status?.replace("_", " ")}
                </Badge>
              )}
              {stop.scheduling_status && (
                <Badge variant={getSchedulingStatusBadgeVariant(stop.scheduling_status)}>
                  {stop.scheduling_status?.replace("_", " ")}
                </Badge>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatTimeWindow(stop.time_window)}</span>
            </div>
            {stop.customer_address && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{stop.customer_address}</span>
              </div>
            )}
            {stop.items && (
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="h-4 w-4 mr-1" />
                <span className="truncate max-w-xs">{stop.items}</span>
              </div>
            )}
            {stop.driver_name && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                <span>{stop.driver_name}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {onEditClick && (
              <Button variant="outline" size="sm" onClick={onEditClick}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onViewClick && (
              <Button variant="outline" size="sm" onClick={onViewClick}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
