// ABOUTME: Reusable form select dropdown component with label
// ABOUTME: Handles single select with consistent styling

interface FormSelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: string[]
  required?: boolean
  error?: string
}

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
}: FormSelectProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-indigo-600 dark:text-indigo-400 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
          error
            ? 'border-red-500 focus:ring-red-200 dark:border-red-400 dark:focus:ring-red-900'
            : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-500 dark:focus:border-indigo-400'
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}
