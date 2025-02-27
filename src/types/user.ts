
export type UserRole = "admin" | "staff" | "client" | "customer" | "user";

export type Permission = "read" | "write" | "delete" | "superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions?: Permission[]; // Add permissions as an optional property
}
