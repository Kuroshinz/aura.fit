import { BaseRepository } from '../base-repository';
import { UserProfile } from '@/store/use-profile-store';

// We map the DB profile to the domain UserProfile.
// For admin purposes, we might need a broader type.
export interface AdminUserRecord extends UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  workout_count?: number;
}

export class UserRepository extends BaseRepository<AdminUserRecord> {
  protected tableName = 'profiles';

  async getEnterpriseUsers(): Promise<AdminUserRecord[]> {
    // In a real scenario, this might join auth.users via a secure RPC or Edge Function
    // Since profiles has role and metrics, we fetch from profiles directly.
    const { data, error } = await this.table.select('*').order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching enterprise users:', error);
      return [];
    }

    return data.map((row: any) => ({
      ...row,
      workout_count: row.workout_history ? row.workout_history.length : 0,
    })) as AdminUserRecord[];
  }

  async suspendUser(id: string): Promise<boolean> {
    // We update a status flag in profiles (requires adding 'status' to profiles later)
    const { error } = await this.table.update({ role: 'suspended' }).eq('id', id);
    return !error;
  }
}

export const userRepository = new UserRepository();
