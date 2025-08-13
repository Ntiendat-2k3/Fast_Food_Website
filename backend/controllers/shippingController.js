import axios from "axios"

// Store address - tọa độ cửa hàng
const STORE_LOCATION = {
  lat: 20.9758758,
  lng: 105.8130185,
  address: "Trường Đại học Thăng Long, Nghiêm Xuân Yêm, Đại Kim, Hoàng Mai, Hà Nội",
}

// Database địa chỉ Việt Nam phổ biến (fallback khi API fail)
const VIETNAM_ADDRESSES_DB = [
  // Hà Nội - Trường đại học
  {
    name: "Đại học Đại Nam",
    address: "Đại học Đại Nam, Hà Nội",
    lat: 20.9758758,
    lng: 105.8130185,
    confidence: 0.9,
    type: "university",
  },
  {
    name: "Đại học Thăng Long",
    address: "Trường Đại học Thăng Long, Nghiêm Xuân Yêm, Đại Kim, Hoàng Mai, Hà Nội",
    lat: 20.9758758,
    lng: 105.8130185,
    confidence: 0.95,
    type: "university",
  },
  {
    name: "Đại học Bách Khoa Hà Nội",
    address: "Đại học Bách Khoa Hà Nội, Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    lat: 21.0045,
    lng: 105.8412,
    confidence: 0.95,
    type: "university",
  },
  {
    name: "Đại học Quốc gia Hà Nội",
    address: "Đại học Quốc gia Hà Nội, Xuân Thủy, Cầu Giấy, Hà Nội",
    lat: 21.0378,
    lng: 105.7826,
    confidence: 0.95,
    type: "university",
  },
  {
    name: "Đại học Kinh tế Quốc dân",
    address: "Đại học Kinh tế Quốc dân, Giải Phóng, Hai Bà Trưng, Hà Nội",
    lat: 20.9967,
    lng: 105.8438,
    confidence: 0.9,
    type: "university",
  },
  {
    name: "Đại học Ngoại thương",
    address: "Đại học Ngoại thương, Chùa Láng, Đống Đa, Hà Nội",
    lat: 21.0136,
    lng: 105.827,
    confidence: 0.9,
    type: "university",
  },

  // Hà Nội - Địa điểm nổi tiếng
  {
    name: "Hồ Gươm",
    address: "Hồ Hoàn Kiếm, Hoàn Kiếm, Hà Nội",
    lat: 21.0285,
    lng: 105.8542,
    confidence: 0.95,
    type: "landmark",
  },
  {
    name: "Chợ Đồng Xuân",
    address: "Chợ Đồng Xuân, Hoàn Kiếm, Hà Nội",
    lat: 21.037,
    lng: 105.8503,
    confidence: 0.9,
    type: "market",
  },
  {
    name: "Bệnh viện Bạch Mai",
    address: "Bệnh viện Bạch Mai, Giải Phóng, Hai Bà Trưng, Hà Nội",
    lat: 20.9967,
    lng: 105.8438,
    confidence: 0.9,
    type: "hospital",
  },
  {
    name: "Sân bay Nội Bài",
    address: "Sân bay Quốc tế Nội Bài, Sóc Sơn, Hà Nội",
    lat: 21.2187,
    lng: 105.8072,
    confidence: 0.95,
    type: "airport",
  },

  // Hà Nội - Quận/Huyện
  {
    name: "Hoàn Kiếm",
    address: "Quận Hoàn Kiếm, Hà Nội",
    lat: 21.0285,
    lng: 105.8542,
    confidence: 0.8,
    type: "district",
  },
  {
    name: "Ba Đình",
    address: "Quận Ba Đình, Hà Nội",
    lat: 21.0333,
    lng: 105.8347,
    confidence: 0.8,
    type: "district",
  },
  {
    name: "Cầu Giấy",
    address: "Quận Cầu Giấy, Hà Nội",
    lat: 21.0378,
    lng: 105.7826,
    confidence: 0.8,
    type: "district",
  },
  {
    name: "Đống Đa",
    address: "Quận Đống Đa, Hà Nội",
    lat: 21.0136,
    lng: 105.827,
    confidence: 0.8,
    type: "district",
  },
  {
    name: "Hai Bà Trưng",
    address: "Quận Hai Bà Trưng, Hà Nội",
    lat: 20.9967,
    lng: 105.8438,
    confidence: 0.8,
    type: "district",
  },
  {
    name: "Hoàng Mai",
    address: "Quận Hoàng Mai, Hà Nội",
    lat: 20.9758,
    lng: 105.813,
    confidence: 0.8,
    type: "district",
  },
  {
    name: "Thanh Xuân",
    address: "Quận Thanh Xuân, Hà Nội",
    lat: 20.9883,
    lng: 105.8053,
    confidence: 0.8,
    type: "district",
  },

  // TP.HCM - Địa điểm nổi tiếng
  {
    name: "Sài Gòn",
    address: "Thành phố Hồ Chí Minh",
    lat: 10.8231,
    lng: 106.6297,
    confidence: 0.9,
    type: "city",
  },
  {
    name: "Quận 1",
    address: "Quận 1, Thành phố Hồ Chí Minh",
    lat: 10.7769,
    lng: 106.7009,
    confidence: 0.8,
    type: "district",
  },
  {
    name: "Bến Thành",
    address: "Chợ Bến Thành, Quận 1, Thành phố Hồ Chí Minh",
    lat: 10.772,
    lng: 106.698,
    confidence: 0.9,
    type: "market",
  },
]

