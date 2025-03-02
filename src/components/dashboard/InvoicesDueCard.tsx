
import { useInvoicesDue } from "@/pages/wholesale-order/hooks/useInvoicesDue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign } from "lucide-react";

export function InvoicesDueCard() {
  const { invoicesDue, loading } = useInvoicesDue();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Invoices Due
        </CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <div className="text-2xl font-bold text-red-600">
            ${invoicesDue.toLocaleString('en-US', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
