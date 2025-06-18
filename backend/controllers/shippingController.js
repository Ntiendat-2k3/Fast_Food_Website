import axios from "axios"

// Tính phí ship dựa trên khoảng cách
const calculateShippingFee = (distance) => {
  if (distance <= 2) return 0 // Freeship dưới 2km
  if (distance <= 5) return 14000 // 2-5km: 14k
  if (distance <= 7) return 20000 // 5-7km: 20k
  if (distance <= 10) return 25000 // 7-10km: 25k
  return -1 // Ngoài phạm vi giao hàng
}

// Tính khoảng cách giữa 2 điểm
const calculateDistance = async (req, res) => {
  try {
    const { origin, destination } = req.body

    if (!origin || !destination) {
      return res.json({
        success: false,
        message: "Vui lòng cung cấp địa chỉ gốc và đích",
      })
    }

    // Gọi Google Maps Distance Matrix API
    const response = await axios.get("https://maps.googleapis.com/maps/api/distancematrix/json", {
      params: {
        origins: origin,
        destinations: destination,
        units: "metric",
        mode: "driving",
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    })

    if (response.data.status !== "OK") {
      return res.json({
        success: false,
        message: "Không thể tính toán khoảng cách",
      })
    }

    const element = response.data.rows[0].elements[0]

    if (element.status !== "OK") {
      return res.json({
        success: false,
        message: "Không tìm thấy đường đi",
      })
    }

    const distanceInKm = element.distance.value / 1000 // Convert to km
    const duration = element.duration.text
    const shippingFee = calculateShippingFee(distanceInKm)

    if (shippingFee === -1) {
      return res.json({
        success: false,
        message: "Địa chỉ nằm ngoài phạm vi giao hàng (tối đa 10km)",
        distance: distanceInKm,
      })
    }

    res.json({
      success: true,
      data: {
        distance: distanceInKm,
        duration: duration,
        shippingFee: shippingFee,
        freeShipping: shippingFee === 0,
      },
    })
  } catch (error) {
    console.error("Error calculating distance:", error)
    res.json({
      success: false,
      message: "Lỗi khi tính toán khoảng cách",
    })
  }
}

// Lấy gợi ý địa chỉ
const getAddressSuggestions = async (req, res) => {
  try {
    const { input } = req.query

    if (!input) {
      return res.json({
        success: false,
        message: "Vui lòng nhập địa chỉ",
      })
    }

    const response = await axios.get("https://maps.googleapis.com/maps/api/place/autocomplete/json", {
      params: {
        input: input,
        components: "country:vn", // Chỉ tìm ở Việt Nam
        language: "vi",
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    })

    if (response.data.status !== "OK") {
      return res.json({
        success: false,
        message: "Không thể lấy gợi ý địa chỉ",
      })
    }

    const suggestions = response.data.predictions.map((prediction) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text,
    }))

    res.json({
      success: true,
      data: suggestions,
    })
  } catch (error) {
    console.error("Error getting address suggestions:", error)
    res.json({
      success: false,
      message: "Lỗi khi lấy gợi ý địa chỉ",
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

    const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
      params: {
        place_id: placeId,
        fields: "formatted_address,geometry",
        language: "vi",
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    })

    if (response.data.status !== "OK") {
      return res.json({
        success: false,
        message: "Không thể lấy chi tiết địa chỉ",
      })
    }

    const place = response.data.result

    res.json({
      success: true,
      data: {
        address: place.formatted_address,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
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
