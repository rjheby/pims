
-- Function to get all templates
CREATE OR REPLACE FUNCTION public.get_templates()
RETURNS SETOF wholesale_order_templates
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM wholesale_order_templates ORDER BY updated_at DESC;
$$;

-- Function to get a template by id
CREATE OR REPLACE FUNCTION public.get_template_by_id(template_id UUID)
RETURNS wholesale_order_templates
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM wholesale_order_templates WHERE id = template_id LIMIT 1;
$$;

-- Function to save a template
CREATE OR REPLACE FUNCTION public.save_template(
  template_id UUID,
  template_name TEXT,
  template_description TEXT,
  template_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_id UUID;
BEGIN
  INSERT INTO wholesale_order_templates (
    id, 
    name, 
    description, 
    items,
    created_by
  ) VALUES (
    template_id,
    template_name,
    template_description,
    template_items,
    auth.uid()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = template_name,
    description = template_description,
    items = template_items,
    updated_at = now()
  RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$;

-- Function to delete a template
CREATE OR REPLACE FUNCTION public.delete_template(template_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM wholesale_order_templates WHERE id = template_id;
  RETURN FOUND;
END;
$$;
