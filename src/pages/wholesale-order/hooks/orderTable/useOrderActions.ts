
import { useWholesaleOrder } from "../../context/WholesaleOrderContext";
import { OrderItem, DropdownOptions } from "../../types";
import { useHistory } from "@/context/HistoryContext";

export function useOrderActions() {
  const { 
    items = [], 
    setItems,
    options,
    setOptions,
    setEditingField,
    setNewOption
  } = useWholesaleOrder();
  
  const { addAction } = useHistory();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, field: keyof DropdownOptions) => {
    const { newOption } = useWholesaleOrder();
    if (e.key === "Enter" && newOption?.trim()) {
      const prevOptions = { ...options };
      const updatedOptions = [...(options[field] || []), newOption.trim()];
      
      setOptions({
        ...options,
        [field]: updatedOptions,
      });
      
      // Record this action in history
      addAction({
        payload: { 
          type: 'options', 
          field, 
          data: { 
            ...options,
            [field]: updatedOptions 
          } 
        },
        reverse: () => setOptions(prevOptions)
      });
      
      setNewOption("");
      setEditingField(null);
    }
  };

  const handleUpdateItem = (updatedItem: OrderItem) => {
    const prevItems = [...items];
    const index = items.findIndex(item => item.id === updatedItem.id);
    
    if (index !== -1) {
      const newItems = [...items];
      newItems[index] = updatedItem;
      setItems(newItems);
      
      // Record this action in history
      addAction({
        payload: { 
          type: 'updateItem', 
          itemId: updatedItem.id
        },
        reverse: () => setItems(prevItems)
      });
    }
  };

  const handleRemoveRow = (id: number) => {
    const prevItems = [...items];
    setItems(prev => prev.filter((item) => item.id !== id));
    
    // Record this action in history
    addAction({
      payload: { 
        type: 'removeRow', 
        itemId: id 
      },
      reverse: () => setItems(prevItems)
    });
  };

  const handleCopyRow = (item: OrderItem) => {
    const prevItems = [...items];
    const maxId = Math.max(...items.map((item) => item.id), 0);
    const newItem = { ...item, id: maxId + 1 };
    
    setItems(prev => [...prev, newItem]);
    
    // Record this action in history
    addAction({
      payload: { 
        type: 'copyRow', 
        newItem 
      },
      reverse: () => setItems(prevItems)
    });
  };

  const handleAddItem = () => {
    const prevItems = [...items];
    const maxId = Math.max(...items.map((item) => item.id), 0);
    const newItem = {
      id: maxId + 1,
      species: "",
      length: "",
      bundleType: "",
      thickness: "",
      packaging: "Pallets",
      pallets: 0,
      unitCost: 250, // Default unit cost
    };
    
    setItems(prev => [...prev, newItem]);
    
    // Record this action in history
    addAction({
      payload: { 
        type: 'addItem', 
        newItem 
      },
      reverse: () => setItems(prevItems)
    });
  };

  const handleUpdateOptions = (field: keyof DropdownOptions, option: string) => {
    const prevOptions = { ...options };
    const updatedOptions = [...options[field], option];
    
    setOptions({
      ...options,
      [field]: updatedOptions,
    });
    
    // Record this action in history
    addAction({
      payload: { 
        type: 'updateOptions', 
        field, 
        option 
      },
      reverse: () => setOptions(prevOptions)
    });
  };

  return {
    handleKeyPress,
    handleUpdateItem,
    handleRemoveRow,
    handleCopyRow,
    handleAddItem,
    handleUpdateOptions,
  };
}
