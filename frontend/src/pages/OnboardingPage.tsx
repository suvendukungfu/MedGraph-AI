import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthSession } from '../hooks/useAuthSession'
import type { UserRole } from '../types/auth'
import { getRawJwt } from '../utils/jwtCookie'

const ROLES: { role: UserRole; label: string; icon: string; description: string; color: string }[] = [
    {
        role: 'doctor',
        label: 'Doctor / Clinician',
        icon: '👨‍⚕️',
        description: 'Manage patient prescriptions, risk queues, and interaction alerts.',
        color: 'from-indigo-500 to-blue-600',
    },
    {
        role: 'patient',
        label: 'Patient',
        icon: '🩺',
        description: 'View your medication schedule, adherence streaks, and safety alerts.',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        role: 'caretaker',
        label: 'Caretaker / Family',
        icon: '🤝',
        description: "Monitor a dependent's risk level and acknowledge medication alerts.",
        color: 'from-amber-500 to-orange-500',
    },
    {
        role: 'admin',
        label: 'Platform Admin',
        icon: '⚙️',
        description: 'Manage users, assign roles, and oversee platform health.',
        color: 'from-rose-500 to-pink-600',
    },
]

const ROLE_DESTINATIONS: Record<UserRole, string> = {
    admin: '/roles/admin',
    doctor: '/roles/doctor',
    patient: '/roles/patient',
    caretaker: '/roles/caretaker',
}

export const OnboardingPage = () => {
    const [selected, setSelected] = useState<UserRole | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { login } = useAuthSession()
    const navigate = useNavigate()

    const handleContinue = async () => {
        if (!selected) return
        setLoading(true)
        setError(null)

        try {
            const token = getRawJwt()
            const res = await fetch('/api/v1/auth/onboarding/complete', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ role: selected }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.detail || 'Failed to complete onboarding')
            }

            const data = await res.json()

            // Store new token with real role in cookie
            document.cookie = `medgraph_token=${data.token}; path=/; max-age=${7 * 24 * 3600}`

            // Update the in-memory session
            login({
                user_id: '',
                email: '',
                name: '',
                role: data.role,
            })

            navigate(ROLE_DESTINATIONS[selected] || '/dashboard', { replace: true })
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50">
            {/* Background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-2xl mx-auto px-4"
            >
                <div className="bg-white/85 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-3xl p-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 text-center">
                        Welcome to MediGraph AI 👋
                    </h1>
                    <p className="text-slate-500 text-sm text-center mb-8">
                        Choose your role so we can personalise your workspace.
                    </p>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {ROLES.map(({ role, label, icon, description, color }) => {
                            const isSelected = selected === role
                            return (
                                <motion.button
                                    key={role}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelected(role)}
                                    className={`rounded-2xl border-2 p-5 text-left transition-all duration-200 ${isSelected
                                        ? `border-teal-500 bg-teal-50/70 shadow-md`
                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                        }`}
                                >
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color} text-white text-2xl mb-3 shadow-sm`}>
                                        {icon}
                                    </div>
                                    <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
                                    <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
                                </motion.button>
                            )
                        })}
                    </div>

                    <button
                        onClick={handleContinue}
                        disabled={!selected || loading}
                        className="w-full py-3.5 rounded-xl bg-teal-600 text-white font-bold text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-700 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Setting up your workspace...
                            </>
                        ) : (
                            `Continue as ${selected ? ROLES.find(r => r.role === selected)?.label : '…'}`
                        )}
                    </button>
                </div>
            </motion.div>
        </section>
    )
}
