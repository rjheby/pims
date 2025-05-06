
import { useCallback } from 'react';
import { useWholesaleOrder } from '../../context/WholesaleOrderContext';
import { OrderItem, DropdownOptions } from '../../types';
import { handleOptionOperation } from '../../utils/optionManagement';
import { KeyboardEvent } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useOrderActions = () => {
  const {
    items,
    setItems,
    options,
    setOptions,
    editingField,
    setEditingField,
    newOption,
    setNewOption,
    editingRowId,
    setEditingRowId
  } = useWholesaleOrder();

  const { toast } = useToast();

  const handleUpdateItemValue = useCallback((id: number, field: string, value: any) => {
    console.log(`Updating item ${id}, field: ${field}, value:`, value);
    const updatedItems = items.map(item =>
      item.id === id ? (field === 'all' ? value : { ...item, [field]: value }) : item
    );
    setItems(updatedItems);
  }, [items, setItems]);

  const handleAddItem = useCallback(() => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    const newItem: OrderItem = {
      id: newId,
      species: '',
      length: '',
      bundleType: '',
      thickness: '',
      packaging: 'Pallets',
      pallets: 1,
      unitCost: 0
    };
    
    setItems([...items, newItem]);
  }, [items, setItems]);

  const handleAddItem2 = useCallback((item?: Partial<OrderItem>) => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    const newItem: OrderItem = {
      id: newId,
      species: item?.species || '',
      length: item?.length || '',
      bundleType: item?.bundleType || '',
      thickness: item?.thickness || '',
      packaging: item?.packaging || 'Pallets',
      pallets: item?.pallets || 1,
      unitCost: item?.unitCost || 0,
      productId: item?.productId
    };
    
    setItems([...items, newItem]);
    console.log('Added new item:', newItem);
  }, [items, setItems]);

  const handleRemoveItem = useCallback((id: number) => {
    const filteredItems = items.filter(item => item.id !== id);
    setItems(filteredItems);
  }, [items, setItems]);

  const handleDuplicateItem = useCallback((id: number) => {
    const itemToDuplicate = items.find(item => item.id === id);
    if (itemToDuplicate) {
      const newId = Math.max(...items.map(item => item.id)) + 1;
      const newItem = { ...itemToDuplicate, id: newId };
      setItems([...items, newItem]);
    }
  }, [items, setItems]);

  const handleQuantityChange = useCallback((id: number, value: string) => {
    const pallets = parseInt(value, 10);
    if (!isNaN(pallets) && pallets > 0) {
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, pallets } : item
      );
      setItems(updatedItems);
    }
  }, [items, setItems]);

  const handleOptionChange = useCallback((id: number, field: keyof DropdownOptions, value: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  }, [items, setItems]);

  const handleNewOptionChange = useCallback((value: string) => {
    setNewOption(value);
  }, [setNewOption]);

  const handleKeyPressOnNewOption = useCallback(async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newOption.trim() && editingField) {
      e.preventDefault();
      
      // Use the optionManagement utility to add the new option
      const updatedOptions = await handleOptionOperation(
        'add',
        editingField,
        newOption,
        options
      );
      
      if (updatedOptions) {
        setOptions(updatedOptions);
        
        if (editingRowId !== null) {
          const updatedItems = items.map(item =>
            item.id === editingRowId ? { ...item, [editingField]: newOption } : item
          );
          setItems(updatedItems);
        }
        
        setNewOption('');
        setEditingField(null);
        setEditingRowId(null);
      }
    }
  }, [newOption, editingField, editingRowId, items, options, setOptions, setItems, setNewOption, setEditingField, setEditingRowId]);

  const handleUpdateOptions = useCallback(async (option: string) => {
    if (option.trim() && editingField) {
      // Use the optionManagement utility to add the new option
      const updatedOptions = await handleOptionOperation(
        'add',
        editingField,
        option,
        options
      );
      
      if (updatedOptions) {
        setOptions(updatedOptions);
        
        if (editingRowId !== null) {
          const updatedItems = items.map(item =>
            item.id === editingRowId ? { ...item, [editingField]: option } : item
          );
          setItems(updatedItems);
        }
        
        setNewOption('');
        setEditingField(null);
        setEditingRowId(null);
      }
    }
  }, [editingField, editingRowId, items, options, setOptions, setItems, setNewOption, setEditingField, setEditingRowId]);

  const handleStartEditing = useCallback((id: number, field: keyof DropdownOptions) => {
    console.log(`Start editing field ${field} for item ${id}`);
    setEditingField(field);
    setEditingRowId(id);
    setNewOption('');
  }, [setEditingField, setEditingRowId, setNewOption]);

  const isEditing = useCallback((id: number, field: keyof DropdownOptions) => {
    return editingField === field && editingRowId === id;
  }, [editingField, editingRowId]);

  return {
    handleUpdateItemValue,
    handleAddItem: handleAddItem2,
    handleRemoveItem,
    handleDuplicateItem,
    handleQuantityChange,
    handleOptionChange,
    handleNewOptionChange,
    handleKeyPressOnNewOption,
    handleUpdateOptions,
    handleStartEditing,
    isEditing
  };
};
