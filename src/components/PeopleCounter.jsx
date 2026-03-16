import { useState, useRef } from 'react'
import { ChevronDown, Eye, EyeOff, Download } from 'lucide-react'
import * as ort from 'onnxruntime-web'
import ModelStatus from './ModelStatus'
import ImageUploader from './ImageUploader'
import SettingsPanel from './SettingsPanel'
import ImageViewer from './ImageViewer'
import { useOnnxModel } from '../hooks/useOnnxModel'

const waitForNextPaint = () => new Promise((resolve) => {
  requestAnimationFrame(() => requestAnimationFrame(resolve))
})

const PeopleCounter = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageBitmap, setImageBitmap] = useState(null)
  const [detections, setDetections] = useState([])
  const [annotationsVisible, setAnnotationsVisible] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [confidence, setConfidence] = useState(35)
  const [iou, setIou] = useState(60)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState('Select an image to start')
  
  const { session, modelLoaded, modelError } = useOnnxModel()
  const imageCanvasRef = useRef(null)
  const overlayCanvasRef = useRef(null)

  const clearSelectedImage = () => {
    setSelectedImage(null)
    setImageBitmap(null)
    setDetections([])
    setAnnotationsVisible(true)
    setStatus('Select an image to start')
  }

  const handleImageSelect = async (file) => {
    try {
      setStatus('Loading image...')
      if (imageBitmap) {
        imageBitmap.close()
      }
      
      const bitmap = await createImageBitmap(file)
      setImageBitmap(bitmap)
      setSelectedImage(file)
      setDetections([])
      setAnnotationsVisible(true)
      setStatus('Ready to detect. Click Run Detection.')
    } catch (error) {
      setStatus('Failed to load image')
      console.error(error)
    }
  }

  const runDetection = async () => {
    if (!session || !imageBitmap) {
      setStatus('Model not ready or no image selected')
      return
    }

    setIsProcessing(true)
    setStatus('Preparing detection...')

    try {
      // Let React paint the loading state before running CPU-heavy preprocessing/inference.
      await waitForNextPaint()
      setStatus('Running model inference...')

      const detectionResults = await detectPeople(imageBitmap, session, confidence / 100, iou / 100)
      setDetections(detectionResults)
      setStatus('')
    } catch (error) {
      setStatus('Detection failed. Please try again.')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const drawDetectionsOnContext = (ctx, detections, canvasWidth) => {
    const lineWidth = Math.max(2, Math.round(canvasWidth / 400))
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = '#39ff14'

    detections.forEach((d) => {
      const w = d.x2 - d.x1
      const h = d.y2 - d.y1
      ctx.strokeRect(d.x1, d.y1, w, h)
    })
  }

  const toggleAnnotations = () => {
    setAnnotationsVisible((prev) => !prev)
  }

  const downloadImage = () => {
    if (!imageCanvasRef.current || !overlayCanvasRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = imageCanvasRef.current.width
    canvas.height = imageCanvasRef.current.height

    const ctx = canvas.getContext('2d')
    ctx.drawImage(imageCanvasRef.current, 0, 0)

    // Always include annotations in download at source resolution
    drawDetectionsOnContext(ctx, detections, canvas.width)

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `people-count-${detections.length}.png`
      link.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 lg:py-12 flex flex-col gap-6">
      {isProcessing && (
        <div className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[2px] flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-xl p-5">
            <div>
              <p className="text-base font-semibold text-slate-900">Detecting people</p>
              <p className="text-sm text-slate-600">This can take a few seconds on mobile.</p>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div className="loading-indicator h-full rounded-full bg-accent" />
            </div>
            <p className="mt-3 text-xs text-slate-500">Tip: keep this tab active for fastest inference.</p>
          </div>
        </div>
      )}

      {/* Model Status Header */}
      <ModelStatus loaded={modelLoaded} error={modelError} />
      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Image Upload Section */}
        {!selectedImage ? (
          <ImageUploader onImageSelect={handleImageSelect} />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Image Viewer */}
            <ImageViewer
              imageBitmap={imageBitmap}
              imageCanvasRef={imageCanvasRef}
              overlayCanvasRef={overlayCanvasRef}
              detections={detections}
              annotationsVisible={annotationsVisible}
              isProcessing={isProcessing}
              onClearImage={clearSelectedImage}
            />

            {/* Controls Below Image */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={runDetection}
                disabled={isProcessing || !modelLoaded}
                className="btn btn-primary flex-1"
              >
                {isProcessing ? (
                  'Running detection...'
                ) : (
                  'Run Detection'
                )}
              </button>

              {detections.length > 0 && (
                <>
                  <button
                    onClick={toggleAnnotations}
                    className="btn btn-secondary flex-1"
                  >
                    {annotationsVisible ? (
                      <>
                        <Eye className="w-4 h-4" />
                        Hide
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Show
                      </>
                    )}
                  </button>

                  <button
                    onClick={downloadImage}
                    className="btn btn-secondary flex-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </>
              )}

            </div>

            {/* Result Count */}
            {detections.length > 0 && (
              <div className="text-center p-4 bg-accent-light rounded-lg">
                <p className="text-sm text-slate-600">People Detected</p>
                <p className="text-3xl font-bold text-accent">{detections.length}</p>
              </div>
            )}

            {/* Status */}
            {status ? <p className="text-sm text-slate-600 text-center">{status}</p> : null}
          </div>
        )}

        {/* Settings Panel */}
        <div className="card">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="font-medium text-slate-900">Advanced Settings</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${showSettings ? 'rotate-180' : ''}`}
            />
          </button>

          {showSettings && (
            <div className="border-t border-slate-200 p-4">
              <SettingsPanel
                confidence={confidence}
                setConfidence={setConfidence}
                iou={iou}
                setIou={setIou}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// Detection logic (moved from original app.js)
const INPUT_SIZE = 640
const HEAD_CLASS_ID = 1

async function detectPeople(imageBitmap, session, confThreshold, iouThreshold) {
  const prep = buildInputTensorFromImage(imageBitmap)
  const inputName = session.inputNames[0]
  const outputName = session.outputNames[0]

  const feeds = { [inputName]: prep.tensor }
  const outputMap = await session.run(feeds)
  const rawOutput = outputMap[outputName] || outputMap[Object.keys(outputMap)[0]]

  const parsed = parseOutput(rawOutput, confThreshold)
  const mapped = mapToOriginal(parsed, prep)
  const filtered = nms(mapped, iouThreshold)

  return filtered
}

function buildInputTensorFromImage(image) {
  const srcW = image.width
  const srcH = image.height
  const scale = Math.min(INPUT_SIZE / srcW, INPUT_SIZE / srcH)

  const resizedW = Math.round(srcW * scale)
  const resizedH = Math.round(srcH * scale)
  const padX = Math.floor((INPUT_SIZE - resizedW) / 2)
  const padY = Math.floor((INPUT_SIZE - resizedH) / 2)

  const prepCanvas = document.createElement('canvas')
  prepCanvas.width = INPUT_SIZE
  prepCanvas.height = INPUT_SIZE
  const prepCtx = prepCanvas.getContext('2d', { willReadFrequently: true })
  prepCtx.fillStyle = '#000000'
  prepCtx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE)
  prepCtx.imageSmoothingEnabled = true
  prepCtx.drawImage(image, 0, 0, srcW, srcH, padX, padY, resizedW, resizedH)

  const pixels = prepCtx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE).data
  const floatData = new Float32Array(1 * 3 * INPUT_SIZE * INPUT_SIZE)
  const area = INPUT_SIZE * INPUT_SIZE

  for (let i = 0; i < area; i += 1) {
    const p = i * 4
    floatData[i] = pixels[p] / 255.0
    floatData[i + area] = pixels[p + 1] / 255.0
    floatData[i + area * 2] = pixels[p + 2] / 255.0
  }

  return {
    tensor: new ort.Tensor('float32', floatData, [1, 3, INPUT_SIZE, INPUT_SIZE]),
    scale,
    padX,
    padY,
    sourceWidth: srcW,
    sourceHeight: srcH,
  }
}

function parseOutput(rawOutput, confThreshold) {
  const dims = rawOutput.dims
  const data = rawOutput.data

  let rows
  let cols
  let rowGetter

  if (dims.length === 3 && dims[1] > 1000 && dims[2] <= 256) {
    rows = dims[1]
    cols = dims[2]
    rowGetter = (r, c) => data[r * cols + c]
  } else if (dims.length === 3 && dims[2] > 1000 && dims[1] <= 256) {
    rows = dims[2]
    cols = dims[1]
    rowGetter = (r, c) => data[c * rows + r]
  } else {
    throw new Error(`Unsupported output shape: [${dims.join(', ')}]`)
  }

  const detections = []

  for (let r = 0; r < rows; r += 1) {
    const cx = rowGetter(r, 0)
    const cy = rowGetter(r, 1)
    const w = rowGetter(r, 2)
    const h = rowGetter(r, 3)

    const objectness = cols > 4 ? rowGetter(r, 4) : 1.0
    if (objectness < 1e-6) {
      continue
    }

    let bestClass = 0
    let bestClassScore = 1.0

    if (cols > 5) {
      bestClassScore = -Infinity
      for (let c = 5; c < cols; c += 1) {
        const score = rowGetter(r, c)
        if (score > bestClassScore) {
          bestClassScore = score
          bestClass = c - 5
        }
      }
    } else if (cols === 5) {
      bestClass = HEAD_CLASS_ID
      bestClassScore = 1.0
    }

    const confidence = objectness * bestClassScore
    if (confidence < confThreshold) {
      continue
    }

    if (bestClass !== HEAD_CLASS_ID) {
      continue
    }

    detections.push({
      x1: cx - w / 2,
      y1: cy - h / 2,
      x2: cx + w / 2,
      y2: cy + h / 2,
      confidence,
      classId: bestClass,
    })
  }

  return detections
}

function mapToOriginal(detections, prep) {
  const out = []
  for (const d of detections) {
    const x1 = (d.x1 - prep.padX) / prep.scale
    const y1 = (d.y1 - prep.padY) / prep.scale
    const x2 = (d.x2 - prep.padX) / prep.scale
    const y2 = (d.y2 - prep.padY) / prep.scale

    out.push({
      x1: clamp(x1, 0, prep.sourceWidth),
      y1: clamp(y1, 0, prep.sourceHeight),
      x2: clamp(x2, 0, prep.sourceWidth),
      y2: clamp(y2, 0, prep.sourceHeight),
      confidence: d.confidence,
    })
  }
  return out
}

function iou(a, b) {
  const x1 = Math.max(a.x1, b.x1)
  const y1 = Math.max(a.y1, b.y1)
  const x2 = Math.min(a.x2, b.x2)
  const y2 = Math.min(a.y2, b.y2)
  const interW = Math.max(0, x2 - x1)
  const interH = Math.max(0, y2 - y1)
  const inter = interW * interH
  if (inter <= 0) {
    return 0
  }

  const areaA = Math.max(0, a.x2 - a.x1) * Math.max(0, a.y2 - a.y1)
  const areaB = Math.max(0, b.x2 - b.x1) * Math.max(0, b.y2 - b.y1)
  return inter / (areaA + areaB - inter + 1e-6)
}

function nms(dets, iouThreshold) {
  const sorted = [...dets].sort((a, b) => b.confidence - a.confidence)
  const keep = []

  while (sorted.length) {
    const candidate = sorted.shift()
    keep.push(candidate)
    for (let i = sorted.length - 1; i >= 0; i -= 1) {
      if (iou(candidate, sorted[i]) > iouThreshold) {
        sorted.splice(i, 1)
      }
    }
  }

  return keep
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

export default PeopleCounter
