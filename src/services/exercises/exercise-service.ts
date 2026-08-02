import { exerciseRepository, ExerciseRecord } from '@/repositories/exercises/exercise-repository';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/response';

export class ExerciseService {
  async getAllExercises(): Promise<ApiResponse<ExerciseRecord[]>> {
    try {
      const exercises = await exerciseRepository.getAdminExercises();
      return createSuccessResponse(exercises, 'Successfully fetched all exercises.');
    } catch (error: any) {
      return createErrorResponse('EXERCISE_FETCH_ERROR', error.message || 'Failed to fetch exercises');
    }
  }

  async deleteExercise(id: string): Promise<ApiResponse<null>> {
    try {
      const success = await exerciseRepository.delete(id);
      if (success) {
        return createSuccessResponse(null, 'Exercise successfully deleted.');
      }
      return createErrorResponse('EXERCISE_DELETE_ERROR', 'Failed to delete exercise.');
    } catch (error: any) {
      return createErrorResponse('EXERCISE_DELETE_ERROR', error.message);
    }
  }
}

export const exerciseService = new ExerciseService();
