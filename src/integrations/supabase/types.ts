export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customer_pricing: {
        Row: {
          created_at: string | null
          custom_price: number | null
          customer_id: string
          discount_percentage: number | null
          id: string
          updated_at: string | null
          wood_product_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_price?: number | null
          customer_id: string
          discount_percentage?: number | null
          id?: string
          updated_at?: string | null
          wood_product_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_price?: number | null
          customer_id?: string
          discount_percentage?: number | null
          id?: string
          updated_at?: string | null
          wood_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_pricing_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_pricing_wood_product_id_fkey"
            columns: ["wood_product_id"]
            isOneToOne: false
            referencedRelation: "wood_products"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          profile_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_schedules: {
        Row: {
          created_at: string | null
          customer_id: string | null
          delivery_date: string | null
          driver_id: string | null
          id: string
          items: string | null
          notes: string | null
          recurring_day: string | null
          schedule_type: string
          status: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          delivery_date?: string | null
          driver_id?: string | null
          id?: string
          items?: string | null
          notes?: string | null
          recurring_day?: string | null
          schedule_type: string
          status?: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          delivery_date?: string | null
          driver_id?: string | null
          id?: string
          items?: string | null
          notes?: string | null
          recurring_day?: string | null
          schedule_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_schedules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      firewood_products: {
        Row: {
          created_at: string | null
          id: number
          image_reference: string | null
          item_full_name: string
          item_name: string
          length: string
          minimum_quantity: number
          package_size: string
          product_type: string
          species: string
          split_size: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          image_reference?: string | null
          item_full_name: string
          item_name: string
          length: string
          minimum_quantity: number
          package_size: string
          product_type: string
          species: string
          split_size: string
        }
        Update: {
          created_at?: string | null
          id?: number
          image_reference?: string | null
          item_full_name?: string
          item_name?: string
          length?: string
          minimum_quantity?: number
          package_size?: string
          product_type?: string
          species?: string
          split_size?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          id: string
          last_updated: string
          location: string | null
          notes: string | null
          pallets_allocated: number
          pallets_available: number
          total_pallets: number
          wood_product_id: string
        }
        Insert: {
          id?: string
          last_updated?: string
          location?: string | null
          notes?: string | null
          pallets_allocated?: number
          pallets_available?: number
          total_pallets?: number
          wood_product_id: string
        }
        Update: {
          id?: string
          last_updated?: string
          location?: string | null
          notes?: string | null
          pallets_allocated?: number
          pallets_available?: number
          total_pallets?: number
          wood_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_wood_product_id_fkey"
            columns: ["wood_product_id"]
            isOneToOne: false
            referencedRelation: "wood_products"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_records: {
        Row: {
          actual_conversion_ratio: number
          expected_ratio: number | null
          firewood_product_id: number
          id: string
          notes: string | null
          processed_by: string
          processed_date: string
          retail_packages_created: number
          wholesale_pallets_used: number
          wood_product_id: string
        }
        Insert: {
          actual_conversion_ratio: number
          expected_ratio?: number | null
          firewood_product_id: number
          id?: string
          notes?: string | null
          processed_by: string
          processed_date?: string
          retail_packages_created: number
          wholesale_pallets_used: number
          wood_product_id: string
        }
        Update: {
          actual_conversion_ratio?: number
          expected_ratio?: number | null
          firewood_product_id?: number
          id?: string
          notes?: string | null
          processed_by?: string
          processed_date?: string
          retail_packages_created?: number
          wholesale_pallets_used?: number
          wood_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processing_records_firewood_product_id_fkey"
            columns: ["firewood_product_id"]
            isOneToOne: false
            referencedRelation: "firewood_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_records_wood_product_id_fkey"
            columns: ["wood_product_id"]
            isOneToOne: false
            referencedRelation: "wood_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_pricing: {
        Row: {
          created_at: string | null
          id: number
          price_tier_name: string
          product_id: number
          quantity_max: number | null
          quantity_min: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          price_tier_name: string
          product_id: number
          quantity_max?: number | null
          quantity_min: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: number
          price_tier_name?: string
          product_id?: number
          quantity_max?: number | null
          quantity_min?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_pricing_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "firewood_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_orders: {
        Row: {
          created_at: string | null
          customer_id: string
          frequency: string
          id: string
          preferred_day: string | null
          preferred_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          frequency: string
          id?: string
          preferred_day?: string | null
          preferred_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          frequency?: string
          id?: string
          preferred_day?: string | null
          preferred_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      wholesale_order_options: {
        Row: {
          bundleType: string[]
          created_at: string
          id: number
          length: string[]
          packaging: string[]
          species: string[]
          thickness: string[]
        }
        Insert: {
          bundleType?: string[]
          created_at?: string
          id?: number
          length?: string[]
          packaging?: string[]
          species?: string[]
          thickness?: string[]
        }
        Update: {
          bundleType?: string[]
          created_at?: string
          id?: number
          length?: string[]
          packaging?: string[]
          species?: string[]
          thickness?: string[]
        }
        Relationships: []
      }
      wholesale_order_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          items: Json
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          items: Json
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          items?: Json
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      wholesale_orders: {
        Row: {
          admin_editable: boolean | null
          created_at: string | null
          delivery_date: string | null
          id: string
          items: Json
          order_date: string
          order_name: string | null
          order_number: string
          status: string | null
          submitted_at: string | null
          template_id: string | null
        }
        Insert: {
          admin_editable?: boolean | null
          created_at?: string | null
          delivery_date?: string | null
          id?: string
          items: Json
          order_date: string
          order_name?: string | null
          order_number: string
          status?: string | null
          submitted_at?: string | null
          template_id?: string | null
        }
        Update: {
          admin_editable?: boolean | null
          created_at?: string | null
          delivery_date?: string | null
          id?: string
          items?: Json
          order_date?: string
          order_name?: string | null
          order_number?: string
          status?: string | null
          submitted_at?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_orders_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "wholesale_order_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      wood_products: {
        Row: {
          bundle_type: string
          created_at: string | null
          full_description: string
          id: string
          is_popular: boolean | null
          length: string
          popularity_rank: number | null
          species: string
          thickness: string
          unit_cost: number
        }
        Insert: {
          bundle_type: string
          created_at?: string | null
          full_description: string
          id?: string
          is_popular?: boolean | null
          length: string
          popularity_rank?: number | null
          species: string
          thickness: string
          unit_cost?: number
        }
        Update: {
          bundle_type?: string
          created_at?: string | null
          full_description?: string
          id?: string
          is_popular?: boolean | null
          length?: string
          popularity_rank?: number | null
          species?: string
          thickness?: string
          unit_cost?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "DRIVER" | "CLIENT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
