'use client';

import React from 'react';
import { useProfileStore } from '@/store/use-profile-store';
import { hasPermission } from './rbac';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard — chặn UI theo quyền.
 * Trong AURA.FIT (ứng dụng chính), admin panel được nhúng cùng session,
 * nên chúng ta KIỂM TRA role thật từ profile store:
 * - Nếu profile.role là admin/owner → cho phép
 * - Nếu user thường → hiện fallback (Access Denied)
 */
export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { profile } = useProfileStore();

  const role = (profile?.role || 'user').toLowerCase();
  const isAdminRole = role === 'admin' || role === 'owner';

  if (!isAdminRole) {
    return <>{fallback}</>;
  }

  // Admin/owner có toàn quyền (wildcard) — mọi permission đều pass
  const userPermissions = ['*'];
  return <>{hasPermission(userPermissions, permission) ? children : fallback}</>;
}