// Cấu hình API với timeout ngắn hơn và retry
const GEOCODING_APIS = [
  {
    name: "Nominatim",
    url: "https://nominatim.openstreetmap.org/search",
    timeout: 8000,
    retries: 2,
    params: (query) => ({
      q: query,
      format: "json",
      addressdetails: 1,
      limit: 8,
      countrycodes: "vn",
      "accept-language": "vi,en",
      bounded: 1,
      viewbox: "102.14441,8.59975,109.46762,23.39270",
    }),
  },
  {
    name: "Photon",
    url: "https://photon.komoot.io/api",
    timeout: 6000,
    retries: 2,
    params: (query) => ({
      q: query,
      limit: 8,
      lang: "vi",
      bbox: "102.14441,8.59975,109.46762,23.39270",
    }),
  },
]

// Hàm tìm kiếm trong database local
const searchLocalDatabase = (query) => {
  const searchTerm = query.toLowerCase().trim()

  const results = VIETNAM_ADDRESSES_DB.filter((item) => {
    const name = item.name.toLowerCase()
    const address = item.address.toLowerCase()

    return (
      name.includes(searchTerm) ||
      address.includes(searchTerm) ||
      searchTerm.includes(name) ||
      // Fuzzy matching cho các từ khóa
      searchTerm
        .split(" ")
        .some((word) => word.length > 2 && (name.includes(word) || address.includes(word)))
    )
  })

  // Sắp xếp theo độ phù hợp
  return results
    .sort((a, b) => {
      const aScore = calculateLocalScore(a, searchTerm)
      const bScore = calculateLocalScore(b, searchTerm)
      return bScore - aScore
    })
    .slice(0, 8)
}

// Tính điểm phù hợp cho kết quả local
const calculateLocalScore = (item, searchTerm) => {
  let score = item.confidence

  const name = item.name.toLowerCase()
  const address = item.address.toLowerCase()

  // Exact match
  if (name === searchTerm || address === searchTerm) {
    score += 0.5
  }

  // Starts with
  if (name.startsWith(searchTerm) || address.startsWith(searchTerm)) {
    score += 0.3
  }

  // Contains
  if (name.includes(searchTerm) || address.includes(searchTerm)) {
    score += 0.2
  }

  // Type bonus
  if (item.type === "university") score += 0.1
  if (item.type === "landmark") score += 0.1

  return score
}

// Hàm retry với exponential backoff
const retryWithBackoff = async (fn, retries = 2, delay = 1000) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && !error.message.includes("aborted")) {
      console.log(`Retrying in ${delay}ms... (${retries} retries left)`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retryWithBackoff(fn, retries - 1, delay * 2)
    }
    throw error
  }
}

