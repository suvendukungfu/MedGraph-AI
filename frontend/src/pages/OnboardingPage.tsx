import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ArrowRight, Check } from 'lucide-react'
import { httpClient } from '../api/httpClient'
import { useAuthStore } from '../store/authStore'
import { toast } from 'sonner'

const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export const OnboardingPage = () => {
    const [step, setStep] = useState(1)
    const [age, setAge] = useState('')
    const [height, setHeight] = useState('')
    const [weight, setWeight] = useState('')
    const [chronicInput, setChronicInput] = useState('')
    const [allergyInput, setAllergyInput] = useState('')

    const [chronic_conditions, setChronicConditions] = useState<string[]>([])
    const [allergies, setAllergies] = useState<string[]>([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const setCredentials = useAuthStore(state => state.setCredentials)
    const token = useAuthStore(state => state.token)
    const role = useAuthStore(state => state.role)

    const handleAddCondition = () => {
        if (chronicInput.trim() && !chronic_conditions.includes(chronicInput.trim())) {
            setChronicConditions([...chronic_conditions, chronicInput.trim()])
            setChronicInput('')
        }
    }

    const handleAddAllergy = () => {
        if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
            setAllergies([...allergies, allergyInput.trim()])
            setAllergyInput('')
        }
    }

    const handleFinalSubmit = async () => {
        setLoading(true)
        setError(null)

        try {
            await httpClient.post('/auth/onboarding/complete', {
                age,
                height,
                weight,
                chronic_conditions,
                allergies
            })

            // Setup finished, remove 'isNewUser' flag
            if (token && role) {
                setCredentials(token, role, false)
            }
            toast.success('Your clinical profile has been saved.')
            navigate('/', { replace: true })
        } catch (err: any) {
            const message = err.message || 'Failed to complete profile.'
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 blur-[120px]" />

            <div className="relative z-10 w-full max-w-lg mx-auto px-4">
                <div className="bg-white/85 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-3xl p-10">

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-md">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Patient Profile</h1>
                            <p className="text-slate-500 text-xs font-medium">Let's set up your clinical baseline (Step {step} of 2)</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="show" exit="exit" className="space-y-5">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Age</label>
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            className="block w-full px-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 bg-slate-50/50"
                                            placeholder="Yrs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Height</label>
                                        <input
                                            type="text"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                            className="block w-full px-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 bg-slate-50/50"
                                            placeholder="cm/ft"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Weight</label>
                                        <input
                                            type="text"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            className="block w-full px-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 bg-slate-50/50"
                                            placeholder="kg/lbs"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full py-3.5 mt-4 rounded-xl bg-slate-900 text-white font-bold text-sm tracking-wide hover:bg-slate-800 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="show" exit="exit" className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Chronic Conditions</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={chronicInput}
                                            onChange={(e) => setChronicInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddCondition()}
                                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 bg-slate-50/50"
                                            placeholder="e.g. Hypertension, Diabetes"
                                        />
                                        <button onClick={handleAddCondition} className="px-4 bg-teal-100 text-teal-700 font-bold text-xs rounded-xl hover:bg-teal-200">Add</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {chronic_conditions.map(cond => (
                                            <span key={cond} className="px-3 py-1 bg-white border border-teal-200 text-teal-700 text-xs font-bold rounded-lg shadow-sm">
                                                {cond}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Known Allergies</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={allergyInput}
                                            onChange={(e) => setAllergyInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddAllergy()}
                                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 bg-slate-50/50"
                                            placeholder="e.g. Penicillin, Peanuts"
                                        />
                                        <button onClick={handleAddAllergy} className="px-4 bg-teal-100 text-teal-700 font-bold text-xs rounded-xl hover:bg-teal-200">Add</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {allergies.map(alg => (
                                            <span key={alg} className="px-3 py-1 bg-white border border-rose-200 text-rose-700 text-xs font-bold rounded-lg shadow-sm">
                                                {alg}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="w-1/3 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleFinalSubmit}
                                        disabled={loading}
                                        className="w-2/3 py-3.5 rounded-xl bg-teal-600 text-white font-bold text-sm tracking-wide disabled:opacity-40 hover:bg-teal-700 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                    >
                                        {loading ? 'Saving...' : (
                                            <>Complete Profile <Check className="w-5 h-5" /></>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    )
}
