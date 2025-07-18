/**
 * Chuyển đổi chuỗi thành slug URL
 * @param {string} text - Chuỗi cần chuyển đổi
 * @returns {string} - Slug URL
 */
export const slugify = (text) => {
  if (!text) return ""

  // Bảng chuyển đổi ký tự tiếng Việt sang không dấu
  const vietnameseMap = {
    à: "a",
    á: "a",
    ạ: "a",
    ả: "a",
    ã: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ậ: "a",
    ẩ: "a",
    ẫ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ặ: "a",
    ẳ: "a",
    ẵ: "a",
    è: "e",
    é: "e",
    ẹ: "e",
    ẻ: "e",
    ẽ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ệ: "e",
    ể: "e",
    ễ: "e",
    ì: "i",
    í: "i",
    ị: "i",
    ỉ: "i",
    ĩ: "i",
    ò: "o",
    ó: "o",
    ọ: "o",
    ỏ: "o",
    õ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ộ: "o",
    ổ: "o",
    ỗ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ợ: "o",
    ở: "o",
    ỡ: "o",
    ù: "u",
    ú: "u",
    ụ: "u",
    ủ: "u",
    ũ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ự: "u",
    ử: "u",
    ữ: "u",
    ỳ: "y",
    ý: "y",
    ỵ: "y",
    ỷ: "y",
    ỹ: "y",
    đ: "d",
    // Viết hoa
    À: "a",
    Á: "a",
    Ạ: "a",
    Ả: "a",
    Ã: "a",
    Â: "a",
    Ầ: "a",
    Ấ: "a",
    Ậ: "a",
    Ẩ: "a",
    Ẫ: "a",
    Ă: "a",
    Ằ: "a",
    Ắ: "a",
    Ặ: "a",
    Ẳ: "a",
    Ẵ: "a",
    È: "e",
    É: "e",
    Ẹ: "e",
    Ẻ: "e",
    Ẽ: "e",
    Ê: "e",
    Ề: "e",
    Ế: "e",
    Ệ: "e",
    Ể: "e",
    Ễ: "e",
    Ì: "i",
    Í: "i",
    Ị: "i",
    Ỉ: "i",
    Ĩ: "i",
    Ò: "o",
    Ó: "o",
    Ọ: "o",
    Ỏ: "o",
    Õ: "o",
    Ô: "o",
    Ồ: "o",
    Ố: "o",
    Ộ: "o",
    Ổ: "o",
    Ỗ: "o",
    Ơ: "o",
    Ờ: "o",
    Ớ: "o",
    Ợ: "o",
    Ở: "o",
    Ỡ: "o",
    Ù: "u",
    Ú: "u",
    Ụ: "u",
    Ủ: "u",
    Ũ: "u",
    Ư: "u",
    Ừ: "u",
    Ứ: "u",
    Ự: "u",
    Ử: "u",
    Ữ: "u",
    Ỳ: "y",
    Ý: "y",
    Ỵ: "y",
    Ỷ: "y",
    Ỹ: "y",
    Đ: "d",
  }

  return (
    text
      .toString()
      .toLowerCase()
      // Thay thế ký tự tiếng Việt
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
      .replace(/[èéẹẻẽêềếệểễ]/g, "e")
      .replace(/[ìíịỉĩ]/g, "i")
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
      .replace(/[ùúụủũưừứựửữ]/g, "u")
      .replace(/[ỳýỵỷỹ]/g, "y")
      .replace(/đ/g, "d")
      // Hoặc sử dụng map để thay thế từng ký tự
      .split("")
      .map((char) => vietnameseMap[char] || char)
      .join("")
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

// Hàm tạo slug từ tên sản phẩm
export const createSlug = (name) => {
  if (!name) return ""

  return name
    .toLowerCase()
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

// Hàm so sánh tên với slug
export const compareNameWithSlug = (name, slug) => {
  if (!name || !slug) return false

  const nameSlug = createSlug(name)
  const normalizedSlug = slug.toLowerCase()

  console.log(`Comparing: "${nameSlug}" === "${normalizedSlug}"`)

  return nameSlug === normalizedSlug
}
