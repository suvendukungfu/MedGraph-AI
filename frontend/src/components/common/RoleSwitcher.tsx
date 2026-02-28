import type { UserRole } from '../../types/auth'
import { useAuthSession } from '../../hooks/useAuthSession'

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  doctor: 'Doctor',
  patient: 'Patient',
  caretaker: 'Caretaker',
}

export const RoleSwitcher = () => {
  const { session, setRole } = useAuthSession()

  return (
    <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-light px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Role</span>
      <select
        value={session.role}
        onChange={(event) => setRole(event.target.value as UserRole)}
        className="rounded-lg border border-surface-border bg-white px-2 py-1 text-sm font-semibold text-brand-navy outline-none focus:border-brand-blue"
      >
        {(Object.keys(roleLabels) as UserRole[]).map((role) => (
          <option key={role} value={role}>
            {roleLabels[role]}
          </option>
        ))}
      </select>
    </div>
  )
}
