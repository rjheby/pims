
import { OrderItem } from "./types";
import { toast } from "@/hooks/use-toast";

export const addRow = () => {
  const totalPallets = items.reduce((sum, item) => sum + (item.pallets || 0), 0);
  const newPallets = 0; // Default for new row

  if (totalPallets + newPallets > 24) {
    toast({
      title: "Warning",
      description: "Adding more pallets would exceed the 24-pallet limit for a tractor trailer.",
      variant: "destructive",
    });
    return;
  }

  return {
    id: items.length + 1,
    species: "",
    length: "",
    bundleType: "",
    thickness: "",
    packaging: "Pallets",
    pallets: 0,
  };
};
