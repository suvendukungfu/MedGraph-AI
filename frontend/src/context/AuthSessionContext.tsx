import { useMemo, useState, type ReactNode } from 'react'

import type { RoleSession, UserRole } from '../types/auth'
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
    const next: RoleSession = {
      role,
      tenantId: 'clinic-alpha',
      displayName: roleDisplayNameMap[role],
    }
    setSession(next)
    localStorage.setItem(authSessionStorageKey, JSON.stringify(next))
  }

  const value = useMemo(() => ({ session, setRole }), [session])

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}