// Hàm geocoding với fallback và retry
const geocodeAddress = async (address, returnMultiple = false) => {
  console.log(`Starting geocoding for: "${address}"`)

  // Bước 1: Tìm trong database local trước (chỉ khi query ngắn)
  if (address.length < 10) {
    const localResults = searchLocalDatabase(address)
    if (localResults.length > 0) {
      console.log(`Found ${localResults.length} results in local database`)

      const formattedResults = localResults.map((item) => ({
        lat: item.lat,
        lng: item.lng,
        display_name: item.address,
        confidence: item.confidence,
        address_components: { name: item.name, type: item.type },
        source: "Local Database",
        place_id: `local_${item.name.replace(/\s+/g, "_")}`,
      }))

      if (returnMultiple) {
        return formattedResults
      }
      return formattedResults[0]
    }
  }

  // Bước 2: Thử các API external
  const enhancedQuery = enhanceSearchQuery(address)
  console.log(`Enhanced query: "${enhancedQuery}"`)

  let allResults = []

  for (const api of GEOCODING_APIS) {
    try {
      console.log(`Trying ${api.name} API...`)

      const apiCall = async () => {
        const response = await axios.get(api.url, {
          params: api.params(enhancedQuery),
          timeout: api.timeout,
          headers: {
            "User-Agent": "FastFood-Delivery-App/1.0 (contact@fastfood.com)",
            Accept: "application/json",
            "Accept-Language": "vi,en",
          },
        })
        return response
      }

      const response = await retryWithBackoff(apiCall, api.retries)
      let results = []

      if (api.name === "Nominatim") {
        results = response.data
          .filter((item) => {
            const displayName = item.display_name.toLowerCase()
            return displayName.includes("việt nam") || displayName.includes("vietnam")
          })
          .map((item) => ({
            lat: Number.parseFloat(item.lat),
            lng: Number.parseFloat(item.lon),
            display_name: item.display_name,
            confidence: calculateNominatimConfidence(item),
            address_components: item.address || {},
            source: "Nominatim",
            place_id: item.place_id,
          }))
      } else if (api.name === "Photon") {
        results = response.data.features
          .filter((item) => {
            const country = item.properties.country || ""
            return country.toLowerCase().includes("vietnam") || country.toLowerCase().includes("việt nam")
          })
          .map((item) => ({
            lat: item.geometry.coordinates[1],
            lng: item.geometry.coordinates[0],
            display_name: formatPhotonDisplayName(item.properties),
            confidence: item.properties.confidence || 0.6,
            address_components: item.properties,
            source: "Photon",
            place_id: `photon_${item.properties.osm_id}`,
          }))
      }

      if (results.length > 0) {
        console.log(`${api.name} returned ${results.length} results`)
        allResults = [...allResults, ...results]

        if (!returnMultiple) {
          return results.sort((a, b) => b.confidence - a.confidence)[0]
        }
      }
    } catch (error) {
      console.error(`${api.name} API error:`, error.message)
      continue
    }
  }

  if (returnMultiple && allResults.length > 0) {
    const uniqueResults = allResults
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => Math.abs(t.lat - item.lat) < 0.001 && Math.abs(t.lng - item.lng) < 0.001),
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8)

    return uniqueResults
  }

  if (allResults.length > 0) {
    return allResults.sort((a, b) => b.confidence - a.confidence)[0]
  }

  // Bước 3: Fallback cuối cùng - tìm kiếm fuzzy trong database
  console.log("All APIs failed, trying fuzzy search in local database...")
  const fuzzyResults = searchFuzzyLocal(address)
  if (fuzzyResults.length > 0) {
    console.log(`Found ${fuzzyResults.length} fuzzy results in local database`)
    const formattedResults = fuzzyResults.map((item) => ({
      lat: item.lat,
      lng: item.lng,
      display_name: `${item.address} (gợi ý)`,
      confidence: item.confidence * 0.7,
      address_components: { name: item.name, type: item.type },
      source: "Local Fuzzy",
      place_id: `fuzzy_${item.name.replace(/\s+/g, "_")}`,
    }))

    if (returnMultiple) {
      return formattedResults
    }
    return formattedResults[0]
  }

  throw new Error("No geocoding results found from any source")
}

// Tìm kiếm fuzzy trong database local
const searchFuzzyLocal = (query) => {
  const searchTerm = query.toLowerCase().trim()
  const words = searchTerm.split(" ").filter((word) => word.length > 1)

  return VIETNAM_ADDRESSES_DB.filter((item) => {
    const name = item.name.toLowerCase()
    const address = item.address.toLowerCase()

    return words.some(
      (word) =>
        name.includes(word) ||
        address.includes(word) ||
        calculateSimilarity(word, name) > 0.6 ||
        calculateSimilarity(word, address) > 0.6,
    )
  }).slice(0, 5)
}

// Tính độ tương đồng đơn giản
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

