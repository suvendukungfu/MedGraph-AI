import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CameraOff, RefreshCw, Aperture } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (file: File) => void
}

export const CameraCapture = ({ onCapture }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [isActive, setIsActive] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [showFlash, setShowFlash] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsActive(true)
      setHasPermission(true)
      setCapturedImage(null)
    } catch {
      setHasPermission(false)
      setIsActive(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsActive(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)

    // Flash effect
    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 400)

    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `prescription-capture-${Date.now()}.png`, { type: 'image/png' })
      setCapturedImage(canvas.toDataURL('image/png'))
      stopCamera()
      onCapture(file)
    }, 'image/png', 0.95)
  }, [onCapture, stopCamera])

  const retake = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  useEffect(() => {
    return () => { stopCamera() }
  }, [stopCamera])

  return (
    <div className="flex flex-col h-full">
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 flex-1 min-h-[320px] flex items-center justify-center">
        {/* Flash overlay */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-white z-30"
            />
          )}
        </AnimatePresence>

        {/* Captured image preview */}
        {capturedImage ? (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0">
            <img src={capturedImage} alt="Captured prescription" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-white/90 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Captured Successfully
              </span>
              <button onClick={retake} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white text-sm font-semibold hover:bg-white/30 transition-all">
                <RefreshCw className="w-4 h-4" /> Retake
              </button>
            </div>
          </motion.div>
        ) : isActive ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {/* Scanning overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-4 border-2 border-teal-400/40 rounded-xl" />
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-teal-400 rounded-tl-xl" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-teal-400 rounded-tr-xl" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-teal-400 rounded-bl-xl" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-teal-400 rounded-br-xl" />
              <div className="scan-line absolute inset-x-4" />
            </div>
            {/* Capture button */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={capturePhoto}
                className="group relative w-16 h-16 rounded-full bg-white shadow-xl hover:scale-110 transition-all duration-200 active:scale-95 flex items-center justify-center"
              >
                <div className="absolute inset-0 rounded-full border-4 border-white/50 group-hover:border-teal-300 transition-colors" />
                <Aperture className="w-7 h-7 text-teal-600" />
              </button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-8">
            {hasPermission === false ? (
              <>
                <CameraOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-white font-semibold">Camera Access Denied</p>
                <p className="text-slate-400 text-sm mt-2">Please allow camera permissions in your browser settings.</p>
                <button onClick={startCamera} className="mt-4 btn-secondary text-sm">Try Again</button>
              </>
            ) : (
              <>
                <div className="relative mx-auto w-20 h-20 mb-5">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-teal-400" />
                  </div>
                </div>
                <p className="text-white font-bold text-lg">Live Camera Capture</p>
                <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">Point your camera at a prescription label for instant AI-powered drug extraction.</p>
                <button onClick={startCamera} className="mt-5 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-teal-500/25 transition-all active:scale-95">
                  Start Camera
                </button>
              </>
            )}
          </motion.div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
