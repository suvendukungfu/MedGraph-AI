import { PageHeader } from '../../components/common/PageHeader'
import { RoleEventFeed } from '../../components/roles/RoleEventFeed'

const metrics = [
  { label: 'Active Tenants', value: '12' },
  { label: 'Queue Throughput/min', value: '184' },
  { label: 'Escalations Today', value: '26' },
  { label: 'Emergency Events', value: '2' },
]

const auditRows = [
  ['22:05', 'doctor:avery', 'Updated medication plan for patient P-104'],
  ['21:42', 'caretaker:maya', 'Acknowledged high-risk escalation for P-201'],
  ['21:33', 'system', 'Queued OCR batch processed successfully'],
  ['21:14', 'admin:ops', 'Rotated notification provider fallback policy'],
]

export const AdminDashboardPage = () => {
  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Platform Operations Dashboard"
        subtitle="Operational reliability overview across queues, escalations, and audit-sensitive actions."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="glass-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold text-brand-navy">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <div className="glass-card">
          <p className="section-title">Audit Timeline</p>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">Actor</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {auditRows.map((row, idx) => (
                  <tr key={`${row[0]}-${idx}`} className="border-t border-surface-border">
                    <td className="px-3 py-2 text-gray-600">{row[0]}</td>
                    <td className="px-3 py-2 font-semibold text-brand-navy">{row[1]}</td>
                    <td className="px-3 py-2 text-gray-700">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <RoleEventFeed role="admin" />
      </div>
    </section>
  )
}
