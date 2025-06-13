const EmptyProductState = () => {
  return (
    <div className="text-center py-12 bg-gray-50 dark:bg-dark-lighter md:rounded-xl">
      <img src="/placeholder.svg?height=120&width=120" alt="Không có kết quả" className="mx-auto mb-4 opacity-50" />
      <h3 className="text-xl text-gray-500 dark:text-gray-400 mb-2">Không tìm thấy sản phẩm</h3>
      <p className="text-gray-400 dark:text-gray-500">Hãy thử thay đổi tìm kiếm hoặc danh mục</p>
    </div>
  )
}

export default EmptyProductState