// Levenshtein distance
const levenshteinDistance = (str1, str2) => {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }

  return matrix[str2.length][str1.length]
}

// Cải thiện search query
const enhanceSearchQuery = (query) => {
  let enhancedQuery = query.trim()

  // Thêm "Vietnam" nếu chưa có
  const vietnamKeywords = ["việt nam", "vietnam", "hà nội", "hanoi", "hcm", "sài gòn"]
  const hasVietnamKeyword = vietnamKeywords.some((keyword) => enhancedQuery.toLowerCase().includes(keyword))

  if (!hasVietnamKeyword) {
    enhancedQuery += ", Vietnam"
  }

  return enhancedQuery
}

// Format display name cho Photon
const formatPhotonDisplayName = (properties) => {
  const parts = []

  if (properties.name) parts.push(properties.name)
  if (properties.street) parts.push(properties.street)
  if (properties.district) parts.push(properties.district)
  if (properties.city) parts.push(properties.city)
  if (properties.state) parts.push(properties.state)
  if (properties.country) parts.push(properties.country)

  return parts.join(", ")
}

// Tính confidence cho Nominatim
const calculateNominatimConfidence = (item) => {
  let confidence = 0.5

  if (item.importance) {
    confidence = Math.min(item.importance * 1.2, 1.0)
  }

  if (item.class) {
    switch (item.class) {
      case "amenity":
        confidence += 0.2
        break
      case "building":
        confidence += 0.15
        break
      case "highway":
        confidence += 0.1
        break
      case "place":
        confidence += 0.25
        break
    }
  }

  if (item.address) {
    if (item.address.house_number) confidence += 0.15
    if (item.address.road) confidence += 0.1
    if (item.address.suburb || item.address.district) confidence += 0.1
    if (item.address.city) confidence += 0.1
  }

  return Math.min(confidence, 1.0)
}

// Tính route với fallback
const calculateRoute = async (origin, destination) => {
  try {
    console.log(`Calculating route from ${origin.lng},${origin.lat} to ${destination.lng},${destination.lat}`)

    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`

    const response = await axios.get(url, {
      params: {
        overview: "false",
        alternatives: false,
        steps: false,
        geometries: "polyline",
        annotations: false,
      },
      timeout: 10000,
      headers: {
        "User-Agent": "FastFood-Delivery-App/1.0",
      },
    })

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0]
      const distanceKm = (route.distance / 1000).toFixed(1)
      const durationMinutes = Math.ceil(route.duration / 60)

      console.log(`OSRM route: ${distanceKm}km, ${durationMinutes} minutes`)

      return {
        distance: Number.parseFloat(distanceKm),
        duration: durationMinutes,
        source: "OSRM",
      }
    }

    throw new Error("No route found")
  } catch (error) {
    console.error("OSRM routing error:", error.message)

    // Fallback: Haversine distance
    const distance = calculateHaversineDistance(origin, destination)
    const roadDistance = distance * 1.4
    const estimatedDuration = Math.ceil((roadDistance / 25) * 60)

    console.log(`Using Haversine fallback: ${roadDistance.toFixed(1)}km, ${estimatedDuration} minutes`)

    return {
      distance: Number.parseFloat(roadDistance.toFixed(1)),
      duration: estimatedDuration,
      source: "Haversine (fallback)",
    }
  }
}

// Haversine distance
const calculateHaversineDistance = (pos1, pos2) => {
  const R = 6371
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180
  const dLng = ((pos2.lng - pos1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.lat * Math.PI) / 180) *
      Math.cos((pos2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Tính phí ship
const calculateShippingFee = (distance) => {
  if (distance <= 2) return 0
  if (distance <= 5) return 14000
  if (distance <= 7) return 20000
  if (distance <= 10) return 25000
  return null
}

// Format thời gian
const formatDeliveryTime = (routeDuration) => {
  const prepTime = 15
  const deliveryTime = 5
  const totalMinutes = prepTime + routeDuration + deliveryTime

  if (totalMinutes < 60) {
    return `${totalMinutes} phút`
  } else {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h${minutes > 0 ? ` ${minutes}p` : ""}`
  }
}

// Validate địa chỉ
const validateVietnameseAddress = (address) => {
  const errors = []

  if (!address || address.trim().length < 3) {
    errors.push("Địa chỉ quá ngắn")
    return errors
  }

  return errors
}

