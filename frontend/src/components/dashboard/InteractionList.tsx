import { useMemo, useState } from 'react'

import type { InteractionPair } from '../../types/interactions'
import type { SeverityLevel } from '../../types/api'
import { severityBadgeClass } from '../../utils/severity'

interface InteractionListProps {
  interactions: InteractionPair[]
}

export const InteractionList = ({ interactions }: InteractionListProps) => {
  const [query, setQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all')

  const filteredInteractions = useMemo(() => {
    return interactions.filter((item) => {
      const matchesSeverity = severityFilter === 'all' ? true : item.severity === severityFilter
      const normalizedQuery = query.trim().toLowerCase()
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : [item.drug_a, item.drug_b, item.explanation].some((value) =>
            value.toLowerCase().includes(normalizedQuery),
          )

      return matchesSeverity && matchesQuery
    })
  }, [interactions, query, severityFilter])

  if (interactions.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <p className="text-xl font-bold text-slate-800 tracking-tight">Detected Interactions</p>
        <div className="mt-6 flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <svg className="w-12 h-12 text-emerald-400/70 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-bold text-slate-600 text-center">
            Regimen is stable. No critical interactions detected in current pipeline.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col h-full">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xl font-bold text-slate-800 tracking-tight">Detected Interactions</p>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            Displaying {filteredInteractions.length} / {interactions.length}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={severityFilter}
            onChange={(event) => setSeverityFilter(event.target.value as SeverityLevel | 'all')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
          >
            <option value="all">All Severities</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
            <option value="contraindicated">Contraindicated</option>
          </select>

          <div className="relative">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search medication..."
              className="w-full sm:w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto pr-2 max-h-[400px] custom-scrollbar">
        {filteredInteractions.map((item, index) => (
          <div key={`${item.drug_a}-${item.drug_b}-${index}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all hover:border-slate-300 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 group-hover:bg-slate-300 transition-colors" />
            <div className="flex flex-wrap items-center justify-between gap-3 pl-2">
              <p className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                {item.drug_a} <span className="text-slate-300 mx-1">+</span> {item.drug_b}
              </p>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm ${severityBadgeClass[item.severity]}`}>
                {item.severity}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed pl-2">{item.explanation}</p>
          </div>
        ))}

        {filteredInteractions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <p className="text-sm font-bold text-slate-500">No interactions match criteria.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
