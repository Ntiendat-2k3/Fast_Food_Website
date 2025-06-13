/**
 * ErrorMessage component for displaying login errors
 *
 * @param {Object} props - Component props
 * @param {string} props.message - The error message to display
 * @returns {JSX.Element|null} The rendered component or null if no message
 */
const ErrorMessage = ({ message }) => {
  if (!message) return null

  return (
    <div className="mb-4 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
      <p>{message}</p>
    </div>
  )
}

export default ErrorMessage
