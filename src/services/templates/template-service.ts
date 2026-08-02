import { templateRepository, RoutineRecord } from '@/repositories/templates/template-repository';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/response';

export class TemplateService {
  async getAllTemplates(): Promise<ApiResponse<RoutineRecord[]>> {
    try {
      const templates = await templateRepository.getAdminTemplates();
      return createSuccessResponse(templates, 'Successfully fetched templates.');
    } catch (error: any) {
      return createErrorResponse('TEMPLATE_FETCH_ERROR', error.message || 'Failed to fetch templates');
    }
  }

  async deleteTemplate(id: string): Promise<ApiResponse<null>> {
    try {
      const success = await templateRepository.delete(id);
      if (success) {
        return createSuccessResponse(null, 'Template successfully deleted.');
      }
      return createErrorResponse('TEMPLATE_DELETE_ERROR', 'Failed to delete template.');
    } catch (error: any) {
      return createErrorResponse('TEMPLATE_DELETE_ERROR', error.message);
    }
  }
}

export const templateService = new TemplateService();
