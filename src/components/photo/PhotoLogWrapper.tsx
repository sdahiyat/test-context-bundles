'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const PhotoRecognitionFlow = dynamic(
  () => import('./PhotoRecognitionFlow'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading camera...</p>
        </div>
      </div>
    ),
  }
)

interface PhotoLogWrapperProps {
  userId: string
}

export default function PhotoLogWrapper({ userId }: PhotoLogWrapperProps) {
  const router = useRouter()

  return (
    <PhotoRecognitionFlow
      userId={userId}
      onMealLogged={(mealId) => {
        router.push('/dashboard')
      }}
      onClose={() => {
        router.push('/log')
      }}
    />
  )
}
