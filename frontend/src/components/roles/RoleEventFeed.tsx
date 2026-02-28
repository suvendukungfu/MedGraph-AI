import type { UserRole } from '../../types/auth'
import { useRoleEventStream } from '../../hooks/useRoleEventStream'

interface RoleEventFeedProps {
  role: UserRole
}

const levelTone: Record<string, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  critical: 'border-rose-200 bg-rose-50 text-rose-700',
}

export const RoleEventFeed = ({ role }: RoleEventFeedProps) => {
  const { events, connectionState, statusLabel } = useRoleEventStream(role)

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between gap-2">
        <p className="section-title">Live Event Feed</p>
        <span className="rounded-full border border-surface-border bg-surface-muted px-2 py-1 text-xs font-semibold text-gray-600">
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {events.length === 0 ? (
          <div className="rounded-lg border border-surface-border bg-surface-muted p-3 text-sm text-gray-500">
            {connectionState === 'connecting' ? 'Waiting for first event...' : 'No events yet.'}
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`rounded-lg border px-3 py-2 text-sm ${levelTone[event.level] ?? 'border-slate-200 bg-slate-50 text-slate-700'}`}
            >
              <p className="font-semibold">{event.message}</p>
              <p className="mt-1 text-xs opacity-70">{new Date(event.createdAt).toLocaleTimeString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
