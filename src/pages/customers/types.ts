
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  type: string | "commercial" | "residential"; // Updated to accept any string
  created_at?: string;
  updated_at?: string;
  profile_id?: string;
  latitude?: number;
  longitude?: number;
}
