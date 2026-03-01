import { motion } from 'framer-motion'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'

import { useAuthSession } from '../../hooks/useAuthSession'
import { useSystemHealth } from '../../hooks/useSystemHealth'
import { RoleSwitcher } from './RoleSwitcher'

const links = [
  { to: '/', label: 'Prescription Upload' },
  { to: '/dashboard', label: 'Risk Dashboard' },
  { to: '/roles', label: 'Role Dashboards' },
  { to: '/architecture', label: 'Architecture' },
]

const routeTitle: Record<string, string> = {
  '/': 'Prescription Intelligence',
  '/dashboard': 'Clinical Command Center',
  '/roles': 'Role Navigator',
  '/architecture': 'System Blueprint',
}

export const AppLayout = () => {
  const { data } = useSystemHealth()
  const { session } = useAuthSession()
  const location = useLocation()

  const isReady = data?.status === 'ready'
  const title = routeTitle[location.pathname] ?? 'MediGraph Workspace'

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Toaster position="bottom-right" richColors theme="light" />
      <aside className="w-64 bg-white border-r border-slate-200/60 flex flex-col shadow-sm z-10 relative">
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-md shadow-teal-500/20 text-lg font-bold text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 blur-md transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000" />
              MG
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-slate-800">MediGraph.AI</p>
              <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider mt-0.5">Clinical Safety</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6">
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Workspace</p>
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-semibold transition-all ${isActive
                    ? 'bg-brand-blue/10 text-brand-blue'
                    : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-surface-border space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-muted px-4 py-3 text-sm font-medium text-gray-600">
            <span
              className={`h-2.5 w-2.5 rounded-full ${typeof isReady === 'undefined' ? 'bg-gray-400 animate-pulse' : isReady ? 'bg-risk-safe' : 'bg-risk-moderate'
                }`}
            />
            {typeof isReady === 'undefined' ? 'Checking Backend...' : isReady ? 'System Online' : 'Degraded'}
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-muted px-4 py-3 text-xs text-gray-500">
            Active Role: <span className="font-semibold uppercase text-brand-navy">{session.role}</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        <header className="h-20 bg-surface-light/80 backdrop-blur-md border-b border-surface-border flex items-center justify-between px-8 z-20">
          <h1 className="text-xl font-semibold text-brand-navy">{title}</h1>
          <div className="flex items-center gap-4">
            <RoleSwitcher />
            <div className="h-10 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center px-3 text-brand-blue font-bold text-sm">
              {session.displayName}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-8 py-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

# style(frontend): refine glassmorphic effects and backdrop blurs in AppLayout
