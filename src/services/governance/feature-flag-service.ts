import { ApiResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/response';

export interface FeatureFlag {
  id: string;
  flag_key: string;
  is_enabled: boolean;
  description: string;
}

export class FeatureFlagService {
  private mockFlags: FeatureFlag[] = [
    { id: '1', flag_key: 'beta_dashboard', is_enabled: true, description: 'Enable the new V4 dashboard layout' },
    { id: '2', flag_key: 'ai_coach', is_enabled: false, description: 'Enable AI workout generation' },
    { id: '3', flag_key: 'social_sharing', is_enabled: true, description: 'Allow users to share routines' },
  ];

  async getFlags(): Promise<ApiResponse<FeatureFlag[]>> {
    try {
      return createSuccessResponse(this.mockFlags);
    } catch (error: any) {
      return createErrorResponse('FLAG_FETCH_ERROR', error.message);
    }
  }

  async toggleFlag(id: string, is_enabled: boolean): Promise<ApiResponse<FeatureFlag>> {
    try {
      const flag = this.mockFlags.find(f => f.id === id);
      if (flag) {
        flag.is_enabled = is_enabled;
        return createSuccessResponse(flag, `Flag ${flag.flag_key} ${is_enabled ? 'enabled' : 'disabled'}.`);
      }
      return createErrorResponse('FLAG_NOT_FOUND', 'Flag not found.');
    } catch (error: any) {
      return createErrorResponse('FLAG_UPDATE_ERROR', error.message);
    }
  }
}

export const featureFlagService = new FeatureFlagService();
