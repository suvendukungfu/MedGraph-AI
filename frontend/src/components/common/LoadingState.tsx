import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface LoadingStateProps {
  label?: string
}

const steps = [
  'Image acquired & normalizing contrast...',
  'Running OCR extraction via Tesseract...',
  'Mapping entities to RxNorm clinical ontology...',
  'Resolving multi-edge conflict graph...',
]

export const LoadingState = ({ label }: LoadingStateProps) => {
  const [activeStep, setActiveStep] = useState(0)

  // Auto-progress steps every 800ms to simulate a complex pipeline
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1))
    }, 800)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
        <motion.div
          className="h-full bg-teal-500"
          initial={{ width: '0%' }}
          animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-20" />
          <svg className="w-5 h-5 text-teal-600 relative z-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-0.5">MediGraph AI Compute</p>
          <p className="text-sm font-semibold text-slate-800">{label || 'Analyzing Clinical Regimen'}</p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = index === activeStep
          const isPast = index < activeStep

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isActive || isPast ? 1 : 0.4, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${isPast ? 'bg-teal-500 border-teal-500' :
                  isActive ? 'border-teal-500 animate-pulse bg-teal-100' :
                    'border-slate-300 bg-slate-100'
                }`}>
                {isPast && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping" />
                )}
              </div>
              <p className={`text-sm ${isPast ? 'text-slate-500' :
                  isActive ? 'text-teal-700 font-semibold' :
                    'text-slate-400'
                }`}>
                {step}
              </p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
