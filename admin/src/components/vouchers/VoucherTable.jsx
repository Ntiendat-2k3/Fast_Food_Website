import VoucherTableRow from "./VoucherTableRow"

const VoucherTable = ({ vouchers, onEditVoucher, onDeleteClick, formatDate }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-lighter">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Mã giảm giá
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Giá trị
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Thời gian
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Sử dụng
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-dark-lighter">
          {vouchers.map((voucher) => (
            <VoucherTableRow
              key={voucher._id}
              voucher={voucher}
              onEdit={onEditVoucher}
              onDelete={onDeleteClick}
              formatDate={formatDate}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default VoucherTable
