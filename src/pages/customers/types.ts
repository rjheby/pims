
export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  type: 'commercial' | 'residential';
  notes: string | null;
  profile_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecurringOrder {
  id: string;
  customer_id: string;
  frequency: string;
  preferred_day: string | null;
  preferred_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerPricing {
  id: string;
  customer_id: string;
  wood_product_id: string | null;
  custom_price: number | null;
  discount_percentage: number | null;
  created_at: string;
  updated_at: string;
}
