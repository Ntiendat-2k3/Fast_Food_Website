import ProductCard from "./ProductCard"
import EmptyProductState from "./EmptyProductState"

const ProductGrid = ({
  loading,
  items,
  url,
  deleteMode,
  selectedItems,
  toggleSelectItem,
  handleEditClick,
  handleDeleteClick,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return <EmptyProductState />
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
      {items.map((item) => (
        <ProductCard
          key={item._id}
          item={item}
          url={url}
          deleteMode={deleteMode}
          selectedItems={selectedItems}
          toggleSelectItem={toggleSelectItem}
          handleEditClick={handleEditClick}
          handleDeleteClick={handleDeleteClick}
        />
      ))}
    </div>
  )
}

export default ProductGrid
