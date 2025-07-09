/**
 * RememberMeCheckbox component for the login form
 *
 * @returns {JSX.Element} The rendered component
 */
const RememberMeCheckbox = () => {
  return (
    <div className="flex items-center">
      <input
        id="remember-me"
        name="remember-me"
        type="checkbox"
        className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-gray-700"
      />
      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
        Ghi nhớ đăng nhập
      </label>
    </div>
  )
}

export default RememberMeCheckbox
