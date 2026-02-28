import { Link } from 'react-router-dom'

interface RoleDashboardCardProps {
  role: string
  title: string
  description: string
  to: string
  accentClass: string
}

export const RoleDashboardCard = ({ role, title, description, to, accentClass }: RoleDashboardCardProps) => {
  return (
    <article className="glass-card">
      <div className={`mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${accentClass}`}>
        {role}
      </div>
      <h2 className="text-lg font-semibold text-brand-navy">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      <Link to={to} className="btn-primary mt-4">
        Open Dashboard
      </Link>
    </article>
  )
}
