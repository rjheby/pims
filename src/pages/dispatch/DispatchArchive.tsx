
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DispatchArchive() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dispatch Archives</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Past Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No archived deliveries found.</p>
        </CardContent>
      </Card>
    </div>
  );
}
