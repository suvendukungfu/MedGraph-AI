export type UserRole = 'admin' | 'doctor' | 'patient' | 'caretaker'

export interface UserProfile {
  user_id: string
  email: string
  name: string
  picture?: string
  expires_at?: number
}

export interface RoleSession {
  role: UserRole
  tenantId: string
  displayName: string
  user?: UserProfile
  isAuthenticated?: boolean
}
