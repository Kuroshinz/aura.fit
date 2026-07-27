import { createClient } from './client'
import { ParsedRoutine } from '../utils/excel-parser'

export interface UserRoutine {
  id: string
  user_id: string
  name: string
  description?: string
  split_id: string
  schedule_data: ParsedRoutine
  is_active: boolean
  updated_at: string
}

export async function saveRoutine(
  routineName: string,
  parsedRoutine: ParsedRoutine,
  splitId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Insert new routine
    const { data, error } = await supabase
      .from('routines')
      .insert({
        user_id: user.id,
        name: routineName,
        split_id: splitId,
        schedule_data: parsedRoutine,
        is_active: true, // Auto-activate newly imported routine
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Deactivate other routines
    await supabase
      .from('routines')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .neq('id', data.id)

    return { success: true, data }
  } catch (err: any) {
    console.error('Error saving routine:', err)
    return { success: false, error: err.message }
  }
}

export async function getActiveRoutine(): Promise<UserRoutine | null> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // Ignore row not found error
      console.error('Error fetching active routine:', error)
      return null
    }

    return data as UserRoutine | null
  } catch (err) {
    console.error('Unexpected error fetching routine:', err)
    return null
  }
}

export async function updateRoutine(
  routineId: string,
  routineName: string,
  parsedRoutine: ParsedRoutine,
  splitId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('routines')
      .update({
        name: routineName,
        split_id: splitId,
        schedule_data: parsedRoutine,
        updated_at: new Date().toISOString()
      })
      .eq('id', routineId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.error('Error updating routine:', err)
    return { success: false, error: err.message }
  }
}

export async function deleteRoutine(routineId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('routines').delete().eq('id', routineId)
    return !error
  } catch {
    return false
  }
}
