
import { Sheet } from "@/components/sheets/Sheet";
import { OrderItem } from "./types";
import { useWholesaleOrder } from "./context/WholesaleOrderContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function WholesaleOrderSheet() {
  const { items, options, setItems, isAdmin } = useWholesaleOrder();

  const handleUpdateItem = (id: number, field: keyof OrderItem, value: any) => {
    setItems(prev => 
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddItem = () => {
    const maxId = Math.max(...items.map(item => item.id), 0);
    setItems([...items, {
      id: maxId + 1,
      species: "",
      length: "",
      bundleType: "",
      thickness: "",
      packaging: "Pallets",
      pallets: 0,
      quantity: 0,
      cost: 0
    }]);
  };

  const columns = [
    {
      field: 'species' as keyof OrderItem,
      header: 'Species',
      render: (item: OrderItem) => (
        <Select value={item.species} onValueChange={(value) => handleUpdateItem(item.id, 'species', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select species" />
          </SelectTrigger>
          <SelectContent>
            {options.species.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    },
    // ... Add other columns similarly
  ];

  const summaries = [
    {
      label: 'Total Pallets',
      calculate: (items: OrderItem[]) => items.reduce((sum, item) => sum + (Number(item.pallets) || 0), 0),
    },
    {
      label: 'Total Cost',
      calculate: (items: OrderItem[]) => items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0),
      format: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  ];

  return (
    <Sheet<OrderItem>
      items={items}
      columns={columns}
      summaries={summaries}
      onAddItem={handleAddItem}
      onUpdateItem={handleUpdateItem}
      onRemoveItem={(id) => setItems(items.filter(item => item.id !== id))}
      onCopyItem={(item) => setItems([...items, { ...item, id: Math.max(...items.map(i => i.id), 0) + 1 }])}
      isAdmin={isAdmin}
      addItemLabel="Add Product"
    />
  );
}
