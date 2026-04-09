'use client'

import { useState, useEffect } from 'react'
import { RecognizedFood, MealType, NutritionTotals } from '@/types/nutrition'
import PhotoUpload from './PhotoUpload'
import RecognitionResults from './RecognitionResults'

type Step = 'upload' | 'analyzing' | 'results' | 'saving' | 'success' | 'error'

interface PhotoRecognitionFlowProps {
  userId: string
  onMealLogged: (mealId: string) => void
  onClose: () => void
}

export default function PhotoRecognitionFlow({
  userId,
  onMealLogged,
  onClose,
}: PhotoRecognitionFlowProps) {
  const [step, setStep] = useState<Step>('upload')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [recognizedFoods, setRecognizedFoods] = useState<RecognizedFood[]>([])
  const [error, setError] = useState<string | null>(null)
  const [savedMealId, setSavedMealId] = useState<string | null>(null)
  const [mealTotals, setMealTotals] = useState<NutritionTotals | null>(null)

  // Auto-close after success
  useEffect(() => {
    if (step === 'success' && savedMealId) {
      const timer = setTimeout(() => {
        onMealLogged(savedMealId)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [step, savedMealId, onMealLogged])

  const handleUploadComplete = async (url: string) => {
    setImageUrl(url)
    setStep('analyzing')
    setError(null)

    try {
      const response = await fetch('/api/nutrition/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url, userId }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze image')
      }

      setRecognizedFoods(data.foods || [])
      setStep('results')
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err?.message || 'Failed to analyze the image.')
      setStep('error')
    }
  }

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage)
    setStep('error')
  }

  const handleConfirm = async (foods: RecognizedFood[], mealType: MealType) => {
    setStep('saving')
    setError(null)

    const totals: NutritionTotals = foods.reduce(
      (acc, f) => ({
        calories: acc.calories + f.calories,
        protein: acc.protein + f.protein,
        carbs: acc.carbs + f.carbs,
        fat: acc.fat + f.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )

    try {
      const response = await fetch('/api/nutrition/save-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mealType,
          foods,
          imageUrl: imageUrl || '',
          loggedAt: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to save meal')
      }

      setSavedMealId(data.mealId)
      setMealTotals(totals)
      setStep('success')
    } catch (err: any) {
      console.error('Save meal error:', err)
      setError(err?.message || 'Failed to save the meal. Please try again.')
      setStep('error')
    }
  }

  const handleRetry = () => {
    setImageUrl(null)
    setRecognizedFoods([])
    setError(null)
    setStep('upload')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe py-4 border-b border-gray-800">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-white font-semibold">AI Photo Logging</h1>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Upload step */}
        {step === 'upload' && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-white text-xl font-bold mb-1">Snap your meal</h2>
              <p className="text-gray-400 text-sm">Take a photo or upload an image — AI will identify the foods for you</p>
            </div>
            <PhotoUpload
              onUploadComplete={handleUploadComplete}
              onError={handleUploadError}
              userId={userId}
            />
            <div className="text-center">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-sm underline transition-colors"
              >
                Enter meal manually instead
              </button>
            </div>
          </div>
        )}

        {/* Analyzing step */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            {imageUrl && (
              <div className="relative w-full max-w-sm h-48 rounded-2xl overflow-hidden">
                <img src={imageUrl} alt="Analyzing" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-3 animate-bounce">🤖</div>
                    <div className="w-8 h-8 border-3 border-green-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                </div>
              </div>
            )}
            <div className="text-center">
              <p className="text-white text-xl font-bold mb-2">Analyzing your food with AI...</p>
              <p className="text-gray-400 text-sm">This usually takes 5-10 seconds</p>
            </div>
            <div className="flex gap-2">
              {['Identifying foods', 'Estimating portions', 'Calculating nutrition'].map((label, i) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 bg-gray-800 rounded-full px-3 py-1.5"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-gray-300 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results step */}
        {(step === 'results') && (
          <RecognitionResults
            foods={recognizedFoods}
            imageUrl={imageUrl || ''}
            onConfirm={handleConfirm}
            onRetry={handleRetry}
            onManualEntry={onClose}
            isLoading={false}
          />
        )}

        {/* Saving step */}
        {step === 'saving' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white text-xl font-bold">Saving your meal...</p>
              <p className="text-gray-400 text-sm mt-1">Updating your nutrition log</p>
            </div>
          </div>
        )}

        {/* Success step */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-bold mb-1">Meal logged! 🎉</p>
              <p className="text-gray-400 text-sm">Your nutrition has been updated</p>
            </div>

            {mealTotals && (
              <div className="w-full bg-gray-800 rounded-2xl p-5">
                <p className="text-gray-400 text-sm font-medium mb-4 text-center">Meal summary</p>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-green-400 font-bold text-xl">{Math.round(mealTotals.calories)}</p>
                    <p className="text-gray-500 text-xs mt-0.5">calories</p>
                  </div>
                  <div>
                    <p className="text-blue-400 font-bold text-xl">{Math.round(mealTotals.protein)}g</p>
                    <p className="text-gray-500 text-xs mt-0.5">protein</p>
                  </div>
                  <div>
                    <p className="text-yellow-400 font-bold text-xl">{Math.round(mealTotals.carbs)}g</p>
                    <p className="text-gray-500 text-xs mt-0.5">carbs</p>
                  </div>
                  <div>
                    <p className="text-red-400 font-bold text-xl">{Math.round(mealTotals.fat)}g</p>
                    <p className="text-gray-500 text-xs mt-0.5">fat</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => savedMealId && onMealLogged(savedMealId)}
              className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold transition-colors"
            >
              View Dashboard
            </button>
            <p className="text-gray-500 text-xs">Redirecting automatically...</p>
          </div>
        )}

        {/* Error step */}
        {step === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white text-xl font-bold mb-2">Something went wrong</p>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                {error || 'Failed to process your image. Please try again.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={handleRetry}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl font-medium transition-colors"
              >
                Enter Manually
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
