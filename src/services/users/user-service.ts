import { userRepository, AdminUserRecord } from '@/repositories/users/user-repository';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/response';

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

  async updateUserRole(userId: string, role: string): Promise<ApiResponse<null>> {
    try {
      const success = await userRepository.updateUserRole(userId, role);
      if (success) {
        return createSuccessResponse(null, `User role successfully updated to ${role}.`);
      }
      return createErrorResponse('USER_ROLE_UPDATE_ERROR', 'Failed to update user role.');
    } catch (error: any) {
      return createErrorResponse('USER_ROLE_UPDATE_ERROR', error.message);
    }
  }
}

export const userService = new UserService();
