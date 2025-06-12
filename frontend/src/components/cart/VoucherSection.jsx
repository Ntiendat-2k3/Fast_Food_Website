"use client"
import { motion } from "framer-motion"
import { Tag, Check, X } from "lucide-react"
import Input from "../common/Input"
import Button from "../common/Button"
import Card from "../common/Card"

const VoucherSection = ({
  voucherCode,
  setVoucherCode,
  appliedVoucher,
  onApplyVoucher,
  onRemoveVoucher,
  isApplying,
  error,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-slate-700/30 backdrop-blur-sm p-6 rounded-xl border border-slate-600"
    >
      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
        <Tag className="mr-2 text-primary" size={20} />
        Mã giảm giá
      </h3>

      {appliedVoucher ? (
        <Card background="transparent" className="bg-green-500/20 border-green-400/30 mb-4" padding="md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Check size={20} className="text-green-400 mr-2" />
              <div>
                <p className="text-green-300 font-medium">{voucherCode}</p>
                <p className="text-green-400 text-sm">
                  {appliedVoucher.voucherInfo.discountType === "percentage"
                    ? `Giảm ${appliedVoucher.voucherInfo.discountValue}%`
                    : `Giảm ${appliedVoucher.voucherInfo.discountValue.toLocaleString("vi-VN")}đ`}
                  {appliedVoucher.voucherInfo.maxDiscountAmount
                    ? ` (tối đa ${appliedVoucher.voucherInfo.maxDiscountAmount.toLocaleString("vi-VN")}đ)`
                    : ""}
                </p>
              </div>
            </div>
            <Button
              onClick={onRemoveVoucher}
              variant="ghost"
              size="sm"
              icon={<X size={20} />}
              className="text-red-400 hover:text-red-300"
            />
          </div>
        </Card>
      ) : (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Nhập mã giảm giá..."
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            icon={<Tag size={18} />}
            error={error}
            className="flex-1"
          />
          <Button onClick={onApplyVoucher} loading={isApplying} variant="primary" className="px-6">
            Áp dụng
          </Button>
        </div>
      )}
    </motion.div>
  )
}

export default VoucherSection
