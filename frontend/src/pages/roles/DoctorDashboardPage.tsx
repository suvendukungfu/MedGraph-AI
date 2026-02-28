import { PageHeader } from '../../components/common/PageHeader'
import { RoleEventFeed } from '../../components/roles/RoleEventFeed'

const riskQueue = [
  { patient: 'P-104', risk: 86, band: 'Critical', issue: 'Warfarin + Aspirin severe edge' },
  { patient: 'P-201', risk: 72, band: 'High', issue: '3 missed doses this week' },
  { patient: 'P-177', risk: 54, band: 'High', issue: 'Contraindicated dosage overlap' },
  { patient: 'P-031', risk: 34, band: 'Moderate', issue: 'Late adherence trend' },
]

const heatmap = [
  [16, 20, 28, 34, 41, 53, 65],
  [18, 22, 25, 31, 38, 44, 58],
  [14, 17, 20, 29, 32, 45, 52],
]

const bucketClass = (value: number) => {
  if (value < 25) return 'bg-emerald-100 text-emerald-700'
  if (value < 50) return 'bg-amber-100 text-amber-700'
  if (value < 75) return 'bg-orange-100 text-orange-700'
  return 'bg-rose-100 text-rose-700'
}

export const DoctorDashboardPage = () => {
  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Doctor"
        title="Clinical Risk Queue"
        subtitle="Prioritized patients requiring intervention based on interaction severity and adherence drift."
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <div className="glass-card">
            <p className="section-title">Patient Priority Queue</p>
            <div className="mt-3 space-y-2">
              {riskQueue.map((item) => (
                <div key={item.patient} className="rounded-lg border border-surface-border bg-surface-muted px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-brand-navy">Patient {item.patient}</p>
                    <span className={`rounded-full border border-transparent px-2 py-1 text-xs font-semibold ${bucketClass(item.risk)}`}>
                      {item.band} · {item.risk}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{item.issue}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <p className="section-title">Risk Heatmap (Last 7 Days)</p>
            <p className="subtle-text mt-1">Rows represent ward cohorts; columns represent daily aggregate risk.</p>
            <div className="mt-3 grid gap-2">
              {heatmap.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="grid grid-cols-7 gap-2">
                  {row.map((value, colIndex) => (
                    <div
                      key={`cell-${rowIndex}-${colIndex}`}
                      className={`rounded-md px-2 py-2 text-center text-xs font-semibold ${bucketClass(value)}`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <RoleEventFeed role="doctor" />
      </div>
    </section>
  )
}
