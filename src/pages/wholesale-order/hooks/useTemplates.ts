
import { useState, useCallback } from "react";
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

export interface UseTemplatesReturn {
  templates: Template[];
  loadTemplate: (id: string) => Promise<Template | null>;
  saveTemplate: (name: string, description: string, items: any[]) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;
}

export const useTemplates = (): UseTemplatesReturn => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const { toast } = useToast();

  const refreshTemplates = useCallback(async () => {
    try {
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
      toast({
        title: "Error",
        description: `Failed to fetch templates: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [toast]);

  const saveTemplate = useCallback(
    async (name: string, description: string, items: any[]) => {
      try {
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
        toast({
          title: "Error",
          description: `Failed to save template: ${error.message}`,
          variant: "destructive",
        });
        throw error;
      }
    },
    [refreshTemplates, toast]
  );

  const loadTemplate = useCallback(
    async (id: string): Promise<Template | null> => {
      try {
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
        toast({
          title: "Error",
          description: `Failed to load template: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      try {
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
        toast({
          title: "Error",
          description: `Failed to delete template: ${error.message}`,
          variant: "destructive",
        });
        throw error;
      }
    },
    [refreshTemplates, toast]
  );

  return {
    templates,
    loadTemplate,
    saveTemplate,
    deleteTemplate,
    refreshTemplates,
  };
};
