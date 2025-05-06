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
        const updatedItems = items.map(item =>
          item.id === editingRowId ? { ...item, [editingField]: newOption } : item
        );
        setItems(updatedItems);
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
        const updatedItems = items.map(item =>
          item.id === editingRowId ? { ...item, [editingField]: option } : item
        );
        setItems(updatedItems);
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
