
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";

interface RecurringOrderFormProps {
  customers: any[];
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  initialValues?: {
    customer_id?: string;
    frequency?: string;
    preferred_day?: string;
    preferred_time?: string;
  };
}

export function RecurringOrderForm({
  customers,
  onSubmit,
  onCancel,
  initialValues = {}
}: RecurringOrderFormProps) {
  const [formData, setFormData] = useState({
    customer_id: initialValues.customer_id || '',
    frequency: initialValues.frequency || 'weekly',
    preferred_day: initialValues.preferred_day || 'monday',
    preferred_time: initialValues.preferred_time || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }
    
    if (!formData.frequency) {
      newErrors.frequency = 'Frequency is required';
    }
    
    if (!formData.preferred_day) {
      newErrors.preferred_day = 'Preferred day is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  const getDayOptions = () => {
    if (formData.frequency === 'weekly' || formData.frequency === 'bi-weekly') {
      return [
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' },
        { value: 'sunday', label: 'Sunday' },
      ];
    } else if (formData.frequency === 'monthly') {
      // For monthly, we'll offer both day-of-month and pattern options
      const daysOfMonth = Array.from({ length: 28 }, (_, i) => ({
        value: `${i + 1}`,
        label: `${i + 1}${getDaySuffix(i + 1)} of the month`,
      }));
      
      const patterns = [
        { value: 'first monday', label: 'First Monday' },
        { value: 'first tuesday', label: 'First Tuesday' },
        { value: 'first wednesday', label: 'First Wednesday' },
        { value: 'first thursday', label: 'First Thursday' },
        { value: 'first friday', label: 'First Friday' },
        { value: 'second monday', label: 'Second Monday' },
        { value: 'second tuesday', label: 'Second Tuesday' },
        { value: 'second wednesday', label: 'Second Wednesday' },
        { value: 'second thursday', label: 'Second Thursday' },
        { value: 'second friday', label: 'Second Friday' },
        { value: 'third monday', label: 'Third Monday' },
        { value: 'third tuesday', label: 'Third Tuesday' },
        { value: 'third wednesday', label: 'Third Wednesday' },
        { value: 'third thursday', label: 'Third Thursday' },
        { value: 'third friday', label: 'Third Friday' },
        { value: 'last monday', label: 'Last Monday' },
        { value: 'last tuesday', label: 'Last Tuesday' },
        { value: 'last wednesday', label: 'Last Wednesday' },
        { value: 'last thursday', label: 'Last Thursday' },
        { value: 'last friday', label: 'Last Friday' },
      ];
      
      return [...daysOfMonth, ...patterns];
    }
    
    return [];
  };

  const getDaySuffix = (day: number) => {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="customer">Customer</Label>
        <Select
          value={formData.customer_id}
          onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
        >
          <SelectTrigger id="customer" className={errors.customer_id ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customer_id && (
          <p className="text-sm text-red-500">{errors.customer_id}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency</Label>
        <Select
          value={formData.frequency}
          onValueChange={(value) => {
            setFormData({
              ...formData,
              frequency: value,
              // Reset preferred day when frequency changes
              preferred_day: value === 'monthly' ? '1' : 'monday'
            });
          }}
        >
          <SelectTrigger id="frequency" className={errors.frequency ? 'border-red-500' : ''}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
        {errors.frequency && (
          <p className="text-sm text-red-500">{errors.frequency}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="preferred_day">
          {formData.frequency === 'monthly' ? 'Day of Month' : 'Preferred Day'}
        </Label>
        <Select
          value={formData.preferred_day}
          onValueChange={(value) => setFormData({ ...formData, preferred_day: value })}
        >
          <SelectTrigger 
            id="preferred_day" 
            className={`${errors.preferred_day ? 'border-red-500' : ''} flex items-center`}
          >
            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {getDayOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.preferred_day && (
          <p className="text-sm text-red-500">{errors.preferred_day}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="preferred_time">Preferred Time (optional)</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Clock className="h-4 w-4 text-gray-500" />
          </div>
          <Input
            id="preferred_time"
            type="time"
            className="pl-10"
            value={formData.preferred_time}
            onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
          />
        </div>
        <p className="text-sm text-gray-500">
          This is a preferred time window, not a guaranteed delivery time
        </p>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#2A4131] hover:bg-[#2A4131]/90">
          Create Recurring Order
        </Button>
      </div>
    </form>
  );
}
