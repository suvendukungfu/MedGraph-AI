import { createContext } from 'react'

import type { RoleSession, UserRole, UserProfile } from '../types/auth'

export interface AuthSessionContextValue {
  session: RoleSession
  setRole: (role: UserRole) => void
  login: (user: UserProfile) => void
  logout: () => void
}

export const authSessionStorageKey = 'medigraph:role-session'

export const defaultSession: RoleSession = {
  role: 'doctor',
  tenantId: 'clinic-alpha',
  displayName: 'Dr. Avery Chen',
  isAuthenticated: false
}

export const roleDisplayNameMap: Record<UserRole, string> = {
  admin: 'Platform Admin',
  doctor: 'Dr. Avery Chen',
  patient: 'Raj Patel',
  caretaker: 'Maya Patel',
}

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)
