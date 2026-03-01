import { useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

import type { MedicationDosageInput } from '../../types/schedule'

interface MedicationComposerProps {
  dosages: MedicationDosageInput[]
  onChange: (next: MedicationDosageInput[]) => void
}

const normalize = (name: string) => name.trim().toUpperCase()

export const MedicationComposer = ({ dosages, onChange }: MedicationComposerProps) => {
  const [newDrug, setNewDrug] = useState('')
  const [newFrequency, setNewFrequency] = useState(1)

  const handleAdd = () => {
    const normalizedDrug = normalize(newDrug)
    if (!normalizedDrug) return

    const existing = dosages.find((item) => item.drug_name === normalizedDrug)
    if (existing) {
      onChange(
        dosages.map((item) =>
          item.drug_name === normalizedDrug ? { ...item, frequency: Math.max(item.frequency, newFrequency) } : item,
        ),
      )
      toast.success(`${normalizedDrug} updated`, { description: `Frequency set to ${Math.max(existing.frequency, newFrequency)}/day` })
    } else {
      onChange([...dosages, { drug_name: normalizedDrug, frequency: newFrequency }])
      toast.success(`${normalizedDrug} added`, { description: `Added to clinical interaction set.` })
    }

    setNewDrug('')
    setNewFrequency(1)
  }

  const handleDelete = (drugName: string) => {
    onChange(dosages.filter((item) => item.drug_name !== drugName))
    toast.error(`${drugName} removed`, { description: 'Removed from clinical interaction set.' })
  }

  const updateFrequency = (drugName: string, nextFrequency: number) => {
    onChange(
      dosages.map((item) =>
        item.drug_name === drugName ? { ...item, frequency: Math.max(1, Math.floor(nextFrequency)) } : item,
      ),
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 shadow-xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-2.5 bg-teal-500/10 rounded-xl border border-teal-500/20">
          <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <p className="text-xl font-bold text-slate-800 tracking-tight">Medication Composer</p>
          <p className="text-sm text-slate-500 mt-1">Review extracted drugs, add missing entries, and set daily frequency.</p>
        </div>
      </div>

      <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200 grid gap-4 sm:grid-cols-[1fr_120px_auto] items-center">
        <div className="relative">
          <input
            value={newDrug}
            onChange={(event) => setNewDrug(event.target.value)}
            placeholder="Type medication name..."
            className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 bg-white shadow-sm"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div className="relative">
          <input
            type="number"
            min={1}
            max={6}
            value={newFrequency}
            onChange={(event) => setNewFrequency(Number(event.target.value || 1))}
            className="w-full rounded-xl border border-slate-200 pl-12 pr-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 bg-white shadow-sm"
          />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider absolute left-4 top-3.5 mt-0.5">Frq</span>
        </div>
        <button type="button" onClick={handleAdd} className="bg-slate-800 border-none text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-slate-900 active:scale-95 transition-all shadow-md whitespace-nowrap">
          Add Drug
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {dosages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-500">No active medications in regimen.</p>
            <p className="text-xs text-slate-400 mt-1">Add a drug above to begin interaction analysis.</p>
          </div>
        ) : (
          <AnimatePresence>
            {dosages.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                key={item.drug_name}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all hover:border-teal-500/30 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-sm uppercase tracking-wider border border-teal-100">
                    {item.drug_name.charAt(0)}{item.drug_name.charAt(1)}
                  </div>
                  <p className="text-base font-bold text-slate-800 uppercase tracking-wide">{item.drug_name}</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex-1 sm:flex-none justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daily Doses</span>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={item.frequency}
                      onChange={(event) => updateFrequency(item.drug_name, Number(event.target.value || 1))}
                      className="w-12 text-center rounded-lg border border-slate-200 py-1 text-sm font-bold text-slate-800 outline-none focus:border-teal-500 shadow-sm transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.drug_name)}
                    className="rounded-xl p-2.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-200 shrink-0"
                    aria-label="Remove medication"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

# refactor(frontend): improve type safety in medication composer component
