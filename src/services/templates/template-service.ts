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

  async duplicateTemplate(id: string): Promise<ApiResponse<RoutineRecord>> {
    try {
      const template = await templateRepository.findById(id);
      if (!template) {
        return createErrorResponse('TEMPLATE_NOT_FOUND', 'Template not found for duplication.');
      }

      // Create a duplicate with a new name and new ID
      const { id: oldId, created_at, updated_at, ...rest } = template;
      const payload: Partial<RoutineRecord> = {
        ...rest,
        name: `${template.name} (Copy)`
      };

      const newTemplate = await templateRepository.create(payload);
      if (newTemplate) {
        return createSuccessResponse(newTemplate, 'Template duplicated successfully.');
      }
      return createErrorResponse('TEMPLATE_DUPLICATE_ERROR', 'Failed to create duplicate.');
    } catch (error: any) {
      return createErrorResponse('TEMPLATE_DUPLICATE_ERROR', error.message);
    }
  }
}

export const templateService = new TemplateService();
