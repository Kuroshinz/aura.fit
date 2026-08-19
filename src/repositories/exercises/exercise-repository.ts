import { BaseRepository } from '../base-repository';
import { Database } from '@/types/supabase';

export interface ExerciseRecord {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  is_custom?: boolean;
  created_by?: string;
  created_at?: string;
  description?: string;
  instructions?: string[];
  media_urls?: string[];
  difficulty?: string;
  target?: string;
  sort_order?: number;
}

export class ExerciseRepository extends BaseRepository<ExerciseRecord> {
  protected tableName = 'exercises';

  async getAdminExercises(): Promise<ExerciseRecord[]> {
    const { data, error } = await this.table.select('*').order('sort_order', { ascending: true }).order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching admin exercises:', error);
      return [];
    }
    return data as ExerciseRecord[];
  }
}

export const exerciseRepository = new ExerciseRepository();
