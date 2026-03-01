import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'

import { LoadingState } from '../components/common/LoadingState'
import { PageHeader } from '../components/common/PageHeader'
import { InteractionList } from '../components/dashboard/InteractionList'
import { KpiStrip } from '../components/dashboard/KpiStrip'
import { RiskCard } from '../components/dashboard/RiskCard'
import { RiskReportActions } from '../components/dashboard/RiskReportActions'
import { ScheduleTimeline } from '../components/dashboard/ScheduleTimeline'
import { WorkflowMetaCard } from '../components/dashboard/WorkflowMetaCard'
import type { DashboardWorkflowState } from '../types/workflow'
import { loadWorkflow } from '../utils/storage'

const cardMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

const RiskAnalyticsChart = lazy(() =>
  import('../components/dashboard/RiskAnalyticsChart').then((module) => ({
    default: module.RiskAnalyticsChart,
  })),
)

const InteractionGraph = lazy(() =>
  import('../components/graph/InteractionGraph').then((module) => ({
    default: module.InteractionGraph,
  })),
)

export const RiskDashboardPage = () => {
  const location = useLocation()
  const routeState = location.state as DashboardWorkflowState | undefined
  const workflow = routeState ?? loadWorkflow()

  if (!workflow) {
    return (
      <section className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-16 shadow-xl flex flex-col items-center justify-center min-h-[60vh] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 via-transparent to-teal-50/20 pointer-events-none" />
        <svg className="w-16 h-16 text-slate-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <PageHeader
          eyebrow="Clinical Command Center"
          title="No Active Intelligence Session"
          subtitle="Awaiting prescription extraction or manual drug entry to spawn the interaction conflict graph."
        />
        <div className="mt-8 z-10">
          <Link to="/" className="px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 border bg-slate-800 border-slate-800 text-white shadow-lg hover:bg-slate-900 active:scale-95 inline-flex items-center gap-2">
            Upload Prescription
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section>
      <PageHeader
        eyebrow="Clinical Insights"
        title="Medication Risk Command Center"
        subtitle={`Live topology for ${workflow.extractedDrugs.length} medication(s) computed via ${workflow.executionMode === 'queued' ? 'async workers' : 'direct execution'}.`}
        actions={<RiskReportActions workflow={workflow} />}
      />

      <div className="space-y-6 mt-6">
        <KpiStrip analysis={workflow.interactionAnalysis} medicationCount={workflow.extractedDrugs.length} />

        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <RiskCard analysis={workflow.interactionAnalysis} />
            <motion.div variants={cardMotion} initial="initial" animate="animate" transition={{ delay: 0.08 }}>
              <InteractionList interactions={workflow.interactionAnalysis.interactions} />
            </motion.div>
            <motion.div variants={cardMotion} initial="initial" animate="animate" transition={{ delay: 0.12 }}>
              <ScheduleTimeline slots={workflow.schedule.schedule} notes={workflow.schedule.notes} />
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div variants={cardMotion} initial="initial" animate="animate" transition={{ delay: 0.03 }}>
              <WorkflowMetaCard
                executionMode={workflow.executionMode}
                generatedAt={workflow.createdAt}
                ocr={workflow.ocr}
              />
            </motion.div>
            <motion.div variants={cardMotion} initial="initial" animate="animate" transition={{ delay: 0.06 }}>
              <Suspense fallback={<LoadingState label="Loading risk chart..." />}>
                <RiskAnalyticsChart analysis={workflow.interactionAnalysis} />
              </Suspense>
            </motion.div>
            <motion.div variants={cardMotion} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
              <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-xl relative overflow-hidden h-full flex flex-col">
                <p className="text-xl font-bold text-slate-800 tracking-tight">Interaction Graph</p>
                <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">Visual conflict topology across extracted medications.</p>
                <div className="mt-6 flex-1 min-h-[400px]">
                  <Suspense fallback={<LoadingState label="Rendering interaction graph..." />}>
                    <InteractionGraph
                      drugs={workflow.extractedDrugs}
                      interactions={workflow.interactionAnalysis.interactions}
                    />
                  </Suspense>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

# fix(frontend): handle null states gracefully in interaction graph rendering
