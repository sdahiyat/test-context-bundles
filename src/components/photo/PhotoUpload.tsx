'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'

interface PhotoUploadProps {
  onUploadComplete: (imageUrl: string) => void
  onError: (error: string) => void
  userId: string
}

export default function PhotoUpload({ onUploadComplete, onError, userId }: PhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20MB

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        onError('Please select an image file.')
        return
      }

      if (file.size > MAX_SIZE_BYTES) {
        onError('Image is too large. Please select an image under 20MB.')
        return
      }

      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      setIsUploading(true)

      try {
        // Read file as base64
        const base64 = await readFileAsBase64(file)

        const response = await fetch('/api/nutrition/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type,
            userId,
          }),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Upload failed')
        }

        onUploadComplete(data.imageUrl)
      } catch (error: any) {
        console.error('Upload error:', error)
        onError(error?.message || 'Failed to upload image. Please try again.')
        setPreviewUrl(null)
      } finally {
        setIsUploading(false)
      }
    },
    [userId, onUploadComplete, onError]
  )

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Return just the base64 data part (after the comma)
        resolve(result)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const clearPreview = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (previewUrl) {
    return (
      <div className="relative w-full">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900">
          <img
            src={previewUrl}
            alt="Food preview"
            className="w-full h-full object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-white font-medium">Uploading image...</p>
            </div>
          )}
          {!isUploading && (
            <button
              onClick={clearPreview}
              className="absolute top-3 right-3 w-8 h-8 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Remove image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload food photo"
      />

      <div
        onClick={triggerFileInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          w-full min-h-[280px] border-2 border-dashed rounded-xl cursor-pointer
          flex flex-col items-center justify-center gap-4 p-8
          transition-all duration-200
          ${dragOver
            ? 'border-green-400 bg-green-50/10 scale-[1.01]'
            : 'border-gray-600 hover:border-green-500 hover:bg-green-50/5'
          }
        `}
      >
        {/* Camera Icon */}
        <div className={`
          w-20 h-20 rounded-full flex items-center justify-center
          transition-colors duration-200
          ${dragOver ? 'bg-green-500/20' : 'bg-gray-800'}
        `}>
          <svg
            className={`w-10 h-10 transition-colors ${dragOver ? 'text-green-400' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-1">
            Take a photo or upload an image
          </p>
          <p className="text-gray-400 text-sm">
            Drag and drop, or tap to select
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Supports JPEG, PNG, WebP • Max 20MB
          </p>
        </div>

        <div className="flex gap-3 mt-2">
          <div className="flex items-center gap-2 bg-green-600 hover:bg-green-500 transition-colors px-4 py-2 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            <span className="text-white text-sm font-medium">Camera</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 transition-colors px-4 py-2 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-white text-sm font-medium">Gallery</span>
          </div>
        </div>
      </div>
    </div>
  )
}
