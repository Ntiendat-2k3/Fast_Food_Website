// import orderModel from "../models/orderModel.js";

// //////////////////////
// // Xem tổng doanh thu
// const getTotalRevenue = async (req, res) => {
//   try {
//     const orders = await orderModel.find({});
//     const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
//     res.json({ success: true, totalRevenue });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: "Error" });
//   }
// };

// // Xem doanh thu theo mặt hàng
// const getRevenueByCategory = async (req, res) => {
//   try {
//     const orders = await orderModel.find({});
//     const categoryRevenue = {};

//     orders.forEach((order) => {
//       order.items.forEach((item) => {
//         const category = item.category || "Other"; // Assuming 'category' exists in item
//         if (!categoryRevenue[category]) {
//           categoryRevenue[category] = 0;
//         }
//         categoryRevenue[category] += item.price * item.quantity;
//       });
//     });

//     res.json({ success: true, categoryRevenue });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: "Error" });
//   }
// };

// // Xem doanh thu theo món
// const getRevenueByItem = async (req, res) => {
//   try {
//     const orders = await orderModel.find({});
//     const itemRevenue = {};

//     orders.forEach((order) => {
//       order.items.forEach((item) => {
//         if (!itemRevenue[item.name]) {
//           itemRevenue[item.name] = 0;
//         }
//         itemRevenue[item.name] += item.price * item.quantity;
//       });
//     });

//     res.json({ success: true, itemRevenue });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: "Error" });
//   }
// };

// export { getTotalRevenue, getRevenueByCategory, getRevenueByItem };
// ////////////////////////
