
import { InvoicesDueCard } from "@/components/dashboard/InvoicesDueCard";
import { RetailInventoryCard } from "@/components/dashboard/RetailInventoryCard";

export default function Dashboard() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InvoicesDueCard />
        <RetailInventoryCard />
        {/* Add other dashboard cards here */}
      </div>
    </div>
  );
}
