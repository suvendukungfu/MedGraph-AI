import { useMemo, useState, type ReactNode } from 'react'

import type { RoleSession, UserRole, UserProfile } from '../types/auth'
import {
  authSessionStorageKey,
  AuthSessionContext,
  defaultSession,
  roleDisplayNameMap,
} from './authSessionStore'

const loadSession = (): RoleSession => {
  const rawValue = localStorage.getItem(authSessionStorageKey)
  if (!rawValue) return defaultSession

  try {
    const parsed = JSON.parse(rawValue) as RoleSession
    if (!parsed.role) return defaultSession
    return parsed
  } catch {
    return defaultSession
  }
}

export const AuthSessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<RoleSession>(() => loadSession())

  const setRole = (role: UserRole) => {
    setSession(prev => {
      const next: RoleSession = {
        ...prev,
        role,
        displayName: prev.user?.name || roleDisplayNameMap[role],
      }
      localStorage.setItem(authSessionStorageKey, JSON.stringify(next))
      return next
    })
  }

  const login = (user: UserProfile) => {
    setSession(prev => {
      const next: RoleSession = {
        ...prev,
        user,
        displayName: user.name,
        isAuthenticated: true
      }
      localStorage.setItem(authSessionStorageKey, JSON.stringify(next))
      return next
    })
  }

  const logout = () => {
    localStorage.removeItem(authSessionStorageKey)
    setSession({ ...defaultSession, isAuthenticated: false })
    // We also need to trigger a backend logout
    window.location.href = '/logout'
  }

  const value = useMemo(() => ({ session, setRole, login, logout }), [session])

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}
