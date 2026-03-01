import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, ShieldCheck, Mail, Lock, Zap, Heart } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { httpClient } from '../api/httpClient'
import { toast } from 'sonner'

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: unknown }).message
        if (typeof message === 'string' && message.trim()) return message
    }
    return fallback
}

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const staggerChild = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const setCredentials = useAuthStore((state) => state.setCredentials)
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (isAuthenticated) {
        navigate('/', { replace: true })
        return null
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { data } = await httpClient.post('/auth/login', { email, password })
            setCredentials(data.access_token, data.role, data.is_new)

            if (data.is_new) {
                toast.success('Account created successfully! Let\'s set up your profile.')
                navigate('/onboarding', { replace: true })
            } else {
                toast.success('Welcome back!')
                navigate('/', { replace: true })
            }
        } catch (error: unknown) {
            const message = getErrorMessage(error, 'Invalid credentials. Please try again.')
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-mesh" />

            {/* Floating Orbs */}
            <div className="absolute top-[10%] left-[15%] w-72 h-72 rounded-full bg-teal-400/20 blur-[100px] floating-orb" />
            <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-emerald-400/15 blur-[120px] floating-orb-delay" />
            <div className="absolute top-[50%] left-[60%] w-48 h-48 rounded-full bg-cyan-400/10 blur-[80px] floating-orb" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }} />

            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="relative z-10 w-full max-w-md mx-auto px-6"
            >
                <div className="glass-card rounded-3xl p-10 flex flex-col items-center shadow-2xl">
                    {/* Animated Logo */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
                        className="relative mb-6"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 shimmer" />
                            <Activity className="w-10 h-10 text-white relative z-10" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <Heart className="w-3 h-3 text-white" />
                        </div>
                    </motion.div>

                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1 text-center">
                        Welcome Back
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed text-center max-w-xs">
                        Secure clinical intelligence and polypharmacy management platform.
                    </p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-3"
                        >
                            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                            <p className="text-left">{error}</p>
                        </motion.div>
                    )}

                    <motion.form
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        onSubmit={handleLogin}
                        className="w-full space-y-4 text-left"
                    >
                        <motion.div variants={staggerChild}>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 bg-white/60 backdrop-blur-sm transition-all duration-200"
                                    placeholder="you@email.com"
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={staggerChild}>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 bg-white/60 backdrop-blur-sm transition-all duration-200"
                                    placeholder="••••••••"
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={staggerChild}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl text-white font-bold text-sm hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <Zap className="w-4 h-4 relative z-10" />
                                <span className="relative z-10">{loading ? 'Authenticating...' : 'Sign In Securely'}</span>
                            </button>
                        </motion.div>
                    </motion.form>

                    <p className="mt-8 text-sm text-slate-500 font-medium">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-teal-600 hover:text-teal-500 font-bold transition-colors">
                            Register now
                        </Link>
                    </p>
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-6 mt-6 text-white/50">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Compliant
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Lock className="w-3.5 h-3.5" /> 256-bit Encrypted
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
