import { AlertCircle } from "lucide-react"

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 flex items-center">
      <AlertCircle size={20} className="text-red-400 mr-2 flex-shrink-0" />
      <span className="text-red-400 text-sm">{message}</span>
    </div>
  )
}

export default ErrorMessage
