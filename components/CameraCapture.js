'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera, Upload, CheckCircle2, AlertCircle, Loader } from 'lucide-react'
import { openCameraModal, captureImage, uploadImage } from '../lib/imageUtils'

export default function CameraCapture({ 
  onImageCaptured, 
  onImageUploaded, 
  label = "Take Photo",
  description = "Capture an image for verification",
  required = false,
  multiple = false,
  maxImages = 1,
  className = ""
}) {
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')

  const handleCameraCapture = async () => {
    try {
      setUploadStatus('Opening camera...')
      const file = await openCameraModal()
      
      if (file) {
        // Add to images array
        const imageData = {
          id: Date.now(),
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          uploaded: false
        }
        
        const updatedImages = multiple 
          ? [...images, imageData].slice(0, maxImages)
          : [imageData]
        
        setImages(updatedImages)
        
        // Call callback
        if (onImageCaptured) {
          onImageCaptured(file, updatedImages)
        }
        
        // Auto upload if callback provided
        if (onImageUploaded) {
          await handleUploadImage(imageData)
        }
        
        setUploadStatus('')
      }
    } catch (error) {
      console.error('Camera capture failed:', error)
      setUploadStatus('Camera access failed')
      setTimeout(() => setUploadStatus(''), 3000)
    }
  }

  const handleFileUpload = async () => {
    try {
      setUploadStatus('Selecting file...')
      const file = await captureImage()
      
      if (file) {
        const imageData = {
          id: Date.now(),
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          uploaded: false
        }
        
        const updatedImages = multiple 
          ? [...images, imageData].slice(0, maxImages)
          : [imageData]
        
        setImages(updatedImages)
        
        // Call callback
        if (onImageCaptured) {
          onImageCaptured(file, updatedImages)
        }
        
        // Auto upload if callback provided
        if (onImageUploaded) {
          await handleUploadImage(imageData)
        }
        
        setUploadStatus('')
      }
    } catch (error) {
      console.error('File upload failed:', error)
      setUploadStatus('File selection cancelled')
      setTimeout(() => setUploadStatus(''), 3000)
    }
  }

  const handleUploadImage = async (imageData) => {
    try {
      setUploading(true)
      setUploadStatus('Uploading image...')
      
      const result = await uploadImage(imageData.file)
      
      // Update image data with upload result
      const updatedImages = images.map(img => 
        img.id === imageData.id 
          ? { ...img, uploaded: true, uploadResult: result }
          : img
      )
      setImages(updatedImages)
      
      if (onImageUploaded) {
        onImageUploaded(result, updatedImages)
      }
      
      setUploadStatus('Image uploaded successfully!')
      setTimeout(() => setUploadStatus(''), 3000)
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadStatus('Upload failed. Please try again.')
      setTimeout(() => setUploadStatus(''), 5000)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId)
    setImages(updatedImages)
    
    // Clean up preview URLs
    const removedImage = images.find(img => img.id === imageId)
    if (removedImage?.preview) {
      URL.revokeObjectURL(removedImage.preview)
    }
  }

  const canAddMore = multiple && images.length < maxImages

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-slate-800">{label}</h4>
          {required && <span className="text-red-500 text-sm">*</span>}
        </div>
        <p className="text-sm text-slate-600">{description}</p>
        {multiple && (
          <p className="text-xs text-slate-500 mt-1">
            {images.length} of {maxImages} images selected
          </p>
        )}
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((image) => (
            <div key={image.id} className="relative">
              <div className="relative w-full h-32">
                <Image 
                  src={image.preview}
                  alt={image.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="object-cover rounded-lg border border-slate-200"
                  unoptimized
                />
                
                {/* Upload Status Overlay */}
                {image.uploaded ? (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                ) : uploading ? (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <Loader className="w-6 h-6 text-white animate-spin" />
                  </div>
                ) : null}
                
                {/* Remove Button */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 left-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              
              {/* Image Info */}
              <div className="mt-2 text-xs text-slate-500">
                <p className="truncate">{image.name}</p>
                <p>{(image.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {(images.length === 0 || canAddMore) && (
        <div className="flex gap-3">
          {/* Camera Button */}
          <button
            onClick={handleCameraCapture}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span>Take Photo</span>
          </button>
          
          {/* Upload Button */}
          <button
            onClick={handleFileUpload}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload</span>
          </button>
        </div>
      )}

      {/* Status Message */}
      {uploadStatus && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${ 
          uploadStatus.includes('success') || uploadStatus.includes('uploaded')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : uploadStatus.includes('failed') || uploadStatus.includes('error')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {uploading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : uploadStatus.includes('success') ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : uploadStatus.includes('failed') ? (
            <AlertCircle className="w-4 h-4" />
          ) : null}
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="text-sm text-amber-700">
          <p className="font-medium mb-1">📷 Photo Guidelines:</p>
          <ul className="space-y-1 text-xs">
            <li>• Ensure good lighting for clear visibility</li>
            <li>• Include the complete order/package in frame</li>
            <li>• Keep the image steady and in focus</li>
            {required && <li>• This photo is required to continue</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
