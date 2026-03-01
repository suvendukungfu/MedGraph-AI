import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pill, Sparkles, Zap, FlaskConical, X } from 'lucide-react'

import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { MedicationComposer } from '../components/common/MedicationComposer'
import { PageHeader } from '../components/common/PageHeader'
import { PipelineModeSwitch } from '../components/common/PipelineModeSwitch'
import { DualInputSection } from '../components/capture/DualInputSection'
import { useInteractionAnalysis } from '../hooks/useInteractionAnalysis'
import { useOcrExtraction } from '../hooks/useOcrExtraction'
import { useQueuedWorkflow } from '../hooks/useQueuedWorkflow'
import { useScheduleOptimization } from '../hooks/useScheduleOptimization'
import type { MedicationDosageInput } from '../types/schedule'
import type { DashboardWorkflowState } from '../types/workflow'
import { saveWorkflow } from '../utils/storage'
import { toast } from 'sonner'

const normalizeDrugName = (name: string) => name.trim().toUpperCase()

const upsertDosage = (
  dosages: MedicationDosageInput[],
  candidate: MedicationDosageInput,
): MedicationDosageInput[] => {
  const normalizedName = normalizeDrugName(candidate.drug_name)
  if (!normalizedName) return dosages

  const normalizedFrequency = Math.max(1, Math.floor(candidate.frequency || 1))

  const existing = dosages.find((item) => item.drug_name === normalizedName)
  if (existing) {
    return dosages.map((item) =>
      item.drug_name === normalizedName
        ? { ...item, frequency: Math.max(item.frequency, normalizedFrequency) }
        : item,
    )
  }

  return [...dosages, { drug_name: normalizedName, frequency: normalizedFrequency }]
}


