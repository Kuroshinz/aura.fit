'use client';

import React from 'react';
import { useProfileStore } from '@/store/use-profile-store';
import { hasPermission, Permission, Role } from './rbac';

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { profile } = useProfileStore();
  const role = (profile?.role as Role) || 'user';

  if (hasPermission(role, permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
