import { ApiResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { exerciseRepository } from '@/repositories/exercises/exercise-repository';
import { jobQueueService } from '@/services/jobs/job-queue-service';

export interface QualityReport {
  totalScanned: number;
  duplicateNames: number;
  missingMuscles: number;
  missingEquipment: number;
  issues: { id: string; name: string; issue: string }[];
}

export class AIQualityService {
  async runQualityScan(): Promise<ApiResponse<string>> {
    try {
      // Trigger a background job for the AI to scan
      const res = await jobQueueService.enqueueJob('ai_scan');
      if (res.success && res.data) {
        return createSuccessResponse(res.data, 'AI Quality Scan started.');
      }
      throw new Error(res.error?.message);
    } catch (error: any) {
      return createErrorResponse('AI_SCAN_ERROR', error.message || 'Failed to start AI scan.');
    }
  }

  async getLatestReport(): Promise<ApiResponse<QualityReport>> {
    try {
      const exercises = await exerciseRepository.getAdminExercises();
      
      const issues: QualityReport['issues'] = [];
      let duplicateNames = 0;
      let missingMuscles = 0;
      let missingEquipment = 0;

      const nameMap = new Map<string, string>();

      exercises.forEach((ex) => {
        // Detect duplicates
        if (nameMap.has(ex.name)) {
          duplicateNames++;
          issues.push({ id: ex.id, name: ex.name, issue: 'Duplicate exercise name' });
        } else {
          nameMap.set(ex.name, ex.id);
        }

        // Detect missing metadata
        if (!ex.muscle_group) {
          missingMuscles++;
          issues.push({ id: ex.id, name: ex.name, issue: 'Missing primary muscle group' });
        }
        if (!ex.equipment) {
          missingEquipment++;
          issues.push({ id: ex.id, name: ex.name, issue: 'Missing equipment' });
        }
      });

      const report: QualityReport = {
        totalScanned: exercises.length,
        duplicateNames,
        missingMuscles,
        missingEquipment,
        issues,
      };

      return createSuccessResponse(report);
    } catch (error: any) {
      return createErrorResponse('AI_REPORT_ERROR', error.message || 'Failed to fetch quality report.');
    }
  }
}

export const aiQualityService = new AIQualityService();
