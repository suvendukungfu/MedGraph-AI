import { PageHeader } from '../../components/common/PageHeader'
import { RoleEventFeed } from '../../components/roles/RoleEventFeed'
import { ScheduleTimeline } from '../../components/dashboard/ScheduleTimeline'
import { RiskRadialMeter } from '../../components/dashboard/RiskRadialMeter'
import { InteractionGraph } from '../../components/graph/InteractionGraph'

const mockTimeline = [
  { time: '08:00', medications: ['WARFARIN', 'LISINOPRIL'] },
  { time: '12:00', medications: ['OMEPRAZOLE'] },
  { time: '18:00', medications: ['ASPIRIN'] },
]

const mockDrugs = ['WARFARIN', 'ASPIRIN', 'LISINOPRIL', 'OMEPRAZOLE']
const mockInteractions = [
  {
    drug_a: 'WARFARIN',
    drug_b: 'ASPIRIN',
    severity: 'severe' as const,
    explanation: 'Dangerous increase in bleeding risk when combined.'
  },
  {
    drug_a: 'LISINOPRIL',
    drug_b: 'ASPIRIN',
    severity: 'mild' as const,
    explanation: 'NSAIDs may decrease the antihypertensive effect of ACE inhibitors.'
  }
]

export const PatientDashboardPage = () => {
  return (
    <section className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Patient"
        title="Clinical Safety Dashboard"
        subtitle="Your medication timeline, active contraindications, and interaction map securely analyzed."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left Column: Timeline & Meter */}
        <div className="space-y-6 flex flex-col xl:col-span-1">
          <RiskRadialMeter score={8.5} severity="SEVERE" />

          <div className="flex-1">
            <ScheduleTimeline
              slots={mockTimeline}
              notes="Aspirin and Warfarin have been spaced apart safely, but severe interaction risk remains. Consult your doctor."
            />
          </div>
        </div>

        {/* Center Column: Graph */}
        <div className="space-y-6 flex flex-col xl:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-xl h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-4">Interaction Graph</h3>
            <div className="flex-1 min-h-[400px]">
              <InteractionGraph drugs={mockDrugs} interactions={mockInteractions} />
            </div>
          </div>
        </div>

        {/* Right Column: Event Feed */}
        <div className="xl:col-span-1 flex flex-col h-full">
          <RoleEventFeed role="patient" />
        </div>
      </div>
    </section>
  )
}
