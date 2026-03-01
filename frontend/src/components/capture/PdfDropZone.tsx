import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileUp, X, FileText, Image as ImageIcon } from 'lucide-react'

interface PdfDropZoneProps {
  onFileSelected: (file: File) => void
  selectedFile: File | null
  onClear: () => void
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
  return <ImageIcon className="w-5 h-5 text-teal-500" />
}

export const PdfDropZone = ({ onFileSelected, selectedFile, onClear }: PdfDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = useCallback((file: File | null) => {
    if (!file) return
    onFileSelected(file)

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }, [onFileSelected])

  const handleClear = () => {
    setPreview(null)
    onClear()
  }

  return (
    <div className="flex flex-col h-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFile(e.dataTransfer.files?.[0] ?? null)
        }}
        className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 flex-1 min-h-[320px] flex flex-col items-center justify-center overflow-hidden ${
          isDragging
            ? 'border-teal-500 bg-teal-50/80 scale-[1.01]'
            : selectedFile
              ? 'border-teal-300 bg-teal-50/30'
              : 'border-slate-300 bg-slate-50/50 hover:border-teal-400 hover:bg-teal-50/20 cursor-pointer'
        }`}
      >
        {/* Background hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full h-full flex flex-col items-center justify-center p-6"
            >
              {/* Image preview */}
              {preview && (
                <div className="relative w-full max-h-48 rounded-xl overflow-hidden mb-4 border border-slate-200 shadow-sm">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain bg-white" />
                </div>
              )}

              {/* File info card */}
              <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm w-full max-w-sm">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200">
                  {getFileIcon(selectedFile.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={handleClear}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Upload another */}
              <label className="mt-4 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors cursor-pointer">
                Change File
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-8"
            >
              <div className="relative mx-auto w-16 h-16 mb-5">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileUp className="w-8 h-8 text-teal-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <p className="text-lg font-bold text-slate-800 tracking-tight">Drop Prescription Here</p>
              <p className="mt-1.5 text-sm text-slate-500">Drag & drop or browse for PDF or image files.</p>
              <p className="mt-1 text-xs text-slate-400">Supports PNG, JPG, WebP, PDF</p>

              <label className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer shadow-sm">
                <FileUp className="w-4 h-4" />
                Browse Files
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
