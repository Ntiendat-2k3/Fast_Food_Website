/**
 * Chuyển đổi chuỗi thành slug URL
 * @param {string} text - Chuỗi cần chuyển đổi
 * @returns {string} - Slug URL
 */
export const slugify = (text) => {
  if (!text) return ""

  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      // Chuyển đổi ký tự tiếng Việt
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      // Loại bỏ ký tự đặc biệt, chỉ giữ lại chữ cái, số và dấu cách
      .replace(/[^a-z0-9\s-]/g, "")
      // Thay thế khoảng trắng bằng dấu gạch ngang
      .replace(/\s+/g, "-")
      // Loại bỏ dấu gạch ngang liên tiếp
      .replace(/-+/g, "-")
      // Loại bỏ dấu gạch ngang ở đầu và cuối
      .replace(/^-+|-+$/g, "")
  )
}

/**
 * Trích xuất tên sản phẩm từ slug
 * @param {string} slug - Slug URL
 * @returns {string} - Tên sản phẩm đã được chuẩn hóa
 */
export function extractNameFromSlug(slug) {
  // Chuyển đổi slug thành tên sản phẩm có thể so sánh
  return slug.replace(/-/g, " ")
}

// Hàm tạo slug từ tên sản phẩm - CHÍNH XÁC
export const createSlug = (name) => {
  if (!name) return ""

  return name
    .toLowerCase()
    .trim()
    .normalize("NFD") // Chuẩn hóa Unicode
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
    .replace(/[đĐ]/g, "d") // Thay đ thành d
    .replace(/[^a-z0-9\s-]/g, "") // Chỉ giữ chữ, số, space, dấu gạch ngang
    .replace(/\s+/g, "-") // Thay space thành dấu gạch ngang
    .replace(/-+/g, "-") // Loại bỏ dấu gạch ngang liên tiếp
    .replace(/^-|-$/g, "") // Loại bỏ dấu gạch ngang ở đầu và cuối
}

// Hàm tạo URL từ tên sản phẩm
export const createProductUrl = (name) => {
  return `/product/${createSlug(name)}`
}

// Hàm so sánh tên với slug - FIX CHÍNH XÁC
export const compareNameWithSlug = (name, slug) => {
  if (!name || !slug) {
    console.log("Missing name or slug:", { name, slug })
    return false
  }

  // Tạo slug từ tên sản phẩm
  const nameSlug = createSlug(name)
  const normalizedSlug = slug.toLowerCase().trim()

  console.log(`=== SLUG COMPARISON ===`)
  console.log(`Product name: "${name}"`)
  console.log(`Generated slug from name: "${nameSlug}"`)
  console.log(`URL slug: "${normalizedSlug}"`)
  console.log(`Exact match: ${nameSlug === normalizedSlug}`)

  // So sánh chính xác
  const isExactMatch = nameSlug === normalizedSlug

  if (isExactMatch) {
    console.log(`✅ EXACT MATCH FOUND for "${name}"`)
    return true
  }

  console.log(`❌ NO MATCH for "${name}" with slug "${slug}"`)
  return false
}
