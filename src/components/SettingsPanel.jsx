const SettingsPanel = ({ confidence, setConfidence, iou, setIou }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Confidence Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="font-medium text-slate-900">Confidence Threshold</label>
          <span className="text-sm font-semibold text-accent bg-accent-light px-3 py-1 rounded-full">
            {confidence}%
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="95"
          step="1"
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <p className="text-xs text-slate-500">
          Lower values detect more people but may include false positives
        </p>
      </div>

      {/* IoU Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="font-medium text-slate-900">IoU Threshold</label>
          <span className="text-sm font-semibold text-accent bg-accent-light px-3 py-1 rounded-full">
            {iou}%
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="95"
          step="1"
          value={iou}
          onChange={(e) => setIou(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <p className="text-xs text-slate-500">
          Lower values remove more overlapping detections
        </p>
      </div>
    </div>
  )
}

export default SettingsPanel
