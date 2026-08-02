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

  async suspendUser(userId: string): Promise<ApiResponse<null>> {
    try {
      const success = await userRepository.suspendUser(userId);
      if (success) {
        return createSuccessResponse(null, 'User successfully suspended.');
      }
      return createErrorResponse('USER_SUSPEND_ERROR', 'Failed to suspend user.');
    } catch (error: any) {
      return createErrorResponse('USER_SUSPEND_ERROR', error.message);
    }
  }
}

export const userService = new UserService();
