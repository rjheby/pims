
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HistoryControls } from "./History/HistoryControls";
import { NavigationControls } from "./Navigation/NavigationControls";

export function GlobalControls() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K to toggle search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
  
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <NavigationControls />
        <div className="mx-1 border-r border-gray-200 h-8" />
        <HistoryControls />
      </div>
      
      <div className="relative flex-1">
        {showSearch ? (
          <Input
            type="text"
            placeholder="Search..."
            className="h-9 w-[200px] lg:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            onBlur={() => {
              if (!searchQuery) setShowSearch(false);
            }}
          />
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearch(true)}
            className="h-8 w-8 p-0"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        )}
      </div>
    </div>
  );
}
