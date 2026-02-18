"use client"

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

interface Point {
  x: number
  y: number
}

interface Area {
  x: number
  y: number
  width: number
  height: number
}

interface ImageCropProps {
  imageSrc: string
  onCropComplete: (croppedBlob: Blob) => void
  onCancel: () => void
  aspectRatios: { [key: string]: number }
  defaultAspect?: string
  section: 'blog' | 'works'
}

export default function ImageCrop({ 
  imageSrc, 
  onCropComplete, 
  onCancel, 
  aspectRatios,
  defaultAspect = '16:9',
  section 
}: ImageCropProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [selectedAspect, setSelectedAspect] = useState(defaultAspect)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 })
  const [showPreview, setShowPreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  const onCropChange = (location: Point) => {
    setCrop(location)
  }

  const onCropCompleteInternal = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
    const width = Math.round(croppedAreaPixels.width)
    const height = Math.round(croppedAreaPixels.height)
    setDimensions({ width, height })
    
    // Check for unusual aspect ratios in free mode
    if (selectedAspect === 'Custom' && width > 0 && height > 0) {
      const ratio = width / height
      if (ratio > 3 || ratio < 1/3) {
        console.warn('Unusual proportions detected')
      }
    }
  }, [selectedAspect])
  
  // Load original image dimensions
  useCallback(() => {
    const img = new Image()
    img.onload = () => {
      setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.src = imageSrc
  }, [imageSrc])()

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return

    const image = new Image()
    image.src = imageSrc
    
    await new Promise((resolve) => {
      image.onload = resolve
    })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = croppedAreaPixels.width
    canvas.height = croppedAreaPixels.height

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    )

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, 'image/jpeg', section === 'works' ? 0.85 : 0.82)
    })
  }

  const handlePreview = async () => {
    const croppedBlob = await createCroppedImage()
    if (croppedBlob) {
      const url = URL.createObjectURL(croppedBlob)
      setPreviewUrl(url)
      setShowPreview(true)
    }
  }

  const handleCrop = async () => {
    const croppedBlob = await createCroppedImage()
    if (croppedBlob) {
      onCropComplete(croppedBlob)
    }
  }

  const handleReset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setShowPreview(false)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    }
  }
  
  const getUnusualAspectWarning = () => {
    if (selectedAspect !== 'Custom' || dimensions.width === 0) return null
    const ratio = dimensions.width / dimensions.height
    if (ratio > 3 || ratio < 1/3) {
      return 'Unusual proportions may affect layout'
    }
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-[#fefdfb] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200">
          <h2 className="font-crimson text-2xl font-semibold text-[#1a1a1a]">Crop Image</h2>
        </div>

        {/* Crop Area */}
        <div className="p-6">
          <div className="relative h-[500px] bg-[#fefdfb] rounded-lg overflow-hidden border-2 border-[#8B6F47]/20">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatios[selectedAspect]}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteInternal}
              onZoomChange={setZoom}
              style={{
                containerStyle: {
                  backgroundColor: '#fefdfb',
                },
                cropAreaStyle: {
                  border: '2px solid #8B6F47',
                  color: 'rgba(26, 26, 26, 0.3)',
                },
              }}
              showGrid={true}
              objectFit="contain"
            />
            
            {/* Dimensions Display */}
            {dimensions.width > 0 && (
              <div className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-md">
                <span className="font-lora text-sm text-[#1a1a1a]">
                  {dimensions.width} × {dimensions.height}px
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-6 space-y-4">
            {/* Dimensions Display */}
            <div className="flex items-center justify-between text-sm font-lora text-[#1a1a1a]">
              <div>
                <span className="text-zinc-500">Original:</span> {originalDimensions.width} × {originalDimensions.height}px
              </div>
              <div>
                <span className="text-zinc-500">Cropped:</span> {dimensions.width} × {dimensions.height}px
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="flex items-center gap-4">
              <label className="font-crimson text-base text-[#1a1a1a]">
                Aspect Ratio
              </label>
              <select
                value={selectedAspect}
                onChange={(e) => setSelectedAspect(e.target.value)}
                className="px-4 py-2 border border-zinc-300 rounded-lg font-lora text-base text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#8B6F47]"
              >
                {Object.keys(aspectRatios).map((key) => (
                  <option key={key} value={key}>
                    {key === 'Free' ? 'Custom' : key}
                  </option>
                ))}
              </select>
            </div>

            {/* Warning for unusual aspect ratios */}
            {getUnusualAspectWarning() && (
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 font-lora">
                {getUnusualAspectWarning()}
              </div>
            )}

            {/* Preview Section */}
            {showPreview && previewUrl && (
              <div className="border-t border-zinc-200 pt-4">
                <h3 className="font-crimson text-base text-[#1a1a1a] mb-2">Preview</h3>
                <div className="relative max-w-md mx-auto border-2 border-[#8B6F47]/20 rounded-lg overflow-hidden">
                  <img src={previewUrl} alt="Crop preview" className="w-full h-auto" />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-[#1a1a1a] hover:bg-zinc-100 rounded-lg transition-colors font-lora"
              >
                Reset
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 border border-zinc-300 text-[#1a1a1a] hover:bg-zinc-50 rounded-lg transition-colors font-lora"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePreview}
                  className="px-6 py-2 border border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47]/10 rounded-lg transition-colors font-lora"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={handleCrop}
                  className="px-6 py-2 bg-[#8B6F47] text-white hover:bg-[#6d5638] rounded-lg transition-colors font-lora"
                >
                  Crop & Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
