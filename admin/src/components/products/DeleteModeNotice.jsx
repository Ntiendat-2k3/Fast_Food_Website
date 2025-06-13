const DeleteModeNotice = ({ isVisible }) => {
  if (!isVisible) return null

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
        <span className="font-medium">Chế độ xóa:</span> Chọn các sản phẩm bạn muốn xóa bằng cách nhấp vào chúng, sau đó
        nhấn "Xác nhận xóa".
      </p>
    </div>
  )
}

export default DeleteModeNotice
