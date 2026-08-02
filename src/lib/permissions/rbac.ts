export type Role = 'owner' | 'admin' | 'moderator' | 'editor' | 'viewer' | 'user';

export type Permission =
  | 'manage:users'
  | 'manage:roles'
  | 'manage:settings'
  | 'view:analytics'
  | 'manage:exercises'
  | 'manage:templates'
  | 'manage:media'
  | 'manage:feedback'
  | 'manage:announcements'
  | 'manage:feature_flags'
  | 'view:audit_logs'
  | 'manage:backups';

const PERMISSION_MATRIX: Record<Role, Permission[]> = {
  owner: [
    'manage:users', 'manage:roles', 'manage:settings', 'view:analytics',
    'manage:exercises', 'manage:templates', 'manage:media', 'manage:feedback',
    'manage:announcements', 'manage:feature_flags', 'view:audit_logs', 'manage:backups'
  ],
  admin: [
    'manage:users', 'view:analytics', 'manage:exercises', 'manage:templates',
    'manage:media', 'manage:feedback', 'manage:announcements', 'manage:feature_flags',
    'view:audit_logs'
  ],
  moderator: [
    'manage:feedback', 'manage:announcements', 'view:analytics'
  ],
  editor: [
    'manage:exercises', 'manage:templates', 'manage:media'
  ],
  viewer: [
    'view:analytics'
  ],
  user: []
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  const permissions = PERMISSION_MATRIX[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: Role | undefined): Permission[] {
  if (!role) return [];
  return PERMISSION_MATRIX[role] || [];
}
