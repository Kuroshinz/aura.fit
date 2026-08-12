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
  role_id?: string;
  subscription_id?: string;
  status?: string;
  roles?: { id: string, name: string };
  subscriptions?: { id: string, tier_name: string };
}

export class UserRepository extends BaseRepository<AdminUserRecord> {
  protected tableName = 'profiles';

  async getEnterpriseUsers(): Promise<AdminUserRecord[]> {
    const { data, error } = await this.table.select(`
      *,
      roles ( id, name ),
      subscriptions ( id, tier_name )
    `).order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching enterprise users:', error);
      return [];
    }

    return data.map((row: any) => ({
      ...row,
      workout_count: row.workout_history ? row.workout_history.length : 0,
    })) as AdminUserRecord[];
  }

  async suspendUser(id: string, isSuspended: boolean): Promise<boolean> {
    const status = isSuspended ? 'suspended' : 'active';
    const { error } = await this.table.update({ status }).eq('id', id);
    return !error;
  }

  async updateUserRole(id: string, role_id: string): Promise<boolean> {
    const { error } = await this.table.update({ role_id }).eq('id', id);
    return !error;
  }
}

export const userRepository = new UserRepository();
