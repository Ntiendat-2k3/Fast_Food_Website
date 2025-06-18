import axios from "axios"

// Tính phí ship dựa trên khoảng cách
const calculateShippingFee = (distance) => {
  if (distance <= 2) return 0 // Freeship dưới 2km
  if (distance <= 5) return 14000 // 2-5km: 14k
  if (distance <= 7) return 20000 // 5-7km: 20k
  if (distance <= 10) return 25000 // 7-10km: 25k
  return -1 // Ngoài phạm vi giao hàng
}

// Tính thời gian giao hàng thực tế (bao gồm cả thời gian chuẩn bị)
const calculateDeliveryTime = (distance, routeDurationSeconds) => {
  // Thời gian chuẩn bị đơn hàng (phút)
  const preparationTime = 15

  // Thời gian di chuyển từ OSRM (phút)
  let travelTime = Math.round(routeDurationSeconds / 60)

  // Nếu không có dữ liệu từ OSRM, ước tính dựa trên khoảng cách
  if (!routeDurationSeconds || travelTime < 5) {
    // Tốc độ trung bình trong thành phố: 20-25 km/h
    const avgSpeed = distance <= 5 ? 20 : 25 // km/h
    travelTime = Math.round((distance / avgSpeed) * 60) // phút
  }

  // Thêm buffer time cho việc tìm địa chỉ, giao hàng
  const bufferTime = Math.min(10, Math.max(5, Math.round(distance * 1.5)))

  const totalTime = preparationTime + travelTime + bufferTime

  // Format thời gian
  if (totalTime < 60) {
    return `${totalTime} phút`
  } else {
    const hours = Math.floor(totalTime / 60)
    const minutes = totalTime % 60
    return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`
  }
}

// Validation địa chỉ Việt Nam - Cải thiện
const validateVietnameseAddress = (address) => {
  const errors = []

  // Kiểm tra độ dài
  if (!address || address.trim().length < 8) {
    errors.push("Địa chỉ phải có ít nhất 8 ký tự")
  }

  if (address.trim().length > 200) {
    errors.push("Địa chỉ không được vượt quá 200 ký tự")
  }

  const addressLower = address.toLowerCase()

  // Kiểm tra từ khóa Việt Nam (mở rộng)
  const vietnamKeywords = [
    // Thành phố lớn
    "hà nội",
    "hanoi",
    "hồ chí minh",
    "ho chi minh",
    "sài gòn",
    "saigon",
    "đà nẵng",
    "da nang",
    "hải phòng",
    "hai phong",
    "cần thơ",
    "can tho",

    // Đơn vị hành chính
    "quận",
    "huyện",
    "phường",
    "xã",
    "thành phố",
    "tỉnh",
    "tp",
    "thị xã",
    "thị trấn",
    "khu vực",
    "khu",
    "tòa nhà",
    "chung cư",

    // Loại địa điểm
    "trường",
    "đại học",
    "học viện",
    "bệnh viện",
    "công ty",
    "tập đoàn",
    "nhà máy",
    "khu công nghiệp",
    "siêu thị",
    "trung tâm",
    "plaza",
    "building",
    "tower",
    "center",
    "mall",
    "market",
    "chợ",

    // Đường phố
    "đường",
    "phố",
    "ngõ",
    "hẻm",
    "lô",
    "số",
    "tổ",
    "khu phố",

    // Tên tỉnh thành phổ biến
    "bắc ninh",
    "hưng yên",
    "vĩnh phúc",
    "thái nguyên",
    "quảng ninh",
    "nghệ an",
    "thanh hóa",
    "huế",
    "quảng nam",
    "bình dương",
    "đồng nai",
    "vũng tàu",
    "tiền giang",
    "an giang",
    "kiên giang",
    "cà mau",

    // Quốc gia
    "việt nam",
    "vietnam",
    "vn",
  ]

  const hasVietnameseKeyword = vietnamKeywords.some((keyword) => addressLower.includes(keyword))

  if (!hasVietnameseKeyword) {
    errors.push("Địa chỉ phải ở Việt Nam và có thông tin địa danh rõ ràng")
  }

  // Kiểm tra có thông tin định vị (số nhà HOẶC tên địa điểm cụ thể)
  const hasNumber = /\d/.test(address)
  const hasSpecificLocation = [
    "trường",
    "đại học",
    "học viện",
    "bệnh viện",
    "công ty",
    "tập đoàn",
    "siêu thị",
    "trung tâm",
    "chợ",
    "tòa nhà",
    "chung cư",
    "khu",
    "plaza",
    "building",
    "tower",
    "center",
    "mall",
    "market",
  ].some((keyword) => addressLower.includes(keyword))

  if (!hasNumber && !hasSpecificLocation) {
    errors.push("Địa chỉ phải có số nhà hoặc tên địa điểm cụ thể (VD: Trường ĐH, Bệnh viện, Công ty...)")
  }

  // Kiểm tra ký tự đặc biệt không hợp lệ (nới lỏng hơn)
  const invalidChars = /[<>{}[\]\\|`~!@#$%^&*()_+=]/
  if (invalidChars.test(address)) {
    errors.push("Địa chỉ chứa ký tự không hợp lệ")
  }

  // Kiểm tra không phải chỉ là số hoặc ký tự đặc biệt
  const meaningfulContent = address.replace(/[0-9\s\-,./]/g, "")
  if (meaningfulContent.length < 3) {
    errors.push("Địa chỉ phải có thông tin địa danh cụ thể")
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  }
}

// Sử dụng OpenStreetMap Nominatim API (miễn phí) - Cải thiện
const geocodeAddress = async (address) => {
  try {
    // Validate trước khi geocode
    const validation = validateVietnameseAddress(address)
    if (!validation.isValid) {
      throw new Error(`Địa chỉ không hợp lệ: ${validation.errors.join(", ")}`)
    }

    // Thêm "Vietnam" vào cuối nếu chưa có để tăng độ chính xác
    let searchQuery = address
    const addressLower = address.toLowerCase()
    if (!addressLower.includes("việt nam") && !addressLower.includes("vietnam")) {
      searchQuery = `${address}, Vietnam`
    }

    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: searchQuery,
        format: "json",
        limit: 3, // Tăng lên 3 để có nhiều lựa chọn hơn
        countrycodes: "vn", // Chỉ tìm ở Việt Nam
        addressdetails: 1,
        extratags: 1, // Lấy thêm thông tin
      },
      headers: {
        "User-Agent": "FastFoodWebsite/1.0", // Nominatim yêu cầu User-Agent
      },
      timeout: 10000, // 10 seconds timeout
    })

    if (response.data && response.data.length > 0) {
      // Ưu tiên kết quả có độ chính xác cao hơn
      const sortedResults = response.data.sort((a, b) => {
        const importanceA = a.importance || 0
        const importanceB = b.importance || 0
        return importanceB - importanceA
      })

      const result = sortedResults[0]

      // Kiểm tra kết quả có phải ở Việt Nam không
      const displayName = result.display_name.toLowerCase()
      if (!displayName.includes("việt nam") && !displayName.includes("vietnam")) {
        throw new Error("Địa chỉ không thuộc Việt Nam")
      }

      return {
        lat: Number.parseFloat(result.lat),
        lng: Number.parseFloat(result.lon),
        display_name: result.display_name,
        confidence: result.importance || 0.5,
        type: result.type || "unknown",
        class: result.class || "unknown",
      }
    }
    throw new Error("Không tìm thấy địa chỉ")
  } catch (error) {
    console.error("Geocoding error:", error)
    throw error
  }
}

