import WishlistItem from "./WishlistItem"

const WishlistGrid = ({ items, onRemove, ratings }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <WishlistItem key={item._id} item={item} index={index} onRemove={onRemove} ratings={ratings} />
      ))}
    </div>
  )
}

export default WishlistGrid
