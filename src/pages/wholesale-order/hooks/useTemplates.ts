
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { OrderItem, serializeOrderItems } from "../types";

export type OrderTemplate = {
  id: string;
  name: string;
  description: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
};

export function useTemplates() {
  const [templates, setTemplates] = useState<OrderTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wholesale_order_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      // Parse items from each template
      const parsedTemplates = data.map((template: any) => ({
        ...template,
        items: typeof template.items === 'string' 
          ? JSON.parse(template.items) 
          : template.items
      }));

      setTemplates(parsedTemplates);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.message || 'Failed to fetch templates');
      toast({
        title: "Error",
        description: "Failed to load templates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (name: string, description: string | null, items: OrderItem[]) => {
    try {
      // Validate inputs
      if (!name.trim()) {
        throw new Error("Template name is required");
      }
      
      if (!items || items.length === 0) {
        throw new Error("Template must contain at least one item");
      }

      const serializedItems = serializeOrderItems(items);
      
      const { data, error } = await supabase
        .from('wholesale_order_templates')
        .insert([
          { 
            name, 
            description, 
            items: serializedItems
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      await fetchTemplates();

      toast({
        title: "Success",
        description: "Template saved successfully",
      });

      return data;
    } catch (err: any) {
      console.error('Error saving template:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to save template",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<Omit<OrderTemplate, 'id'>>) => {
    try {
      let updateData: Record<string, any> = { ...updates };
      
      // Serialize items if they exist in the updates
      if (updates.items) {
        updateData.items = serializeOrderItems(updates.items);
      }
      
      const { error } = await supabase
        .from('wholesale_order_templates')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchTemplates();

      toast({
        title: "Success",
        description: "Template updated successfully",
      });
    } catch (err: any) {
      console.error('Error updating template:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update template",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wholesale_order_templates')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTemplates(templates.filter(template => template.id !== id));

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (err: any) {
      console.error('Error deleting template:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete template",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    saveTemplate,
    updateTemplate,
    deleteTemplate
  };
}
