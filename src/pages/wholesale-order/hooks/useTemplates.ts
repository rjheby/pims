
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export interface Template {
  id: string;
  name: string;
  description: string;
  items: Record<string, any>[];
  created_at?: string;
  updated_at?: string;
}

export interface UseTemplatesReturn {
  templates: Template[];
  isLoading: boolean;
  error: string | null;
  saveTemplate: (name: string, description: string, items: Record<string, any>[]) => Promise<string>;
  loadTemplate: (templateId: string) => Promise<Template | null>;
  deleteTemplate: (templateId: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all templates
  const refreshTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use RPC instead of direct query to work around TypeScript limitations
      const { data, error } = await supabase.rpc('get_templates', {});

      if (error) {
        throw new Error(error.message);
      }

      setTemplates(data || []);
    } catch (err: any) {
      console.error("Error fetching templates:", err);
      setError(err.message);
      toast({
        title: "Error fetching templates",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Save template
  const saveTemplate = useCallback(
    async (
      name: string,
      description: string,
      items: Record<string, any>[]
    ): Promise<string> => {
      try {
        setError(null);
        
        // Generate a new UUID for the template
        const templateId = uuidv4();
        
        // Use RPC instead of direct query to work around TypeScript limitations
        const { error } = await supabase.rpc('save_template', {
          template_id: templateId,
          template_name: name,
          template_description: description,
          template_items: items
        });

        if (error) {
          throw new Error(error.message);
        }

        toast({
          title: "Template saved",
          description: `"${name}" has been saved successfully.`,
        });

        await refreshTemplates();
        return templateId;
      } catch (err: any) {
        console.error("Error saving template:", err);
        setError(err.message);
        toast({
          title: "Error saving template",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      }
    },
    [refreshTemplates, toast]
  );

  // Load a specific template
  const loadTemplate = useCallback(
    async (templateId: string): Promise<Template | null> => {
      try {
        setError(null);

        // Use RPC instead of direct query to work around TypeScript limitations
        const { data, error } = await supabase.rpc('get_template_by_id', {
          template_id: templateId
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          return data as Template;
        }
        
        return null;
      } catch (err: any) {
        console.error("Error loading template:", err);
        setError(err.message);
        toast({
          title: "Error loading template",
          description: err.message,
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  // Delete a template
  const deleteTemplate = useCallback(
    async (templateId: string): Promise<void> => {
      try {
        setError(null);

        // Use RPC instead of direct query to work around TypeScript limitations
        const { error } = await supabase.rpc('delete_template', {
          template_id: templateId
        });

        if (error) {
          throw new Error(error.message);
        }

        toast({
          title: "Template deleted",
          description: "Template has been deleted successfully.",
        });

        await refreshTemplates();
      } catch (err: any) {
        console.error("Error deleting template:", err);
        setError(err.message);
        toast({
          title: "Error deleting template",
          description: err.message,
          variant: "destructive",
        });
      }
    },
    [refreshTemplates, toast]
  );

  return {
    templates,
    isLoading,
    error,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    refreshTemplates,
  };
}
