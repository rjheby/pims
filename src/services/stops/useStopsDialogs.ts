/**
 * Dialog management for stops
 */

import { useState, useCallback } from 'react';
import type { StopFormData, RecurrenceData, Customer, Driver } from '@/types';

/**
 * Hook for managing stop dialogs
 */
export function useStopsDialogs() {
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [recurrenceDialogOpen, setRecurrenceDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNewStop, setIsAddingNewStop] = useState(false);
  const [editForm, setEditForm] = useState<StopFormData>({
    client_id: '',
    items: '',
    stop_number: 0
  });
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData>({
    isRecurring: false,
    frequency: 'weekly'
  });

  /**
   * Open customer selection dialog
   */
  const openCustomerDialog = useCallback(() => {
    setCustomerDialogOpen(true);
  }, []);

  /**
   * Close customer selection dialog
   */
  const closeCustomerDialog = useCallback(() => {
    setCustomerDialogOpen(false);
  }, []);

  /**
   * Open items selection dialog
   */
  const openItemsDialog = useCallback(() => {
    setItemsDialogOpen(true);
  }, []);

  /**
   * Close items selection dialog
   */
  const closeItemsDialog = useCallback(() => {
    setItemsDialogOpen(false);
  }, []);

  /**
   * Open recurrence settings dialog
   */
  const openRecurrenceDialog = useCallback(() => {
    setRecurrenceDialogOpen(true);
  }, []);

  /**
   * Close recurrence settings dialog
   */
  const closeRecurrenceDialog = useCallback(() => {
    setRecurrenceDialogOpen(false);
  }, []);

  /**
   * Handle customer selection
   */
  const handleCustomerSelect = useCallback((customer: Customer) => {
    setEditForm(prev => ({
      ...prev,
      client_id: customer.id,
      customer
    }));
    closeCustomerDialog();
  }, [closeCustomerDialog]);

  /**
   * Handle items selection
   */
  const handleItemsSelect = useCallback((items: string) => {
    setEditForm(prev => ({
      ...prev,
      items
    }));
    closeItemsDialog();
  }, [closeItemsDialog]);

  /**
   * Handle recurrence data change
   */
  const handleRecurrenceChange = useCallback((data: RecurrenceData) => {
    setRecurrenceData(data);
    closeRecurrenceDialog();
  }, [closeRecurrenceDialog]);

  /**
   * Start editing a stop
   */
  const startEditing = useCallback((index: number, stop: StopFormData) => {
    setEditingIndex(index);
    setEditForm(stop);
    setIsAddingNewStop(false);
  }, []);

  /**
   * Start adding a new stop
   */
  const startAdding = useCallback(() => {
    setEditingIndex(null);
    setEditForm({
      client_id: '',
      items: '',
      stop_number: 0
    });
    setIsAddingNewStop(true);
  }, []);

  /**
   * Cancel editing/adding
   */
  const cancelEditing = useCallback(() => {
    setEditingIndex(null);
    setEditForm({
      client_id: '',
      items: '',
      stop_number: 0
    });
    setIsAddingNewStop(false);
    setRecurrenceData({
      isRecurring: false,
      frequency: 'weekly'
    });
  }, []);

  return {
    customerDialogOpen,
    itemsDialogOpen,
    recurrenceDialogOpen,
    editingIndex,
    isAddingNewStop,
    editForm,
    recurrenceData,
    setEditForm,
    openCustomerDialog,
    closeCustomerDialog,
    openItemsDialog,
    closeItemsDialog,
    openRecurrenceDialog,
    closeRecurrenceDialog,
    handleCustomerSelect,
    handleItemsSelect,
    handleRecurrenceChange,
    startEditing,
    startAdding,
    cancelEditing
  };
} 