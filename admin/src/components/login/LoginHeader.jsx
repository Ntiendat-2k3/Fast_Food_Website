/**
 * LoginHeader component displays the logo and title section of the login page
 *
 * @param {Object} props - Component props
 * @param {string} props.logoSrc - Source URL for the logo image
 * @returns {JSX.Element} The rendered component
 */
const LoginHeader = ({ logoSrc = "/logo.png" }) => {
  return (
    <div className="text-center mb-8">
      <img className="mx-auto h-16 w-auto" src={logoSrc || "/placeholder.svg"} alt="Logo" />
      <h2 className="mt-4 text-3xl font-extrabold text-white">Đăng nhập vào trang quản trị</h2>
      <p className="mt-2 text-sm text-gray-400">Vui lòng đăng nhập để truy cập vào hệ thống quản lý</p>
    </div>
  )
}

export default LoginHeader
