
export type UserRole = "superadmin" | "admin" | "manager" | "warehouse" | "driver" | "client" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  created_at?: string;
  last_sign_in?: string;
}
