import { useEffect, useMemo, useState } from 'react'

import type { UserRole } from '../types/auth'
import type { RoleStreamEvent } from '../types/stream'

const DEMO_MODE = (import.meta.env.VITE_DEMO_MODE ?? 'false').toLowerCase() === 'true'
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? 'ws://localhost:8000/ws'

const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const demoMessages: Record<UserRole, string[]> = {
  admin: [
    'Queue latency elevated on notification worker.',
    'Audit export completed for tenant clinic-alpha.',
    'Emergency acknowledgment SLA improved this hour.',
  ],
  doctor: [
    'Patient #P-104 moved to high-risk band.',
    'New contraindicated interaction alert awaiting review.',
    'Schedule optimization requested for polypharmacy case.',
  ],
  patient: [
    'Reminder: Evening dose due in 30 minutes.',
    'Great adherence streak: 6 doses on-time.',
    'Caretaker acknowledged your missed-dose alert.',
  ],
  caretaker: [
    'Missed-dose escalation triggered for dependent.',
    'Doctor updated treatment instructions.',
    'Emergency event acknowledged by clinic responder.',
  ],
}

export const useRoleEventStream = (role: UserRole) => {
  const [events, setEvents] = useState<RoleStreamEvent[]>([])
  const [connectionState, setConnectionState] = useState<'connecting' | 'live' | 'offline'>(
    DEMO_MODE ? 'live' : 'connecting',
  )

  useEffect(() => {
    let ws: WebSocket | null = null
    let intervalId: number | null = null

    const pushEvent = (message: string, level: RoleStreamEvent['level']) => {
      setEvents((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          role,
          level,
          message,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 8))
    }

    if (DEMO_MODE) {
      intervalId = window.setInterval(() => {
        pushEvent(randomFrom(demoMessages[role]), randomFrom(['info', 'warning', 'critical']))
      }, 9000)

      return () => {
        if (intervalId) window.clearInterval(intervalId)
      }
    }

    try {
      ws = new WebSocket(`${WS_BASE_URL}/roles/${role}`)

      ws.onopen = () => {
        setConnectionState('live')
      }

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as RoleStreamEvent
          setEvents((prev) => [payload, ...prev].slice(0, 8))
        } catch {
          pushEvent(String(event.data), 'info')
        }
      }

      ws.onerror = () => {
        setConnectionState('offline')
      }

      ws.onclose = () => {
        setConnectionState('offline')
      }
    } catch {
      window.setTimeout(() => setConnectionState('offline'), 0)
    }

    return () => {
      ws?.close()
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [role])

  const statusLabel = useMemo(() => {
    if (connectionState === 'live') return 'Live feed connected'
    if (connectionState === 'connecting') return 'Connecting feed'
    return 'Feed offline'
  }, [connectionState])

  return {
    events,
    connectionState,
    statusLabel,
  }
}
