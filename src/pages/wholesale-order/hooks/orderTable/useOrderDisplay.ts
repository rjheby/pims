
import { useState } from "react";

export function useOrderDisplay() {
  const [compressedStates, setCompressedStates] = useState<Record<number, boolean>>({});

  const toggleCompressed = (itemId: number) => {
    setCompressedStates(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return {
    compressedStates,
    toggleCompressed
  };
}
