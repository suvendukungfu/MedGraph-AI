import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthSession } from '../../hooks/useAuthSession'
import { httpClient } from '../../api/httpClient'
import { useAuthStore } from '../../store/authStore'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const [verifying, setVerifying] = useState(true)
    const { session, login, logout } = useAuthSession()
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const location = useLocation()

    useEffect(() => {
        const verifySession = async () => {
            if (!isAuthenticated) {
                setVerifying(false)
                return
            }

            try {
                // Call the FastAPI /me endpoint to validate the JWT is still valid server-side
                const response = await httpClient.get('/auth/me')
                if (response.status === 200 && response.data.role) {
                    // Update role locally if it somehow changed
                    login({ role: response.data.role })
                }
            } catch (error: unknown) {
                if (error && typeof error === 'object' && 'message' in error) {
                    console.error('Auth verification failed', (error as { message?: string }).message)
                } else {
                    console.error('Auth verification failed', error)
                }
                logout() // Force clear if token is invalid
            } finally {
                setVerifying(false)
            }
        }

        verifySession()
    }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

    if (verifying) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <div className="flex items-center gap-3 text-slate-500 font-medium">
                    <svg className="w-5 h-5 animate-spin text-teal-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying Secure Session...
                </div>
            </div>
        )
    }

    if (!session.isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <>{children}</>
}
