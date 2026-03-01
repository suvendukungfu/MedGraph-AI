import { motion } from 'framer-motion'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Upload, BarChart3, Users, Layers, LogOut, Activity, Shield } from 'lucide-react'

import { useAuthSession } from '../../hooks/useAuthSession'
import { useSystemHealth } from '../../hooks/useSystemHealth'
import { RoleSwitcher } from './RoleSwitcher'

const links = [
  { to: '/', label: 'Prescription Upload', icon: Upload },
  { to: '/dashboard', label: 'Risk Dashboard', icon: BarChart3 },
  { to: '/roles', label: 'Role Dashboards', icon: Users },
  { to: '/architecture', label: 'Architecture', icon: Layers },
]

const routeTitle: Record<string, string> = {
  '/': 'Prescription Intelligence',
  '/dashboard': 'Clinical Command Center',
  '/roles': 'Role Navigator',
  '/architecture': 'System Blueprint',
}

export const AppLayout = () => {
  const { data } = useSystemHealth()
  const { session, logout } = useAuthSession()
  const location = useLocation()

  const isReady = data?.status === 'ready'
  const title = routeTitle[location.pathname] ?? 'MediGraph Workspace'

  return (
    <div className="flex h-screen bg-gradient-mesh-light font-sans overflow-hidden">
      <Toaster position="bottom-right" richColors theme="light" />

      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col shadow-sm z-10 relative">
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />

        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-md shadow-teal-500/20 text-lg font-bold text-white overflow-hidden shimmer">
              MG
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-slate-800">MediGraph.AI</p>
              <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Clinical Safety
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 py-6 flex-1">
          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] mb-4">Workspace</p>
          <nav className="flex flex-col gap-1.5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-700 border border-teal-200/60 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <link.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-teal-500 to-emerald-500"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 space-y-2.5">
          {/* Health Status */}
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200/60 px-4 py-3 text-sm font-medium text-slate-600">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inset-0 rounded-full animate-ping opacity-50 ${typeof isReady === 'undefined' ? 'bg-slate-400' : isReady ? 'bg-emerald-500' : 'bg-amber-500'}`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${typeof isReady === 'undefined' ? 'bg-slate-400' : isReady ? 'bg-emerald-500' : 'bg-amber-500'}`}
              />
            </span>
            {typeof isReady === 'undefined' ? 'Checking...' : isReady ? 'System Online' : 'Degraded'}
          </div>

          {/* Role Badge */}
          <div className="rounded-xl bg-gradient-to-r from-slate-50 to-teal-50/50 border border-slate-200/60 px-4 py-3 text-xs text-slate-600">
            Active Role: <span className="font-bold uppercase text-teal-700 ml-1">{session.role}</span>
          </div>

          {/* Sign Out */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50/40 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition-all active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <RoleSwitcher />
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 leading-none">{session.displayName}</p>
                <p className="text-[11px] text-teal-600 font-semibold mt-1 uppercase tracking-wider">{session.role}</p>
              </div>
              {session.user?.picture ? (
                <img
                  src={session.user.picture}
                  alt={session.displayName}
                  className="h-10 w-10 rounded-full border-2 border-teal-500/20 p-0.5 object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 border-2 border-teal-500/20 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {session.displayName.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
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
