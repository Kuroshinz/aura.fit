import { BaseRepository } from '../base-repository';
import { Database } from '@/types/supabase';

export type RoutineRecord = Database['public']['Tables']['routines']['Row'];

export class TemplateRepository extends BaseRepository<RoutineRecord> {
  protected tableName = 'routines';

  async getAdminTemplates(): Promise<RoutineRecord[]> {
    // For an admin panel, we fetch global templates or all user routines.
    // Assuming 'is_global' or similar doesn't exist yet, we fetch all for now
    const { data, error } = await this.table.select('*').order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin templates:', error);
      return [];
    }
    return data as RoutineRecord[];
  }
}

export const templateRepository = new TemplateRepository();
