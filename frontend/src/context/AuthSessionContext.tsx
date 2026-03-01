import { useMemo, useState, type ReactNode } from 'react'

import type { RoleSession, UserRole, UserProfile } from '../types/auth'
import {
  authSessionStorageKey,
  AuthSessionContext,
  defaultSession,
  roleDisplayNameMap,
} from './authSessionStore'
import { parseJwtFromCookie, clearAuthCookie } from '../utils/jwtCookie'

/**
 * Try to bootstrap a session from:
 *  1. A valid JWT cookie from the backend (real production auth)
 *  2. localStorage (for persistance across refreshes)
 *  3. The default guest session
 */
const loadSession = (): RoleSession => {
  // 1. Try real JWT cookie first
  const jwtPayload = parseJwtFromCookie()
  if (jwtPayload && jwtPayload.email) {
    const rawRole = String(jwtPayload.role || 'patient')
    const role = (rawRole !== '__pending__' ? rawRole : 'patient') as UserRole
    const session: RoleSession = {
      role,
      tenantId: jwtPayload.tenant_id || 'clinic-default',
      displayName: jwtPayload.name || jwtPayload.email,
      isAuthenticated: rawRole !== '__pending__',
      user: {
        user_id: jwtPayload.sub || jwtPayload.email,
        email: jwtPayload.email,
        name: jwtPayload.name || jwtPayload.email,
        picture: jwtPayload.picture,
        role: rawRole !== '__pending__' ? role : undefined,
        tenantId: jwtPayload.tenant_id,
        expires_at: jwtPayload.exp,
      },
    }
    // Persist to localStorage so next refresh doesn't hit network
    localStorage.setItem(authSessionStorageKey, JSON.stringify(session))
    return session
  }

  // 2. Fallback to localStorage
  const rawValue = localStorage.getItem(authSessionStorageKey)
  if (rawValue) {
    try {
      const parsed = JSON.parse(rawValue) as RoleSession
      if (parsed.role && parsed.isAuthenticated) return parsed
    } catch {
      // corrupted, ignore
    }
  }

  return defaultSession
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
      const role = (user.role || prev.role || 'patient') as UserRole
      const next: RoleSession = {
        ...prev,
        user,
        role,
        tenantId: user.tenantId || prev.tenantId || 'clinic-default',
        displayName: user.name,
        isAuthenticated: true,
      }
      localStorage.setItem(authSessionStorageKey, JSON.stringify(next))
      return next
    })
  }

  const logout = () => {
    localStorage.removeItem(authSessionStorageKey)
    clearAuthCookie()
    setSession({ ...defaultSession, isAuthenticated: false })
    // Also clear the backend session
    fetch('/auth/logout', { method: 'POST', credentials: 'include' }).finally(() => {
      window.location.href = '/login'
    })
  }

  const value = useMemo(() => ({ session, setRole, login, logout }), [session])

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}
