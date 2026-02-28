import type { InteractionAnalysisResult } from '../../types/interactions'

interface KpiStripProps {
  analysis: InteractionAnalysisResult
  medicationCount: number
}

export const KpiStrip = ({ analysis, medicationCount }: KpiStripProps) => {
  const criticalEdges = analysis.interactions.filter(
    (item) => item.severity === 'severe' || item.severity === 'contraindicated',
  ).length

  const kpis = [
    { label: 'Active Meds', value: medicationCount, tone: 'text-teal-700', bg: 'bg-teal-50' },
    { label: 'Interactions', value: analysis.interactions.length, tone: 'text-slate-800', bg: 'bg-slate-50' },
    { label: 'Critical Edges', value: criticalEdges, tone: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Network Weight', value: analysis.raw_weight, tone: 'text-amber-700', bg: 'bg-amber-50' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-md relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 ${kpi.bg}`} />
          <div className="relative z-10 w-full flex items-center justify-between lg:flex-col lg:items-start">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{kpi.label}</p>
            <p className={`mt-1 text-4xl font-black tracking-tighter ${kpi.tone}`}>{kpi.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
