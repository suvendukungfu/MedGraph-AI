import { PageHeader } from '../../components/common/PageHeader'
import { RoleEventFeed } from '../../components/roles/RoleEventFeed'

const inbox = [
  { patient: 'P-201', severity: 'High', note: 'Missed evening dose twice this week', status: 'Unacknowledged' },
  { patient: 'P-104', severity: 'Critical', note: 'Contraindicated interaction + late adherence', status: 'Open' },
  { patient: 'P-031', severity: 'Moderate', note: 'Needs refill in 2 days', status: 'Acknowledged' },
]

const severityClass: Record<string, string> = {
  Moderate: 'bg-amber-100 text-amber-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-rose-100 text-rose-700',
}

export const CaretakerDashboardPage = () => {
  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Caretaker"
        title="Dependent Escalation Inbox"
        subtitle="Track dependent alerts, acknowledge risks, and coordinate with clinicians quickly."
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <div className="glass-card">
          <p className="section-title">Escalation Queue</p>
          <div className="mt-3 space-y-2">
            {inbox.map((item, index) => (
              <div key={`${item.patient}-${index}`} className="rounded-lg border border-surface-border bg-surface-muted px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-brand-navy">Patient {item.patient}</p>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${severityClass[item.severity]}`}>
                    {item.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{item.note}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{item.status}</p>
              </div>
            ))}
          </div>
        </div>

        <RoleEventFeed role="caretaker" />
      </div>
    </section>
  )
}
