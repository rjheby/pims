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
      base_products: {
        Row: {
          created_at: string | null
          id: string
          is_bundled: boolean | null
          length: number
          name: string
          species_id: string
          thickness: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_bundled?: boolean | null
          length: number
          name: string
          species_id: string
          thickness: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_bundled?: boolean | null
          length?: number
          name?: string
          species_id?: string
          thickness?: string
        }
        Relationships: [
          {
            foreignKeyName: "base_products_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "wood_species"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_packages: {
        Row: {
          created_at: string | null
          cubic_feet: number | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          cubic_feet?: number | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          cubic_feet?: number | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      customer_pricing: {
        Row: {
          created_at: string | null
          custom_price: number
          customer_id: string
          effective_date: string | null
          end_date: string | null
          id: string
          notes: string | null
          retail_product_id: string
        }
        Insert: {
          created_at?: string | null
          custom_price: number
          customer_id: string
          effective_date?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          retail_product_id: string
        }
        Update: {
          created_at?: string | null
          custom_price?: number
          customer_id?: string
          effective_date?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          retail_product_id?: string
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
            foreignKeyName: "customer_pricing_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "product_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_pricing_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "product_display_names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_pricing_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "retail_products"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          arrival_window: string | null
          city: string | null
          created_at: string | null
          customer_type: string | null
          delivery_notes: string | null
          delivery_zone: string | null
          email: string | null
          has_stairs: boolean | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          state: string | null
          street_address: string
          unit_number: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          arrival_window?: string | null
          city?: string | null
          created_at?: string | null
          customer_type?: string | null
          delivery_notes?: string | null
          delivery_zone?: string | null
          email?: string | null
          has_stairs?: boolean | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          state?: string | null
          street_address: string
          unit_number?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          arrival_window?: string | null
          city?: string | null
          created_at?: string | null
          customer_type?: string | null
          delivery_notes?: string | null
          delivery_zone?: string | null
          email?: string | null
          has_stairs?: boolean | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          state?: string | null
          street_address?: string
          unit_number?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      daily_financials: {
        Row: {
          business_date: string
          commercial_revenue: number | null
          created_at: string | null
          delivery_commission: number | null
          gross_profit: number | null
          id: string
          inventory_cost: number | null
          labor_cost: number | null
          loading_labor_cost: number | null
          margin_percentage: number | null
          net_profit: number | null
          residential_revenue: number | null
          total_deliveries: number | null
          total_revenue: number | null
          units_sold: Json | null
          updated_at: string | null
        }
        Insert: {
          business_date: string
          commercial_revenue?: number | null
          created_at?: string | null
          delivery_commission?: number | null
          gross_profit?: number | null
          id?: string
          inventory_cost?: number | null
          labor_cost?: number | null
          loading_labor_cost?: number | null
          margin_percentage?: number | null
          net_profit?: number | null
          residential_revenue?: number | null
          total_deliveries?: number | null
          total_revenue?: number | null
          units_sold?: Json | null
          updated_at?: string | null
        }
        Update: {
          business_date?: string
          commercial_revenue?: number | null
          created_at?: string | null
          delivery_commission?: number | null
          gross_profit?: number | null
          id?: string
          inventory_cost?: number | null
          labor_cost?: number | null
          loading_labor_cost?: number | null
          margin_percentage?: number | null
          net_profit?: number | null
          residential_revenue?: number | null
          total_deliveries?: number | null
          total_revenue?: number | null
          units_sold?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      delivery_stops: {
        Row: {
          actual_arrival: string | null
          created_at: string | null
          customer_notified: boolean | null
          delivered_at: string | null
          delivery_notes: string | null
          delivery_photo_url: string | null
          delivery_status: string
          estimated_arrival: string | null
          id: string
          notification_sent_at: string | null
          order_id: string
          route_assignment_id: string
          stop_sequence: number
          updated_at: string | null
        }
        Insert: {
          actual_arrival?: string | null
          created_at?: string | null
          customer_notified?: boolean | null
          delivered_at?: string | null
          delivery_notes?: string | null
          delivery_photo_url?: string | null
          delivery_status?: string
          estimated_arrival?: string | null
          id?: string
          notification_sent_at?: string | null
          order_id: string
          route_assignment_id: string
          stop_sequence: number
          updated_at?: string | null
        }
        Update: {
          actual_arrival?: string | null
          created_at?: string | null
          customer_notified?: boolean | null
          delivered_at?: string | null
          delivery_notes?: string | null
          delivery_photo_url?: string | null
          delivery_status?: string
          estimated_arrival?: string | null
          id?: string
          notification_sent_at?: string | null
          order_id?: string
          route_assignment_id?: string
          stop_sequence?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_stops_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_stops_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "unscheduled_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_stops_route_assignment_id_fkey"
            columns: ["route_assignment_id"]
            isOneToOne: false
            referencedRelation: "route_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_stops_route_assignment_id_fkey"
            columns: ["route_assignment_id"]
            isOneToOne: false
            referencedRelation: "todays_schedule"
            referencedColumns: ["route_id"]
          },
        ]
      }
      dispatch_schedules: {
        Row: {
          created_at: string | null
          finalized_at: string | null
          finalized_by: string | null
          id: string
          schedule_date: string
          status: string
          total_cogs: number | null
          total_commission: number | null
          total_revenue: number | null
          total_stops: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          schedule_date: string
          status?: string
          total_cogs?: number | null
          total_commission?: number | null
          total_revenue?: number | null
          total_stops?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          schedule_date?: string
          status?: string
          total_cogs?: number | null
          total_commission?: number | null
          total_revenue?: number | null
          total_stops?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_schedules_finalized_by_fkey"
            columns: ["finalized_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_payments: {
        Row: {
          commission_amount: number
          commission_rate: number
          created_at: string | null
          driver_id: string
          id: string
          minimum_guarantee: number | null
          notes: string | null
          paid_date: string | null
          payment_amount: number | null
          payment_method: string | null
          payment_status: string
          route_assignment_id: string
          route_revenue: number
          updated_at: string | null
        }
        Insert: {
          commission_amount: number
          commission_rate: number
          created_at?: string | null
          driver_id: string
          id?: string
          minimum_guarantee?: number | null
          notes?: string | null
          paid_date?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_status?: string
          route_assignment_id: string
          route_revenue: number
          updated_at?: string | null
        }
        Update: {
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          driver_id?: string
          id?: string
          minimum_guarantee?: number | null
          notes?: string | null
          paid_date?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_status?: string
          route_assignment_id?: string
          route_revenue?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_payments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_payments_route_assignment_id_fkey"
            columns: ["route_assignment_id"]
            isOneToOne: false
            referencedRelation: "route_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_payments_route_assignment_id_fkey"
            columns: ["route_assignment_id"]
            isOneToOne: false
            referencedRelation: "todays_schedule"
            referencedColumns: ["route_id"]
          },
        ]
      }
      drivers: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          employment_type: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          employment_type: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          employment_type?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      extra_products: {
        Row: {
          capacity_units: number | null
          category: string
          cost: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          capacity_units?: number | null
          category: string
          cost?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
        }
        Update: {
          capacity_units?: number | null
          category?: string
          cost?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      inventory_batches: {
        Row: {
          created_at: string | null
          id: string
          last_count_date: string | null
          reorder_point: number | null
          reorder_quantity: number | null
          retail_product_id: string
          units_allocated: number
          units_available: number | null
          units_on_hand: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_count_date?: string | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          retail_product_id: string
          units_allocated?: number
          units_available?: number | null
          units_on_hand?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_count_date?: string | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          retail_product_id?: string
          units_allocated?: number
          units_available?: number | null
          units_on_hand?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_batches_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "product_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "product_display_names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "retail_products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_extras: {
        Row: {
          extra_product_id: string
          id: string
          line_total: number | null
          order_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          extra_product_id: string
          id?: string
          line_total?: number | null
          order_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          extra_product_id?: string
          id?: string
          line_total?: number | null
          order_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_extras_extra_product_id_fkey"
            columns: ["extra_product_id"]
            isOneToOne: false
            referencedRelation: "extra_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_extras_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_extras_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "unscheduled_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          external_sku: string | null
          id: string
          is_package_item: boolean | null
          line_total: number | null
          order_id: string
          package_id: string | null
          product_name: string
          quantity: number
          retail_product_id: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          external_sku?: string | null
          id?: string
          is_package_item?: boolean | null
          line_total?: number | null
          order_id: string
          package_id?: string | null
          product_name: string
          quantity: number
          retail_product_id?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          external_sku?: string | null
          id?: string
          is_package_item?: boolean | null
          line_total?: number | null
          order_id?: string
          package_id?: string | null
          product_name?: string
          quantity?: number
          retail_product_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "unscheduled_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "customer_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "product_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "product_display_names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "retail_products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_id: string
          external_order_id: string | null
          id: string
          is_commercial: boolean
          needs_scheduling: boolean | null
          order_date: string
          order_number: string
          requested_delivery_date: string | null
          source: string | null
          special_instructions: string | null
          status: string
          subtotal: number
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          external_order_id?: string | null
          id?: string
          is_commercial?: boolean
          needs_scheduling?: boolean | null
          order_date?: string
          order_number?: string
          requested_delivery_date?: string | null
          source?: string | null
          special_instructions?: string | null
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          external_order_id?: string | null
          id?: string
          is_commercial?: boolean
          needs_scheduling?: boolean | null
          order_date?: string
          order_number?: string
          requested_delivery_date?: string | null
          source?: string | null
          special_instructions?: string | null
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      package_components: {
        Row: {
          id: string
          package_id: string
          quantity: number
          retail_product_id: string
        }
        Insert: {
          id?: string
          package_id: string
          quantity: number
          retail_product_id: string
        }
        Update: {
          id?: string
          package_id?: string
          quantity?: number
          retail_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_components_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "customer_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_components_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "product_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_components_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "product_display_names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_components_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "retail_products"
            referencedColumns: ["id"]
          },
        ]
      }
      packaging_types: {
        Row: {
          capacity_units: number | null
          category: string
          created_at: string | null
          cubic_feet: number | null
          dimensions: string | null
          id: string
          is_active: boolean | null
          material_cost: number | null
          name: string
          processing_cost: number | null
          processing_cost_thin: number | null
          short_name: string
          sort_order: number | null
        }
        Insert: {
          capacity_units?: number | null
          category: string
          created_at?: string | null
          cubic_feet?: number | null
          dimensions?: string | null
          id?: string
          is_active?: boolean | null
          material_cost?: number | null
          name: string
          processing_cost?: number | null
          processing_cost_thin?: number | null
          short_name: string
          sort_order?: number | null
        }
        Update: {
          capacity_units?: number | null
          category?: string
          created_at?: string | null
          cubic_feet?: number | null
          dimensions?: string | null
          id?: string
          is_active?: boolean | null
          material_cost?: number | null
          name?: string
          processing_cost?: number | null
          processing_cost_thin?: number | null
          short_name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      processing_records: {
        Row: {
          actual_yield: number
          base_product_id: string
          cords_processed: number
          created_at: string | null
          expected_yield: number
          id: string
          labor_cost: number | null
          labor_hours: number | null
          notes: string | null
          process_date: string
          processed_by: string | null
          retail_product_id: string
          units_produced: number
          wholesale_purchase_id: string | null
          yield_variance: number | null
        }
        Insert: {
          actual_yield: number
          base_product_id: string
          cords_processed: number
          created_at?: string | null
          expected_yield: number
          id?: string
          labor_cost?: number | null
          labor_hours?: number | null
          notes?: string | null
          process_date: string
          processed_by?: string | null
          retail_product_id: string
          units_produced: number
          wholesale_purchase_id?: string | null
          yield_variance?: number | null
        }
        Update: {
          actual_yield?: number
          base_product_id?: string
          cords_processed?: number
          created_at?: string | null
          expected_yield?: number
          id?: string
          labor_cost?: number | null
          labor_hours?: number | null
          notes?: string | null
          process_date?: string
          processed_by?: string | null
          retail_product_id?: string
          units_produced?: number
          wholesale_purchase_id?: string | null
          yield_variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_records_base_product_id_fkey"
            columns: ["base_product_id"]
            isOneToOne: false
            referencedRelation: "base_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_records_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_records_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "product_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_records_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "product_display_names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_records_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "retail_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_records_wholesale_purchase_id_fkey"
            columns: ["wholesale_purchase_id"]
            isOneToOne: false
            referencedRelation: "wholesale_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_order_items: {
        Row: {
          custom_price: number | null
          id: string
          quantity: number
          recurring_order_id: string
          retail_product_id: string
        }
        Insert: {
          custom_price?: number | null
          id?: string
          quantity: number
          recurring_order_id: string
          retail_product_id: string
        }
        Update: {
          custom_price?: number | null
          id?: string
          quantity?: number
          recurring_order_id?: string
          retail_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_order_items_recurring_order_id_fkey"
            columns: ["recurring_order_id"]
            isOneToOne: false
            referencedRelation: "recurring_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_order_items_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "product_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_order_items_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "product_display_names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_order_items_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "retail_products"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_orders: {
        Row: {
          created_at: string | null
          customer_id: string
          day_of_week: number | null
          frequency: string
          id: string
          is_active: boolean | null
          is_paused: boolean | null
          last_generated_date: string | null
          next_generation_date: string | null
          notes: string | null
          pause_end_date: string | null
          pause_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          day_of_week?: number | null
          frequency: string
          id?: string
          is_active?: boolean | null
          is_paused?: boolean | null
          last_generated_date?: string | null
          next_generation_date?: string | null
          notes?: string | null
          pause_end_date?: string | null
          pause_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          day_of_week?: number | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          is_paused?: boolean | null
          last_generated_date?: string | null
          next_generation_date?: string | null
          notes?: string | null
          pause_end_date?: string | null
          pause_start_date?: string | null
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
      retail_products: {
        Row: {
          base_product_id: string
          capacity_units: number | null
          commercial_price: number | null
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          material_cost_per_unit: number | null
          name: string
          packaging_type_id: string
          residential_price: number
          total_cogs: number | null
          updated_at: string | null
        }
        Insert: {
          base_product_id: string
          capacity_units?: number | null
          commercial_price?: number | null
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          material_cost_per_unit?: number | null
          name: string
          packaging_type_id: string
          residential_price: number
          total_cogs?: number | null
          updated_at?: string | null
        }
        Update: {
          base_product_id?: string
          capacity_units?: number | null
          commercial_price?: number | null
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          material_cost_per_unit?: number | null
          name?: string
          packaging_type_id?: string
          residential_price?: number
          total_cogs?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retail_products_base_product_id_fkey"
            columns: ["base_product_id"]
            isOneToOne: false
            referencedRelation: "base_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_products_packaging_type_id_fkey"
            columns: ["packaging_type_id"]
            isOneToOne: false
            referencedRelation: "packaging_types"
            referencedColumns: ["id"]
          },
        ]
      }
      route_assignments: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          capacity_percentage: number | null
          commission_amount: number | null
          created_at: string | null
          dispatch_schedule_id: string
          driver_id: string
          estimated_end_time: string | null
          has_stairs: boolean | null
          id: string
          is_overloaded: boolean | null
          route_revenue: number | null
          start_time: string | null
          total_capacity_units: number | null
          vehicle_id: string
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          capacity_percentage?: number | null
          commission_amount?: number | null
          created_at?: string | null
          dispatch_schedule_id: string
          driver_id: string
          estimated_end_time?: string | null
          has_stairs?: boolean | null
          id?: string
          is_overloaded?: boolean | null
          route_revenue?: number | null
          start_time?: string | null
          total_capacity_units?: number | null
          vehicle_id: string
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          capacity_percentage?: number | null
          commission_amount?: number | null
          created_at?: string | null
          dispatch_schedule_id?: string
          driver_id?: string
          estimated_end_time?: string | null
          has_stairs?: boolean | null
          id?: string
          is_overloaded?: boolean | null
          route_revenue?: number | null
          start_time?: string | null
          total_capacity_units?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_assignments_dispatch_schedule_id_fkey"
            columns: ["dispatch_schedule_id"]
            isOneToOne: false
            referencedRelation: "dispatch_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          capacity_factor: number
          created_at: string | null
          id: string
          is_active: boolean | null
          license_plate: string | null
          name: string
          vehicle_type: string
        }
        Insert: {
          capacity_factor: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          license_plate?: string | null
          name: string
          vehicle_type: string
        }
        Update: {
          capacity_factor?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          license_plate?: string | null
          name?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      wholesale_purchases: {
        Row: {
          base_product_id: string
          cords_per_pallet: number | null
          created_at: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          pallet_quantity: number | null
          purchase_date: string
          quantity: number
          quantity_processed: number | null
          quantity_remaining: number | null
          supplier_name: string
          total_cost: number
          unit_cost: number
          unit_cost_per_pallet: number | null
          updated_at: string | null
        }
        Insert: {
          base_product_id: string
          cords_per_pallet?: number | null
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          pallet_quantity?: number | null
          purchase_date: string
          quantity: number
          quantity_processed?: number | null
          quantity_remaining?: number | null
          supplier_name: string
          total_cost: number
          unit_cost: number
          unit_cost_per_pallet?: number | null
          updated_at?: string | null
        }
        Update: {
          base_product_id?: string
          cords_per_pallet?: number | null
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          pallet_quantity?: number | null
          purchase_date?: string
          quantity?: number
          quantity_processed?: number | null
          quantity_remaining?: number | null
          supplier_name?: string
          total_cost?: number
          unit_cost?: number
          unit_cost_per_pallet?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_purchases_base_product_id_fkey"
            columns: ["base_product_id"]
            isOneToOne: false
            referencedRelation: "base_products"
            referencedColumns: ["id"]
          },
        ]
      }
      wood_species: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      inventory_status: {
        Row: {
          commercial_price: number | null
          display_name: string | null
          packaging: string | null
          product_name: string | null
          reorder_point: number | null
          residential_price: number | null
          stock_status: string | null
          total_cogs: number | null
          units_allocated: number | null
          units_available: number | null
          units_on_hand: number | null
        }
        Relationships: []
      }
      product_costs: {
        Row: {
          capacity_units: number | null
          commercial_price: number | null
          cubic_feet: number | null
          display_name: string | null
          id: string | null
          labor_cost: number | null
          packaging_cost: number | null
          residential_margin_pct: number | null
          residential_price: number | null
          residential_profit: number | null
          total_cogs: number | null
          wood_cost: number | null
        }
        Relationships: []
      }
      product_display_names: {
        Row: {
          commercial_price: number | null
          display_name: string | null
          id: string | null
          internal_name: string | null
          residential_price: number | null
        }
        Relationships: []
      }
      todays_schedule: {
        Row: {
          capacity_percentage: number | null
          commission_amount: number | null
          driver_name: string | null
          is_overloaded: boolean | null
          route_id: string | null
          route_revenue: number | null
          schedule_date: string | null
          schedule_status: string | null
          stop_count: number | null
          vehicle_name: string | null
        }
        Relationships: []
      }
      unscheduled_orders: {
        Row: {
          customer_name: string | null
          customer_type: string | null
          id: string | null
          items_summary: string | null
          order_date: string | null
          order_number: string | null
          source: string | null
          street_address: string | null
          total_amount: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_product_variants: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_recurring_orders: {
        Args: { p_date?: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
