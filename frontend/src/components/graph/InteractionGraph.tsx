import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import type { Core } from 'cytoscape'

import type { InteractionPair } from '../../types/interactions'
import { buildGraphElements } from '../../utils/graph'

interface InteractionGraphProps {
  drugs: string[]
  interactions: InteractionPair[]
}

export const InteractionGraph = ({ drugs, interactions }: InteractionGraphProps) => {
  const graphRef = useRef<HTMLDivElement | null>(null)
  const cyRef = useRef<Core | null>(null)
  const [selectedEdgeExplanation, setSelectedEdgeExplanation] = useState<string | null>(null)

  useEffect(() => {
    if (!graphRef.current) return

    const elements = buildGraphElements(drugs, interactions)

    if (cyRef.current) {
      cyRef.current.destroy()
    }

    cyRef.current = cytoscape({
      container: graphRef.current,
      elements,
      layout: {
        name: 'cose',
        animate: true,
      },
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'background-color': '#1f7b80',
            color: '#0f172a',
            'font-size': '11px',
            'text-wrap': 'wrap',
            'text-max-width': '86px',
            'text-valign': 'center',
            'text-halign': 'center',
            width: '44px',
            height: '44px',
            'border-width': '2px',
            'border-color': '#ffffff',
          },
        },
        {
          selector: 'edge',
          style: {
            width: '3px',
            'line-color': 'data(color)',
            'target-arrow-color': 'data(color)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            opacity: 0.8,
          },
        },
      ],
    })

    cyRef.current.on('tap', 'edge', (event) => {
      const explanation = event.target.data('explanation') as string | undefined
      setSelectedEdgeExplanation(explanation ?? null)
    })

    cyRef.current.on('tap', 'node', () => {
      setSelectedEdgeExplanation(null)
    })

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
        cyRef.current = null
      }
    }
  }, [drugs, interactions])

  return (
    <div>
      <div ref={graphRef} className="h-80 w-full rounded-xl border border-slate-200 bg-white" />
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
        <LegendChip tone="bg-emerald-500" label="Mild" />
        <LegendChip tone="bg-amber-500" label="Moderate" />
        <LegendChip tone="bg-rose-500" label="Severe" />
        <LegendChip tone="bg-slate-900" label="Contraindicated" />
      </div>
      {selectedEdgeExplanation ? (
        <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Selected edge detail:</span> {selectedEdgeExplanation}
        </div>
      ) : null}
    </div>
  )
}

interface LegendChipProps {
  tone: string
  label: string
}

const LegendChip = ({ tone, label }: LegendChipProps) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1">
    <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />
    {label}
  </span>
)
