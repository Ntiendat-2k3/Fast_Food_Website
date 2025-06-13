"use client"

const CartTableHeader = ({ selectAll, onSelectAll }) => {
  return (
    <thead className="hidden sm:table-header-group">
      <tr className="text-left border-b border-slate-700">
        <th className="pb-4 text-white font-medium w-12">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={onSelectAll}
              className="w-4 h-4 text-yellow-400 bg-slate-600 border-slate-500 rounded focus:ring-yellow-400 focus:ring-2"
            />
          </div>
        </th>
        <th className="pb-4 text-white font-medium">Sản phẩm</th>
        <th className="pb-4 text-white font-medium">Giá</th>
        <th className="pb-4 text-white font-medium">Số lượng</th>
        <th className="pb-4 text-white font-medium">Tổng tiền</th>
        <th className="pb-4 text-white font-medium">Xóa</th>
      </tr>
    </thead>
  )
}

export default CartTableHeader
