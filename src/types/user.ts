
export type UserRole = "superadmin" | "admin" | "manager" | "warehouse" | "driver" | "client" | "customer" | "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "WAREHOUSE" | "DRIVER" | "CLIENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  created_at?: string;
  last_sign_in?: string;
}