// Tính khoảng cách giữa 2 điểm bằng công thức Haversine
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Sử dụng OSRM API để tính khoảng cách đường bộ (miễn phí)
const calculateRoadDistance = async (originCoords, destCoords) => {
  try {
    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}`,
      {
        params: {
          overview: "false",
          alternatives: "false",
          steps: "false",
        },
        timeout: 8000, // 8 seconds timeout
      },
    )

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0]
      return {
        distance: route.distance / 1000, // Convert to km
        duration: route.duration, // seconds
      }
    }
    return null
  } catch (error) {
    console.error("OSRM routing error:", error)
    return null
  }
}

// Tính khoảng cách và phí ship
const calculateDistance = async (req, res) => {
  try {
    const { origin, destination } = req.body

    if (!destination) {
      return res.json({
        success: false,
        message: "Vui lòng cung cấp địa chỉ giao hàng",
      })
    }

    // Validate địa chỉ đích
    const validation = validateVietnameseAddress(destination)
    if (!validation.isValid) {
      return res.json({
        success: false,
        message: `Địa chỉ không hợp lệ: ${validation.errors[0]}`,
        errors: validation.errors,
      })
    }

    // Địa chỉ cửa hàng mặc định (có thể config)
    const storeAddress = origin || "Trường Đại học Thăng Long, Nghiêm Xuân Yêm, Đại Kim, Hoàng Mai, Hà Nội"

    try {
      // Geocode cả 2 địa chỉ với timeout
      const geocodePromises = [geocodeAddress(storeAddress), geocodeAddress(destination)]

      const [originCoords, destCoords] = await Promise.all(geocodePromises)

      if (!originCoords || !destCoords) {
        return res.json({
          success: false,
          message: "Không thể xác định tọa độ địa chỉ. Vui lòng kiểm tra lại địa chỉ.",
        })
      }

      // Kiểm tra khoảng cách sơ bộ (đường chim bay)
      const straightDistance = calculateHaversineDistance(
        originCoords.lat,
        originCoords.lng,
        destCoords.lat,
        destCoords.lng,
      )

      // Nếu quá xa (>50km đường chim bay), từ chối luôn
      if (straightDistance > 50) {
        return res.json({
          success: false,
          message: "Địa chỉ quá xa, ngoài phạm vi giao hàng",
          distance: straightDistance,
        })
      }

      // Thử tính khoảng cách đường bộ
      let routeInfo = await calculateRoadDistance(originCoords, destCoords)

      // Nếu không tính được đường bộ, dùng khoảng cách thẳng + hệ số
      if (!routeInfo) {
        console.log("OSRM failed, using Haversine distance")
        routeInfo = {
          distance: straightDistance * 1.4, // Hệ số 1.4 cho đường bộ thực tế
          duration: null, // Sẽ tính lại trong calculateDeliveryTime
        }
      }

      const distanceInKm = Math.round(routeInfo.distance * 10) / 10 // Làm tròn 1 chữ số
      const shippingFee = calculateShippingFee(distanceInKm)

      if (shippingFee === -1) {
        return res.json({
          success: false,
          message: "Địa chỉ nằm ngoài phạm vi giao hàng (tối đa 10km)",
          distance: distanceInKm,
        })
      }

      // Tính thời gian giao hàng thực tế
      const deliveryTime = calculateDeliveryTime(distanceInKm, routeInfo.duration)

      res.json({
        success: true,
        data: {
          distance: distanceInKm,
          duration: deliveryTime,
          shippingFee: shippingFee,
          freeShipping: shippingFee === 0,
          originAddress: originCoords.display_name,
          destinationAddress: destCoords.display_name,
          confidence: Math.min(originCoords.confidence, destCoords.confidence),
        },
      })
    } catch (geocodeError) {
      console.error("Geocoding failed:", geocodeError)
      return res.json({
        success: false,
        message: geocodeError.message || "Không thể xác định địa chỉ. Vui lòng nhập địa chỉ chi tiết hơn.",
      })
    }
  } catch (error) {
    console.error("Error calculating distance:", error)
    res.json({
      success: false,
      message: "Lỗi hệ thống khi tính toán khoảng cách. Vui lòng thử lại sau.",
    })
  }
}

// Lấy gợi ý địa chỉ từ Nominatim
const getAddressSuggestions = async (req, res) => {
  try {
    const { input } = req.query

    if (!input || input.length < 3) {
      return res.json({
        success: true,
        data: [],
      })
    }

    // Basic validation cho input
    if (input.length > 100) {
      return res.json({
        success: false,
        message: "Từ khóa tìm kiếm quá dài",
      })
    }

    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: input,
        format: "json",
        limit: 8,
        countrycodes: "vn",
        addressdetails: 1,
      },
      headers: {
        "User-Agent": "FastFoodWebsite/1.0",
      },
      timeout: 5000, // 5 seconds timeout
    })

    if (!response.data || response.data.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: "Không tìm thấy địa chỉ phù hợp",
      })
    }

    const suggestions = response.data
      .filter((item) => {
        // Lọc chỉ lấy kết quả ở Việt Nam
        const displayName = item.display_name.toLowerCase()
        return displayName.includes("việt nam") || displayName.includes("vietnam")
      })
      .map((item, index) => {
        const address = item.display_name
        const parts = address.split(", ")

        return {
          placeId: `osm_${item.place_id}`,
          description: address,
          mainText: parts[0] || address,
          secondaryText: parts.slice(1).join(", "),
          lat: Number.parseFloat(item.lat),
          lng: Number.parseFloat(item.lon),
          confidence: item.importance || 0.5,
        }
      })

    res.json({
      success: true,
      data: suggestions,
    })
  } catch (error) {
    console.error("Error getting address suggestions:", error)
    res.json({
      success: false,
      message: "Lỗi khi lấy gợi ý địa chỉ. Vui lòng thử lại.",
    })
  }
}

// Lấy chi tiết địa chỉ từ place_id
const getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.params

    if (!placeId) {
      return res.json({
        success: false,
        message: "Vui lòng cung cấp place ID",
      })
    }

    // Extract OSM place_id
    const osmPlaceId = placeId.replace("osm_", "")

    const response = await axios.get("https://nominatim.openstreetmap.org/details.php", {
      params: {
        place_id: osmPlaceId,
        format: "json",
        addressdetails: 1,
      },
      headers: {
        "User-Agent": "FastFoodWebsite/1.0",
      },
      timeout: 5000,
    })

    if (!response.data) {
      return res.json({
        success: false,
        message: "Không thể lấy chi tiết địa chỉ",
      })
    }

    const place = response.data

    res.json({
      success: true,
      data: {
        address: place.addresstags?.name || place.localname || "Địa chỉ không xác định",
        lat: Number.parseFloat(place.centroid.coordinates[1]),
        lng: Number.parseFloat(place.centroid.coordinates[0]),
        details: place.addresstags,
      },
    })
  } catch (error) {
    console.error("Error getting place details:", error)
    res.json({
      success: false,
      message: "Lỗi khi lấy chi tiết địa chỉ",
    })
  }
}

export { calculateDistance, getAddressSuggestions, getPlaceDetails }
