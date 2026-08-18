import { createClient } from '@/lib/supabase/client';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/response';

export interface StorageFile {
  id: string | null;
  name: string;
  url: string;
  size: number;
  created_at: string | null;
  type: 'image' | 'video' | 'gif' | 'unknown';
}

export abstract class StorageAdapter {
  abstract listFiles(bucket: string, path?: string): Promise<ApiResponse<StorageFile[]>>;
  abstract uploadFile(bucket: string, path: string, file: File): Promise<ApiResponse<string>>;
  abstract deleteFile(bucket: string, path: string): Promise<ApiResponse<null>>;
}

export class SupabaseStorageAdapter extends StorageAdapter {
  private supabase = createClient();

  async listFiles(bucket: string, path: string = ''): Promise<ApiResponse<StorageFile[]>> {
    try {
      const { data, error } = await this.supabase.storage.from(bucket).list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) throw error;

      const files: StorageFile[] = await Promise.all(data.map(async (file) => {
        const { data: publicUrlData } = this.supabase.storage.from(bucket).getPublicUrl(`${path ? path + '/' : ''}${file.name}`);
        
        let type: StorageFile['type'] = 'unknown';
        if (file.metadata?.mimetype?.includes('image/gif')) type = 'gif';
        else if (file.metadata?.mimetype?.includes('image')) type = 'image';
        else if (file.metadata?.mimetype?.includes('video')) type = 'video';

        return {
          id: file.id,
          name: file.name,
          url: publicUrlData.publicUrl,
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          type,
        };
      }));

      return createSuccessResponse(files.filter(f => f.name !== '.emptyFolderPlaceholder'));
    } catch (error: any) {
      return createErrorResponse('STORAGE_LIST_ERROR', error.message || 'Failed to list files');
    }
  }

  async uploadFile(bucket: string, path: string, file: File): Promise<ApiResponse<string>> {
    try {
      const { data, error } = await this.supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (error) throw error;
      
      const { data: publicUrlData } = this.supabase.storage.from(bucket).getPublicUrl(path);
      return createSuccessResponse(publicUrlData.publicUrl, 'File successfully uploaded.');
    } catch (error: any) {
      return createErrorResponse('STORAGE_UPLOAD_ERROR', error.message || 'Failed to upload file');
    }
  }

  async deleteFile(bucket: string, path: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await this.supabase.storage.from(bucket).remove([path]);
      if (error) throw error;
      return createSuccessResponse(null, 'File successfully deleted.');
    } catch (error: any) {
      return createErrorResponse('STORAGE_DELETE_ERROR', error.message || 'Failed to delete file');
    }
  }
}

export const storageAdapter = new SupabaseStorageAdapter();
