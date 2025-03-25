
import { useCallback } from 'react';
import { useWholesaleOrder } from '../../context/WholesaleOrderContext';
import { OrderItem, DropdownOptions } from '../../types';
import { KeyboardEvent } from 'react';

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

  const handleUpdateItemValue = useCallback((id: number, field: string, value: any) => {
    setItems((prevItems) => {
      return prevItems.map(item =>
        item.id === id ? (field === 'all' ? value : { ...item, [field]: value }) : item
      );
    });
  }, [setItems]);

  const handleAddItem = useCallback(() => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    const newItem: OrderItem = {
      id: newId,
      species: '',
      length: '',
      bundleType: '',
      thickness: '',
      packaging: '',
      pallets: 1,
      unitCost: 0
    };
    
    setItems([...items, newItem]);
  }, [items, setItems]);

  const handleRemoveItem = useCallback((id: number) => {
    setItems(items.filter(item => item.id !== id));
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
      setItems(items.map(item =>
        item.id === id ? { ...item, pallets } : item
      ));
    }
  }, [items, setItems]);

  const handleOptionChange = useCallback((id: number, field: keyof DropdownOptions, value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }, [items, setItems]);

  const handleNewOptionChange = useCallback((value: string) => {
    setNewOption(value);
  }, [setNewOption]);

  const handleKeyPressOnNewOption = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newOption.trim() && editingField) {
      e.preventDefault();
      const updatedOptions = [...(options[editingField] || [])];
      if (!updatedOptions.includes(newOption)) {
        updatedOptions.push(newOption);
        setOptions({
          ...options,
          [editingField]: updatedOptions
        });
      }
      
      if (editingRowId !== null) {
        setItems(items.map(item =>
          item.id === editingRowId ? { ...item, [editingField]: newOption } : item
        ));
      }
      
      setNewOption('');
      setEditingField(null);
      setEditingRowId(null);
    }
  }, [newOption, editingField, editingRowId, items, options, setOptions, setItems, setNewOption, setEditingField, setEditingRowId]);

  const handleUpdateOptions = useCallback((option: string) => {
    if (option.trim() && editingField) {
      const updatedOptions = [...(options[editingField] || [])];
      if (!updatedOptions.includes(option)) {
        updatedOptions.push(option);
        setOptions({
          ...options,
          [editingField]: updatedOptions
        });
      }
      
      if (editingRowId !== null) {
        setItems(items.map(item =>
          item.id === editingRowId ? { ...item, [editingField]: option } : item
        ));
      }
      
      setNewOption('');
      setEditingField(null);
      setEditingRowId(null);
    }
  }, [editingField, editingRowId, items, options, setOptions, setItems, setNewOption, setEditingField, setEditingRowId]);

  const handleStartEditing = useCallback((id: number, field: keyof DropdownOptions) => {
    setEditingField(field);
    setEditingRowId(id);
    setNewOption('');
  }, [setEditingField, setEditingRowId, setNewOption]);

  const isEditing = useCallback((id: number, field: keyof DropdownOptions) => {
    return editingField === field && editingRowId === id;
  }, [editingField, editingRowId]);

  return {
    handleUpdateItemValue,
    handleAddItem,
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