// API lấy gợi ý địa chỉ - Improved version
const getAddressSuggestions = async (req, res) => {
  try {
    const { input } = req.query

    if (!input || input.length < 2) {
      return res.json({
        success: true,
        data: [],
        message: "Vui lòng nhập ít nhất 2 ký tự",
      })
    }

    console.log(`Getting address suggestions for: "${input}"`)

    // Prioritize external APIs for better results
    const results = await geocodeAddress(input, true)

    if (!results || results.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: "Không tìm thấy địa chỉ phù hợp. Thử nhập chi tiết hơn.",
      })
    }

    const suggestions = results.map((result, index) => {
      const parts = result.display_name.split(",")
      return {
        placeId: result.place_id || `${result.lat}_${result.lng}_${index}`,
        description: result.display_name,
        mainText: parts[0]?.trim() || result.display_name,
        secondaryText: parts.slice(1).join(",").trim() || "",
        confidence: result.confidence,
        coordinates: {
          lat: result.lat,
          lng: result.lng,
        },
        source: result.source,
      }
    })

    console.log(`Returning ${suggestions.length} suggestions`)

    res.json({
      success: true,
      data: suggestions,
    })
  } catch (error) {
    console.error("Address suggestions error:", error)
    res.json({
      success: false,
      message: "Lỗi khi tìm kiếm địa chỉ. Vui lòng thử lại.",
      error: error.message,
    })
  }
}

// API tính khoảng cách - Fixed version
const calculateDistance = async (req, res) => {
  try {
    const { destination } = req.body

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp địa chỉ đích",
      })
    }

    console.log(`Calculating shipping for: "${destination}"`)

    const validationErrors = validateVietnameseAddress(destination)
    if (validationErrors.length > 0) {
      return res.json({
        success: false,
        message: "Địa chỉ cần được cải thiện",
        errors: validationErrors,
      })
    }

    let destinationCoords
    try {
      destinationCoords = await geocodeAddress(destination, false)
    } catch (geocodeError) {
      console.error("Geocoding failed:", geocodeError.message)
      return res.status(400).json({
        success: false,
        message: "Không thể xác định tọa độ của địa chỉ này. Vui lòng nhập địa chỉ chi tiết hơn.",
        details: geocodeError.message,
      })
    }

    if (!destinationCoords) {
      return res.status(400).json({
        success: false,
        message: "Không thể xác định tọa độ của địa chỉ này",
      })
    }

    console.log(`Destination: ${destinationCoords.lat}, ${destinationCoords.lng}`)

    let routeInfo
    try {
      routeInfo = await calculateRoute(STORE_LOCATION, destinationCoords)
    } catch (routeError) {
      console.error("Route calculation failed:", routeError.message)
      return res.status(500).json({
        success: false,
        message: "Không thể tính toán tuyến đường. Vui lòng thử lại.",
        details: routeError.message,
      })
    }

    const shippingFee = calculateShippingFee(routeInfo.distance)

    if (shippingFee === null) {
      return res.status(400).json({
        success: false,
        message: `Địa chỉ này nằm ngoài phạm vi giao hàng (${routeInfo.distance}km > 10km)`,
      })
    }

    const result = {
      distance: routeInfo.distance,
      duration: formatDeliveryTime(routeInfo.duration),
      shippingFee: shippingFee,
      freeShipping: shippingFee === 0,
      originAddress: STORE_LOCATION.address,
      destinationAddress: destinationCoords.display_name,
      confidence: destinationCoords.confidence,
      geocodingSource: destinationCoords.source,
      routingSource: routeInfo.source,
      coordinates: {
        origin: {
          lat: STORE_LOCATION.lat,
          lng: STORE_LOCATION.lng,
        },
        destination: {
          lat: destinationCoords.lat,
          lng: destinationCoords.lng,
        },
      },
    }

    console.log("Shipping calculation successful:", result)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Distance calculation error:", error)

    let errorMessage = "Không thể tính phí vận chuyển"

    if (error.message.includes("timeout")) {
      errorMessage = "Kết nối mạng chậm, vui lòng thử lại"
    } else if (error.message.includes("Network Error")) {
      errorMessage = "Lỗi kết nối mạng"
    } else if (error.message.includes("No geocoding results")) {
      errorMessage = "Không tìm thấy địa chỉ này. Vui lòng thử địa chỉ khác."
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      details: error.message,
    })
  }
}

export { getAddressSuggestions, calculateDistance }
