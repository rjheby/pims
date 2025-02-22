
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientOrder() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Client Order Form</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>New Order</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Client order form will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}
