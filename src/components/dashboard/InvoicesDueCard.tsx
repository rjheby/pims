
import { useInvoicesDue } from "@/pages/wholesale-order/hooks/useInvoicesDue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign } from "lucide-react";

export function InvoicesDueCard() {
  const { invoicesDue, loading: invoicesLoading } = useInvoicesDue();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Supplier Invoices Due Next 45 Days
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invoicesLoading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <div className="text-2xl font-bold text-red-600 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
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
