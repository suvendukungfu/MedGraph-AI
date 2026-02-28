import { motion } from 'framer-motion'
import type { InteractionAnalysisResult } from '../../types/interactions'

interface RiskCardProps {
  analysis: InteractionAnalysisResult
}

export const RiskCard = ({ analysis }: RiskCardProps) => {
  const isSevere = analysis.risk_score > 7

  let badgeTone = 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (analysis.risk_score > 3) badgeTone = 'bg-amber-100 text-amber-700 border-amber-200'
  if (analysis.risk_score > 7) badgeTone = 'bg-rose-100 text-rose-700 border-rose-200 bg-pulse'

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`bg-white/90 backdrop-blur-xl border rounded-3xl shadow-xl p-8 relative overflow-hidden ${isSevere ? 'border-rose-300/50 shadow-rose-500/10' : 'border-slate-200/60'}`}
    >
      {isSevere && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 to-red-600 animate-pulse" />
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aggregate Risk Score</p>
          <div className="flex items-baseline mt-1 gap-2">
            <span className={`text-6xl font-black tracking-tighter ${isSevere ? 'text-rose-600' : 'text-slate-800'}`}>
              {analysis.risk_score}
            </span>
            <span className="text-lg text-slate-400 font-semibold tracking-tight">/ 100</span>
          </div>
        </div>
        <span className={`rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-wider shadow-sm ${badgeTone}`}>
          {analysis.clinical_band}
        </span>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-5">
        <p className="text-sm font-medium text-slate-700 leading-relaxed">{analysis.explanation}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Mild Edge" value={analysis.severity_counts.mild} color="emerald" />
        <Metric label="Moderate Edge" value={analysis.severity_counts.moderate} color="amber" />
        <Metric label="Severe Edge" value={analysis.severity_counts.severe} color="rose" />
        <Metric label="Contraindicated" value={analysis.severity_counts.contraindicated} color="slate" />
      </div>
    </motion.section>
  )
}

interface MetricProps {
  label: string
  value: number
  color: 'emerald' | 'amber' | 'rose' | 'slate'
}

const Metric = ({ label, value, color }: MetricProps) => {
  const colorMap = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    slate: 'text-slate-700 bg-slate-100 border-slate-200',
  }

  return (
    <div className={`rounded-2xl border p-4 text-center transition-all hover:-translate-y-1 hover:shadow-md cursor-default ${colorMap[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-black tracking-tight">{value}</p>
    </div>
  )
}
