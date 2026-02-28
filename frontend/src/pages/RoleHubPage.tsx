import { PageHeader } from '../components/common/PageHeader'
import { RoleDashboardCard } from '../components/roles/RoleDashboardCard'

const cards = [
  {
    role: 'Admin',
    title: 'Platform Operations Control',
    description: 'Tenant health, queue observability, and emergency incident timelines.',
    to: '/roles/admin',
    accentClass: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  {
    role: 'Doctor',
    title: 'Clinical Risk Queue',
    description: 'Prioritized patient list with interaction severity and adherence drift.',
    to: '/roles/doctor',
    accentClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  {
    role: 'Patient',
    title: 'Daily Adherence Companion',
    description: 'Today timeline, streak tracking, and immediate safety recommendations.',
    to: '/roles/patient',
    accentClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    role: 'Caretaker',
    title: 'Escalation Inbox',
    description: 'Dependent risk alerts, acknowledgments, and emergency escalation actions.',
    to: '/roles/caretaker',
    accentClass: 'border-amber-200 bg-amber-50 text-amber-700',
  },
]

export const RoleHubPage = () => {
  return (
    <section>
      <PageHeader
        eyebrow="Role-Aware Workspace"
        title="Role Dashboard Navigator"
        subtitle="Explore dedicated dashboard surfaces per role. Route guards enforce role access using session claims."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <RoleDashboardCard key={card.role} {...card} />
        ))}
      </div>
    </section>
  )
}
