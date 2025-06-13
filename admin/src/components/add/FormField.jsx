"use client"

const FormField = ({ label, icon, name, type = "text", value, onChange, placeholder, required = false }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
        <input
          onChange={onChange}
          value={value}
          type={type}
          name={name}
          id={name}
          placeholder={placeholder}
          required={required}
          className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  )
}

export default FormField
