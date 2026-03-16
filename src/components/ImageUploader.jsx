import { Upload } from 'lucide-react'
import { useRef } from 'react'

const ImageUploader = ({ onImageSelect }) => {
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.add('bg-blue-50', 'border-accent')
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.remove('bg-blue-50', 'border-accent')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.remove('bg-blue-50', 'border-accent')

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div
      ref={dropZoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className="w-full p-8 md:p-12 border-2 border-dashed border-slate-300 rounded-lg bg-white cursor-pointer transition-colors duration-200 hover:border-accent hover:bg-slate-50"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center gap-4">
        <div className="p-4 bg-blue-50 rounded-full">
          <Upload className="w-8 h-8 text-accent" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-900">Upload or Drag & Drop</p>
          <p className="text-sm text-slate-600">PNG, JPG, GIF or WebP</p>
        </div>
      </div>
    </div>
  )
}

export default ImageUploader
