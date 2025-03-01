
import { UserRole } from "./user";

export const Permissions = {
  // Admin-only permissions
  ADMIN_ACCESS: 'ADMIN_ACCESS',
  MODIFY_SETTINGS: 'MODIFY_SETTINGS',
  MANAGE_USERS: 'MANAGE_USERS',
  DELETE_USERS: 'DELETE_USERS',
  ASSIGN_ADMIN: 'ASSIGN_ADMIN',
  
  // General permissions
  VIEW_ALL_PAGES: 'VIEW_ALL_PAGES',
  EDIT_DATA: 'EDIT_DATA',
  
  // Driver permissions
  ACCESS_DISPATCH: 'ACCESS_DISPATCH',
  UPDATE_DELIVERY_STATUS: 'UPDATE_DELIVERY_STATUS',
  UPLOAD_DELIVERY_PHOTOS: 'UPLOAD_DELIVERY_PHOTOS',
  VIEW_PAYMENTS: 'VIEW_PAYMENTS',
  
  // Client permissions
  SUBMIT_ORDERS: 'SUBMIT_ORDERS',
  VIEW_OWN_ORDERS: 'VIEW_OWN_ORDERS',
};

// Define which permissions each role has
export const rolePermissions = {
  [UserRole.SUPER_ADMIN]: [
    ...Object.values(Permissions) // Super admin has all permissions
  ],
  [UserRole.ADMIN]: [
    Permissions.ADMIN_ACCESS,
    Permissions.MANAGE_USERS,
    Permissions.VIEW_ALL_PAGES,
    Permissions.EDIT_DATA,
    Permissions.ACCESS_DISPATCH,
    Permissions.UPDATE_DELIVERY_STATUS,
    Permissions.UPLOAD_DELIVERY_PHOTOS,
    Permissions.VIEW_PAYMENTS,
    Permissions.SUBMIT_ORDERS,
    Permissions.VIEW_OWN_ORDERS,
  ],
  [UserRole.MANAGER]: [
    Permissions.VIEW_ALL_PAGES,
    Permissions.EDIT_DATA,
    Permissions.ACCESS_DISPATCH,
    Permissions.UPDATE_DELIVERY_STATUS,
    Permissions.UPLOAD_DELIVERY_PHOTOS,
    Permissions.VIEW_PAYMENTS,
    Permissions.SUBMIT_ORDERS,
    Permissions.VIEW_OWN_ORDERS,
  ],
  [UserRole.DRIVER]: [
    Permissions.ACCESS_DISPATCH,
    Permissions.UPDATE_DELIVERY_STATUS,
    Permissions.UPLOAD_DELIVERY_PHOTOS,
    Permissions.VIEW_PAYMENTS,
  ],
  [UserRole.CLIENT]: [
    Permissions.SUBMIT_ORDERS,
    Permissions.VIEW_OWN_ORDERS,
  ],
};
