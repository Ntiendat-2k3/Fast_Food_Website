// import mongoose from "mongoose"

// const purchaseHistorySchema = new mongoose.Schema(
//   {
//     userId: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     orderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "orders",
//       required: true,
//     },
//     items: [
//       {
//         foodId: {
//           type: String,
//           required: true,
//         },
//         name: {
//           type: String,
//           required: true,
//         },
//         price: {
//           type: Number,
//           required: true,
//         },
//         quantity: {
//           type: Number,
//           required: true,
//         },
//         image: {
//           type: String,
//           required: true,
//         },
//       },
//     ],
//     totalAmount: {
//       type: Number,
//       required: true,
//     },
//     paymentMethod: {
//       type: String,
//       required: true,
//     },
//     paymentStatus: {
//       type: String,
//       required: true,
//     },
//     deliveryAddress: {
//       type: Object,
//       required: true,
//     },
//     purchaseDate: {
//       type: Date,
//       default: Date.now,
//     },
//     voucherCode: {
//       type: String,
//       default: null,
//     },
//     discountAmount: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { timestamps: true },
// )

// const PurchaseHistory = mongoose.models.purchaseHistory || mongoose.model("purchaseHistory", purchaseHistorySchema)
// export default PurchaseHistory
