"use client"

const CartLoadingState = () => {
  return (
    <div className="space-y-4">
      {/* Mobile Select All Skeleton */}
      <div className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg sm:hidden animate-pulse">
        <div className="h-4 bg-slate-600 rounded w-20"></div>
        <div className="w-4 h-4 bg-slate-600 rounded"></div>
      </div>

      {/* Desktop Header Skeleton */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-700/30 rounded-lg animate-pulse">
          <div className="col-span-1 h-4 bg-slate-600 rounded"></div>
          <div className="col-span-4 h-4 bg-slate-600 rounded"></div>
          <div className="col-span-2 h-4 bg-slate-600 rounded"></div>
          <div className="col-span-2 h-4 bg-slate-600 rounded"></div>
          <div className="col-span-2 h-4 bg-slate-600 rounded"></div>
          <div className="col-span-1 h-4 bg-slate-600 rounded"></div>
        </div>
      </div>

      {/* Cart Items Skeleton */}
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-slate-800/50 rounded-xl border border-slate-700 animate-pulse">
          {/* Mobile Layout Skeleton */}
          <div className="sm:hidden p-4">
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 bg-slate-600 rounded mt-1"></div>
              <div className="w-16 h-16 bg-slate-600 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-slate-600 rounded"></div>
                    <div className="w-6 h-4 bg-slate-600 rounded"></div>
                    <div className="w-7 h-7 bg-slate-600 rounded"></div>
                  </div>
                  <div className="w-4 h-4 bg-slate-600 rounded"></div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between">
              <div className="h-4 bg-slate-600 rounded w-16"></div>
              <div className="h-4 bg-slate-600 rounded w-20"></div>
            </div>
          </div>

          {/* Desktop Layout Skeleton */}
          <div className="hidden sm:block">
            <div className="grid grid-cols-12 gap-4 p-4 items-center">
              <div className="col-span-1 w-4 h-4 bg-slate-600 rounded"></div>
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-16 h-16 bg-slate-600 rounded-xl"></div>
                <div className="h-4 bg-slate-600 rounded flex-1"></div>
              </div>
              <div className="col-span-2 h-4 bg-slate-600 rounded"></div>
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-600 rounded"></div>
                <div className="w-6 h-4 bg-slate-600 rounded"></div>
                <div className="w-8 h-8 bg-slate-600 rounded"></div>
              </div>
              <div className="col-span-2 h-4 bg-slate-600 rounded"></div>
              <div className="col-span-1 w-4 h-4 bg-slate-600 rounded"></div>
            </div>
          </div>
        </div>
      ))}

      {/* Summary Skeleton */}
      <div className="bg-slate-700/30 rounded-xl border border-slate-600 animate-pulse">
        <div className="bg-slate-800/80 p-4 sm:p-6 border-b border-slate-600">
          <div className="h-6 bg-slate-600 rounded w-32"></div>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex justify-between items-center">
              <div className="h-4 bg-slate-600 rounded w-32"></div>
              <div className="h-4 bg-slate-600 rounded w-20"></div>
            </div>
          ))}
          <div className="border-t border-slate-600 pt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-slate-600 rounded w-24"></div>
              <div className="h-6 bg-slate-600 rounded w-28"></div>
            </div>
            <div className="h-12 bg-slate-600 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartLoadingState
