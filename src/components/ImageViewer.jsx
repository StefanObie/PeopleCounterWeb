import { useCallback, useEffect } from 'react'
import { X } from 'lucide-react'

const ImageViewer = ({
  imageBitmap,
  imageCanvasRef,
  overlayCanvasRef,
  detections,
  annotationsVisible,
  isProcessing,
  onClearImage,
}) => {
  const drawAnnotations = useCallback(() => {
    if (!overlayCanvasRef.current || !imageCanvasRef.current) return

    const overlayCanvas = overlayCanvasRef.current
    const imageCanvas = imageCanvasRef.current
    const rect = imageCanvas.getBoundingClientRect()

    if (rect.width === 0 || rect.height === 0) return

    const dpr = window.devicePixelRatio || 1
    overlayCanvas.width = Math.max(1, Math.round(rect.width * dpr))
    overlayCanvas.height = Math.max(1, Math.round(rect.height * dpr))
    overlayCanvas.style.width = `${rect.width}px`
    overlayCanvas.style.height = `${rect.height}px`

    const ctx = overlayCanvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)

    if (!annotationsVisible || detections.length === 0) {
      return
    }

    const scaleX = rect.width / imageCanvas.width
    const scaleY = rect.height / imageCanvas.height
    const lineWidth = Math.max(2, Math.round(rect.width / 320))

    ctx.lineWidth = lineWidth
    ctx.strokeStyle = '#39ff14'
    ctx.fillStyle = 'rgba(57, 255, 20, 0.18)'

    detections.forEach((d) => {
      const x = d.x1 * scaleX
      const y = d.y1 * scaleY
      const w = (d.x2 - d.x1) * scaleX
      const h = (d.y2 - d.y1) * scaleY
      ctx.strokeRect(x, y, w, h)
    })
  }, [annotationsVisible, detections, imageCanvasRef, overlayCanvasRef])

  useEffect(() => {
    if (!imageBitmap || !imageCanvasRef.current) return

    const canvas = imageCanvasRef.current
    canvas.width = imageBitmap.width
    canvas.height = imageBitmap.height

    const ctx = canvas.getContext('2d')
    ctx.drawImage(imageBitmap, 0, 0)
    requestAnimationFrame(drawAnnotations)
  }, [imageBitmap, drawAnnotations, imageCanvasRef])

  useEffect(() => {
    drawAnnotations()
  }, [drawAnnotations])

  useEffect(() => {
    const handleResize = () => drawAnnotations()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    let resizeObserver
    if (window.ResizeObserver && imageCanvasRef.current) {
      resizeObserver = new ResizeObserver(() => drawAnnotations())
      resizeObserver.observe(imageCanvasRef.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [drawAnnotations, imageCanvasRef])

  return (
    <div className="relative w-full bg-slate-100 rounded-lg overflow-auto border border-slate-200">
      {onClearImage && (
        <button
          type="button"
          onClick={onClearImage}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700"
          aria-label="Clear selected image"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {isProcessing && (
        <div className="absolute inset-0 z-10 bg-white/55 backdrop-blur-[1px] flex items-center justify-center">
          <div className="px-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
            Detecting heads...
          </div>
        </div>
      )}

      <div className="inline-block relative">
        <canvas
          ref={imageCanvasRef}
          className="block max-w-full h-auto"
        />
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>
    </div>
  )
}

export default ImageViewer
