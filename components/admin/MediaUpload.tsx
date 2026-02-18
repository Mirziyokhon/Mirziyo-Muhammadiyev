"use client"

import { useState, useRef } from 'react'
import { Upload, X, Video, Image as ImageIcon } from 'lucide-react'
import ImageCrop from './ImageCrop'

interface MediaUploadProps {
  onUploadComplete: (url: string) => void
  currentMedia?: string
  acceptVideo?: boolean
  section?: 'blog' | 'works'
}

const BLOG_ASPECT_RATIOS = {
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  '2:1': 2,
}

const WORKS_ASPECT_RATIOS = {
  '4:3': 4 / 3,
  '3:2': 3 / 2,
  'Free': 0,
}

export default function MediaUpload({ 
  onUploadComplete, 
  currentMedia, 
  acceptVideo = false,
  section = 'blog'
}: MediaUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>(currentMedia || '')
  const [showCrop, setShowCrop] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isVideo, setIsVideo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aspectRatios = section === 'blog' ? BLOG_ASPECT_RATIOS : WORKS_ASPECT_RATIOS

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      
      const fileType = file.type.split('/')[0]
      const isVideoFile = fileType === 'video'
      setIsVideo(isVideoFile)
      
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        const result = reader.result?.toString() || ''
        setPreview(result)
        
        // Show crop for images, skip for videos
        if (!isVideoFile) {
          setShowCrop(true)
        }
      })
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCrop(false)
    await uploadFile(croppedBlob)
  }

  const uploadFile = async (fileToUpload: Blob | File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      
      // Convert blob to file with proper name
      if (fileToUpload instanceof Blob && !(fileToUpload instanceof File)) {
        const fileName = selectedFile?.name || 'cropped-image.jpg'
        fileToUpload = new File([fileToUpload], fileName, { type: 'image/jpeg' })
      }
      
      formData.append('file', fileToUpload)

      const token = localStorage.getItem('adminToken')
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      const data = await res.json()

      if (data.url) {
        onUploadComplete(data.url)
        setPreview(data.url)
        setSelectedFile(null)
      } else {
        console.error('Upload failed:', data.error)
        alert('Upload failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed: ' + error)
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async () => {
    if (!selectedFile || !isVideo) return
    await uploadFile(selectedFile)
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreview('')
    setShowCrop(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* File Input */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptVideo ? "image/*,video/*" : "image/*"}
          onChange={onSelectFile}
          className="hidden"
          id="media-upload"
        />
        <label
          htmlFor="media-upload"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
        >
          {acceptVideo ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          Choose {acceptVideo ? 'Image/Video' : 'Image'}
        </label>
      </div>

      {/* Image Crop Modal */}
      {showCrop && preview && !isVideo && (
        <ImageCrop
          imageSrc={preview}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCrop(false)}
          aspectRatios={aspectRatios}
          defaultAspect={section === 'blog' ? '16:9' : '4:3'}
          section={section}
        />
      )}

      {/* Video Preview */}
      {preview && isVideo && (
        <div className="space-y-4">
          <div className="relative border-2 border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <video src={preview} controls className="w-full max-h-96 object-contain" />
          </div>

          <div className="flex gap-2">
            {selectedFile && (
              <button
                onClick={handleVideoUpload}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>
            )}
            <button
              onClick={handleRemove}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Current Media Display */}
      {currentMedia && !selectedFile && (
        <div className="relative border-2 border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden">
          {currentMedia.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={currentMedia} controls className="w-full max-h-64 object-contain" />
          ) : (
            <img src={currentMedia} alt="Current" className="w-full max-h-64 object-contain" />
          )}
        </div>
      )}

      {uploading && (
        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Uploading...
        </div>
      )}
    </div>
  )
}
