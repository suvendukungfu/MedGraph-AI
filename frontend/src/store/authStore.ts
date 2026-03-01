import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserRole } from '../types/auth'

interface AuthState {
    token: string | null
    role: UserRole | null
    isAuthenticated: boolean
    isNewUser: boolean
    setCredentials: (token: string, role: string, isNewUser?: boolean) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            role: null,
            isAuthenticated: false,
            isNewUser: false,
            setCredentials: (token: string, role: string, isNewUser: boolean = false) => {
                set({
                    token,
                    role: role as UserRole,
                    isAuthenticated: true,
                    isNewUser
                })
            },
            logout: () => {
                set({ token: null, role: null, isAuthenticated: false, isNewUser: false })
            },
        }),
        {
            name: 'medgraph-auth-storage', // name of item in the storage (must be unique)
            storage: createJSONStorage(() => sessionStorage), // optionally use sessionStorage
        }
    )
)
