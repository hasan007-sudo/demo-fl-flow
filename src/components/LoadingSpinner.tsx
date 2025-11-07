// ABOUTME: Reusable loading spinner component with optional message
// ABOUTME: Displays animated spinner with customizable size and text

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ message, size = 'md' }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
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
