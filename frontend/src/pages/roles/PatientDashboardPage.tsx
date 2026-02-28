import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { PageHeader } from '../../components/common/PageHeader'
import { RoleEventFeed } from '../../components/roles/RoleEventFeed'

const adherenceTrend = [
  { day: 'Mon', score: 72 },
  { day: 'Tue', score: 80 },
  { day: 'Wed', score: 76 },
  { day: 'Thu', score: 88 },
  { day: 'Fri', score: 91 },
  { day: 'Sat', score: 84 },
  { day: 'Sun', score: 93 },
]

const timeline = [
  { time: '08:00', action: 'Take WARFARIN 5mg', state: 'done' },
  { time: '12:00', action: 'Take OMEPRAZOLE 20mg', state: 'due' },
  { time: '18:00', action: 'Take ASPIRIN 75mg', state: 'pending' },
]

const stateClass: Record<string, string> = {
  done: 'bg-emerald-100 text-emerald-700',
  due: 'bg-amber-100 text-amber-700',
  pending: 'bg-slate-100 text-slate-700',
}

export const PatientDashboardPage = () => {
  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Patient"
        title="Daily Adherence Companion"
        subtitle="Medication timeline, adherence momentum, and proactive reminders in a single view."
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <div className="glass-card">
            <p className="section-title">Today Timeline</p>
            <div className="mt-3 space-y-2">
              {timeline.map((item) => (
                <div key={item.time} className="rounded-lg border border-surface-border bg-surface-muted px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-brand-navy">{item.time}</p>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${stateClass[item.state]}`}>
                      {item.state}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{item.action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <p className="section-title">7-Day Adherence Trend</p>
            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer>
                <LineChart data={adherenceTrend}>
                  <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 12 }} />
                  <YAxis domain={[50, 100]} tick={{ fill: '#475569', fontSize: 12 }} />
                  <Tooltip />
                  <Line dataKey="score" stroke="#2B61B1" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <RoleEventFeed role="patient" />
      </div>
    </section>
  )
}
