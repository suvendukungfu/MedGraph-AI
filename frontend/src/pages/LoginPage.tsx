import { motion } from 'framer-motion'

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export const LoginPage = () => {
    const handleGoogleLogin = () => {
        // The Vite proxy will intercept this and forward to http://localhost:3000/login
        // which initiates the Google OAuth callback
        window.location.href = '/login'
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 blur-[120px]" />

            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="relative z-10 w-full max-w-md mx-auto"
            >
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-3xl p-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100 shadow-sm mb-6">
                        <svg
                            className="w-8 h-8 text-teal-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                        MediGraph AI
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed">
                        Secure clinical intelligence and polypharmacy management system. Sign in to access your secure workspace.
                    </p>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full relative group flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 hover:shadow-md transition-all duration-200 active:scale-95"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                            <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        <span className="text-slate-700 font-bold text-sm tracking-wide">
                            Sign in with Google
                        </span>
                    </button>
                </div>
                <p className="text-center text-xs font-medium text-slate-400 mt-8">
                    Protected by enterprise-grade TLS. <br />
                    Data is entirely isolated per organization.
                </p>
            </motion.div>
        </section>
    )
}

# style(login): fine-tune entrance sequence timing for LoginPage
