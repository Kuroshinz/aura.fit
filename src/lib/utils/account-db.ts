// Multi-User Local Storage Database Utility

export interface UserAccountData {
  email: string
  fullName: string
  passwordHash?: string
  role: 'admin' | 'user'
  profile: any | null
  workoutHistory: any[]
  customRoutine: any | null
  activeWorkout: any | null
}

const ACCOUNTS_DB_KEY = 'aura_fit_accounts_db'
const CURRENT_SESSION_KEY = 'aura_fit_current_session_email'

export const MASTER_ADMIN_EMAIL = 'admin@aura.fit'

export const MASTER_ADMIN_PROFILE = {
  name: 'Super Admin Nguyễn Văn Nhân',
  age: 22,
  gender: 'male',
  height_cm: 175,
  weight_kg: 72.5,
  body_fat: 16.5,
  experience: '3y+',
  goal: 'recomposition',
  sessions_per_week: 5,
  role: 'admin',
}

// Reset all old garbage accounts and create single Master Admin
export function resetAllAndCreateMasterAdmin(): UserAccountData {
  if (typeof window !== 'undefined') {
    localStorage.clear()
  }

  const masterAdminData: UserAccountData = {
    email: MASTER_ADMIN_EMAIL,
    fullName: 'Super Admin Nguyễn Văn Nhân',
    role: 'admin',
    profile: MASTER_ADMIN_PROFILE,
    workoutHistory: [],
    customRoutine: null,
    activeWorkout: null,
  }

  const db = { [MASTER_ADMIN_EMAIL]: masterAdminData }

  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(db))
    localStorage.setItem(CURRENT_SESSION_KEY, MASTER_ADMIN_EMAIL)
  }

  return masterAdminData
}

// Get all registered accounts
export function getAllAccounts(): Record<string, UserAccountData> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(ACCOUNTS_DB_KEY)
    if (!raw) {
      // Auto initialize Master Admin if DB empty
      const master = resetAllAndCreateMasterAdmin()
      return { [MASTER_ADMIN_EMAIL]: master }
    }
    return JSON.parse(raw)
  } catch (e) {
    return {}
  }
}

// Get account by email
export function getAccountByEmail(email: string): UserAccountData | null {
  const db = getAllAccounts()
  return db[email.toLowerCase().trim()] || null
}

// Save or update account data
export function saveAccountData(email: string, data: Partial<UserAccountData>) {
  if (typeof window === 'undefined') return
  const cleanEmail = email.toLowerCase().trim()
  const db = getAllAccounts()
  const existing = db[cleanEmail] || {
    email: cleanEmail,
    fullName: '',
    role: cleanEmail === MASTER_ADMIN_EMAIL ? 'admin' : 'user',
    profile: null,
    workoutHistory: [],
    customRoutine: null,
    activeWorkout: null,
  }

  db[cleanEmail] = {
    ...existing,
    ...data,
  }

  localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(db))
}

// Set current logged in user session
export function setCurrentSessionEmail(email: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CURRENT_SESSION_KEY, email.toLowerCase().trim())
}

// Get current session email
export function getCurrentSessionEmail(): string | null {
  if (typeof window === 'undefined') return MASTER_ADMIN_EMAIL
  return localStorage.getItem(CURRENT_SESSION_KEY) || MASTER_ADMIN_EMAIL
}

// Clear current session
export function clearCurrentSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CURRENT_SESSION_KEY)
}

// Delete account from system DB (except Master Admin)
export function deleteAccountFromDB(email: string) {
  if (typeof window === 'undefined') return
  const cleanEmail = email.toLowerCase().trim()
  if (cleanEmail === MASTER_ADMIN_EMAIL) return // Protect Master Admin

  const db = getAllAccounts()
  delete db[cleanEmail]
  localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(db))
}
