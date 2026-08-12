import { userRepository, AdminUserRecord } from '@/repositories/users/user-repository';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/response';

import { createClient } from '@/lib/supabase/client';

export class UserService {
  async getAllUsers(): Promise<ApiResponse<AdminUserRecord[]>> {
    try {
      const users = await userRepository.getEnterpriseUsers();
      return createSuccessResponse(users, 'Successfully fetched all enterprise users.');
    } catch (error: any) {
      return createErrorResponse('USER_FETCH_ERROR', error.message || 'Failed to fetch users');
    }
  }

  async suspendUser(userId: string, isSuspended: boolean): Promise<ApiResponse<null>> {
    try {
      const success = await userRepository.suspendUser(userId, isSuspended);
      if (success) {
        return createSuccessResponse(null, `User successfully ${isSuspended ? 'suspended' : 'restored'}.`);
      }
      return createErrorResponse('USER_SUSPEND_ERROR', `Failed to ${isSuspended ? 'suspend' : 'restore'} user.`);
    } catch (error: any) {
      return createErrorResponse('USER_SUSPEND_ERROR', error.message);
    }
  }

  async updateUserRole(userId: string, role_id: string): Promise<ApiResponse<null>> {
    try {
      const success = await userRepository.updateUserRole(userId, role_id);
      if (success) {
        return createSuccessResponse(null, `User role successfully updated.`);
      }
      return createErrorResponse('USER_ROLE_UPDATE_ERROR', 'Failed to update user role.');
    } catch (error: any) {
      return createErrorResponse('USER_ROLE_UPDATE_ERROR', error.message);
    }
  }

  async getAllRoles(): Promise<ApiResponse<any[]>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('roles').select('*');
      if (error) return createErrorResponse('FETCH_ROLES_ERROR', error.message);
      return createSuccessResponse(data, 'Fetched roles');
    } catch (error: any) {
      return createErrorResponse('FETCH_ROLES_ERROR', error.message);
    }
  }

  async getPermissionsForRole(roleId: string): Promise<ApiResponse<any[]>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permissions(*)')
        .eq('role_id', roleId);
      if (error) return createErrorResponse('FETCH_PERMISSIONS_ERROR', error.message);
      return createSuccessResponse(data.map((d: any) => d.permissions), 'Fetched permissions');
    } catch (error: any) {
      return createErrorResponse('FETCH_PERMISSIONS_ERROR', error.message);
    }
  }
}

export const userService = new UserService();
