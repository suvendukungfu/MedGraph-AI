import type { OcrExtractionResult } from '../../types/ocr'

interface WorkflowMetaCardProps {
  executionMode: 'sync' | 'queued'
  ocr: OcrExtractionResult | null
  generatedAt: string
}

export const WorkflowMetaCard = ({ executionMode, ocr, generatedAt }: WorkflowMetaCardProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-4 -translate-y-4">
        <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>

      <p className="text-xl font-bold text-slate-800 tracking-tight">Workflow Metadata</p>

      <div className="mt-6 space-y-4 relative z-10 w-full sm:w-11/12">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Execution Mode</span>
          <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{executionMode === 'queued' ? 'Celery Async' : 'Synchronous API'}</span>
        </div>

        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Generated At</span>
          <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{new Date(generatedAt).toLocaleString()}</span>
        </div>

        {ocr ? (
          <div className="pt-2">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-3">Model Trace Outputs</p>
            <div className="grid gap-3 grid-cols-2">
              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
                <span className="text-[10px] uppercase font-bold text-teal-600/70 block mb-1">OCR Match</span>
                <span className="text-sm font-black text-teal-800">{ocr.matched_drug}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <span className="text-[10px] uppercase font-bold text-emerald-600/70 block mb-1">Confidence</span>
                <span className="text-xl font-black text-emerald-700 tracking-tighter">{(ocr.confidence_score * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">No OCR Record Attached</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
