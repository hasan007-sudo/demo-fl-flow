// ABOUTME: Reusable loading spinner component with optional message
// ABOUTME: Displays animated spinner with customizable size and text
// ABOUTME: Supports overlay mode for covering form areas during loading

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  overlay?: boolean
}

export default function LoadingSpinner({ message, size = 'md', overlay = false }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
        <div
          className={`${sizeStyles[size]} border-indigo-600 border-t-transparent rounded-full animate-spin`}
        />
        {message && <p className="mt-4 text-gray-600 text-center font-medium">{message}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeStyles[size]} border-indigo-600 border-t-transparent rounded-full animate-spin`}
      />
      {message && <p className="mt-4 text-gray-600 text-center">{message}</p>}
    </div>
  )
}
