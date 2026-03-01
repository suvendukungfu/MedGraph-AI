import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, ShieldCheck, Mail, Lock, Phone } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { httpClient } from '../api/httpClient'
import { toast } from 'sonner'

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export const RegisterPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const setCredentials = useAuthStore((state) => state.setCredentials)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { data } = await httpClient.post('/auth/register', {
                email,
                password,
                phone,
                role: 'patient' // Defaulting to patient for initial flow
            })

            setCredentials(data.access_token, data.role, true)

            // If patient, throw to onboarding, else throw to dashboard
            if (data.role === 'patient') {
                toast.success('Account created successfully! Please complete your profile.')
                navigate('/onboarding', { replace: true })
            } else {
                toast.success('Account created successfully!')
                navigate('/', { replace: true })
            }
        } catch (err: any) {
            const message = err.message || 'Failed to create account. Please try again.'
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 font-sans">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 blur-[120px]" />

            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="relative z-10 w-full max-w-md mx-auto"
            >
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-3xl p-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-md mb-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <Activity className="w-8 h-8 text-white relative z-10" />
                    </div>

                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 text-center">
                        Create Account
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed text-center">
                        Join MediGraph AI for secure clinical intelligence.
                    </p>

                    {error && (
                        <div className="w-full mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                            <p className="text-left">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="w-full space-y-4 text-left">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 bg-slate-50/50"
                                    placeholder="you@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Phone</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 bg-slate-50/50"
                                    placeholder="xxx-xxx-xxxx"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 bg-slate-50/50"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 border border-transparent rounded-xl text-white font-bold text-sm hover:bg-slate-800 transition-all duration-200 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-8 text-sm text-slate-500 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-teal-600 hover:text-teal-500 font-bold">
                            Sign in instead
                        </Link>
                    </p>
                </div>
            </motion.div>
        </section>
    )
}
