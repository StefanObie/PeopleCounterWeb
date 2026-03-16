import { useState, useEffect } from 'react'
import * as ort from 'onnxruntime-web'

export const useOnnxModel = () => {
  const [session, setSession] = useState(null)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [modelError, setModelError] = useState(null)

  useEffect(() => {
    const loadModel = async () => {
      try {
        // Set WASM path to the node_modules location
        ort.env.wasm.wasmPaths = '/node_modules/onnxruntime-web/dist/'

        // Configure ONNX Runtime
        ort.env.wasm.numThreads = 1 // Disable threading for better compatibility
        ort.env.wasm.simd = false // Disable SIMD for simpler setup

        const sess = await ort.InferenceSession.create('crowdhuman_yolov5m.onnx', {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all',
        })

        setSession(sess)
        setModelLoaded(true)
      } catch (error) {
        console.error('Failed to load ONNX model:', error)
        setModelError(error.message || 'Failed to load model')
        setModelLoaded(false)
      }
    }

    loadModel()
  }, [])

  return { session, modelLoaded, modelError }
}
