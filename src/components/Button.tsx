// ABOUTME: Reusable button component with variant styles
// ABOUTME: Supports primary, secondary, and outline variants with loading state

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  className = '',
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 text-sm rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1'

  const variantStyles = {
    primary: 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-600',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400',
    outline: 'bg-white dark:bg-gray-900 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 focus:ring-indigo-500 disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-400',
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${className}`}
    >
      {children}
    </button>
  )
}
