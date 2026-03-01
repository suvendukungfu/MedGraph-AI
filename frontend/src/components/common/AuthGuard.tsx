import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthSession } from '../../hooks/useAuthSession'
import { parseJwtFromCookie } from '../../utils/jwtCookie'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const [verifying, setVerifying] = useState(true)
    const { session, login } = useAuthSession()
    const location = useLocation()

    useEffect(() => {
        const verifySession = async () => {
            try {
                // 1. Try the local JWT cookie first (fastest — no network needed)
                const jwtPayload = parseJwtFromCookie()
                if (jwtPayload && jwtPayload.email && jwtPayload.role && jwtPayload.role !== '__pending__') {
                    login({
                        user_id: jwtPayload.sub,
                        email: jwtPayload.email,
                        name: jwtPayload.name,
                        picture: jwtPayload.picture,
                        role: jwtPayload.role,
                        tenantId: jwtPayload.tenant_id,
                        expires_at: jwtPayload.exp,
                    })
                    setVerifying(false)
                    return
                }

                // 2. Fallback: call the FastAPI /me endpoint (validates the JWT server-side)
                const response = await fetch('/api/v1/auth/me', { credentials: 'include' })
                if (response.ok) {
                    const data = await response.json()
                    if (data.email && data.role) {
                        login({
                            user_id: data.user_id,
                            email: data.email,
                            name: data.name,
                            picture: data.picture,
                            role: data.role,
                            tenantId: data.tenant_id,
                        })
                    }
                }
            } catch (e) {
                console.error('Auth verification failed', e)
            } finally {
                setVerifying(false)
            }
        }

        verifySession()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
