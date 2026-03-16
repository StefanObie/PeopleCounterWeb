import { CheckCircle, AlertCircle, Loader } from 'lucide-react'

const ModelStatus = ({ loaded, error }) => {
  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="text-left">
          <p className="font-medium text-red-900">Model Failed to Load</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (loaded) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        <p className="font-medium text-green-900">Model Ready</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <Loader className="w-5 h-5 text-blue-600 flex-shrink-0 animate-spin" />
      <p className="font-medium text-blue-900">Loading Model...</p>
    </div>
  )
}

export default ModelStatus
