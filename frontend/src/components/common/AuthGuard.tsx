import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthSession } from '../../hooks/useAuthSession'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const [verifying, setVerifying] = useState(true)
    const { session, login } = useAuthSession()
    const location = useLocation()

    useEffect(() => {
        const verifySession = async () => {
            try {
                // Fetch to our auth server proxy
                const response = await fetch('/api/me')
                if (response.ok) {
                    const data = await response.json()
                    if (data.authenticated && data.user) {
                        login(data.user)
                    }
                } else {
                    // Not authenticated on backend
                }
            } catch (e) {
                console.error('Auth verification failed', e)
            } finally {
                setVerifying(false)
            }
        }

        verifySession()
    }, [login])

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
        // Redirect them to the /login page, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <>{children}</>
}
