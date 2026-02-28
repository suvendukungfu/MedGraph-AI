import type { UserRole } from './auth'

export interface RoleStreamEvent {
  id: string
  role: UserRole
  level: 'info' | 'warning' | 'critical'
  message: string
  createdAt: string
}
