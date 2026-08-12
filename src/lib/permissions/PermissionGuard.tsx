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
  const legacyRole = profile?.role; // Fallback for sessions before RBAC migration

  // Allow if dynamic permissions match OR if they are a legacy admin
  if (hasPermission(permissions, permission) || legacyRole === 'admin' || legacyRole === 'owner') {
    return <>{children}</>;
  }

  return <div className="p-8 text-center text-slate-400">
    <h2 className="text-2xl font-bold text-white mb-2">Unauthorized</h2>
    <p>You do not have the required `{permission}` permission to view this content.</p>
  </div>;
}
