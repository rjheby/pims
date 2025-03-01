
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export interface Template {
  id: string;
  name: string;
  description: string;
  items: any[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// Add OrderTemplate type that other components are expecting
export type OrderTemplate = Template;

export interface UseTemplatesReturn {
  templates: Template[];
  loadTemplate: (id: string) => Promise<Template | null>;
  saveTemplate: (name: string, description: string, items: any[]) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;
  // Add missing properties
  isLoading: boolean;
  error: string | null;
  updateTemplate?: (id: string, data: Partial<Template>) => Promise<void>;
  fetchTemplates?: () => Promise<void>;
}

export const useTemplates = (): UseTemplatesReturn => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("wholesale_order_templates")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        setTemplates(data as Template[]);
      }
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      setError(`Failed to fetch templates: ${error.message}`);
      toast({
        title: "Error",
        description: `Failed to fetch templates: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Alias for refreshTemplates to maintain compatibility
  const fetchTemplates = refreshTemplates;

  const saveTemplate = useCallback(
    async (name: string, description: string, items: any[]) => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        const templateData = {
          name,
          description,
          items: JSON.stringify(items),
          created_by: userId,
        };

        const { error } = await supabase
          .from("wholesale_order_templates")
          .insert(templateData);

        if (error) {
          throw error;
        }

        await refreshTemplates();

        toast({
          title: "Success",
          description: "Template saved successfully",
        });
      } catch (error: any) {
        console.error("Error saving template:", error);
        setError(`Failed to save template: ${error.message}`);
        toast({
          title: "Error",
          description: `Failed to save template: ${error.message}`,
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshTemplates, toast]
  );

  const updateTemplate = useCallback(
    async (id: string, data: Partial<Template>) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Process items if they exist
        const updateData = { ...data };
        if (updateData.items) {
          // Fix: The items array needs to be properly stringified
          updateData.items = JSON.stringify(updateData.items);
        }

        const { error } = await supabase
          .from("wholesale_order_templates")
          .update(updateData)
          .eq("id", id);

        if (error) {
          throw error;
        }

        await refreshTemplates();

        toast({
          title: "Success",
          description: "Template updated successfully",
        });
      } catch (error: any) {
        console.error("Error updating template:", error);
        setError(`Failed to update template: ${error.message}`);
        toast({
          title: "Error",
          description: `Failed to update template: ${error.message}`,
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshTemplates, toast]
  );

  const loadTemplate = useCallback(
    async (id: string): Promise<Template | null> => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("wholesale_order_templates")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // Parse items from JSON string to object
          const template = {
            ...data,
            items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
          };
          return template as Template;
        }

        return null;
      } catch (error: any) {
        console.error("Error loading template:", error);
        setError(`Failed to load template: ${error.message}`);
        toast({
          title: "Error",
          description: `Failed to load template: ${error.message}`,
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { error } = await supabase
          .from("wholesale_order_templates")
          .delete()
          .eq("id", id);

        if (error) {
          throw error;
        }

        await refreshTemplates();

        toast({
          title: "Success",
          description: "Template deleted successfully",
        });
      } catch (error: any) {
        console.error("Error deleting template:", error);
        setError(`Failed to delete template: ${error.message}`);
        toast({
          title: "Error",
          description: `Failed to delete template: ${error.message}`,
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshTemplates, toast]
  );

  // Load templates on mount
  useEffect(() => {
    refreshTemplates();
  }, [refreshTemplates]);

  return {
    templates,
    loadTemplate,
    saveTemplate,
    deleteTemplate,
    refreshTemplates,
    isLoading,
    error,
    updateTemplate,
    fetchTemplates
  };
};
