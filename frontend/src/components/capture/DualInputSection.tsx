import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, FileUp, Scan } from 'lucide-react'

import { CameraCapture } from './CameraCapture'
import { PdfDropZone } from './PdfDropZone'

type InputTab = 'camera' | 'upload'

interface DualInputSectionProps {
  onFileReady: (file: File | null) => void
  selectedFile: File | null
}

export const DualInputSection = ({ onFileReady, selectedFile }: DualInputSectionProps) => {
  const [activeTab, setActiveTab] = useState<InputTab>('upload')

  const handleCameraCapture = (file: File) => {
    onFileReady(file)
    // Stay on camera tab so user sees the captured preview
  }

  const handleFileSelected = (file: File) => {
    onFileReady(file)
  }

  const handleClear = () => {
    onFileReady(null)
  }

  const tabs: { id: InputTab; label: string; icon: typeof Camera }[] = [
    { id: 'camera', label: 'Live Camera', icon: Camera },
    { id: 'upload', label: 'PDF / Image Upload', icon: FileUp },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header with scanning indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-sm">
            <Scan className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Prescription Input</p>
            <p className="text-xs text-slate-500">Capture or upload for AI extraction</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id ? 'tab-active' : 'tab-inactive'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'camera' ? (
          <CameraCapture onCapture={handleCameraCapture} />
        ) : (
          <PdfDropZone
            onFileSelected={handleFileSelected}
            selectedFile={selectedFile}
            onClear={handleClear}
          />
        )}
      </div>
    </div>
  )
}
