export type UserRole = 'admin' | 'doctor' | 'patient' | 'caretaker'

export interface RoleSession {
  role: UserRole
  tenantId: string
  displayName: string
}
