import { ApiResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/response';

export interface DashboardStats {
  totalUsers: number;
  activeUsersToday: number;
  workoutsToday: number;
  totalExercises: number;
  workoutTemplates: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export class AnalyticsDashboardService {
  async getOverviewStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      // Mock data provider until sufficient historical data exists
      const mockStats: DashboardStats = {
        totalUsers: 12450,
        activeUsersToday: 842,
        workoutsToday: 1105,
        totalExercises: 215,
        workoutTemplates: 42,
      };
      return createSuccessResponse(mockStats);
    } catch (error: any) {
      return createErrorResponse('ANALYTICS_STATS_ERROR', error.message);
    }
  }

  async getDailyActiveUsers(days: number = 7): Promise<ApiResponse<ChartDataPoint[]>> {
    try {
      // Mock data provider
      const data: ChartDataPoint[] = [];
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        data.push({
          date: d.toLocaleDateString('en-US', { weekday: 'short' }),
          value: Math.floor(Math.random() * 500) + 500,
        });
      }
      return createSuccessResponse(data);
    } catch (error: any) {
      return createErrorResponse('ANALYTICS_DAU_ERROR', error.message);
    }
  }
}

export const analyticsDashboardService = new AnalyticsDashboardService();
