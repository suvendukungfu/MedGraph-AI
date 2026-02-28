import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import type { UserRole } from '../../types/auth'
import { useAuthSession } from '../../hooks/useAuthSession'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: ReactNode
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { session } = useAuthSession()

  if (!allowedRoles.includes(session.role)) {
    return <Navigate to="/roles" replace />
  }

  return <>{children}</>
}
