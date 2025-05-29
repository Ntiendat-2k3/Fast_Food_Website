// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
// } from "recharts"

// // Shared tooltip component for charts
// export const ChartTooltip = ({ active, payload, label, formatter, labelFormatter }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
//         {labelFormatter ? (
//           <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">{labelFormatter(label)}</p>
//         ) : (
//           <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">{label}</p>
//         )}
//         {payload.map((entry, index) => (
//           <div key={`tooltip-${index}`} className="flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
//             <p className="text-sm">
//               <span className="font-medium">{entry.name}: </span>
//               <span className="text-gray-700 dark:text-gray-200">
//                 {formatter ? formatter(entry.value) : entry.value}
//               </span>
//             </p>
//           </div>
//         ))}
//       </div>
//     )
//   }
//   return null
// }

// // Bar Chart Component
// export const BarChartComponent = ({
//   data,
//   xAxisDataKey,
//   bars,
//   height = 300,
//   grid = true,
//   legend = true,
//   tooltip = true,
//   formatter,
//   labelFormatter,
// }) => {
//   return (
//     <ResponsiveContainer width="100%" height={height}>
//       <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
//         {grid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
//         <XAxis
//           dataKey={xAxisDataKey}
//           tick={{ fill: "#6b7280" }}
//           tickLine={{ stroke: "#e0e0e0" }}
//           axisLine={{ stroke: "#e0e0e0" }}
//         />
//         <YAxis
//           tick={{ fill: "#6b7280" }}
//           tickLine={{ stroke: "#e0e0e0" }}
//           axisLine={{ stroke: "#e0e0e0" }}
//           tickFormatter={formatter}
//         />
//         {tooltip && (
//           <Tooltip
//             content={<ChartTooltip formatter={formatter} labelFormatter={labelFormatter} />}
//             cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
//           />
//         )}
//         {legend && <Legend />}
//         {bars.map((bar, index) => (
//           <Bar
//             key={index}
//             dataKey={bar.dataKey}
//             name={bar.name || bar.dataKey}
//             fill={bar.color}
//             radius={[4, 4, 0, 0]}
//           />
//         ))}
//       </BarChart>
//     </ResponsiveContainer>
//   )
// }

// // Pie Chart Component
// export const PieChartComponent = ({
//   data,
//   nameKey,
//   dataKey,
//   colors,
//   height = 300,
//   legend = true,
//   tooltip = true,
//   formatter,
//   labelFormatter,
// }) => {
//   return (
//     <ResponsiveContainer width="100%" height={height}>
//       <PieChart margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
//         <Pie
//           data={data}
//           nameKey={nameKey}
//           dataKey={dataKey}
//           cx="50%"
//           cy="50%"
//           outerRadius={80}
//           fill="#8884d8"
//           label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//         >
//           {data.map((entry, index) => (
//             <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
//           ))}
//         </Pie>
//         {tooltip && <Tooltip content={<ChartTooltip formatter={formatter} labelFormatter={labelFormatter} />} />}
//         {legend && <Legend />}
//       </PieChart>
//     </ResponsiveContainer>
//   )
// }

// // Line Chart Component
// export const LineChartComponent = ({
//   data,
//   xAxisDataKey,
//   lines,
//   height = 300,
//   grid = true,
//   legend = true,
//   tooltip = true,
//   formatter,
//   labelFormatter,
// }) => {
//   return (
//     <ResponsiveContainer width="100%" height={height}>
//       <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
//         {grid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
//         <XAxis
//           dataKey={xAxisDataKey}
//           tick={{ fill: "#6b7280" }}
//           tickLine={{ stroke: "#e0e0e0" }}
//           axisLine={{ stroke: "#e0e0e0" }}
//         />
//         <YAxis
//           tick={{ fill: "#6b7280" }}
//           tickLine={{ stroke: "#e0e0e0" }}
//           axisLine={{ stroke: "#e0e0e0" }}
//           tickFormatter={formatter}
//         />
//         {tooltip && <Tooltip content={<ChartTooltip formatter={formatter} labelFormatter={labelFormatter} />} />}
//         {legend && <Legend />}
//         {lines.map((line, index) => (
//           <Line
//             key={index}
//             type="monotone"
//             dataKey={line.dataKey}
//             name={line.name || line.dataKey}
//             stroke={line.color}
//             activeDot={{ r: 8 }}
//             strokeWidth={2}
//           />
//         ))}
//       </LineChart>
//     </ResponsiveContainer>
//   )
// }

// // Area Chart Component
// export const AreaChartComponent = ({
//   data,
//   xAxisDataKey,
//   areas,
//   height = 300,
//   grid = true,
//   legend = true,
//   tooltip = true,
//   formatter,
//   labelFormatter,
// }) => {
//   return (
//     <ResponsiveContainer width="100%" height={height}>
//       <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
//         {grid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
//         <XAxis
//           dataKey={xAxisDataKey}
//           tick={{ fill: "#6b7280" }}
//           tickLine={{ stroke: "#e0e0e0" }}
//           axisLine={{ stroke: "#e0e0e0" }}
//         />
//         <YAxis
//           tick={{ fill: "#6b7280" }}
//           tickLine={{ stroke: "#e0e0e0" }}
//           axisLine={{ stroke: "#e0e0e0" }}
//           tickFormatter={formatter}
//         />
//         {tooltip && <Tooltip content={<ChartTooltip formatter={formatter} labelFormatter={labelFormatter} />} />}
//         {legend && <Legend />}
//         {areas.map((area, index) => (
//           <Area
//             key={index}
//             type="monotone"
//             dataKey={area.dataKey}
//             name={area.name || area.dataKey}
//             stroke={area.color}
//             fill={area.color}
//             fillOpacity={0.3}
//           />
//         ))}
//       </AreaChart>
//     </ResponsiveContainer>
//   )
// }
