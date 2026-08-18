import { createClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export abstract class BaseRepository<T extends { [key: string]: any }> {
  protected supabase: SupabaseClient<Database>;
  protected abstract tableName: string;

  constructor() {
    this.supabase = createClient();
  }

  protected get table() {
    return this.supabase.from(this.tableName);
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.table.select('*').eq('id', id).single();
    if (error) {
      console.error(`Error fetching ${this.tableName} by id ${id}:`, error);
      return null;
    }
    return data as T;
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    orderBy?: { column: string; ascending?: boolean };
  }): Promise<T[]> {
    let query = this.table.select('*');

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) {
      console.error(`Error fetching all from ${this.tableName}:`, error);
      return [];
    }
    return data as T[];
  }

  async create(payload: Partial<T>): Promise<T | null> {
    const { data, error } = await this.table.insert(payload as any).select().single();
    if (error) {
      console.error(`Error creating in ${this.tableName}:`, error);
      return null;
    }
    return data as T;
  }

  async update(id: string, payload: Partial<T>): Promise<T | null> {
    const { data, error } = await this.table.update(payload as any).eq('id', id).select().single();
    if (error) {
      console.error(`Error updating ${this.tableName} id ${id}:`, error);
      return null;
    }
    return data as T;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.table.delete().eq('id', id);
    if (error) {
      console.error(`Error deleting from ${this.tableName} id ${id}:`, error);
      return false;
    }
    return true;
  }
}
