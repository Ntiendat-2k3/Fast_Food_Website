"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const ContactMap = ({ className = "" }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  // Store location
  const storeLocation = {
    lat: 20.9758758,
    lng: 105.8130185,
    name: "Fast Food Restaurant",
    address: "Trường Đại học Thăng Long, Nghiêm Xuân Yêm, Đại Kim, Hoàng Mai, Hà Nội",
    phone: "024 3854 3333",
    hours: "8:00 - 22:00 (Thứ 2 - Chủ nhật)",
  }

  // Delivery zones
  const deliveryZones = [
    { radius: 2000, color: "#10b981", fillColor: "#10b981", fillOpacity: 0.1, label: "Miễn phí ship" },
    { radius: 5000, color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.08, label: "14.000đ" },
    { radius: 7000, color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.06, label: "20.000đ" },
    { radius: 10000, color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.04, label: "25.000đ" },
  ]

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [storeLocation.lat, storeLocation.lng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
    })

    mapInstanceRef.current = map

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Create custom pizza icon
    const pizzaIcon = L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 3px solid white;
        ">
          <span style="font-size: 20px;">🍕</span>
        </div>
      `,
      className: "custom-pizza-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    })

    // Add store marker
    const storeMarker = L.marker([storeLocation.lat, storeLocation.lng], {
      icon: pizzaIcon,
    }).addTo(map)

    // Create popup content
    const popupContent = `
      <div style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="text-align: center; margin-bottom: 12px;">
          <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: bold;">
            🍕 ${storeLocation.name}
          </h3>
        </div>

        <div style="space-y: 8px;">
          <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 8px;">
            <span style="color: #6b7280; font-size: 14px;">📍</span>
            <span style="color: #374151; font-size: 14px; line-height: 1.4;">
              ${storeLocation.address}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="color: #6b7280; font-size: 14px;">📞</span>
            <a href="tel:${storeLocation.phone}" style="color: #3b82f6; font-size: 14px; text-decoration: none;">
              ${storeLocation.phone}
            </a>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="color: #6b7280; font-size: 14px;">🕒</span>
            <span style="color: #374151; font-size: 14px;">
              ${storeLocation.hours}
            </span>
          </div>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; text-align: center;">
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=${storeLocation.lat},${storeLocation.lng}"
            target="_blank"
            style="
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white;
              padding: 8px 16px;
              border-radius: 6px;
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              margin-right: 8px;
            "
          >
            🗺️ Chỉ đường
          </a>
          <a
            href="tel:${storeLocation.phone}"
            style="
              display: inline-block;
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              padding: 8px 16px;
              border-radius: 6px;
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
            "
          >
            📞 Gọi ngay
          </a>
        </div>
      </div>
    `

    storeMarker.bindPopup(popupContent, {
      maxWidth: 300,
      className: "custom-popup",
    })

    // Add delivery zones
    deliveryZones.forEach((zone, index) => {
      const circle = L.circle([storeLocation.lat, storeLocation.lng], {
        radius: zone.radius,
        color: zone.color,
        fillColor: zone.fillColor,
        fillOpacity: zone.fillOpacity,
        weight: 2,
        opacity: 0.8,
      }).addTo(map)

      // Add zone label
      const labelIcon = L.divIcon({
        html: `
          <div style="
            background: ${zone.color};
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${zone.label}
          </div>
        `,
        className: "zone-label",
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      })

      // Position label at the edge of the circle
      const angle = index * (Math.PI / 2) // 90 degrees apart
      const labelLat = storeLocation.lat + (zone.radius / 111320) * Math.cos(angle) * 0.7
      const labelLng =
        storeLocation.lng +
        (zone.radius / (111320 * Math.cos((storeLocation.lat * Math.PI) / 180))) * Math.sin(angle) * 0.7

      L.marker([labelLat, labelLng], { icon: labelIcon }).addTo(map)
    })

    // Add legend
    const legend = L.control({ position: "bottomright" })
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend")
      div.style.cssText = `
        background: white;
        padding: 12px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 12px;
        line-height: 1.4;
      `

      div.innerHTML = `
        <div style="margin-bottom: 8px; font-weight: bold; color: #1f2937;">
          🚚 Phí vận chuyển
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%; margin-right: 8px;"></div>
          <span>< 2km: Miễn phí</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 50%; margin-right: 8px;"></div>
          <span>2-5km: 14.000đ</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 50%; margin-right: 8px;"></div>
          <span>5-7km: 20.000đ</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%; margin-right: 8px;"></div>
          <span>7-10km: 25.000đ</span>
        </div>
      `
      return div
    }
    legend.addTo(map)

    // Add scale control
    L.control
      .scale({
        position: "bottomleft",
        metric: true,
        imperial: false,
      })
      .addTo(map)

    // Open popup by default
    setTimeout(() => {
      storeMarker.openPopup()
    }, 1000)

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg shadow-lg border border-gray-200"
        style={{ minHeight: "400px" }}
      />

      {/* Map overlay info */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🍕</span>
          <h4 className="font-semibold text-gray-900">Fast Food Restaurant</h4>
        </div>
        <p className="text-sm text-gray-600">Click vào marker để xem thông tin chi tiết và chỉ đường</p>
      </div>

      {/* Powered by attribution */}
      <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600">
        Powered by OpenStreetMap & Leaflet
      </div>
    </div>
  )
}

export default ContactMap
