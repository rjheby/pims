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
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          phone: string | null
          profile_id: string | null
          state: string | null
          street_address: string | null
          type: string
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          state?: string | null
          street_address?: string | null
          type: string
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          state?: string | null
          street_address?: string | null
          type?: string
          updated_at?: string | null
          zip_code?: string | null
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
          master_schedule_id: string | null
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
          master_schedule_id?: string | null
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
          master_schedule_id?: string | null
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
          {
            foreignKeyName: "delivery_schedules_master_schedule_id_fkey"
            columns: ["master_schedule_id"]
            isOneToOne: false
            referencedRelation: "dispatch_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_stops: {
        Row: {
          created_at: string | null
          customer_address: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          driver_id: string | null
          driver_name: string | null
          id: string
          is_recurring: boolean | null
          items: string | null
          master_schedule_id: string | null
          next_occurrence_date: string | null
          notes: string | null
          preferred_day: number | null
          price: number | null
          recurrence_end_date: string | null
          recurrence_frequency: string | null
          recurring_order_id: string | null
          scheduling_status: string | null
          sequence: number | null
          status: string | null
          stop_number: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          driver_id?: string | null
          driver_name?: string | null
          id?: string
          is_recurring?: boolean | null
          items?: string | null
          master_schedule_id?: string | null
          next_occurrence_date?: string | null
          notes?: string | null
          preferred_day?: number | null
          price?: number | null
          recurrence_end_date?: string | null
          recurrence_frequency?: string | null
          recurring_order_id?: string | null
          scheduling_status?: string | null
          sequence?: number | null
          status?: string | null
          stop_number?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          driver_id?: string | null
          driver_name?: string | null
          id?: string
          is_recurring?: boolean | null
          items?: string | null
          master_schedule_id?: string | null
          next_occurrence_date?: string | null
          notes?: string | null
          preferred_day?: number | null
          price?: number | null
          recurrence_end_date?: string | null
          recurrence_frequency?: string | null
          recurring_order_id?: string | null
          scheduling_status?: string | null
          sequence?: number | null
          status?: string | null
          stop_number?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_stops_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_stops_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_stops_master_schedule_id_fkey"
            columns: ["master_schedule_id"]
            isOneToOne: false
            referencedRelation: "dispatch_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_schedules: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          schedule_date: string
          schedule_number: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          schedule_date: string
          schedule_number: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          schedule_date?: string
          schedule_number?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      recurring_order_schedules: {
        Row: {
          created_at: string
          id: string
          modified_from_template: boolean
          recurring_order_id: string
          schedule_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          modified_from_template?: boolean
          recurring_order_id: string
          schedule_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          modified_from_template?: boolean
          recurring_order_id?: string
          schedule_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_order_schedules_recurring_order_id_fkey"
            columns: ["recurring_order_id"]
            isOneToOne: false
            referencedRelation: "recurring_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_order_schedules_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "dispatch_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_orders: {
        Row: {
          active_status: boolean | null
          created_at: string | null
          customer_id: string
          frequency: string
          id: string
          items: string | null
          preferred_day: string | null
          preferred_time: string | null
          updated_at: string | null
        }
        Insert: {
          active_status?: boolean | null
          created_at?: string | null
          customer_id: string
          frequency: string
          id?: string
          items?: string | null
          preferred_day?: string | null
          preferred_time?: string | null
          updated_at?: string | null
        }
        Update: {
          active_status?: boolean | null
          created_at?: string | null
          customer_id?: string
          frequency?: string
          id?: string
          items?: string | null
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
      retail_inventory: {
        Row: {
          firewood_product_id: number
          id: string
          last_updated: string
          packages_allocated: number
          packages_available: number
          total_packages: number
        }
        Insert: {
          firewood_product_id: number
          id?: string
          last_updated?: string
          packages_allocated?: number
          packages_available?: number
          total_packages?: number
        }
        Update: {
          firewood_product_id?: number
          id?: string
          last_updated?: string
          packages_allocated?: number
          packages_available?: number
          total_packages?: number
        }
        Relationships: [
          {
            foreignKeyName: "retail_inventory_firewood_product_id_fkey"
            columns: ["firewood_product_id"]
            isOneToOne: false
            referencedRelation: "firewood_products"
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
      add_customer: {
        Args: {
          customer_name: string
          customer_phone?: string
          customer_email?: string
          customer_address?: string
          customer_type?: string
        }
        Returns: string
      }
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
      scheduling_status_enum: "scheduled" | "unscheduled" | "recurring_pending"
      user_role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "DRIVER" | "CLIENT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      scheduling_status_enum: ["scheduled", "unscheduled", "recurring_pending"],
      user_role: ["SUPER_ADMIN", "ADMIN", "MANAGER", "DRIVER", "CLIENT"],
    },
  },
} as const
