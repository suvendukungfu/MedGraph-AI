import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types/auth'

export const useAuthSession = () => {
  const { token, role, isAuthenticated, isNewUser, setCredentials, logout } = useAuthStore()

  // Bridging the old context format to the new Zustand auth store
  return {
    session: {
      user_id: '',
      email: '',
      name: '',
      displayName: 'Patient', // Placeholder 
      user: {
        picture: ''
      },
      role: role as UserRole,
      isAuthenticated: isAuthenticated,
      isNewUser: isNewUser
    },
    login: (params: { role: string }) => {
      // Compatibility shim
      setCredentials(token || '', params.role, false)
    },
    logout: () => {
      logout()
    },
    setRole: (newRole: UserRole) => {
      setCredentials(token || '', newRole, isNewUser)
    }
  }
}
