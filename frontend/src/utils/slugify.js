/**
 * Chuyển đổi chuỗi thành slug URL
 * @param {string} text - Chuỗi cần chuyển đổi
 * @returns {string} - Slug URL
 */
// export function slugify(text) {
//   // Chuyển về chữ thường và loại bỏ dấu tiếng Việt
//   const from = "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ"
//   const to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeediiiiiooooooooooooooooouuuuuuuuuuuyyyyy"

//   let result = text.toLowerCase()

//   // Thay thế các ký tự có dấu
//   for (let i = 0; i < from.length; i++) {
//     result = result.replace(new RegExp(from.charAt(i), "g"), to.charAt(i))
//   }

//   // Thay thế các ký tự đặc biệt và khoảng trắng bằng dấu gạch ngang
//   result = result
//     .replace(/[^a-z0-9-]/g, "-") // Thay thế ký tự không phải chữ cái, số bằng dấu gạch ngang
//     .replace(/-+/g, "-") // Thay thế nhiều dấu gạch ngang liên tiếp bằng một dấu
//     .replace(/^-+|-+$/g, "") // Xóa dấu gạch ngang ở đầu và cuối

//   return result
// }

export const slugify = (text) => {
  if (!text) return '';

  // Bảng chuyển đổi ký tự tiếng Việt sang không dấu
  const vietnameseMap = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    // Viết hoa
    'À': 'a', 'Á': 'a', 'Ạ': 'a', 'Ả': 'a', 'Ã': 'a',
    'Â': 'a', 'Ầ': 'a', 'Ấ': 'a', 'Ậ': 'a', 'Ẩ': 'a', 'Ẫ': 'a',
    'Ă': 'a', 'Ằ': 'a', 'Ắ': 'a', 'Ặ': 'a', 'Ẳ': 'a', 'Ẵ': 'a',
    'È': 'e', 'É': 'e', 'Ẹ': 'e', 'Ẻ': 'e', 'Ẽ': 'e',
    'Ê': 'e', 'Ề': 'e', 'Ế': 'e', 'Ệ': 'e', 'Ể': 'e', 'Ễ': 'e',
    'Ì': 'i', 'Í': 'i', 'Ị': 'i', 'Ỉ': 'i', 'Ĩ': 'i',
    'Ò': 'o', 'Ó': 'o', 'Ọ': 'o', 'Ỏ': 'o', 'Õ': 'o',
    'Ô': 'o', 'Ồ': 'o', 'Ố': 'o', 'Ộ': 'o', 'Ổ': 'o', 'Ỗ': 'o',
    'Ơ': 'o', 'Ờ': 'o', 'Ớ': 'o', 'Ợ': 'o', 'Ở': 'o', 'Ỡ': 'o',
    'Ù': 'u', 'Ú': 'u', 'Ụ': 'u', 'Ủ': 'u', 'Ũ': 'u',
    'Ư': 'u', 'Ừ': 'u', 'Ứ': 'u', 'Ự': 'u', 'Ử': 'u', 'Ữ': 'u',
    'Ỳ': 'y', 'Ý': 'y', 'Ỵ': 'y', 'Ỷ': 'y', 'Ỹ': 'y',
    'Đ': 'd'
  };

  return text
    .toString()
    .toLowerCase()
    // Thay thế ký tự tiếng Việt
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    // Hoặc sử dụng map để thay thế từng ký tự
    .split('').map(char => vietnameseMap[char] || char).join('')
    // Loại bỏ ký tự đặc biệt, chỉ giữ lại chữ cái, số và dấu cách
    .replace(/[^a-z0-9\s-]/g, '')
    // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/\s+/g, '-')
    // Loại bỏ dấu gạch ngang liên tiếp
    .replace(/-+/g, '-')
    // Loại bỏ dấu gạch ngang ở đầu và cuối
    .replace(/^-+|-+$/g, '');
};

/**
 * Trích xuất tên sản phẩm từ slug
 * @param {string} slug - Slug URL
 * @returns {string} - Tên sản phẩm đã được chuẩn hóa
 */
export function extractNameFromSlug(slug) {
  // Chuyển đổi slug thành tên sản phẩm có thể so sánh
  return slug.replace(/-/g, " ")
}

/**
 * So sánh tên sản phẩm với slug
 * @param {string} productName - Tên sản phẩm
 * @param {string} slug - Slug URL
 * @returns {boolean} - Kết quả so sánh
 */
export function compareNameWithSlug(productName, slug) {
  const normalizedName = slugify(productName)
  return normalizedName === slug
}
