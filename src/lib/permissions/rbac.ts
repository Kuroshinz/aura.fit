export type PermissionString = string;

/**
 * Check if user permissions array has a specific permission
 * e.g., hasPermission(['users:manage', 'exercises:view'], 'users:manage')
 */
export function hasPermission(userPermissions: string[] | undefined, permission: string): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  
  // Wildcard admin support or specific match
  if (userPermissions.includes('*') || userPermissions.includes('*:*')) return true;
  
  return userPermissions.includes(permission);
}