const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}
export const PrescriptionUploadPage = () => {
  const navigate = useNavigate()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [executionMode, setExecutionMode] = useState<'sync' | 'queued'>('sync')
  const [workflowStage, setWorkflowStage] = useState<string | null>(null)
  const [dosages, setDosages] = useState<MedicationDosageInput[]>([])

  const ocrMutation = useOcrExtraction()
  const interactionMutation = useInteractionAnalysis()
  const scheduleMutation = useScheduleOptimization()
  const queuedWorkflowMutation = useQueuedWorkflow()

  const isExtracting = ocrMutation.isPending
  const isGenerating =
    interactionMutation.isPending || scheduleMutation.isPending || queuedWorkflowMutation.isPending

  const activeError =
    globalError ??
    (ocrMutation.error as Error | null)?.message ??
    (interactionMutation.error as Error | null)?.message ??
    (scheduleMutation.error as Error | null)?.message ??
    (queuedWorkflowMutation.error as Error | null)?.message ??
    null

  const extractedDrugs = useMemo(() => dosages.map((item) => item.drug_name), [dosages])

  const onFilePicked = (file: File | null) => {
    setGlobalError(null)
    setSelectedFile(file)
    setWorkflowStage(null)
    ocrMutation.reset()
    queuedWorkflowMutation.reset()
  }

  const handleExtract = async () => {
    if (!selectedFile) {
      setGlobalError('Please capture or upload a prescription image first.')
      return
    }

    setGlobalError(null)
    setWorkflowStage('Analyzing prescription with AI-powered OCR...')

    try {
      const result = await ocrMutation.mutateAsync(selectedFile)
      setDosages((previous) => upsertDosage(previous, { drug_name: result.matched_drug, frequency: 1 }))
      toast.success('Successfully extracted medication details.')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to extract medication details.'))
    } finally {
      setWorkflowStage(null)
    }
  }

  const buildSyncWorkflow = async (): Promise<DashboardWorkflowState> => {
    const prescribed_drugs = dosages.map((item) => item.drug_name)
    if (prescribed_drugs.length === 0) {
      throw new Error('Add at least one medication before generating dashboard insights.')
    }
    setWorkflowStage('Computing interactions and medication schedule...')
    const [analysis, schedule] = await Promise.all([
      interactionMutation.mutateAsync({ prescribed_drugs }),
      scheduleMutation.mutateAsync({ dosages }),
    ])
    return {
      ocr: ocrMutation.data ?? null,
      extractedDrugs: prescribed_drugs,
      dosages,
      interactionAnalysis: analysis,
      schedule,
      createdAt: new Date().toISOString(),
      executionMode: 'sync',
    }
  }

  const buildQueuedWorkflow = async (): Promise<DashboardWorkflowState> => {
    if (!selectedFile && dosages.length === 0) {
      throw new Error('Queue mode requires a file upload or manually added medications.')
    }
    setWorkflowStage('Submitting workflow to async workers...')
    const result = await queuedWorkflowMutation.mutateAsync({ file: selectedFile, dosages })
    setDosages(result.dosages)
    return {
      ocr: result.ocr,
      extractedDrugs: result.extractedDrugs,
      dosages: result.dosages,
      interactionAnalysis: result.interactionAnalysis,
      schedule: result.schedule,
      createdAt: new Date().toISOString(),
      executionMode: 'queued',
    }
  }

  const handleGenerateClinicalInsights = async () => {
    setGlobalError(null)
    try {
      const workflowPayload =
        executionMode === 'queued' ? await buildQueuedWorkflow() : await buildSyncWorkflow()
      saveWorkflow(workflowPayload)
      toast.success('Generated Risk Dashboard successfully!')
      navigate('/dashboard', { state: workflowPayload })
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to build clinical insights.')
      setGlobalError(message)
      toast.error(message)
    } finally {
      setWorkflowStage(null)
    }
  }

  const removeDosage = (drugName: string) => {
    setDosages((prev) => prev.filter((d) => d.drug_name !== drugName))
  }

  return (
    <section>
      <PageHeader
        eyebrow="Prescription Intelligence"
        title="From Prescription Image to Actionable Safety Graph"
        subtitle="Capture a prescription via camera, upload a PDF/image, then generate conflict-aware safety analytics powered by AI."
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-[1.2fr_1fr] mt-2"
      >
        {/* Left Column: Dual Input + Controls */}
        <div className="space-y-5">
          {/* Camera + PDF Dual Input */}
          <div className="glass-card rounded-3xl p-6 shadow-xl relative overflow-hidden group/card">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
            <DualInputSection onFileReady={onFilePicked} selectedFile={selectedFile} />
          </div>

          {/* Execution Mode */}
          <div className="glass-card rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-sm font-bold text-slate-800">Execution Mode</p>
            </div>
            <PipelineModeSwitch mode={executionMode} onChange={setExecutionMode} />
            <p className="mt-2.5 text-xs text-slate-500">
              {executionMode === 'queued'
                ? 'Uses async job workers and polling. Best for heavy OCR + graph workloads.'
                : 'Uses direct API endpoints for fastest local demo response.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExtract}
              disabled={isExtracting || !selectedFile}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm"
            >
              <FlaskConical className="w-4 h-4" />
              {isExtracting ? 'Extracting...' : 'Extract Medication'}
            </button>

            <button
              onClick={handleGenerateClinicalInsights}
              disabled={isGenerating || (executionMode === 'sync' && dosages.length === 0)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating Insights...' : 'Generate Risk Dashboard'}
            </button>
          </div>

          {/* Status indicators */}
          <div className="space-y-3">
            {isExtracting && <LoadingState label="Running AI-powered OCR extraction pipeline..." />}
            {isGenerating && workflowStage && <LoadingState label={workflowStage} />}
            {activeError && <ErrorState message={activeError} />}
          </div>
        </div>

        {/* Right Column: Medication Set + Composer */}
        <div className="space-y-5">
          <div className="glass-card rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-bold text-slate-800 tracking-tight">Active Medication Set</p>
                <p className="text-sm text-slate-500 mt-0.5">Drugs sent to interaction & scheduling engines.</p>
              </div>
              {extractedDrugs.length > 0 && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {extractedDrugs.length} drug{extractedDrugs.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="min-h-24 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              {extractedDrugs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                    <Pill className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">No medications loaded yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Extract via OCR or add manually below.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {dosages.map((item) => (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        key={item.drug_name}
                        className="group inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-gradient-to-r from-teal-50 to-emerald-50 pl-3 pr-1.5 py-1.5 text-sm font-bold text-teal-700 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Pill className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                        {item.drug_name}
                        <span className="text-teal-500/60 mx-0.5">·</span>
                        <span className="text-teal-600/80 font-medium">{item.frequency}/day</span>
                        <button
                          onClick={() => removeDosage(item.drug_name)}
                          className="ml-0.5 w-5 h-5 rounded-full bg-red-100/0 group-hover:bg-red-100 text-red-400 group-hover:text-red-500 flex items-center justify-center transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* OCR Result */}
            <AnimatePresence>
              {ocrMutation.data && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">OCR Trace</p>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      High Confidence
                    </span>
                  </div>
                  <p className="text-sm font-mono text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {ocrMutation.data.extracted_text}
                  </p>
                  {/* Confidence bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span className="font-medium">Model Confidence</span>
                      <span className="font-bold text-teal-700">{(ocrMutation.data.confidence_score * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full meter-fill"
                        style={{ width: `${ocrMutation.data.confidence_score * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <MedicationComposer dosages={dosages} onChange={setDosages} />
        </div>
      </motion.div>
    </section>
  )
}
