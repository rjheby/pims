
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
    setItems((prevItems: OrderItem[]) => {
      return prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
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
      quantity: 1,
    };
    
    setItems([...items, newItem]);
  }, [items, setItems]);

  const handleRemoveItem = useCallback((id: number) => {
    setItems((prevItems: OrderItem[]) => prevItems.filter(item => item.id !== id));
  }, [setItems]);

  const handleDuplicateItem = useCallback((id: number) => {
    const itemToDuplicate = items.find(item => item.id === id);
    if (itemToDuplicate) {
      const newId = Math.max(...items.map(item => item.id)) + 1;
      const newItem = { ...itemToDuplicate, id: newId };
      setItems((prevItems: OrderItem[]) => [...prevItems, newItem]);
    }
  }, [items, setItems]);

  const handleQuantityChange = useCallback((id: number, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      setItems((prevItems: OrderItem[]) => {
        return prevItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        );
      });
    }
  }, [setItems]);

  const handleOptionChange = useCallback((id: number, field: keyof DropdownOptions, value: string) => {
    setItems((prevItems: OrderItem[]) => {
      return prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      );
    });
  }, [setItems]);

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
        setItems((prevItems: OrderItem[]) => {
          return prevItems.map(item =>
            item.id === editingRowId ? { ...item, [editingField]: newOption } : item
          );
        });
      }
      
      setNewOption('');
      setEditingField(null);
      setEditingRowId(null);
    }
  }, [newOption, editingField, editingRowId, options, setOptions, setItems, setNewOption, setEditingField, setEditingRowId]);

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
        setItems((prevItems: OrderItem[]) => {
          return prevItems.map(item =>
            item.id === editingRowId ? { ...item, [editingField]: option } : item
          );
        });
      }
      
      setNewOption('');
      setEditingField(null);
      setEditingRowId(null);
    }
  }, [editingField, editingRowId, options, setOptions, setItems, setNewOption, setEditingField, setEditingRowId]);

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
