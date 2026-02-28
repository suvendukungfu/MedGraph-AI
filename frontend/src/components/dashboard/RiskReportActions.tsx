import { useState } from 'react'
import { Link } from 'react-router-dom'

import type { DashboardWorkflowState } from '../../types/workflow'

interface RiskReportActionsProps {
  workflow: DashboardWorkflowState
}

export const RiskReportActions = ({ workflow }: RiskReportActionsProps) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPdf = async () => {
    setIsExporting(true)
    try {
      const { exportRiskReportPdf } = await import('../../utils/reportPdf')
      const filename = exportRiskReportPdf(workflow)
      setToastMessage(`Exported ${filename}`)
      window.setTimeout(() => setToastMessage(null), 2200)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link to="/" className="btn-secondary">
        New Analysis
      </Link>
      <button type="button" onClick={handleExportPdf} className="btn-primary" disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export PDF Report'}
      </button>

      {toastMessage ? (
        <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:w-auto">
          {toastMessage}
        </div>
      ) : null}
    </div>
  )
}
