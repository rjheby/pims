
export type UserRole = "superadmin" | "admin" | "staff" | "client" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
