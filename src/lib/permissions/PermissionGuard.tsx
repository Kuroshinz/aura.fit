'use client';

import React from 'react';
import { useProfileStore } from '@/store/use-profile-store';
import { hasPermission } from './rbac';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { profile } = useProfileStore();
  const permissions = (profile as any)?.permissions || [];

  if (hasPermission(permissions, permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
