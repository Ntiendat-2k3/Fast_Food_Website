// "use client"

// import { motion } from "framer-motion"
// import { Sparkles } from "lucide-react"

// const MenuHighlight = ({ title, description, image, reverse = false }) => {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true, margin: "-100px" }}
//       transition={{ duration: 0.6 }}
//       className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-12 my-16`}
//     >
//       <div className="w-full md:w-1/2">
//         <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
//           <Sparkles size={14} className="text-primary" />
//           Đặc sản nổi bật
//         </div>
//         <h3 className="text-2xl md:text-3xl font-bold mb-4 text-dark dark:text-white">{title}</h3>
//         <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
//         <div className="flex gap-4">
//           <button className="bg-primary hover:bg-primary-dark text-dark font-medium py-2.5 px-5 rounded-full transition-colors">
//             Đặt ngay
//           </button>
//           <button className="bg-white dark:bg-dark-light text-dark dark:text-white border border-gray-200 dark:border-dark-lighter hover:border-primary dark:hover:border-primary font-medium py-2.5 px-5 rounded-full transition-colors">
//             Xem chi tiết
//           </button>
//         </div>
//       </div>

//       <div className="w-full md:w-1/2">
//         <div className="relative">
//           <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl -z-10"></div>
//           <div className="bg-gradient-to-br from-white to-gray-100 dark:from-dark-light dark:to-dark p-4 rounded-3xl shadow-lg">
//             {image ? (
//               <img src={image || "/placeholder.svg"} alt={title} className="w-full h-64 object-cover rounded-2xl" />
//             ) : (
//               <div className="w-full h-64 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
//                 <span className="text-6xl text-primary/30">🍔</span>
//               </div>
//             )}
//           </div>

//           <div className="absolute -bottom-6 -right-6 bg-white dark:bg-dark-light shadow-lg rounded-full p-4">
//             <div className="bg-primary/10 text-primary rounded-full h-16 w-16 flex items-center justify-center font-bold">
//               -20%
//             </div>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   )
// }

// export default MenuHighlight
