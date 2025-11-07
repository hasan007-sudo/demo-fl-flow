// ABOUTME: Reusable form input component with label and validation
// ABOUTME: Handles text and tel input types with consistent styling

interface FormInputProps {
  label: string
  name: string
  type?: 'text' | 'tel'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
}

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
}: FormInputProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-indigo-600 dark:text-indigo-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
          error
            ? 'border-red-500 focus:ring-red-200 dark:border-red-400 dark:focus:ring-red-900'
            : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-500 dark:focus:border-indigo-400'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}
