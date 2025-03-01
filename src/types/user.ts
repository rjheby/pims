
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DRIVER = 'DRIVER',
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Previously existing roles for backward compatibility
export type LegacyUserRole = "superadmin" | "admin" | "staff" | "client" | "customer";

// Map legacy roles to new roles for migration
export const mapLegacyRole = (legacyRole: LegacyUserRole): UserRole => {
  switch (legacyRole) {
    case "superadmin": return UserRole.SUPER_ADMIN;
    case "admin": return UserRole.ADMIN;
    case "staff": return UserRole.MANAGER;
    case "client": return UserRole.CLIENT;
    case "customer": return UserRole.CLIENT;
    default: return UserRole.CLIENT;
  }
};
