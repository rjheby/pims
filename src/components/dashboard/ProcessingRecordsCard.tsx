
/*
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Clipboard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { 
  ProcessingRecord, 
  WoodProduct, 
  FirewoodProduct,
  supabaseTable
} from "@/pages/wholesale-order/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ProcessingRecordsCard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [processingRecords, setProcessingRecords] = useState<ProcessingRecord[]>([]);
  const [woodProducts, setWoodProducts] = useState<WoodProduct[]>([]);
  const [firewoodProducts, setFirewoodProducts] = useState<FirewoodProduct[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<ProcessingRecord>>({
    wood_product_id: "",
    firewood_product_id: 0,
    wholesale_pallets_used: 0,
    retail_packages_created: 0,
    actual_conversion_ratio: 0,
    processed_date: new Date().toISOString().split('T')[0],
    processed_by: "",
    notes: ""
  });

  // Fetch processing records, wood products, and firewood products
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch processing records
      const { data: recordsData, error: recordsError } = await supabase
        .from(supabaseTable.processing_records)
        .select('*')
        .order('processed_date', { ascending: false })
        .limit(5);

      if (recordsError) throw recordsError;
      setProcessingRecords(recordsData as ProcessingRecord[] || []);

      // Fetch wood products
      const { data: woodData, error: woodError } = await supabase
        .from(supabaseTable.wood_products)
        .select('*');

      if (woodError) throw woodError;
      setWoodProducts(woodData as WoodProduct[] || []);

      // Fetch firewood products
      const { data: firewoodData, error: firewoodError } = await supabase
        .from(supabaseTable.firewood_products)
        .select('*');

      if (firewoodError) throw firewoodError;
      setFirewoodProducts(firewoodData as FirewoodProduct[] || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate conversion ratio
  const calculateConversionRatio = () => {
    const palletsUsed = formData.wholesale_pallets_used || 0;
    const packagesCreated = formData.retail_packages_created || 0;
    
    if (palletsUsed > 0) {
      const ratio = packagesCreated / palletsUsed;
      setFormData({
        ...formData,
        actual_conversion_ratio: parseFloat(ratio.toFixed(2))
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check for required fields
      if (!formData.wood_product_id || !formData.firewood_product_id || 
          !formData.wholesale_pallets_used || !formData.retail_packages_created || 
          !formData.processed_by) {
        throw new Error("Please fill in all required fields");
      }
      
      // Insert new processing record
      const { data, error } = await supabase
        .from(supabaseTable.processing_records)
        .insert([{
          wood_product_id: formData.wood_product_id,
          firewood_product_id: formData.firewood_product_id,
          wholesale_pallets_used: formData.wholesale_pallets_used,
          retail_packages_created: formData.retail_packages_created,
          actual_conversion_ratio: formData.actual_conversion_ratio,
          processed_date: formData.processed_date,
          processed_by: formData.processed_by,
          notes: formData.notes
        }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Processing record added successfully",
      });
      
      // Reset form and refresh data
      setFormData({
        wood_product_id: "",
        firewood_product_id: 0,
        wholesale_pallets_used: 0,
        retail_packages_created: 0,
        actual_conversion_ratio: 0,
        processed_date: new Date().toISOString().split('T')[0],
        processed_by: "",
        notes: ""
      });
      setShowForm(false);
      fetchData();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add processing record",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Recent Processing Records
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : <Plus className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <>
            {showForm ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Raw Material (Wood Product) *
                    </label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={formData.wood_product_id}
                      onChange={(e) => setFormData({...formData, wood_product_id: e.target.value})}
                      required
                    >
                      <option value="">Select Wood Product</option>
                      {woodProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.full_description}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Processed Into (Firewood Product) *
                    </label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={formData.firewood_product_id}
                      onChange={(e) => setFormData({...formData, firewood_product_id: parseInt(e.target.value)})}
                      required
                    >
                      <option value="">Select Firewood Product</option>
                      {firewoodProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.item_full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Wholesale Pallets Used *
                    </label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded"
                      value={formData.wholesale_pallets_used || ''}
                      onChange={(e) => setFormData({...formData, wholesale_pallets_used: parseInt(e.target.value)})}
                      onBlur={calculateConversionRatio}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Retail Packages Created *
                    </label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded"
                      value={formData.retail_packages_created || ''}
                      onChange={(e) => setFormData({...formData, retail_packages_created: parseInt(e.target.value)})}
                      onBlur={calculateConversionRatio}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Conversion Ratio
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded bg-gray-50"
                      value={formData.actual_conversion_ratio || ''}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Processed By *
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded"
                      value={formData.processed_by || ''}
                      onChange={(e) => setFormData({...formData, processed_by: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Processed Date *
                    </label>
                    <input 
                      type="date" 
                      className="w-full p-2 border rounded"
                      value={formData.processed_date || ''}
                      onChange={(e) => setFormData({...formData, processed_date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <Textarea 
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Enter any additional notes or observations..."
                    className="w-full"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Record"}
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                {processingRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead>Ratio</TableHead>
                          <TableHead>Processed By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processingRecords.map((record) => {
                          const woodProduct = woodProducts.find(p => p.id === record.wood_product_id);
                          const firewoodProduct = firewoodProducts.find(p => p.id === record.firewood_product_id);
                          
                          return (
                            <TableRow key={record.id}>
                              <TableCell>
                                {new Date(record.processed_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {woodProduct ? `${woodProduct.species} ${woodProduct.length}` : 'Unknown'}
                                <br />
                                <span className="text-xs text-gray-500">
                                  {record.wholesale_pallets_used} pallets
                                </span>
                              </TableCell>
                              <TableCell>
                                {firewoodProduct ? firewoodProduct.item_name : 'Unknown'}
                                <br />
                                <span className="text-xs text-gray-500">
                                  {record.retail_packages_created} packages
                                </span>
                              </TableCell>
                              <TableCell>
                                {record.actual_conversion_ratio}
                              </TableCell>
                              <TableCell>
                                {record.processed_by}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500">
                    <Clipboard className="h-10 w-10 mb-2" />
                    <p>No processing records found</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                      onClick={() => setShowForm(true)}
                    >
                      Add Processing Record
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
*/

// This component is temporarily commented out
// It contains functionality for tracking processing records
// which may be needed in the future
