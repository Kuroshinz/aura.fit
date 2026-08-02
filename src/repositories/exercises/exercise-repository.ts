import { BaseRepository } from '../base-repository';
import { Database } from '@/types/supabase';

// We map to the generic Row type for exercises from Supabase
export type ExerciseRecord = Database['public']['Tables']['exercises']['Row'];

export class ExerciseRepository extends BaseRepository<ExerciseRecord> {
  protected tableName = 'exercises';

  async getAdminExercises(): Promise<ExerciseRecord[]> {
    const { data, error } = await this.table.select('*').order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching admin exercises:', error);
      return [];
    }
    return data as ExerciseRecord[];
  }
}

export const exerciseRepository = new ExerciseRepository();
